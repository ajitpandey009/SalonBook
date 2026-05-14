import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { format, addDays, isSameDay } from 'date-fns';
import { Calendar, Clock, User, Phone, Briefcase, CheckCircle2 } from 'lucide-react';

const services = [
  'Haircut & Styling',
  'Coloring & Highlights',
  'Beard Grooming',
  'Facial Treatment'
];

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Booking = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    service: services[0],
    bookingDate: format(new Date(), 'yyyy-MM-dd'),
    bookingTime: ''
  });

  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch booked slots for the selected date
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!formData.bookingDate) return;
      
      try {
        const q = query(
          collection(db, 'appointments'),
          where('bookingDate', '==', formData.bookingDate)
        );
        const querySnapshot = await getDocs(q);
        const slots = querySnapshot.docs.map(doc => doc.data().bookingTime);
        setBookedSlots(slots);
      } catch (err) {
        console.error("Error fetching slots:", err);
      }
    };

    fetchBookedSlots();
  }, [formData.bookingDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.bookingTime) {
      setError('Please select a time slot');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Final check for double booking
      const q = query(
        collection(db, 'appointments'),
        where('bookingDate', '==', formData.bookingDate),
        where('bookingTime', '==', formData.bookingTime)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setError('This slot was just booked. Please select another time.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'appointments'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-border text-center max-w-md w-full space-y-6">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Booking Confirmed!</h2>
          <p className="text-muted-foreground">
            Thank you, <span className="font-semibold text-foreground">{formData.customerName}</span>. Your appointment for <span className="font-semibold text-foreground">{formData.service}</span> on <span className="font-semibold text-foreground">{formData.bookingDate}</span> at <span className="font-semibold text-foreground">{formData.bookingTime}</span> has been received.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-border overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Info Side */}
        <div className="bg-primary p-8 md:p-12 text-white space-y-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Book Your Visit</h2>
            <p className="text-primary-foreground/80 leading-relaxed">
              Take a moment for yourself. Choose your service and a convenient time. We'll take care of the rest.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm opacity-70">Duration</p>
                <p className="font-medium">Varies by service</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm opacity-70">Availability</p>
                <p className="font-medium">Mon - Sat, 9am - 6pm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Full Name
              </label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> Phone Number
              </label>
              <input 
                type="tel" 
                required
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Service
              </label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white"
                value={formData.service}
                onChange={(e) => setFormData({...formData, service: e.target.value})}
              >
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Date
              </label>
              <input 
                type="date" 
                required
                min={format(new Date(), 'yyyy-MM-dd')}
                max={format(addDays(new Date(), 14), 'yyyy-MM-dd')}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                value={formData.bookingDate}
                onChange={(e) => setFormData({...formData, bookingDate: e.target.value, bookingTime: ''})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-primary" /> Select Time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => {
                  const isBooked = bookedSlots.includes(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setFormData({...formData, bookingTime: time})}
                      className={`py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.bookingTime === time 
                        ? 'bg-primary text-white shadow-md' 
                        : isBooked 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through' 
                          : 'bg-muted hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-70"
            >
              {loading ? 'Processing...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
