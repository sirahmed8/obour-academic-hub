import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { ref, onValue, off, DataSnapshot, DatabaseReference } from "firebase/database";
import { db, rtdb } from "@/lib/firebase";

export interface LiveStats {
  students: number;
  resources: number;
  subjects: number;
  uptime: number;
  online: number;
}

export function useLiveStats(): LiveStats {
  const [stats, setStats] = useState({
    students: 0,
    resources: 0,
    subjects: 0,
    uptime: 99.9,
    online: 0,
  });

  useEffect(() => {
    let cancelled = false;

    let unsubFirestore = () => {};
    if (db) {
      unsubFirestore = onSnapshot(doc(db, "settings", "platform_stats"), (statsDoc) => {
        if (statsDoc.exists() && !cancelled) {
          const data = statsDoc.data();
          setStats((prev) => ({
            ...prev,
            students: data.students ?? 0,
            resources: data.resources ?? 0,
            subjects: data.subjects ?? 0,
          }));
        }
      });
    }

    let presenceRef: DatabaseReference | null = null;
    if (rtdb) {
      presenceRef = ref(rtdb, "presence");
      onValue(presenceRef, (snapshot: DataSnapshot) => {
        if (cancelled) return;
        let count = 0;
        snapshot.forEach((child) => {
          if (child.val()?.status === "online") count++;
        });
        setStats((prev) => ({ ...prev, online: count }));
      });
    }

    return () => {
      cancelled = true;
      unsubFirestore();
      if (presenceRef) off(presenceRef);
    };
  }, []);

  return stats;
}
