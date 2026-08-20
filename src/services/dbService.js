import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from '../firebase/config';
import { INITIAL_MOCK_USERS, INITIAL_MOCK_PAYMENTS, INITIAL_MOCK_BILLS } from './mockData';

// Local storage keys for demo mode
const LS_USERS = 'bodima_mock_users_v1';
const LS_PAYMENTS = 'bodima_mock_payments_v1';
const LS_BILLS = 'bodima_mock_bills_v1';

// Helpers to get/set local storage demo data
const getLocalData = (key, fallback) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage write error:", e);
  }
};

// Initialize default mock data if not present
if (!localStorage.getItem(LS_USERS)) setLocalData(LS_USERS, INITIAL_MOCK_USERS);
if (!localStorage.getItem(LS_PAYMENTS)) setLocalData(LS_PAYMENTS, INITIAL_MOCK_PAYMENTS);
if (!localStorage.getItem(LS_BILLS)) setLocalData(LS_BILLS, INITIAL_MOCK_BILLS);

/**
 * USER MANAGEMENT
 */
export const getUserProfile = async (uid) => {
  if (isFirebaseConfigured) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        return { uid, ...userSnap.data() };
      }
    } catch (err) {
      console.error("Error fetching Firestore user:", err);
    }
  }

  // Demo Fallback
  const users = getLocalData(LS_USERS, INITIAL_MOCK_USERS);
  const found = users.find(u => u.uid === uid);
  return found || null;
};

export const createUserProfile = async (uid, userData) => {
  const fullPayload = {
    uid,
    name: userData.name || '',
    email: userData.email || '',
    hometown: userData.hometown || '',
    nic: userData.nic || '',
    contact: userData.contact || '',
    parentsDetails: {
      fatherName: userData.parentsDetails?.fatherName || '',
      fatherContact: userData.parentsDetails?.fatherContact || '',
      motherName: userData.parentsDetails?.motherName || '',
      motherContact: userData.parentsDetails?.motherContact || ''
    },
    roomNumber: userData.roomNumber || 'Unassigned',
    role: userData.role || 'student',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        ...fullPayload,
        createdAt: serverTimestamp()
      });
      return fullPayload;
    } catch (err) {
      console.error("Error creating Firestore user:", err);
    }
  }

  // Demo Fallback
  const users = getLocalData(LS_USERS, INITIAL_MOCK_USERS);
  const updated = [fullPayload, ...users.filter(u => u.uid !== uid)];
  setLocalData(LS_USERS, updated);
  return fullPayload;
};

/**
 * PAYMENT MANAGEMENT & SLIP UPLOADS
 */
