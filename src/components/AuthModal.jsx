import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, Home, CreditCard, Shield, AlertCircle } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Extended student registration fields
  const [name, setName] = useState('');
  const [hometown, setHometown] = useState('');
  const [nic, setNic] = useState('');
  const [contact, setContact] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [fatherContact, setFatherContact] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherContact, setMotherContact] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [role, setRole] = useState('student');
  const [adminPasscode, setAdminPasscode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await signIn(email, password);
        onClose();
      } else {
        // Extended registration
        if (role === 'admin' && adminPasscode !== 'ADMIN123') {
          throw new Error('Invalid Admin Passcode! Use ADMIN123 for test setup.');
        }

        await signUp(email, password, {
          name,
          hometown,
          nic,
          contact,
          parentsDetails: {
            fatherName,
            fatherContact,
            motherName,
            motherContact
          },
          roomNumber: roomNumber || 'Unassigned',
          role
        });
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-card p-6 md:p-8 my-8 border-slate-700/80 shadow-2xl">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title & Tabs */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {activeTab === 'login' ? 'Welcome Back to Bodima' : 'Student & Admin Registration'}
          </h2>
          <p className="text-xs text-slate-400">
            {activeTab === 'login' ? 'Sign in to access payments, bills & boarding details' : 'Fill in complete details to register your boarding account'}
          </p>

          {/* Tabs switch */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl mt-4 border border-slate-800">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kasun@boarding.lk"
                className="w-full glass-input pl-10 text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-10 text-sm"
              />
            </div>
          </div>

          {/* EXTENDED REGISTRATION FIELDS */}
          {activeTab === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kasun Perera"
                    className="w-full glass-input pl-10 text-sm"
                  />
                </div>
              </div>

              {/* Hometown & NIC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hometown</label>
                  <div className="relative">
                    <Home className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={hometown}
                      onChange={(e) => setHometown(e.target.value)}
                      placeholder="Kandy"
                      className="w-full glass-input pl-10 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">NIC Number</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={nic}
                      onChange={(e) => setNic(e.target.value)}
                      placeholder="199834200192"
                      className="w-full glass-input pl-10 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Student Contact & Room Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="+94771234567"
                      className="w-full glass-input pl-10 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="Room 101"
                    className="w-full glass-input text-sm"
                  />
                </div>
              </div>

              {/* Parents' Details Section */}
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Parents' Details</div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Father's Name"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="glass-input text-xs"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Father's Contact"
                    value={fatherContact}
                    onChange={(e) => setFatherContact(e.target.value)}
                    className="glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Mother's Name"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    className="glass-input text-xs"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mother's Contact"
                    value={motherContact}
                    onChange={(e) => setMotherContact(e.target.value)}
                    className="glass-input text-xs"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Account Role</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={role === 'student'}
                      onChange={() => setRole('student')}
                      className="accent-indigo-500"
                    />
                    Student
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={() => setRole('admin')}
                      className="accent-indigo-500"
                    />
                    Admin / Warden
                  </label>
                </div>

                {role === 'admin' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                      Admin Passcode (Use <span className="font-mono bg-amber-950 px-1 py-0.5 rounded text-amber-200">ADMIN123</span>)
                    </label>
                    <input
                      type="password"
                      required
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      placeholder="ADMIN123"
                      className="w-full glass-input text-xs border-amber-500/40"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn mt-4 py-3"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : activeTab === 'login' ? (
              'Sign In to Dashboard'
            ) : (
              'Create Boarding Account'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
