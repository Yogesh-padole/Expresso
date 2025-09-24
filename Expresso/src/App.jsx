import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './views/home'
import Register from './routes/register'
import Login from './routes/login'
import Dashboard from './views/dashboard';
import Posts from './components/myposts';
import Myprofile from './components/myprofile';

import './App.css'

function App() {
  const [count, setCount] = useState(0)

   return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/myposts" element={<Posts />} />
        <Route path="/myprofile" element={<Myprofile />} />
      </Routes>
    </Router>
  );
}

export default App
