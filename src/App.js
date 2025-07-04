import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';
import Profile from './components/Profile';
import Search from './components/Search';
import AddPost from './components/AddPost';
import Activity from './components/Activity';
import PrivateRoute from './components/PrivateRoute';
import CustomCursor from './components/CustomCursor';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <CustomCursor />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
            <Route path="/search" element={
              <PrivateRoute>
                <Search />
              </PrivateRoute>
            } />
            <Route path="/add-post" element={
              <PrivateRoute>
                <AddPost />
              </PrivateRoute>
            } />
            <Route path="/activity" element={
              <PrivateRoute>
                <Activity />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={<Navigate to="/home" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
