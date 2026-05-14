import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight text-foreground">SalonBook</span>
          </Link>
          <div className="flex gap-4">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/book" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all">
              Book Appointment
            </Link>
            <Link to="/admin" className="text-muted-foreground hover:text-foreground pt-2">Admin</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
