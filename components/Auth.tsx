
import React, { useState, useRef } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { saveUser, getUserById } from '../services/firestoreService';
import { User, UserRole } from '../types';

const Auth: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      
      // Check if user exists in our DB
      const existingUser = await getUserById(fbUser.uid);
      
      if (!existingUser) {
        // Create new record for social user
        const names = fbUser.displayName?.split(' ') || ['Unknown', 'User'];
        const newUser: User = {
          id: fbUser.uid,
          firstName: names[0],
          lastName: names.slice(1).join(' ') || 'User',
          email: fbUser.email || '',
          role: 'Editor' as UserRole,
          title: 'Strategic Partner',
          active: true,
          avatar: fbUser.photoURL || undefined
        };
        await saveUser(newUser);
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        
        // Default avatar if none uploaded
        const finalAvatar = avatar || `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;

        await updateProfile(fbUser, {
          displayName: `${firstName} ${lastName}`,
          photoURL: finalAvatar
        });

        const newUser: User = {
          id: fbUser.uid,
          firstName,
          lastName,
          email,
          role: 'Editor' as UserRole, // Default new users to Editor
          title,
          active: true,
          avatar: finalAvatar
        };

        await saveUser(newUser);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Password or Email Incorrect');
      } else {
        setError(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl mb-6">
            <i className="fas fa-bolt text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">POWER SHIFTER</h1>
          <p className="text-slate-400 mt-2 font-light text-sm uppercase tracking-widest">Strategy OS</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setIsRegistering(false)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${!isRegistering ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsRegistering(true)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${isRegistering ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Register
            </button>
          </div>

          <div className="p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              {error && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <i className="fas fa-exclamation-circle text-rose-500"></i>
                  <p className="text-xs font-bold text-rose-600">{error}</p>
                </div>
              )}

              {isRegistering && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center mb-6">
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-400 transition-colors"
                     >
                       {avatar ? (
                         <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                         <div className="text-center">
                           <i className="fas fa-camera text-slate-400 group-hover:text-blue-500 transition-colors"></i>
                           <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Upload</p>
                         </div>
                       )}
                     </div>
                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                      <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input required type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Professional Title</label>
                    <input required type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chief Strategy Officer" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <i className="far fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || googleLoading}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  isRegistering ? 'Create Account' : 'Sign In'
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold text-slate-300">
                <span className="bg-white px-4 tracking-widest">OR</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {googleLoading ? (
                <i className="fas fa-circle-notch animate-spin text-blue-500"></i>
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Sign in with Google
                </>
              )}
            </button>
            
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8">
              Secured by Firebase Enterprise
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
