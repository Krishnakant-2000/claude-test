// Script to create admin user in Firebase Auth
const { createUserWithEmailAndPassword, getAuth } = require('firebase/auth');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Load environment variables
require('dotenv').config();

// Firebase config - using environment variables for security
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  const adminEmail = 'admin@amaplayer.com';
  const adminPassword = 'Admin@123456'; // Strong password
  
  try {
    console.log('Creating admin user...');
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ Admin user created in Firebase Auth:', user.uid);
    
    // Create admin profile in Firestore
    await setDoc(doc(db, 'admins', user.uid), {
      role: 'super_admin',
      email: adminEmail,
      active: true,
      createdAt: new Date(),
      createdBy: 'system_setup'
    });
    
    console.log('✅ Admin profile created in Firestore');
    console.log('📧 Admin Email:', adminEmail);
    console.log('🔐 Admin Password:', adminPassword);
    console.log('🆔 Admin UID:', user.uid);
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ Admin user already exists');
      console.log('📧 Admin Email:', adminEmail);
      console.log('🔐 Admin Password:', adminPassword);
    } else {
      console.error('❌ Error creating admin user:', error);
    }
  }
  
  process.exit(0);
}

createAdminUser();