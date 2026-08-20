import React, { useState } from 'react';
import { addUtilityBill } from '../services/dbService';
import { X, Cpu, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export const WebhookSimulatorModal = ({ isOpen, onClose, onBillAdded }) => {
  const [billType, setBillType] = useState('Electricity');
  const [amount, setAmount] = useState('12500');
  const [month, setMonth] = useState('August 2026');
  const [parsedSmsText, setParsedSmsText] = useState('CEB SMS Alert: Bill amount LKR 12,500 due for August 2026.');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSimulateWebhook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      // Simulate payload received by Firebase Cloud Function HTTP Trigger `utilityBillWebhook`
      const payload = {
        type: billType,
        amount: Number(amount),
        month: month,
        description: `Auto-parsed SMS: ${parsedSmsText}`,
        source: 'webhook'
      };

      await addUtilityBill(payload);
      setSuccessMsg(`Webhook payload processed successfully! Added ${billType} bill of LKR ${Number(amount).toLocaleString()} to Firestore.`);
      onBillAdded();
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-card p-6 border-slate-700/80 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Utility Bill Webhook Simulator</h3>
            <p className="text-xs text-slate-400">Simulate external Tasker / Zapier SMS parsing automation</p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSimulateWebhook} className="space-y-4">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              POST /api/utilityBillWebhook
            </div>
            <p className="text-[10px] text-slate-500">
              Payload matches Firebase Cloud Function HTTP trigger specification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bill Type</label>
              <select
                value={billType}
                onChange={(e) => setBillType(e.target.value)}
                className="w-full glass-input text-xs bg-slate-900"
              >
                <option value="Water">Water (NWSDB)</option>
                <option value="Electricity">Electricity (CEB)</option>
                <option value="Internet">Internet (SLT Fiber)</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Parsed Amount (LKR)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full glass-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Month</label>
            <input
              type="text"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Raw SMS Log Text</label>
            <textarea
              rows={2}
              value={parsedSmsText}
              onChange={(e) => setParsedSmsText(e.target.value)}
              className="w-full glass-input text-xs resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn py-2.5 text-xs mt-2"
          >
            {loading ? (
              <span>Posting to Firebase Function...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Simulate Webhook Call</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
