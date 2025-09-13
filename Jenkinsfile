// Jenkinsfile in chris-freg-react repository
pipeline {
    agent any

    environment {
        REGISTRY = 'localhost:5000'
        IMAGE_NAME = 'chris-freg-react-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "Checked out React code successfully"'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}")
                    docker.withRegistry("http://${REGISTRY}") {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Stop existing container if running
                    sh """
                        docker stop ${IMAGE_NAME} || true
                        docker rm ${IMAGE_NAME} || true
                    """

                    // Run new container on port 4201
                    sh """
                        docker run -d \\
                        --name ${IMAGE_NAME} \\
                        --restart unless-stopped \\
                        -p 4201:80 \\
                        ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sleep 10 // Wait for container to start
                    sh 'curl -f http://localhost:4201 || echo "Health check failed - container may still be starting"'
                }
            }
        }

        stage('E2E Tests') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Wait for services to be ready
                    sh '''
                        echo "🔄 Waiting for React app and API to be ready..."
                        timeout=60
                        while [ $timeout -gt 0 ]; do
                            frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4201 || echo "000")
                            api_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5100/health || echo "000")

                            if [ "$frontend_status" = "200" ] && [ "$api_status" = "200" ]; then
                                echo "✅ Both services are ready"
                                break
                            fi

                            echo "⏳ React Frontend: $frontend_status, API: $api_status - waiting..."
                            sleep 2
                            timeout=$((timeout-2))
                        done

                        if [ $timeout -le 0 ]; then
                            echo "❌ Services failed to start within timeout"
                            exit 1
                        fi
                    '''

                    // Run E2E tests with Node.js from nvm
                    sh '''
                        export PATH="/Users/chris/.nvm/versions/node/v18.17.1/bin:$PATH"
                        echo "📍 Node.js version: $(node --version)"
                        echo "📍 NPM version: $(npm --version)"
                        echo "🧪 Installing Playwright browsers..."
                        npx playwright install chromium
                        echo "🚀 Running React E2E tests..."
                        CI=true npx playwright test --reporter=line
                    '''
                }
            }
            post {
                always {
                    // Archive test results and reports
                    publishTestResults testResultsPattern: 'test-results/results.xml'

                    // Archive all test artifacts including videos
                    archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true, fingerprint: true
                    archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true, fingerprint: true

                    // Archive videos separately for easy access
                    archiveArtifacts artifacts: 'test-results/**/videos/**/*.webm', allowEmptyArchive: true, fingerprint: true
                    archiveArtifacts artifacts: 'test-results/**/traces/**/*.zip', allowEmptyArchive: true, fingerprint: true

                    // Publish HTML reports
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'React Playwright Test Report',
                        reportTitles: 'React E2E Test Results'
                    ])
                }
                success {
                    echo '✅ All React E2E tests passed!'
                    echo '📊 Test report available in Jenkins artifacts'
                }
                failure {
                    echo '❌ React E2E tests failed - check test results, screenshots, and videos'
                    echo '🎥 Videos available in Jenkins artifacts for debugging'
                }
            }
        }
    }

    post {
        success {
            echo 'React frontend pipeline completed successfully!'
        }
        failure {
            echo 'React frontend pipeline failed!'
        }
    }
}