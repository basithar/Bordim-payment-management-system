import React, { useState, useEffect } from 'react';
import { fetchAllPayments, fetchAllBills, fetchAllStudents, updatePaymentStatus } from '../services/dbService';
import { WebhookSimulatorModal } from './WebhookSimulatorModal';
import { WhatsAppTesterModal } from './WhatsAppTesterModal';
import { UtilityBillsWidget } from './UtilityBillsWidget';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Users, 
  DollarSign, 
  Cpu, 
  MessageSquare, 
  Plus, 
  Phone, 
  Home, 
  Search, 
  Filter,
  Check,
  Ban,
  ShieldAlert
} from 'lucide-react';

export const AdminDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'students' | 'bills'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isWebhookOpen, setIsWebhookOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

  // Admin note input state
  const [adminNotesMap, setAdminNotesMap] = useState({});

  const loadAdminData = async () => {
    setLoading(true);
    const [pList, bList, sList] = await Promise.all([
      fetchAllPayments(),
      fetchAllBills(),
      fetchAllStudents()
    ]);
    setPayments(pList);
    setBills(bList);
    setStudents(sList);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleStatusChange = async (paymentId, newStatus) => {
    const note = adminNotesMap[paymentId] || '';
    await updatePaymentStatus(paymentId, newStatus, note);
    loadAdminData();
  };

  // Metrics calculation
  const totalRevenue = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const excusedCount = payments.filter(p => p.status === 'excused').length;
  const duplicateWarningCount = payments.filter(p => p.ocrStatus === 'duplicate_warning').length;

  // Filtered payments list
  const filteredPayments = payments.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = 
      p.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userRoom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Admin Header Banner & Quick Action Buttons */}
      <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-slate-900/90 via-slate-900/95 to-indigo-950/40 border-amber-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge-pending bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> WARDEN CONTROL PANEL
              </span>
              {duplicateWarningCount > 0 && (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {duplicateWarningCount} OCR Duplicate Warning(s)
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Boarding House Admin Portal
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Manage bank slip verification, OCR validation, utility webhooks & automated WhatsApp reminders.
            </p>
          </div>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsWebhookOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>SMS Webhook Simulator</span>
            </button>

            <button
              onClick={() => setIsWhatsAppOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Reminders</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Approved Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            LKR {totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cleared deposit slip total</div>
        </div>

        {/* Pending Approval */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Review</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {pendingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting manual approval</div>
        </div>

        {/* Excused Students */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Granted Excused</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-400">
            {excusedCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ignored in WhatsApp reminders</div>
        </div>

        {/* Total Boarding Students */}
        <div className="glass-card p-5 border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Boarders</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {students.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active room occupants</div>
        </div>

      </div>

      {/* Main Content Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Payment Verification & OCR ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'students'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Student Directory ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bills'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Utility Bills ({bills.length})
          </button>
        </div>
      </div>

      {/* TAB 1: PAYMENTS VERIFICATION QUEUE */}
      {activeTab === 'payments' && (
        <div className="glass-card p-6 border-slate-800 space-y-4">
          
          {/* Controls & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {['all', 'pending', 'approved', 'rejected', 'excused'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white border border-indigo-500/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search student or txn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full glass-input pl-9 text-xs py-2"
              />
            </div>
          </div>

          {/* Table of Payments */}
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-xs">Loading payment entries...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">No payments found matching filter.</div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((p) => (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all ${
                    p.ocrStatus === 'duplicate_warning'
                      ? 'bg-rose-950/20 border-rose-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    
                    {/* Left: Student & Slip Info */}
                    <div className="flex items-start gap-3">
                      {/* Slip thumbnail */}
                      {p.slipUrl ? (
                        <div
                          onClick={() => setSelectedSlip(p)}
                          className="relative group cursor-pointer w-16 h-20 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0"
                        >
                          <img src={p.slipUrl} alt="Slip" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-indigo-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-16 h-20 rounded-lg border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-600 shrink-0">
                          No Slip
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{p.userName}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                            {p.userRoom}
                          </span>
                          
                          {/* OCR Status Warning Pill */}
                          {p.ocrStatus === 'duplicate_warning' && (
                            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              OCR DUPLICATE TXN WARNING
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span>Month: <strong className="text-slate-200">{p.month}</strong></span>
                          <span>Amount: <strong className="text-emerald-400">LKR {Number(p.amount).toLocaleString()}</strong></span>
                          <span>Txn Ref: <strong className="font-mono text-indigo-300">{p.transactionId || 'N/A'}</strong></span>
                        </div>

                        {p.adminNote && (
                          <div className="text-[11px] text-amber-300 font-mono bg-amber-950/40 px-2 py-1 rounded border border-amber-800/40 w-fit">
                            Note: {p.adminNote}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions & Notes Input */}
                    <div className="w-full lg:w-auto flex flex-col sm:flex-row items-end sm:items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800">
                      
                      <input
                        type="text"
                        placeholder="Add admin note..."
                        value={adminNotesMap[p.id] !== undefined ? adminNotesMap[p.id] : p.adminNote || ''}
                        onChange={(e) => setAdminNotesMap({ ...adminNotesMap, [p.id]: e.target.value })}
                        className="glass-input text-xs py-1.5 px-3 w-full sm:w-48"
                      />

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatusChange(p.id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 transition-all"
                          title="Approve Slip Payment"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>

                        <button
                          onClick={() => handleStatusChange(p.id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1 transition-all"
                          title="Reject Slip"
                        >
                          <Ban className="w-3.5 h-3.5" /> Reject
                        </button>

                        <button
                          onClick={() => handleStatusChange(p.id, 'excused')}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1 transition-all"
                          title="Grant Excuse for this month"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Excuse
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: STUDENT DIRECTORY */}
      {activeTab === 'students' && (
        <div className="glass-card p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Registered Boarding Students
            </h3>
            <span className="text-xs text-slate-400 font-medium">Total: {students.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3 px-3">Student Name</th>
                  <th className="pb-3 px-3">Room #</th>
                  <th className="pb-3 px-3">Hometown</th>
                  <th className="pb-3 px-3">NIC Number</th>
                  <th className="pb-3 px-3">Contact</th>
                  <th className="pb-3 px-3">Parents' Contact Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((s) => (
                  <tr key={s.uid} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{s.name}</td>
                    <td className="py-3 px-3 font-semibold text-indigo-300">{s.roomNumber || 'Room 101'}</td>
                    <td className="py-3 px-3 text-slate-300">{s.hometown || 'Kandy'}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">{s.nic || 'N/A'}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{s.contact || 'N/A'}</td>
                    <td className="py-3 px-3 text-slate-400">
                      <div>F: {s.parentsDetails?.fatherName} ({s.parentsDetails?.fatherContact})</div>
                      <div>M: {s.parentsDetails?.motherName} ({s.parentsDetails?.motherContact})</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: UTILITY BILLS MANAGER */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          <UtilityBillsWidget bills={bills} />
        </div>
      )}

      {/* Modal: Full Slip Inspection */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative glass-card p-6 max-w-2xl w-full border-slate-700 space-y-4">
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedSlip.userName} - {selectedSlip.userRoom}</h3>
                <p className="text-xs text-slate-400">Transaction ID: <span className="font-mono text-indigo-300">{selectedSlip.transactionId}</span></p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Amount Paid</span>
                <div className="text-lg font-extrabold text-emerald-400">LKR {Number(selectedSlip.amount).toLocaleString()}</div>
              </div>
            </div>

            {selectedSlip.ocrStatus === 'duplicate_warning' && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>OCR Alert:</strong> This transaction ID matches an existing record. Please inspect image closely for duplicate submissions.
                </span>
              </div>
            )}

            <div className="flex items-center justify-center bg-slate-950 p-2 rounded-xl border border-slate-800">
              <img
                src={selectedSlip.slipUrl}
                alt="Bank Slip Verification"
                className="max-h-[60vh] object-contain rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { handleStatusChange(selectedSlip.id, 'approved'); setSelectedSlip(null); }}
                className="gradient-btn text-xs py-2 px-4"
              >
                Approve Payment
              </button>
              <button
                onClick={() => { handleStatusChange(selectedSlip.id, 'rejected'); setSelectedSlip(null); }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook & WhatsApp Testing Modals */}
      <WebhookSimulatorModal
        isOpen={isWebhookOpen}
        onClose={() => setIsWebhookOpen(false)}
        onBillAdded={loadAdminData}
      />

      <WhatsAppTesterModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        payments={payments}
      />

    </div>
  );
};
