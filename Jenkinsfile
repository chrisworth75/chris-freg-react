pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }

    environment {
        DOCKER_IMAGE = 'chris-freg-react'
        CONTAINER_NAME = 'chris-freg-react-container'
        HOST_PORT = '4201'
        CONTAINER_PORT = '80'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/chris-whitlam/chris-freg-react.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE} ."
                }
            }
        }

        stage('Stop Existing Container') {
            steps {
                script {
                    sh '''
                        if [ $(docker ps -q -f name=${CONTAINER_NAME}) ]; then
                            echo "Stopping existing container..."
                            docker stop ${CONTAINER_NAME}
                        fi
                        if [ $(docker ps -aq -f name=${CONTAINER_NAME}) ]; then
                            echo "Removing existing container..."
                            docker rm ${CONTAINER_NAME}
                        fi
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh '''
                        docker run -d \
                            --name ${CONTAINER_NAME} \
                            -p ${HOST_PORT}:${CONTAINER_PORT} \
                            ${DOCKER_IMAGE}
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    sh '''
                        echo "Waiting for application to start..."
                        sleep 10

                        # Check if container is running
                        if ! docker ps | grep -q ${CONTAINER_NAME}; then
                            echo "Container is not running!"
                            docker logs ${CONTAINER_NAME}
                            exit 1
                        fi

                        # Check if application responds
                        for i in {1..30}; do
                            if curl -f http://localhost:${HOST_PORT}/ > /dev/null 2>&1; then
                                echo "Application is responding!"
                                exit 0
                            fi
                            echo "Attempt $i: Application not yet responding..."
                            sleep 2
                        done

                        echo "Application failed to respond after 60 seconds"
                        docker logs ${CONTAINER_NAME}
                        exit 1
                    '''
                }
            }
        }

        stage('E2E Tests') {
            steps {
                script {
                    sh '''
                        echo "Waiting for application to be fully ready..."
                        sleep 5

                        # Run Playwright tests in Docker to avoid environment issues
                        docker run --rm \
                            --network host \
                            -v "$(pwd)":/workspace \
                            -w /workspace \
                            mcr.microsoft.com/playwright:v1.48.0-noble \
                            /bin/bash -c "
                                npm ci &&
                                npx playwright install &&
                                npx playwright test --config=playwright.config.ts
                            "
                    '''
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Test Report'
                    ])

                    archiveArtifacts artifacts: 'test-results/**/*', fingerprint: true, allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "React app deployment successful! Available at http://localhost:${HOST_PORT}"
        }
        failure {
            script {
                sh '''
                    echo "Pipeline failed. Container logs:"
                    if [ $(docker ps -aq -f name=${CONTAINER_NAME}) ]; then
                        docker logs ${CONTAINER_NAME}
                    fi
                '''
            }
        }
    }
}