// scripts/migrateUsers.ts
// Ejecutar con: npx tsx scripts/migrateUsers.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function migrateCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    console.error("❌ No hay usuario autenticado");
    console.log("Por favor, inicia sesión primero");
    return;
  }

  console.log("👤 Usuario actual:", user.email);

  // Verificar si ya existe el documento
  const userDocRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    console.log("✅ El documento ya existe:", userDoc.data());
    return;
  }

  // Crear documento
  await setDoc(userDocRef, {
    email: user.email,
    displayName: user.displayName || user.email?.split("@")[0] || "Usuario",
    role: "admin", // Primer usuario es admin
    status: "active",
    createdAt: new Date(user.metadata.creationTime!),
    lastLogin: new Date(user.metadata.lastSignInTime!),
  });

  console.log("✅ Documento creado exitosamente");
}

// Función para crear documentos manualmente
async function createUserDocument(
  uid: string,
  email: string,
  displayName?: string,
  role: "admin" | "editor" | "viewer" = "viewer"
) {
  try {
    await setDoc(doc(db, "users", uid), {
      email,
      displayName: displayName || email.split("@")[0],
      role,
      status: "active",
      createdAt: new Date(),
      lastLogin: null,
    });

    console.log(`✅ Usuario ${email} creado`);
  } catch (error) {
    console.error(`❌ Error creando ${email}:`, error);
  }
}

// Ejecutar
migrateCurrentUser().then(() => {
  console.log("🎉 Migración completada");
  process.exit(0);
});
