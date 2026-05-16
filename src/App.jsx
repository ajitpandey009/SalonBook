import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Booking from './pages/Booking';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CheckBooking from './pages/CheckBooking';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<Booking />} />
            <Route path="/my-bookings" element={<CheckBooking />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <footer className="border-t border-border py-10 mt-20 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SalonBook. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
