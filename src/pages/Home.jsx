import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Star, Shield, Award, Sparkles, Scissors, Smile, Heart } from 'lucide-react';

const services = [
  // Hair Services
  { id: 'haircut', name: 'Haircut', price: '₹100', duration: '30 min', category: 'Hair Services', description: 'Professional haircut tailored to your style.' },
  { id: 'saving', name: 'Shaving', price: '₹60', duration: '20 min', category: 'Hair Services', description: 'Classic clean shave with premium cream.' },
  { id: 'children_cut', name: "Children's Cutting", price: '₹100', duration: '25 min', category: 'Hair Services', description: 'Gentle and cool haircut for kids.' },
  { id: 'hair_straightening', name: 'Hair Straightening', price: '₹1000', duration: '90 min', category: 'Hair Services', description: 'Sleek, straight, and smooth hair treatment.' },
  { id: 'hair_smoothening', name: 'Hair Smoothenings', price: '₹1000', duration: '90 min', category: 'Hair Services', description: 'Soft, silky, and manageable hair.' },
  { id: 'hair_spa', name: 'Hair Spa', price: '₹650', duration: '60 min', category: 'Hair Services', description: 'Deep nourishing therapy for healthy hair.' },
  { id: 'head_wash', name: 'Head Wash', price: '₹50', duration: '15 min', category: 'Hair Services', description: 'Refreshing hair wash and gentle blow dry.' },

  // Massage
  { id: 'amravati_oil', name: 'Amravati Oil Massage', price: '₹150', duration: '45 min', category: 'Massages', description: 'Traditional rejuvenating head & shoulder massage.' },
  { id: 'navratn_gold', name: 'Navratn Gold Massage', price: '₹150', duration: '45 min', category: 'Massages', description: 'Cooling gold massage for ultimate relaxation.' },
  { id: 'navratan_oil', name: 'Navratan Oil Massage', price: '₹100', duration: '30 min', category: 'Massages', description: 'Relaxing head massage with herbal oil.' },
  { id: 'bajaj_oil', name: 'Bajaj Oil Massage', price: '₹150', duration: '45 min', category: 'Massages', description: 'Gentle head massage with nourishing almond oil.' },
  { id: 'shrigandha_oil', name: 'Shrigandha Oil Massage', price: '₹100', duration: '30 min', category: 'Massages', description: 'Soothing Sandalwood infused oil head massage.' },
  { id: 'scrub_face', name: 'Scrub Face Massage', price: '₹150', duration: '30 min', category: 'Massages', description: 'Exfoliating and relaxing face massage.' },

  // Color / Hair Color
  { id: 'beauty_blanc', name: 'Beauty Blanc Gel Color', price: '₹250', duration: '45 min', category: 'Hair Colors', description: 'Vibrant gel hair color with shiny finish.' },
  { id: 'loreal_black', name: 'Loreal Colour Black', price: '₹400', duration: '60 min', category: 'Hair Colors', description: 'Premium Loreal professional black color.' },
  { id: 'garnier_black', name: 'Garnier Colour Black', price: '₹200', duration: '45 min', category: 'Hair Colors', description: 'Classic Garnier long-lasting rich black.' },
  { id: 'enega_colour', name: 'Enega Colour', price: '₹200', duration: '45 min', category: 'Hair Colors', description: 'Gentle color formulation for absolute coverage.' },
  { id: 'black_rose', name: 'Black Rose', price: '₹200', duration: '40 min', category: 'Hair Colors', description: 'Reliable and fast black hair coloring.' },

  // Facials & D-Tan
  { id: 'pro_lacto', name: 'Pro+ Lacto Detn', price: '₹350', duration: '40 min', category: 'Facials & D-Tan', description: 'Advanced lacto formula to instantly remove tan.' },
  { id: 'raga_detn', name: 'Raga Professional Detn', price: '₹400', duration: '45 min', category: 'Facials & D-Tan', description: 'Elite skin clarifying & de-tanning session.' },
  { id: 'real_aroma_diamond', name: 'Real Aroma Diamond Facial', price: '₹650', duration: '60 min', category: 'Facials & D-Tan', description: 'Luxury diamond glow for premium radiance.' },
  { id: 'real_aroma_gold', name: 'Real Aroma Gold Facial', price: '₹700', duration: '60 min', category: 'Facials & D-Tan', description: 'Golden therapy for skin renewal & brightness.' },
  { id: 'real_aroma_papaya', name: 'Real Aroma Papaya Facial', price: '₹700', duration: '60 min', category: 'Facials & D-Tan', description: 'Natural fruit enzymes for fresh, smooth skin.' },
  { id: 'real_aroma_whitening', name: 'Real Aroma Whitening Facial', price: '₹700', duration: '60 min', category: 'Facials & D-Tan', description: 'Even skin tone & high brightening therapy.' },
  { id: 'banana_facial', name: 'Banana Facial', price: '₹600', duration: '50 min', category: 'Facials & D-Tan', description: 'Deep hydration & nourishment with banana extracts.' },
  { id: 'o7_plus_gold', name: 'O7 Plus Herbal Gold Facial', price: '₹700', duration: '60 min', category: 'Facials & D-Tan', description: 'Rejuvenating organic herbal gold facial.' },
  { id: 'herbal_tree', name: 'Herbal Tree Facial', price: '₹800', duration: '70 min', category: 'Facials & D-Tan', description: 'Natural Ayurvedic deep detox and facial therapy.' },
  { id: 'lotus_facial', name: 'Lotus Facial', price: '₹700', duration: '60 min', category: 'Facials & D-Tan', description: 'Premium lotus extracts for glowing skin.' },
  { id: 'lilium_gold_scrub', name: 'Lilium Gold Face Scrub', price: '₹250', duration: '30 min', category: 'Facials & D-Tan', description: 'Gentle exfoliating gold scrub for soft texture.' },
  { id: 'eyebrow_setting', name: 'Eyebrow Setting', price: '₹50', duration: '10 min', category: 'Facials & D-Tan', description: 'Precise shape and setting for eyebrows.' }
];

