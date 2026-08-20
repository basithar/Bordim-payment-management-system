import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchStudentPayments, fetchAllBills } from '../services/dbService';
import { SlipUploadModal } from './SlipUploadModal';
import { UtilityBillsWidget } from './UtilityBillsWidget';
import { 
  CreditCard, 
  UploadCloud, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  AlertCircle, 
  User, 
  Phone, 
  Home, 
  Eye, 
  Calendar,
  FileText
} from 'lucide-react';

export const StudentDashboard = () => {
  const { userProfile } = useAuth();
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedSlipUrl, setSelectedSlipUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStudentData = async () => {
    if (!userProfile?.uid) return;
    setLoading(true);
    const pList = await fetchStudentPayments(userProfile.uid);
    const bList = await fetchAllBills();
    setPayments(pList);
    setBills(bList);
    setLoading(false);
  };

  useEffect(() => {
    loadStudentData();
  }, [userProfile?.uid]);

  // Current month payment status check
  const latestPayment = payments[0];
  const currentMonthStatus = latestPayment ? latestPayment.status : 'pending';

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="badge-approved">
            <CheckCircle className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="badge-rejected">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'excused':
        return (
          <span className="badge-excused">
            <ShieldCheck className="w-3.5 h-3.5" />
            Excused
          </span>
        );
      default:
        return (
          <span className="badge-pending">
            <Clock className="w-3.5 h-3.5" />
            Pending Verification
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Student Welcome Banner */}
      <div className="glass-card p-6 md:p-8 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {userProfile?.roomNumber || 'Room 101'}
              </span>
              <span className="text-xs text-slate-400">NIC: {userProfile?.nic || 'N/A'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Hello, <span className="gradient-text">{userProfile?.name}</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Hometown: {userProfile?.hometown || 'Kandy'} • Contact: {userProfile?.contact || 'N/A'}
            </p>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => setIsUploadOpen(true)}
            className="gradient-btn text-sm py-3 px-6 shrink-0 shadow-indigo-500/30"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Submit Payment Slip</span>
          </button>
        </div>

        {/* Pending Notice Alert */}
        {currentMonthStatus === 'pending' && (
          <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong className="font-semibold block">Monthly Boarding Fee Due</strong>
                <p className="text-slate-300 text-[11px]">
                  Please upload your bank deposit receipt for August 2026 before the scheduled reminder date.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-semibold shrink-0"
            >
              Upload Now
            </button>
          </div>
        )}
      </div>

      {/* Grid Layout: Parents' Info & Utility Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Parents' & Emergency Contact Card */}
        <div className="glass-card p-6 border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Emergency & Parents Info</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-indigo-400">Father Details</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {userProfile?.parentsDetails?.fatherName || 'Sunil Perera'}
              </div>
              <div className="text-slate-400 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3 text-slate-500" />
                {userProfile?.parentsDetails?.fatherContact || '+94719876543'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-purple-400">Mother Details</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {userProfile?.parentsDetails?.motherName || 'Malini Perera'}
              </div>
              <div className="text-slate-400 flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3 text-slate-500" />
                {userProfile?.parentsDetails?.motherContact || '+94718765432'}
              </div>
            </div>
          </div>
        </div>

        {/* Utility Bills Widget */}
        <div className="lg:col-span-2">
          <UtilityBillsWidget bills={bills} />
        </div>

      </div>

      {/* Payment History Table */}
      <div className="glass-card p-6 border-slate-800">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">My Payment History</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Total Records: {payments.length}</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs animate-pulse">Loading records...</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No payment records found. Upload a slip to get started!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">Billing Month</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Txn Reference</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Admin Notes</th>
                  <th className="pb-3 px-3 text-right">Receipt Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-white flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {p.month}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-200">
                      LKR {Number(p.amount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-indigo-300 font-medium">
                      {p.transactionId || 'N/A'}
                    </td>
                    <td className="py-3.5 px-3">
                      {renderStatusBadge(p.status)}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 max-w-xs truncate">
                      {p.adminNote || 'No notes'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {p.slipUrl ? (
                        <button
                          onClick={() => setSelectedSlipUrl(p.slipUrl)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3 h-3" /> View Slip
                        </button>
                      ) : (
                        <span className="text-slate-600">No Slip</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slip Modal Preview */}
      {selectedSlipUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative glass-card p-4 max-w-xl w-full border-slate-700">
            <button
              onClick={() => setSelectedSlipUrl(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800"
            >
              <XCircle className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-white mb-3">Bank Slip Receipt</h4>
            <img
              src={selectedSlipUrl}
              alt="Bank Deposit Slip"
              className="w-full max-h-[70vh] object-contain rounded-lg border border-slate-800"
            />
          </div>
        </div>
      )}

      {/* Upload Slip Drawer */}
      <SlipUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        userProfile={userProfile}
        onSuccess={loadStudentData}
      />

    </div>
  );
};
