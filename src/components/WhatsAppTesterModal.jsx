import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const WhatsAppTesterModal = ({ isOpen, onClose, payments = [] }) => {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);

  if (!isOpen) return null;

  // Filter payments logic identical to Cloud Function schedule
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const excusedPayments = payments.filter(p => p.status === 'excused');

  const handleRunScheduledJob = () => {
    setRunning(true);
    setLogs([]);

    setTimeout(() => {
      const generatedLogs = [];
      
      payments.forEach(p => {
        if (p.status === 'pending') {
          generatedLogs.push({
            id: p.id,
            status: 'SENT',
            student: p.userName,
            room: p.userRoom,
            phone: '+94 77 XXX XXXX',
            message: `Hi ${p.userName} (${p.userRoom}), your boarding payment of LKR ${Number(p.amount).toLocaleString()} for ${p.month} is PENDING. Please upload your deposit slip on Bodima App.`
          });
        } else if (p.status === 'excused') {
          generatedLogs.push({
            id: p.id,
            status: 'IGNORED_EXCUSED',
            student: p.userName,
            room: p.userRoom,
            reason: 'User status is EXCUSED. Automated reminder suppressed per system policy.'
          });
        }
      });

      setLogs(generatedLogs);
      setRunning(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-card p-6 border-slate-700/80 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Scheduled WhatsApp Reminder Trigger</h3>
            <p className="text-xs text-slate-400">Simulates Firebase Cloud Function Pub/Sub (Runs on 8th & 20th of every month)</p>
          </div>
        </div>

        {/* Rule highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200">
            <span className="font-bold block mb-1">Targets Pending Payments</span>
            Currently found <strong>{pendingPayments.length} pending</strong> payment records needing reminders.
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-200">
            <span className="font-bold block mb-1">Excused Status Exclusion</span>
            <strong>{excusedPayments.length} excused</strong> users will be strictly ignored by the Cloud Function.
          </div>
        </div>

        <button
          onClick={handleRunScheduledJob}
          disabled={running}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mb-4 transition-all text-xs"
        >
          {running ? (
            <span>Querying Firestore & Triggering WhatsApp API...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Test Trigger Scheduled Job Now</span>
            </>
          )}
        </button>

        {/* Dispatch Log Output */}
        {logs.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cloud Function Dispatch Logs</div>
            {logs.map((log, index) => (
              <div key={index} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{log.student} ({log.room})</span>
                  {log.status === 'SENT' ? (
                    <span className="badge-approved text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> WhatsApp Reminder Sent
                    </span>
                  ) : (
                    <span className="badge-excused text-[10px]">
                      <ShieldCheck className="w-3 h-3" /> Ignored (Excused)
                    </span>
                  )}
                </div>
                {log.message && <p className="text-slate-300 font-mono text-[11px] bg-slate-900 p-2 rounded">{log.message}</p>}
                {log.reason && <p className="text-slate-400 italic text-[11px]">{log.reason}</p>}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
