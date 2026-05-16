import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { User, Plus, Trash2, Calendar, Clock, Check, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const BarberManagement = () => {
  const [barbers, setBarbers] = useState([]);
  const [newBarberName, setNewBarberName] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    if (selectedBarber && selectedDate) {
      fetchAvailability();
    }
  }, [selectedBarber, selectedDate]);

  const fetchBarbers = async () => {
    const querySnapshot = await getDocs(collection(db, 'barbers'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBarbers(data);
    if (data.length > 0 && !selectedBarber) setSelectedBarber(data[0]);
    setLoading(false);
  };

  const fetchAvailability = async () => {
    const docRef = doc(db, 'barberAvailability', `${selectedBarber.id}_${selectedDate}`);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setAvailability(docSnap.data().slots || []);
    } else {
      setAvailability([]);
    }
  };

  const handleAddBarber = async (e) => {
    e.preventDefault();
    if (!newBarberName.trim()) return;
    await addDoc(collection(db, 'barbers'), { name: newBarberName, active: true });
    setNewBarberName('');
    fetchBarbers();
  };

  const handleDeleteBarber = async (id) => {
    if (window.confirm('Delete this barber?')) {
      await deleteDoc(doc(db, 'barbers', id));
      fetchBarbers();
      if (selectedBarber?.id === id) setSelectedBarber(null);
    }
  };

  const toggleSlot = async (slot) => {
    const newSlots = availability.includes(slot)
      ? availability.filter(s => s !== slot)
      : [...availability, slot];
    
    setAvailability(newSlots);
    const docRef = doc(db, 'barberAvailability', `${selectedBarber.id}_${selectedDate}`);
    await setDoc(docRef, { 
      barberId: selectedBarber.id, 
      date: selectedDate, 
      slots: newSlots 
    });
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Barber List */}
        <div className="bg-white p-6 rounded-3xl border border-border shadow-sm h-fit">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Manage Barbers
          </h2>
          
          <form onSubmit={handleAddBarber} className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="Barber Name"
              className="flex-1 px-3 py-2 rounded-xl border border-border text-sm outline-none focus:ring-2 focus:ring-primary/20"
              value={newBarberName}
              onChange={(e) => setNewBarberName(e.target.value)}
            />
            <button type="submit" className="bg-primary text-white p-2 rounded-xl hover:bg-primary/90">
              <Plus className="h-5 w-5" />
            </button>
          </form>

          <div className="space-y-2">
            {barbers.map(barber => (
              <div 
                key={barber.id}
                onClick={() => setSelectedBarber(barber)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedBarber?.id === barber.id ? 'bg-primary/5 border-primary shadow-sm' : 'border-transparent hover:bg-muted'
                }`}
              >
                <span className="font-medium text-sm">{barber.name}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteBarber(barber.id); }}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Grid */}
        <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-border shadow-sm">
          {!selectedBarber ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground italic">
              Select a barber to manage availability
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedBarber.name}'s Schedule</h2>
                  <p className="text-muted-foreground text-sm">Select a date and toggle available slots</p>
                </div>
                <input 
                  type="date" 
                  className="px-4 py-2 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20"
                  value={selectedDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Clock className="h-4 w-4" /> Available Slots for {format(new Date(selectedDate + 'T00:00:00'), 'MMM dd, yyyy')}
                  </div>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Clear custom slots and reset to all-day availability?')) {
                        await deleteDoc(doc(db, 'barberAvailability', `${selectedBarber.id}_${selectedDate}`));
                        fetchAvailability();
                      }
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Reset to Default
                  </button>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(slot)}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                        availability.includes(slot)
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-muted text-muted-foreground border-transparent hover:border-primary/30'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <div className="bg-primary/5 p-4 rounded-2xl text-xs text-primary font-medium mt-4">
                  <p>💡 **Default Behavior:** If no slots are selected above, the system automatically opens ALL slots for this day.</p>
                  <p className="mt-1 opacity-80">• Click slots to restrict availability to specific times.</p>
                  <p className="opacity-80">• Use "Reset to Default" to open the whole day again.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarberManagement;
