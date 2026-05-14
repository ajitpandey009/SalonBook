import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { LogIn, Scissors } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-border space-y-8 text-center">
        <div className="space-y-2">
          <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scissors className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground">Please sign in to manage appointments</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-border py-4 rounded-xl font-bold hover:bg-muted transition-all group disabled:opacity-70"
        >
          {loading ? (
             <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground pt-4">
          By continuing, you agree to the SalonBook Admin terms and security policies.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