const categories = ['All', 'Hair Services', 'Massages', 'Hair Colors', 'Facials & D-Tan'];

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-[550px] flex items-center justify-center text-center px-4 overflow-hidden rounded-3xl mt-8 mx-4 lg:mx-8 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1600" 
            alt="MS. Saloon Background" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-sm font-bold backdrop-blur-md">
            <Sparkles className="h-4 w-4" /> Welcome to MS. Saloon
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
            Elevate Your Style & <br />
            <span className="text-primary-foreground underline decoration-primary underline-offset-8">Grooming Experience</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium">
            Discover the ultimate destination for premium cuts, soothing massages, vibrant hair colors, and rejuvenating facials at unbeatable rates.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/book" className="w-full sm:w-auto bg-primary text-white text-lg font-bold px-10 py-5 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all inline-block">
              Book Your Appointment
            </Link>
            <Link to="/my-bookings" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 text-lg font-bold px-10 py-5 rounded-2xl backdrop-blur-sm transition-all inline-block">
              Check My Booking
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-foreground">Our Premium Menu & Rate Card</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
            Browse through our wide array of professional grooming, oil massage, facial, and hair color options.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 border-b border-border pb-6 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-lg shadow-primary/10'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-3xl border border-border hover:border-primary/40 hover:shadow-xl transition-all group flex flex-col justify-between h-[220px]">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] bg-primary/10 text-primary font-black uppercase px-2.5 py-1 rounded-full">
                    {service.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{service.duration}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{service.name}</h3>
                <p className="text-muted-foreground text-xs mt-2 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border/50">
                <span className="text-2xl font-black text-foreground">{service.price}</span>
                <Link to="/book" className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Book Slot →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Us Section */}
      <section className="bg-muted py-20 rounded-[40px] mx-4 lg:mx-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-foreground">Why Choose MS. Saloon?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              We deliver prime hair styling, top brand facial scrubs, and relaxing traditional massages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-3xl shadow-sm border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scissors className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Professional Cut</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Expert hair styling, child-friendly trimming, and classic premium shaves.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-3xl shadow-sm border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Top Facials & Colors</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Certified Real Aroma Gold/Diamond Facials, Loreal, Garnier, and Enega hair coloring.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-3xl shadow-sm border border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smile className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Oil Massage Therapy</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Rejuvenate with absolute relaxation: Amravati, Navratn Gold, and Shrigandha Oil Massage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Contact Details Info banner */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20 space-y-4">
          <p className="text-xs font-black uppercase text-primary tracking-widest">Immediate booking available</p>
          <h3 className="text-2xl font-black text-foreground">Need Assistance? Call Us Directly</h3>
          <p className="text-3xl font-black text-primary hover:scale-105 transition-transform cursor-pointer">
            +91 9708286099
          </p>
          <p className="text-xs text-muted-foreground">
            📍 MS. Saloon - Men's Parlour | Open 7 Days a week (09:00 AM - 08:00 PM)
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
