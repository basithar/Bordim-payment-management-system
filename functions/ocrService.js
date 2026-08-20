/**
 * ============================================================================
 * MODULAR OCR VALIDATION SERVICE PLACEHOLDER
 * ============================================================================
 * This module cleanly abstracts OCR validation and transaction duplicate checks.
 * 
 * INTEGRATION INSTRUCTIONS FOR LIVE PRODUCTION OCR:
 * 
 * Option A: Tesseract.js (Node.js / Cloud Function OCR)
 * ----------------------------------------------------------------------------
 * 1. npm install tesseract.js
 * 2. const { createWorker } = require('tesseract.js');
 * 3. const worker = await createWorker('eng');
 *    const { data: { text } } = await worker.recognize(slipImageUrl);
 *    // Extract transaction ref using regex: /TXN[A-Z0-9]{6,12}/i
 * 
 * Option B: Google Cloud Vision API
 * ----------------------------------------------------------------------------
 * 1. npm install @google-cloud/vision
 * 2. const vision = require('@google-cloud/vision');
 *    const client = new vision.ImageAnnotatorClient();
 *    const [result] = await client.textDetection(slipImageUrl);
 * ============================================================================
 */

/**
 * Validate payment slip OCR & check for duplicate Transaction IDs in Firestore
 * @param {Object} db - Firestore admin instance
 * @param {string} transactionId - Submitted Transaction ID
 * @param {string} currentPaymentId - Current Payment ID (if updating)
 */
async function validateSlipOCR(db, transactionId, currentPaymentId = null) {
  if (!transactionId) {
    return { isDuplicate: false, status: 'valid', confidenceScore: 1.0 };
  }

  const cleanTxn = transactionId.trim().toUpperCase();

  // Query Firestore 'payments' collection for matching transactionId
  const snapshot = await db.collection('payments')
    .where('transactionId', '==', cleanTxn)
    .get();

  const duplicateDocs = [];
  snapshot.forEach(doc => {
    if (doc.id !== currentPaymentId) {
      duplicateDocs.push({ id: doc.id, ...doc.data() });
    }
  });

  if (duplicateDocs.length > 0) {
    console.warn(`[OCR SERVICE PLACEHOLDER] Warning: Duplicate Transaction ID ${cleanTxn} detected in Firestore!`, duplicateDocs);
    return {
      isDuplicate: true,
      status: 'duplicate_warning',
      matchedCount: duplicateDocs.length,
      matchedPayments: duplicateDocs.map(d => ({ id: d.id, userName: d.userName, month: d.month })),
      confidenceScore: 0.98
    };
  }

  return {
    isDuplicate: false,
    status: 'valid',
    confidenceScore: 0.99
  };
}

module.exports = {
  validateSlipOCR
};
