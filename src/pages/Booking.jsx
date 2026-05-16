import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Calendar, Clock, User, Phone, CheckCircle, ChevronRight, Scissors } from 'lucide-react';
import { format } from 'date-fns';

const services = [
  { id: 'haircut', name: 'Haircut & Styling', price: '₹500' },
  { id: 'beard', name: 'Beard Grooming', price: '₹300' },
  { id: 'color', name: 'Coloring', price: '₹1200+' },
  { id: 'facial', name: 'Facial Treatment', price: '₹800' }
];

const defaultTimeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Booking = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    service: services[0].name,
    barberId: '',
    barberName: '',
    bookingDate: format(new Date(), 'yyyy-MM-dd'),
    bookingTime: ''
  });

  const [barbers, setBarbers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (formData.barberId && formData.bookingDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [formData.barberId, formData.bookingDate]);

  const fetchBarbers = async () => {
    const querySnapshot = await getDocs(collection(db, 'barbers'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBarbers(data);
    if (data.length > 0) {
      setFormData(prev => ({ ...prev, barberId: data[0].id, barberName: data[0].name }));
    }
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      // 1. Get Admin-defined slots
      const availRef = doc(db, 'barberAvailability', `${formData.barberId}_${formData.bookingDate}`);
      const availSnap = await getDoc(availRef);
      
      // Default to ALL slots if admin hasn't set anything yet
      const allowedSlots = availSnap.exists() ? availSnap.data().slots : defaultTimeSlots;

      // 2. Get existing appointments
      const q = query(
        collection(db, 'appointments'),
        where('barberId', '==', formData.barberId),
        where('bookingDate', '==', formData.bookingDate)
      );
      const querySnapshot = await getDocs(q);
      const bookedSlots = querySnapshot.docs.map(doc => doc.data().bookingTime);

      // 3. Filter
      const finalSlots = allowedSlots.filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(finalSlots);
    } catch (err) {
      console.error("Error fetching slots:", err);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingTime) {
      setError('Please select a time slot.');
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

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl border border-border shadow-xl text-center space-y-6">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-foreground">Booking Confirmed!</h2>
        <p className="text-muted-foreground">We'll see you soon, {formData.customerName}!</p>
        <button onClick={() => window.location.href = '/'} className="w-full bg-primary text-white py-4 rounded-2xl font-bold">Return Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Side */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-8">
            <h1 className="text-3xl font-black flex items-center gap-3">
              <Scissors className="h-8 w-8 text-primary" /> Book Appointment
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Your Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full p-4 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20"
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
                    className="w-full p-4 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Service</label>
                  <select 
                    className="w-full p-4 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-medium"
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                  >
                    {services.map(s => <option key={s.id} value={s.name}>{s.name} ({s.price})</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <User className="h-4 w-4" /> Select Your Stylist
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {barbers.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setFormData({...formData, barberId: b.id, barberName: b.name})}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${
                          formData.barberId === b.id 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'border-border hover:border-primary/30 bg-white'
                        }`}
                      >
                        <p className={`font-bold ${formData.barberId === b.id ? 'text-primary' : 'text-foreground'}`}>
                          {b.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black mt-1">Stylist</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> 1. Select Date
                </label>
                <input 
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full sm:w-64 p-4 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold"
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4" /> 2. Select Time Slot
                </label>
                {loading ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />)}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    No slots available for this selection.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData({...formData, bookingTime: slot})}
                        className={`py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                          formData.bookingTime === slot 
                          ? 'bg-primary text-white border-primary shadow-lg scale-105' 
                          : 'bg-white border-border text-foreground hover:border-primary/50'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 font-bold text-sm">{error}</p>}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Confirming...' : 'Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>

        {/* Info Side */}
        <div className="space-y-6">
          <div className="bg-primary p-8 rounded-3xl text-white shadow-xl">
            <h3 className="text-xl font-bold mb-4">Why Book With Us?</h3>
            <ul className="space-y-4 text-sm font-medium opacity-90">
              <li className="flex items-center gap-3">
                <div className="bg-white/20 p-1 rounded-full"><CheckCircle className="h-4 w-4" /></div>
                Experienced Professionals
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-white/20 p-1 rounded-full"><CheckCircle className="h-4 w-4" /></div>
                Premium Products Only
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-white/20 p-1 rounded-full"><CheckCircle className="h-4 w-4" /></div>
                Relaxing Environment
              </li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-4">
            <h3 className="font-bold text-foreground">Salon Location</h3>
            <p className="text-sm text-muted-foreground">123 Barber Street, Suite 100<br/>New York, NY 10001</p>
            <div className="pt-2">
              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Call Us</p>
              <p className="font-bold">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