export const uploadBankSlip = async (file, userId) => {
  if (isFirebaseConfigured && file) {
    try {
      const timeStamp = Date.now();
      const storageRef = ref(storage, `slips/${userId}/${timeStamp}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (err) {
      console.error("Error uploading slip to Firebase Storage:", err);
    }
  }

  // Demo Fallback: return object URL or placeholder slip image
  if (file) {
    return URL.createObjectURL(file);
  }
  return "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80";
};

/**
 * OCR PLACEHOLDER FUNCTION
 * Checks Firestore / mock storage for duplicate Transaction IDs
 */
export const checkDuplicateTransactionId = async (transactionId, currentPaymentId = null) => {
  if (!transactionId) return false;
  const cleanTxn = transactionId.trim().toUpperCase();

  if (isFirebaseConfigured) {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('transactionId', '==', cleanTxn));
      const snap = await getDocs(q);
      const matches = snap.docs.filter(d => d.id !== currentPaymentId);
      return matches.length > 0;
    } catch (err) {
      console.error("OCR Firestore duplicate check error:", err);
    }
  }

  // Demo Fallback check
  const payments = getLocalData(LS_PAYMENTS, INITIAL_MOCK_PAYMENTS);
  const duplicate = payments.find(
    p => p.transactionId?.toUpperCase() === cleanTxn && p.id !== currentPaymentId
  );
  return Boolean(duplicate);
};

export const createPaymentRecord = async (paymentData) => {
  // Perform OCR placeholder verification for duplicate transaction ID
  const isDuplicate = await checkDuplicateTransactionId(paymentData.transactionId);

  const payload = {
    userId: paymentData.userId,
    userName: paymentData.userName,
    userRoom: paymentData.userRoom || 'Room Unassigned',
    month: paymentData.month,
    amount: Number(paymentData.amount),
    slipUrl: paymentData.slipUrl,
    transactionId: paymentData.transactionId?.trim().toUpperCase() || '',
    status: 'pending',
    ocrStatus: isDuplicate ? 'duplicate_warning' : 'valid',
    adminNote: isDuplicate ? `OCR Warning: Duplicate Transaction ID (${paymentData.transactionId}) detected!` : '',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    try {
      const paymentsRef = collection(db, 'payments');
      const docRef = await addDoc(paymentsRef, {
        ...payload,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...payload };
    } catch (err) {
      console.error("Error creating Firestore payment:", err);
    }
  }

  // Demo Fallback
  const payments = getLocalData(LS_PAYMENTS, INITIAL_MOCK_PAYMENTS);
  const newPayment = { id: `pay-${Date.now()}`, ...payload };
  const updated = [newPayment, ...payments];
  setLocalData(LS_PAYMENTS, updated);
  return newPayment;
};

export const fetchAllPayments = async () => {
  if (isFirebaseConfigured) {
    try {
      const paymentsRef = collection(db, 'payments');
      const snap = await getDocs(paymentsRef);
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return list;
    } catch (err) {
      console.error("Error fetching Firestore payments:", err);
    }
  }

  // Demo Fallback
  return getLocalData(LS_PAYMENTS, INITIAL_MOCK_PAYMENTS);
};

export const fetchStudentPayments = async (userId) => {
  if (isFirebaseConfigured) {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('userId', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching student payments:", err);
    }
  }

  // Demo Fallback
  const payments = getLocalData(LS_PAYMENTS, INITIAL_MOCK_PAYMENTS);
  return payments.filter(p => p.userId === userId);
};

export const updatePaymentStatus = async (paymentId, status, adminNote = '') => {
  if (isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'payments', paymentId);
      await updateDoc(docRef, {
        status,
        adminNote,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (err) {
      console.error("Error updating payment status in Firestore:", err);
    }
  }

  // Demo Fallback
  const payments = getLocalData(LS_PAYMENTS, INITIAL_MOCK_PAYMENTS);
  const updated = payments.map(p => {
    if (p.id === paymentId) {
      return { ...p, status, adminNote, updatedAt: new Date().toISOString() };
    }
    return p;
  });
  setLocalData(LS_PAYMENTS, updated);
  return true;
};

/**
 * UTILITY BILLS MANAGEMENT
 */
export const fetchAllBills = async () => {
  if (isFirebaseConfigured) {
    try {
      const billsRef = collection(db, 'bills');
      const snap = await getDocs(billsRef);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching utility bills from Firestore:", err);
    }
  }

  // Demo Fallback
  return getLocalData(LS_BILLS, INITIAL_MOCK_BILLS);
};

export const addUtilityBill = async (billData) => {
  const payload = {
    type: billData.type || 'Water',
    month: billData.month || 'Current Month',
    amount: Number(billData.amount),
    description: billData.description || '',
    source: billData.source || 'manual',
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured) {
    try {
      const billsRef = collection(db, 'bills');
      const docRef = await addDoc(billsRef, {
        ...payload,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...payload };
    } catch (err) {
      console.error("Error adding utility bill to Firestore:", err);
    }
  }

  // Demo Fallback
  const bills = getLocalData(LS_BILLS, INITIAL_MOCK_BILLS);
  const newBill = { id: `bill-${Date.now()}`, ...payload };
  const updated = [newBill, ...bills];
  setLocalData(LS_BILLS, updated);
  return newBill;
};

/**
 * ALL STUDENTS DIRECTORY (ADMIN)
 */
export const fetchAllStudents = async () => {
  if (isFirebaseConfigured) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'student'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("Error fetching student list from Firestore:", err);
    }
  }

  // Demo Fallback
  const users = getLocalData(LS_USERS, INITIAL_MOCK_USERS);
  return users.filter(u => u.role === 'student');
};
