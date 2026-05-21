import {
  collection, doc, getDocs, setDoc,
  updateDoc, onSnapshot, writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const COLLECTION = "customers";

// ── Load all customers once ────────────────────────────────────────────────
export const loadCustomers = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((d) => d.data());
};

// ── Seed 50 unassigned cards (run once on first launch) ───────────────────
export const seedCards = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  if (!snapshot.empty) return;

  const batch = writeBatch(db);
  for (let i = 1; i <= 50; i++) {
    const id = `LM-${String(i).padStart(3, "0")}`;
    const ref = doc(db, COLLECTION, id);
    batch.set(ref, {
      id,
      name: null,
      phone: null,
      assigned: false,
      washes: 0,
      totalSpent: 0,
      history: [],
      createdAt: null,
    });
  }
  await batch.commit();
  console.log("✅ 50 cards seeded to Firestore");
};

// ── Assign a card to a customer ────────────────────────────────────────────
export const assignCard = async (cardData) => {
  const ref = doc(db, COLLECTION, cardData.id);
  await setDoc(ref, cardData);
};

// ── Update customer (wash, edit, delete) — replaces full document ──────────
export const updateCustomer = async (customer) => {
  const ref = doc(db, COLLECTION, customer.id);
  await setDoc(ref, customer); // setDoc replaces entire doc — handles delete/reset correctly
};

// ── Real-time listener ─────────────────────────────────────────────────────
export const subscribeToCustomers = (onChange) => {
  return onSnapshot(collection(db, COLLECTION), (snapshot) => {
    const customers = snapshot.docs.map((d) => d.data());
    onChange(customers);
  });
};