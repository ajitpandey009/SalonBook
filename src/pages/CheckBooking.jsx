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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="relative bg-white rounded-3xl border border-border shadow-xl hover:shadow-2xl transition-all group overflow-hidden flex flex-col justify-between">
              
              {/* Ticket Top Section */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-muted pb-3">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-primary" />
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">MS. Saloon Pass</span>
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {appointment.status || 'Pending'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">Service Requested</span>
                  <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                    {appointment.service}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Customer</span>
                    <p className="font-bold text-sm text-foreground truncate">{appointment.customerName}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Stylist</span>
                    <p className="font-bold text-sm text-foreground truncate">{appointment.barberName || 'Salon Expert'}</p>
                  </div>
                </div>
              </div>

              {/* Boarding Pass Dashed Divider with Notches */}
              <div className="relative h-4 flex items-center justify-between">
                {/* Left Notch */}
                <div className="w-5 h-5 bg-background border-r border-border rounded-full absolute -left-2.5 z-10" />
                
                {/* Dashed Line */}
                <div className="w-full border-t-2 border-dashed border-border/80 mx-4" />
                
                {/* Right Notch */}
                <div className="w-5 h-5 bg-background border-l border-border rounded-full absolute -right-2.5 z-10" />
              </div>

              {/* Ticket Bottom Section */}
              <div className="p-6 bg-muted/20 border-t border-border/40 space-y-4 rounded-b-3xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Appointment Date</span>
                    <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary shrink-0" />
                      {appointment.bookingDate}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider">Scheduled Time</span>
                    <p className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      {appointment.bookingTime}
                    </p>
                  </div>
                </div>

                {/* Aesthetic Barcode */}
                <div className="pt-2 flex flex-col items-center gap-1 border-t border-border/50">
                  <div className="flex gap-[2px] h-6 items-center justify-center opacity-40">
                    <div className="w-[1.5px] h-full bg-foreground" />
                    <div className="w-[3px] h-full bg-foreground" />
                    <div className="w-[1px] h-full bg-foreground" />
                    <div className="w-[2px] h-full bg-foreground" />
                    <div className="w-[1px] h-full bg-foreground" />
                    <div className="w-[4px] h-full bg-foreground" />
                    <div className="w-[1.5px] h-full bg-foreground" />
                    <div className="w-[2px] h-full bg-foreground" />
                    <div className="w-[3px] h-full bg-foreground" />
                    <div className="w-[1px] h-full bg-foreground" />
                    <div className="w-[2px] h-full bg-foreground" />
                    <div className="w-[4px] h-full bg-foreground" />
                  </div>
                  <span className="text-[8px] font-mono tracking-widest text-muted-foreground uppercase opacity-60">
                    MS-{appointment.id?.substring(0, 8)}
                  </span>
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
