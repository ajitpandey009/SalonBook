import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Star } from 'lucide-react';

const services = [
  { id: 1, name: 'Haircut & Styling', price: '₹500', duration: '45 min', description: 'Professional cut and style tailored to your face shape.' },
  { id: 2, name: 'Coloring & Highlights', price: '₹1200+', duration: '120 min', description: 'Full or partial highlights with premium colors.' },
  { id: 3, name: 'Beard Grooming', price: '₹300', duration: '30 min', description: 'Precision trim and hot towel finish.' },
  { id: 4, name: 'Facial Treatment', price: '₹800', duration: '60 min', description: 'Deep cleansing and hydration for glowing skin.' },
];

const Home = () => {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center text-center px-4 overflow-hidden rounded-3xl mt-8 mx-4 lg:mx-8">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1600" 
            alt="Salon Background" 
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Elevate Your Style at <span className="text-primary-foreground underline decoration-primary underline-offset-8">SalonBook</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-medium">
            Experience the art of grooming with our expert stylists in a modern, relaxing environment.
          </p>
          <div className="pt-4">
            <Link to="/book" className="bg-primary text-white text-lg font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all inline-block">
              Book Your Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From classic cuts to modern styling, we offer a wide range of services to help you look and feel your best.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-2xl border border-border hover:border-primary/50 transition-all shadow-sm group">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{service.name}</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {service.description}
              </p>
              <div className="flex items-center justify-between text-sm font-medium pt-4 border-t border-border">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{service.duration}</span>
                </div>
                <span className="text-primary font-bold text-lg">{service.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us Section */}
      <section className="bg-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
            </div>
            <h3 className="text-xl font-bold">Expert Stylists</h3>
            <p className="text-muted-foreground">Years of experience in the latest trends and techniques.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold">Easy Booking</h3>
            <p className="text-muted-foreground">Select your preferred time slot and book in seconds.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold">Quality Products</h3>
            <p className="text-muted-foreground">We use only premium, eco-friendly products for your hair.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
