import { Route, BrowserRouter, Routes } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PostDetail from "./pages/PostDetail";
import Profile from "./pages/Profile";
import Navbar from "./admin/pages/Navbar";
import AdminPanel from "./admin/pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/Admin"
          element={
            <div className="App">
              <Navbar />
              <AdminPanel />
            </div>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/post/:postId" element={<PostDetail />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </BrowserRouter>
  );
}

export default App;
