import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Calendar, Clock, User, Phone, CheckCircle, ChevronRight, Scissors, Star } from 'lucide-react';
import { format, addDays } from 'date-fns';

const services = [
  { id: 'haircut', name: 'Haircut & Styling', price: '$30', duration: '45 min' },
  { id: 'beard', name: 'Beard Grooming', price: '$20', duration: '30 min' },
  { id: 'color', name: 'Coloring', price: '$50+', duration: '90 min' },
  { id: 'facial', name: 'Facial Treatment', price: '$40', duration: '45 min' }
];

const Booking = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    service: '',
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
    }
  }, [formData.barberId, formData.bookingDate]);

  const fetchBarbers = async () => {
    const querySnapshot = await getDocs(collection(db, 'barbers'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBarbers(data);
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      // 1. Get Admin-defined slots for this barber/date
      const availRef = doc(db, 'barberAvailability', `${formData.barberId}_${formData.bookingDate}`);
      const availSnap = await getDoc(availRef);
      const adminSlots = availSnap.exists() ? availSnap.data().slots : [];

      if (adminSlots.length === 0) {
        setAvailableSlots([]);
        setLoading(false);
        return;
      }

      // 2. Get existing appointments for this barber/date
      const q = query(
        collection(db, 'appointments'),
        where('barberId', '==', formData.barberId),
        where('bookingDate', '==', formData.bookingDate)
      );
      const querySnapshot = await getDocs(q);
      const bookedSlots = querySnapshot.docs.map(doc => doc.data().bookingTime);

      // 3. Filter out booked slots
      const finalSlots = adminSlots.filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(finalSlots);
    } catch (err) {
      console.error("Error fetching slots:", err);
    }
    setLoading(false);
  };

  const handleBarberSelect = (barber) => {
    setFormData({ ...formData, barberId: barber.id, barberName: barber.name });
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl border border-border shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-black text-foreground">Booking Confirmed!</h2>
        <p className="text-muted-foreground">We've received your appointment request. See you soon!</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-black text-foreground tracking-tight">Book Your Experience</h1>
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-2 w-12 rounded-full transition-all ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-border shadow-2xl overflow-hidden">
        {/* Step 1: Service */}
        {step === 1 && (
          <div className="p-8 space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2"><Scissors className="h-5 w-5" /> Select Service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setFormData({...formData, service: s.name}); setStep(2); }}
                  className="flex items-center justify-between p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div>
                    <p className="font-bold text-lg group-hover:text-primary transition-colors">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.duration}</p>
                  </div>
                  <p className="font-black text-primary">{s.price}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Barber */}
        {step === 2 && (
          <div className="p-8 space-y-6 animate-in slide-in-from-right duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2"><User className="h-5 w-5" /> Choose Your Stylist</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {barbers.length === 0 ? (
                <p className="text-muted-foreground col-span-2 text-center py-10">No barbers available at the moment.</p>
              ) : (
                barbers.map(b => (
                  <button
                    key={b.id}
                    onClick={() => handleBarberSelect(b)}
                    className="flex items-center gap-4 p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="bg-muted p-3 rounded-xl group-hover:bg-primary/10 transition-colors">
                      <User className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{b.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> Professional Stylist</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <button onClick={() => setStep(1)} className="text-muted-foreground font-bold hover:text-foreground">← Back to services</button>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div className="p-8 space-y-8 animate-in slide-in-from-right duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Calendar className="h-5 w-5" /> Select Date</h2>
                <input 
                  type="date"
                  className="w-full p-4 rounded-2xl border-2 border-border outline-none focus:border-primary transition-all text-lg font-bold"
                  value={formData.bookingDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="h-5 w-5" /> Select Time</h2>
                {loading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />)}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-6 bg-muted/50 rounded-2xl text-center">
                    <p className="text-sm text-muted-foreground font-medium">No slots available for this date/barber. Try another selection.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => { setFormData({...formData, bookingTime: slot}); setStep(4); }}
                        className="py-3 rounded-xl border-2 border-border font-bold hover:border-primary hover:text-primary transition-all text-sm"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setStep(2)} className="text-muted-foreground font-bold hover:text-foreground">← Back to stylist</button>
          </div>
        )}

        {/* Step 4: Final Details */}
        {step === 4 && (
          <div className="p-8 space-y-8 animate-in slide-in-from-right duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2"><User className="h-5 w-5" /> Your Contact Info</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Full Name</label>
                  <input 
                    required
                    type="text"
                    className="w-full p-4 rounded-2xl border-2 border-border outline-none focus:border-primary transition-all"
                    placeholder="Enter your name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground">Phone Number</label>
                  <input 
                    required
                    type="tel"
                    className="w-full p-4 rounded-2xl border-2 border-border outline-none focus:border-primary transition-all"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-muted/50 p-6 rounded-3xl space-y-3">
                <h3 className="font-bold text-foreground">Summary</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-bold">{formData.service}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Barber:</span>
                  <span className="font-bold">{formData.barberName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-bold">{formData.bookingDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-bold">{formData.bookingTime}</span>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-muted py-4 rounded-2xl font-bold hover:bg-muted/80 transition-all"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : 'Confirm Appointment'}
                  {!loading && <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
