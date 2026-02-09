import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getFirestore } from "firebase/firestore";
import { auth } from "@/firebase/config";
import app from "@/firebase/config";

const db = getFirestore(app);

export const login = async (
  email: string,
  password: string,
  callback: (result: { success: boolean; user?: any; error?: any }) => void
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (!userCredential.user.emailVerified) {
      return callback({
        success: false,
        error: { code: "email-not-verified", message: "Email not verified" },
      });
    }

    // Actualizar lastLogin en Firestore
    try {
      await setDoc(
        doc(db, "users", userCredential.user.uid),
        {
          lastLogin: new Date(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error actualizando lastLogin:", error);
    }

    callback({ success: true, user: userCredential.user });
  } catch (error) {
    callback({ success: false, error });
  }
};

export const register = async (
  email: string,
  password: string,
  displayName?: string
) => {
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Crear documento en Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      displayName: displayName || email.split("@")[0],
      role: "viewer", // Rol por defecto
      status: "active",
      createdAt: new Date(),
      lastLogin: null,
    });

    console.log("✅ Usuario creado en Firestore:", userCredential.user.uid);

    // Enviar email de verificación
    await sendEmailVerification(userCredential.user);

    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("❌ Error en registro:", error);
    return { success: false, error };
  }
};

export const logout = async () => {
  if (window.__UNSUB_FIRESTORE__) {
    try {
      window.__UNSUB_FIRESTORE__();
      delete window.__UNSUB_FIRESTORE__;
    } catch (e) {
      console.error("Error cerrando subscripción:", e);
    }
  }
  await signOut(auth);
};

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const resendEmailVerification = async (
  callback: (result: { success: boolean; error?: any }) => void
) => {
  try {
    if (!auth.currentUser) {
      return callback({ success: false, error: "No user logged in" });
    }

    await sendEmailVerification(auth.currentUser);

    callback({ success: true });
  } catch (error) {
    callback({ success: false, error });
  }
};

export const resetPassword = async (
  email: string,
  callback: (result: { success: boolean; error?: any }) => void
) => {
  try {
    await sendPasswordResetEmail(auth, email);
    callback({ success: true });
  } catch (error) {
    callback({ success: false, error });
  }
};
