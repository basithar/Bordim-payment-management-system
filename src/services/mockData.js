export const INITIAL_MOCK_USERS = [
  {
    uid: "student-1",
    name: "Kasun Perera",
    email: "kasun@boarding.lk",
    hometown: "Kandy",
    nic: "199834200192",
    contact: "+94771234567",
    parentsDetails: {
      fatherName: "Sunil Perera",
      fatherContact: "+94719876543",
      motherName: "Malini Perera",
      motherContact: "+94718765432"
    },
    roomNumber: "Room 101",
    role: "student",
    createdAt: new Date().toISOString()
  },
  {
    uid: "student-2",
    name: "Nimali Fernando",
    email: "nimali@boarding.lk",
    hometown: "Galle",
    nic: "200084399210",
    contact: "+94762345678",
    parentsDetails: {
      fatherName: "Gamini Fernando",
      fatherContact: "+94701122334",
      motherName: "Shanthi Fernando",
      motherContact: "+94702233445"
    },
    roomNumber: "Room 102",
    role: "student",
    createdAt: new Date().toISOString()
  },
  {
    uid: "student-3",
    name: "Sahan Jayasinghe",
    email: "sahan@boarding.lk",
    hometown: "Kurunegala",
    nic: "199745100345",
    contact: "+94713456789",
    parentsDetails: {
      fatherName: "Anura Jayasinghe",
      fatherContact: "+94723344556",
      motherName: "Geetha Jayasinghe",
      motherContact: "+94724455667"
    },
    roomNumber: "Room 103",
    role: "student",
    createdAt: new Date().toISOString()
  },
  {
    uid: "admin-1",
    name: "Mr. Bandara (Warden)",
    email: "admin@boarding.lk",
    hometown: "Colombo",
    nic: "197512900456",
    contact: "+94770001122",
    parentsDetails: {
      fatherName: "-",
      fatherContact: "-",
      motherName: "-",
      motherContact: "-"
    },
    roomNumber: "Admin Office",
    role: "admin",
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_MOCK_PAYMENTS = [
  {
    id: "pay-101",
    userId: "student-1",
    userName: "Kasun Perera",
    userRoom: "Room 101",
    month: "August 2026",
    amount: 15000,
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    transactionId: "TXN984210",
    status: "approved",
    ocrStatus: "valid",
    adminNote: "Slip verified with bank ref. Payment cleared.",
    createdAt: "2026-08-05T10:30:00.000Z"
  },
  {
    id: "pay-102",
    userId: "student-2",
    userName: "Nimali Fernando",
    userRoom: "Room 102",
    month: "August 2026",
    amount: 15000,
    slipUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80",
    transactionId: "TXN771092",
    status: "pending",
    ocrStatus: "valid",
    adminNote: "",
    createdAt: "2026-08-12T14:15:00.000Z"
  },
  {
    id: "pay-103",
    userId: "student-3",
    userName: "Sahan Jayasinghe",
    userRoom: "Room 103",
    month: "August 2026",
    amount: 15000,
    slipUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    transactionId: "TXN984210", // Intentional duplicate to demonstrate OCR Duplicate Warning!
    status: "pending",
    ocrStatus: "duplicate_warning",
    adminNote: "OCR Warning: Transaction ID matches TXN984210 from Kasun Perera!",
    createdAt: "2026-08-18T09:00:00.000Z"
  },
  {
    id: "pay-104",
    userId: "student-1",
    userName: "Kasun Perera",
    userRoom: "Room 101",
    month: "July 2026",
    amount: 15000,
    slipUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
    transactionId: "TXN654129",
    status: "approved",
    ocrStatus: "valid",
    adminNote: "Verified",
    createdAt: "2026-07-04T11:20:00.000Z"
  },
  {
    id: "pay-105",
    userId: "student-2",
    userName: "Nimali Fernando",
    userRoom: "Room 102",
    month: "July 2026",
    amount: 15000,
    slipUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80",
    transactionId: "TXN552199",
    status: "excused",
    ocrStatus: "valid",
    adminNote: "Medical excuse granted for July by Warden.",
    createdAt: "2026-07-08T16:45:00.000Z"
  }
];

export const INITIAL_MOCK_BILLS = [
  {
    id: "bill-1",
    type: "Water",
    month: "August 2026",
    amount: 4850,
    description: "National Water Supply Bill - Account #904812",
    source: "webhook",
    createdAt: "2026-08-02T08:00:00.000Z"
  },
  {
    id: "bill-2",
    type: "Electricity",
    month: "August 2026",
    amount: 18200,
    description: "CEB Electricity Bill - Main Meter #CEB-48192",
    source: "webhook",
    createdAt: "2026-08-03T10:15:00.000Z"
  },
  {
    id: "bill-3",
    type: "Internet",
    month: "August 2026",
    amount: 6500,
    description: "SLT Fiber Unlimited Boarding House Wi-Fi",
    source: "manual",
    createdAt: "2026-08-01T09:00:00.000Z"
  }
];
