import React from 'react';
import { Zap, Droplets, Wifi, Receipt, Cpu } from 'lucide-react';

export const UtilityBillsWidget = ({ bills = [] }) => {
  const getBillIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'water':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'electricity':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'internet':
        return <Wifi className="w-5 h-5 text-indigo-400" />;
      default:
        return <Receipt className="w-5 h-5 text-purple-400" />;
    }
  };

  const totalBillAmount = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  return (
    <div className="glass-card p-6 border-slate-800">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Monthly Utility Bills</h3>
            <p className="text-xs text-slate-400">Received via Firebase HTTP Webhook & Admin Portal</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 font-medium">Total Utility Cost</div>
          <div className="text-lg font-extrabold text-emerald-400">
            LKR {totalBillAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs">
          No utility bills recorded for this cycle yet.
        </div>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  {getBillIcon(bill.type)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {bill.type} Bill
                    {bill.source === 'webhook' && (
                      <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                        <Cpu className="w-2.5 h-2.5" />
                        Webhook Auto
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {bill.description || bill.month} • {bill.month}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-extrabold text-white">
                  LKR {Number(bill.amount).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(bill.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
