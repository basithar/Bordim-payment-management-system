import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Home, ShieldCheck, UserCheck, LogOut, LogIn, Sparkles, User, RefreshCw } from 'lucide-react';

export const Navbar = ({ onOpenAuth }) => {
  const { userProfile, logout, isDemoMode, switchDemoRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">Bodima</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">Boarding House Management System</p>
          </div>
        </div>

        {/* Center / Right Control Cluster */}
        <div className="flex items-center gap-3">

          {/* Environment Status Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700/60 text-slate-300">
            {isDemoMode ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Demo Mode</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-emerald-400">Firebase Live</span>
              </>
            )}
          </div>

          {/* Quick Demo Role Switcher for instant testing */}
          {isDemoMode && (
            <div className="relative">
              <button 
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 hover:bg-indigo-900/60 transition-colors"
                title="Switch role instantly to test Admin or Student views"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch View</span>
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                    Select Test Account
                  </div>
                  <button
                    onClick={() => { switchDemoRole('student'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Kasun (Student - Room 101)</span>
                  </button>
                  <button
                    onClick={() => { switchDemoRole('student-2'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Nimali (Student - Room 102)</span>
                  </button>
                  <button
                    onClick={() => { switchDemoRole('admin'); setShowRoleMenu(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mr. Bandara (Warden / Admin)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User Info & Actions */}
          {userProfile ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-white flex items-center justify-end gap-1.5">
                  {userProfile.name}
                  {userProfile.role === 'admin' ? (
                    <span className="badge-pending bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                      ADMIN
                    </span>
                  ) : (
                    <span className="badge-approved bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                      {userProfile.roomNumber || 'STUDENT'}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">{userProfile.email}</div>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 border border-slate-700/60 transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="gradient-btn text-xs py-2 px-4"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
