// Script to create admin user in Firebase Auth
const { createUserWithEmailAndPassword, getAuth } = require('firebase/auth');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBrFpknzO0LwmCKzRbIznQE3erVY0teo80",
  authDomain: "my-react-firebase-app-69fcd.firebaseapp.com",
  projectId: "my-react-firebase-app-69fcd",
  storageBucket: "my-react-firebase-app-69fcd.firebasestorage.app",
  messagingSenderId: "333629247601",
  appId: "1:333629247601:web:c7d83b6270eb66083f8bd0"
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