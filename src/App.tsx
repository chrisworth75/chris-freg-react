import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import FeeList from './components/FeeList';
import FeeCreate from './components/FeeCreate';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <Header />
        </header>

        <main className="main">
          <div className="content">
            <Routes>
              <Route path="/" element={<FeeList />} />
              <Route path="/fees" element={<FeeList />} />
              <Route path="/create" element={<FeeCreate />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
