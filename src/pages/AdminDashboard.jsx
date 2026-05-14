import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Trash2, LogOut, Calendar, Clock, User, Phone, Briefcase, Filter, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAppointments(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await deleteDoc(doc(db, 'appointments', id));
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'confirmed' : 'pending';
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage all salon bookings and schedules</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right mr-4">
            <p className="text-sm font-bold">{auth.currentUser?.displayName}</p>
            <p className="text-xs text-muted-foreground">{auth.currentUser?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-xl font-medium hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Stats or Filter (Optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Total Bookings</p>
          <p className="text-3xl font-black">{appointments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Confirmed</p>
          <p className="text-3xl font-black text-green-600">
            {appointments.filter(a => a.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Pending</p>
          <p className="text-3xl font-black text-amber-500">
            {appointments.filter(a => a.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Service</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Schedule</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    No appointments found yet.
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{appointment.customerName}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {appointment.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className="bg-muted px-3 py-1 rounded-full text-foreground border border-border">
                        {appointment.service}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-primary" /> {appointment.bookingDate}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {appointment.bookingTime}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(appointment.id, appointment.status)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                          appointment.status === 'confirmed'
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
