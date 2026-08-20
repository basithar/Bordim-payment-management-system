import React, { useState } from 'react';
import { uploadBankSlip, createPaymentRecord, checkDuplicateTransactionId } from '../services/dbService';
import { X, UploadCloud, FileCheck, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export const SlipUploadModal = ({ isOpen, onClose, userProfile, onSuccess }) => {
  const [month, setMonth] = useState('August 2026');
  const [amount, setAmount] = useState('15000');
  const [transactionId, setTransactionId] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [ocrChecking, setOcrChecking] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleTransactionIdChange = async (val) => {
    setTransactionId(val);
    setDuplicateWarning(false);

    if (val.trim().length >= 4) {
      setOcrChecking(true);
      const isDup = await checkDuplicateTransactionId(val);
      setDuplicateWarning(isDup);
      setOcrChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file && !previewUrl) {
      setError('Please select a bank deposit slip image to upload.');
      return;
    }

    if (!transactionId.trim()) {
      setError('Please enter the bank transaction reference ID.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload bank slip to Firebase Cloud Storage
      const slipUrl = await uploadBankSlip(file, userProfile.uid);

      // Step 2: Save record to Firestore payments collection
      await createPaymentRecord({
        userId: userProfile.uid,
        userName: userProfile.name,
        userRoom: userProfile.roomNumber,
        month,
        amount: Number(amount),
        slipUrl,
        transactionId: transactionId.trim().toUpperCase()
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to upload slip. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass-card p-6 md:p-8 border-slate-700/80 shadow-2xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Upload Bank Slip</h3>
              <p className="text-xs text-slate-400">Submit room fee payment slip for Admin verification</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Month & Amount Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Billing Month</label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full glass-input text-sm bg-slate-900"
              >
                <option value="August 2026">August 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="October 2026">October 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Amount Paid (LKR)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full glass-input text-sm"
                placeholder="15000"
              />
            </div>
          </div>

          {/* Transaction ID & Realtime OCR Duplicate Check */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Transaction Ref / ID
              </label>
              <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1">
                {ocrChecking ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking OCR...
                  </>
                ) : (
                  "OCR Duplicate Shield Active"
                )}
              </span>
            </div>

            <input
              type="text"
              required
              value={transactionId}
              onChange={(e) => handleTransactionIdChange(e.target.value)}
              placeholder="e.g. TXN984210"
              className={`w-full glass-input text-sm uppercase ${
                duplicateWarning ? 'border-amber-500 focus:ring-amber-500/20' : ''
              }`}
            />

            {duplicateWarning && (
              <div className="mt-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>OCR Warning:</strong> This Transaction ID matches a record already in Firestore. Admin will be flagged for duplicate verification.
                </span>
              </div>
            )}
          </div>

          {/* Slip Drag & Drop / File Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Bank Deposit Slip Image
            </label>

            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-4 text-center bg-slate-950/40 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={previewUrl}
                    alt="Slip Preview"
                    className="max-h-40 rounded-lg object-contain border border-slate-700 shadow-md"
                  />
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Image Attached ({file?.name || 'Bank Slip'})
                  </span>
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center gap-2">
                  <FileCheck className="w-8 h-8 text-slate-500" />
                  <p className="text-xs text-slate-300">
                    <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop slip
                  </p>
                  <p className="text-[10px] text-slate-500">PNG, JPG, JPEG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn py-3 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading Slip to Storage...
              </span>
            ) : (
              'Submit Slip for Approval'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
