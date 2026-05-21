import { useState, useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { updateCustomer, assignCard } from "../firebase/firebaseService";

const QUEUE_KEY = "offline_queue";

export default function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const isOnlineRef = useRef(true);

  // ── Load pending count on mount ──────────────────────────────────────────
  useEffect(() => {
    loadQueue().then((q) => setPendingCount(q.length));
  }, []);

  // ── Network listener ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const online = !!(state.isConnected && state.isInternetReachable);
      setIsOnline(online);
      isOnlineRef.current = online;

      if (online) {
        flushQueue();
      }
    });
    return () => unsub();
  }, []);

  // ── Queue helpers ────────────────────────────────────────────────────────
  const loadQueue = async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveQueue = async (queue) => {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      setPendingCount(queue.length);
    } catch {}
  };

  const addToQueue = async (action) => {
    const queue = await loadQueue();
    queue.push({ ...action, timestamp: Date.now() });
    await saveQueue(queue);
  };

  // ── Flush queue when back online ─────────────────────────────────────────
  const flushQueue = async () => {
    const queue = await loadQueue();
    if (queue.length === 0) return;

    setSyncing(true);
    const failed = [];

    for (const action of queue) {
      try {
        if (action.type === "updateCustomer") {
          await updateCustomer(action.payload);
        } else if (action.type === "assignCard") {
          await assignCard(action.payload);
        }
      } catch {
        failed.push(action);
      }
    }

    await saveQueue(failed);
    setSyncing(false);
  };

  // ── Public API ───────────────────────────────────────────────────────────
  const enqueueUpdate = async (customer) => {
    if (isOnlineRef.current) {
      await updateCustomer(customer);
    } else {
      await addToQueue({ type: "updateCustomer", payload: customer });
    }
  };

  const enqueueAssign = async (card) => {
    if (isOnlineRef.current) {
      await assignCard(card);
    } else {
      await addToQueue({ type: "assignCard", payload: card });
    }
  };

  return { isOnline, syncing, pendingCount, enqueueUpdate, enqueueAssign };
}