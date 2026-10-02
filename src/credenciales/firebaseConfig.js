import { initializeApp } from 'firebase/app';
// importamos unicamente firestore (ya no usamos storage por el cobro)
import { getFirestore } from 'firebase/firestore';

// =========================================================
// reto 1: credenciales de firebase
// =========================================================
const firebaseConfig = {
  apiKey: "AIzaSyDHhC5Pe6tfeYHP4GfnGgLXqnx0ic_1Tgg",
  authDomain: "practica13-perfil-ff802.firebaseapp.com",
  projectId: "practica13-perfil-ff802",
  storageBucket: "practica13-perfil-ff802.firebasestorage.app",
  messagingSenderId: "47154602619",
  appId: "1:47154602619:web:ff5bcbe39a16045eef38de"
};
// =========================================================

const app = initializeApp(firebaseConfig);

// inicializamos y exportamos firestore
export const db = getFirestore(app);