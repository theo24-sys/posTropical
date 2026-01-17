
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, ChevronRight, ArrowLeft } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (pin === selectedUser.pin) {
      onLogin(selectedUser);
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setError('');
    setPin('');
  };

  // Helper to get avatar colors based on role
  const getAvatarStyles = (role: string) => {
    if (role === 'Admin') return 'bg-purple-100 text-purple-600';
    if (role === 'Cashier') return 'bg-blue-100 text-blue-600';
    if (role === 'Chef') return 'bg-green-100 text-green-600';
    if (role === 'Barista') return 'bg-teal-100 text-teal-600';
    return 'bg-orange-100 text-orange-600'; // Waiter
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans overflow-hidden">
      
      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex w-1/2 relative bg-coffee-900 items-center justify-center p-12">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
           <div className="w-80 h-80 bg-white rounded-full flex items-center justify-center p-10 mb-8 shadow-2xl border-4 border-white/20">
              <img 
                src={LOGO_URL} 
                alt="Tropical Dreams Logo" 
                className="w-full h-full object-contain drop-shadow-sm"
              />
           </div>

           <div className="mt-4">
             <h1 className="font-serif text-5xl font-bold leading-tight mb-4 text-white">
               Tropical Dreams<br/>Coffee House
             </h1>
             <p className="text-lg text-coffee-100 max-w-md mx-auto font-light">
               Experience the finest blends and meals in the heart of Lodwar.
             </p>
           </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN INTERFACE */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-4 shadow-sm border border-gray-100 p-4">
               <img src={LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-gray-900">Tropical Dreams</h1>
          </div>

          {!selectedUser ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-500">Select your account to continue</p>
              </div>

              <div className="space-y-4">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className="w-full bg-white border border-gray-100 p-4 rounded-2xl flex items-center gap-5 hover:border-gray-300 hover:shadow-lg transition-all group text-left shadow-sm"
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110 overflow-hidden ${!user.avatar ? getAvatarStyles(user.role) : 'bg-gray-100'}`}>
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon size={24} />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-black">{user.name}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{user.role}</p>
                    </div>

                    <div className="text-gray-300 group-hover:text-gray-600 transition-colors">
                      <ChevronRight size={24} />
                    </div>
                  </button>
                ))}

                {users.length === 0 && (
                  <div className="p-6 bg-red-50 rounded-xl text-red-600 text-center text-sm">
                    No users found in database.
                  </div>
                )}
              </div>
              
              <p className="text-center text-gray-300 text-xs mt-12">
                &copy; {new Date().getFullYear()} Tropical Dreams POS System
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <button 
                onClick={() => setSelectedUser(null)}
                className="mb-8 text-gray-400 hover:text-gray-800 flex items-center gap-2 transition-colors font-medium"
              >
                <ArrowLeft size={20} /> Back to users
              </button>

              <div className="text-center mb-10">
                 <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold shadow-xl overflow-hidden ${!selectedUser.avatar ? getAvatarStyles(selectedUser.role) : 'bg-gray-100'}`}>
                    {selectedUser.avatar ? (
                        <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                    ) : (
                        selectedUser.name.charAt(0)
                    )}
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900">Hello, {selectedUser.name}</h2>
                 <p className="text-gray-500">Enter your PIN to access the system</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <div className="relative">
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => { setPin(e.target.value); setError(''); }}
                      className={`w-full text-center text-4xl font-bold tracking-[0.5em] py-5 border-b-2 bg-transparent outline-none transition-all placeholder:text-gray-200
                        ${error ? 'border-red-500 text-red-600' : 'border-gray-200 focus:border-black text-gray-800'}
                      `}
                      placeholder="••••"
                      maxLength={4}
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none">
                      <Lock className={`w-5 h-5 ${error ? 'text-red-400' : 'text-gray-300'}`} />
                    </div>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-3 text-center font-medium animate-pulse">{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={pin.length < 1}
                  className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  Login to POS
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
