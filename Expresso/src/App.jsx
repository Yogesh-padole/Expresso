import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './views/home'
import Register from './routes/register'
import Login from './routes/login'
import Dashboard from './views/dashboard';
import Posts from './components/myposts';
import Myprofile from './components/myprofile';
import Saved from './components/saved';
import TagPosts from './components/tagposts';
import Feedback from './components/feedback'; // ✅ Import Feedback component




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
        <Route path="/saved" element={<Saved />} />
        <Route path="/tags/:tag" element={<TagPosts />} /> 
        <Route path="/feedback" element={<Feedback />} /> 
      </Routes>
    </Router>
  );
}

export default App
