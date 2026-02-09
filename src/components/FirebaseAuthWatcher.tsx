"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function FirebaseAuthWatcher() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        router.replace("/dashboard");
      }
    });

    return () => unsub();
  }, [router]);

  return null;
}
