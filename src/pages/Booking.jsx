import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Calendar, Clock, User, Phone, CheckCircle, ChevronRight, Scissors } from 'lucide-react';
import { format } from 'date-fns';

const services = [
  // Hair Services
  { id: 'haircut', name: 'Haircut', price: '₹100', category: 'Hair Services' },
  { id: 'saving', name: 'Shaving', price: '₹60', category: 'Hair Services' },
  { id: 'children_cut', name: "Children's Cutting", price: '₹100', category: 'Hair Services' },
  { id: 'hair_straightening', name: 'Hair Straightening', price: '₹1000', category: 'Hair Services' },
  { id: 'hair_smoothening', name: 'Hair Smoothenings', price: '₹1000', category: 'Hair Services' },
  { id: 'hair_spa', name: 'Hair Spa', price: '₹650', category: 'Hair Services' },
  { id: 'head_wash', name: 'Head Wash', price: '₹50', category: 'Hair Services' },

  // Massage
  { id: 'amravati_oil', name: 'Amravati Oil Massage', price: '₹150', category: 'Massages' },
  { id: 'navratn_gold', name: 'Navratn Gold Massage', price: '₹150', category: 'Massages' },
  { id: 'navratan_oil', name: 'Navratan Oil Massage', price: '₹100', category: 'Massages' },
  { id: 'bajaj_oil', name: 'Bajaj Oil Massage', price: '₹150', category: 'Massages' },
  { id: 'shrigandha_oil', name: 'Shrigandha Oil Massage', price: '₹100', category: 'Massages' },
  { id: 'scrub_face', name: 'Scrub Face Massage', price: '₹150', category: 'Massages' },

  // Color / Hair Color
  { id: 'beauty_blanc', name: 'Beauty Blanc Gel Color', price: '₹250', category: 'Hair Colors' },
  { id: 'loreal_black', name: 'Loreal Colour Black', price: '₹400', category: 'Hair Colors' },
  { id: 'garnier_black', name: 'Garnier Colour Black', price: '₹200', category: 'Hair Colors' },
  { id: 'enega_colour', name: 'Enega Colour', price: '₹200', category: 'Hair Colors' },
  { id: 'black_rose', name: 'Black Rose', price: '₹200', category: 'Hair Colors' },

  // Facials & D-Tan
  { id: 'pro_lacto', name: 'Pro+ Lacto Detn', price: '₹350', category: 'Facials & D-Tan' },
  { id: 'raga_detn', name: 'Raga Professional Detn', price: '₹400', category: 'Facials & D-Tan' },
  { id: 'real_aroma_diamond', name: 'Real Aroma Diamond Facial', price: '₹650', category: 'Facials & D-Tan' },
  { id: 'real_aroma_gold', name: 'Real Aroma Gold Facial', price: '₹700', category: 'Facials & D-Tan' },
  { id: 'real_aroma_papaya', name: 'Real Aroma Papaya Facial', price: '₹700', category: 'Facials & D-Tan' },
  { id: 'real_aroma_whitening', name: 'Real Aroma Whitening Facial', price: '₹700', category: 'Facials & D-Tan' },
  { id: 'banana_facial', name: 'Banana Facial', price: '₹600', category: 'Facials & D-Tan' },
  { id: 'o7_plus_gold', name: 'O7 Plus Herbal Gold Facial', price: '₹700', category: 'Facials & D-Tan' },
  { id: 'herbal_tree', name: 'Herbal Tree Facial', price: '₹800', category: 'Facials & D-Tan' },
  { id: 'lotus_facial', name: 'Lotus Facial', price: '₹700', category: 'Facials & D-Tan' },
  { id: 'lilium_gold_scrub', name: 'Lilium Gold Face Scrub', price: '₹250', category: 'Facials & D-Tan' },
  { id: 'eyebrow_setting', name: 'Eyebrow Setting', price: '₹50', category: 'Facials & D-Tan' }
];

const defaultTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Booking = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    service: `${services[0].name} (${services[0].price})`,
    barberId: '',
    barberName: '',
    bookingDate: format(new Date(), 'yyyy-MM-dd'),
    bookingTime: ''
  });

  const [barbers, setBarbers] = useState([]);
  const [barberSlots, setBarberSlots] = useState({}); // { barberId: [slots] }
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (barbers.length > 0 && formData.bookingDate) {
      fetchAllBarberSlots();
    }
  }, [barbers, formData.bookingDate]);

  const fetchInitialData = async () => {
    const querySnapshot = await getDocs(collection(db, 'barbers'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBarbers(data);
  };

  const fetchAllBarberSlots = async () => {
    setLoading(true);
    const slotsMap = {};
    
    try {
      // Get all appointments for this date to filter
      const q = query(
        collection(db, 'appointments'),
        where('bookingDate', '==', formData.bookingDate)
      );
      const querySnapshot = await getDocs(q);
      const allAppointments = querySnapshot.docs.map(doc => doc.data());

      // Fetch availability for all barbers in parallel
      await Promise.all(
        barbers.map(async (barber) => {
          const availRef = doc(db, 'barberAvailability', `${barber.id}_${formData.bookingDate}`);
          const availSnap = await getDoc(availRef);
          const allowedSlots = availSnap.exists() ? availSnap.data().slots : defaultTimeSlots;

          const bookedForThisBarber = allAppointments
            .filter(app => app.barberId === barber.id)
            .map(app => app.bookingTime);

          slotsMap[barber.id] = allowedSlots.filter(slot => !bookedForThisBarber.includes(slot));
        })
      );

      setBarberSlots(slotsMap);
    } catch (err) {
      console.error("Error fetching all slots:", err);
    }
    setLoading(false);
  };

  const handleSlotSelect = (barber, slot) => {
    setFormData({
      ...formData,
      barberId: barber.id,
      barberName: barber.name,
      bookingTime: slot
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingTime) {
      setError('Please select a stylist and an available time slot.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'appointments'), {
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      setSuccess(true);
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
    }
    setLoading(false);
  };

  // Group services by category for dropdown grouping
  const groupedServices = services.reduce((acc, current) => {
    if (!acc[current.category]) {
      acc[current.category] = [];
    }
    acc[current.category].push(current);
    return acc;
  }, {});

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl border border-border shadow-xl text-center space-y-6">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-foreground">Booking Confirmed!</h2>
        <p className="text-muted-foreground">We'll see you soon at MS. Saloon, {formData.customerName}!</p>
        <button onClick={() => window.location.href = '/'} className="w-full bg-primary text-white py-4 rounded-2xl font-bold">Return Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Side */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-8">
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Scissors className="h-8 w-8 text-primary" /> Instant Booking
            </h1>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full p-4 bg-white border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter full name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                  <input 
                    required
                    type="tel"
                    className="w-full p-4 bg-white border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Select Service</label>
                  <select 
                    className="w-full p-4 bg-white border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-medium"
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                  >
                    {Object.keys(groupedServices).map(category => (
                      <optgroup key={category} label={category} className="font-bold text-primary">
                        {groupedServices[category].map(s => (
                          <option key={s.id} value={`${s.name} (${s.price})`} className="text-foreground font-medium">
                            {s.name} — {s.price}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-lg font-black text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> 1. Pick a Date
                  </label>
                  <input 
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="p-3 bg-muted border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                  />
                </div>
              </div>

              {/* Barber & Slot Grid */}
              <div className="space-y-6">
                <label className="text-lg font-black text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> 2. Pick Your Stylist & Time (Booked slots are hidden)
                </label>
                
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2].map(i => (
                      <div key={i} className="animate-pulse space-y-3">
                        <div className="h-6 w-32 bg-muted rounded" />
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map(j => <div key={j} className="h-10 bg-muted rounded-lg" />)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {barbers.map(barber => (
                      <div key={barber.id} className="space-y-4 border-l-4 border-muted pl-6 focus-within:border-primary transition-all">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <h3 className="font-bold text-lg text-foreground">{barber.name}</h3>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-black">Stylist</span>
                        </div>
                        
                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                          {!barberSlots[barber.id] || barberSlots[barber.id].length === 0 ? (
                            <p className="text-xs text-muted-foreground italic col-span-full">No available slots for today.</p>
                          ) : (
                            barberSlots[barber.id].map(slot => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleSlotSelect(barber, slot)}
                                className={`py-2 px-3 rounded-xl border transition-all text-sm font-bold ${
                                  formData.barberId === barber.id && formData.bookingTime === slot
                                  ? 'bg-primary text-white border-primary shadow-lg scale-105'
                                  : 'bg-white border-border text-foreground hover:border-primary/40'
                                }`}
                              >
                                {slot}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 font-bold text-sm bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}

              <button 
                type="submit"
                disabled={loading || !formData.bookingTime}
                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? 'Confirming...' : 'Complete Booking'}
              </button>
            </form>
          </div>
        </div>

        {/* Summary Side */}
        <div className="space-y-6">
          <div className="bg-foreground text-white p-8 rounded-3xl shadow-xl space-y-6 sticky top-8">
            <h3 className="text-xl font-bold border-b border-white/10 pb-4">Booking Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Service</span>
                <span className="font-bold text-right text-sm leading-snug">{formData.service}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Stylist</span>
                <span className="font-bold">{formData.barberName || 'Not selected'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Date</span>
                <span className="font-bold">{formData.bookingDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-sm">Time</span>
                <span className="font-bold text-primary-foreground text-lg">{formData.bookingTime || '--:--'}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-xs text-white/50 leading-relaxed">
              📍 MS. Saloon - Men's Parlour<br />
              📞 Call: +91 9708286099<br />
              * Please arrive 5 minutes before your appointment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
