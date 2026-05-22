import React, { useState } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Search, Phone, Calendar, Clock, User, Scissors, CheckCircle, AlertCircle } from 'lucide-react';

const CheckBooking = () => {
  const [phone, setPhone] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const q = query(
        collection(db, 'appointments'),
        where('phone', '==', phone.trim())
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort in memory to avoid needing composite index in Firestore
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setAppointments(data);
    } catch (err) {
      console.error("Search failed:", err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-foreground tracking-tight">Find Your Booking</h1>
        <p className="text-muted-foreground">Enter your phone number to see your upcoming appointments</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-border shadow-2xl space-y-8 max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              required
              type="tel"
              placeholder="Enter your phone number"
              className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-base sm:text-lg font-medium"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-4 sm:py-0 px-8 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? 'Searching...' : <><Search className="h-5 w-5" /> Search</>}
          </button>
        </form>

        {searched && !loading && appointments.length === 0 && (
          <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-6 w-6 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-900">No appointments found</h3>
              <p className="text-sm text-amber-700">We couldn't find any bookings for this number. Please double-check the number or make a new booking.</p>
            </div>
          </div>
        )}
      </div>

      {appointments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-3xl border border-border shadow-md overflow-hidden hover:shadow-xl transition-all group">
              <div className={`p-1 text-center text-[10px] font-black uppercase tracking-widest ${
                appointment.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'
              }`}>
                {appointment.status || 'Pending'}
              </div>
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-foreground">{appointment.service}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                      <User className="h-4 w-4" /> {appointment.customerName}
                    </p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                    <Scissors className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Date</p>
                    <p className="font-bold flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" /> {appointment.bookingDate}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Time</p>
                    <p className="font-bold flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" /> {appointment.bookingTime}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Stylist</p>
                    <p className="text-sm font-bold text-foreground">{appointment.barberName || 'Salon Expert'}</p>
                  </div>
                  {appointment.status === 'confirmed' && (
                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                      <CheckCircle className="h-3.5 w-3.5" /> Confirmed
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CheckBooking;
