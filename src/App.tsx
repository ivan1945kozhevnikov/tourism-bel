import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import InteractiveMap from '@/pages/InteractiveMap';
import Tours from '@/pages/Tours';
import Traditions from '@/pages/Traditions';
import Food from '@/pages/Food';
import Legends from '@/pages/Legends';
import Admin from '@/pages/Admin';
import Reviews from '@/pages/Reviews';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/map" element={<InteractiveMap />} />
                  <Route path="/tours" element={<Tours />} />
                  <Route path="/traditions" element={<Traditions />} />
                  <Route path="/legends" element={<Legends />} />
                  <Route path="/food" element={<Food />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
