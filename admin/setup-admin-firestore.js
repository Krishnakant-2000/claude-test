// Script to set up admin user in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

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

async function setupAdminUser() {
  const adminEmail = 'admin@amaplayer.com';
  const adminPassword = 'Admin@123456';
  
  try {
    console.log('🔐 Signing in to get user UID...');
    
    // Sign in to get the user UID
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    const adminUID = user.uid;
    
    console.log('✅ Admin user UID:', adminUID);
    
    // Check if admin document already exists
    const adminDoc = await getDoc(doc(db, 'admins', adminUID));
    
    if (adminDoc.exists()) {
      console.log('ℹ️ Admin document already exists in Firestore');
      console.log('📋 Current admin data:', adminDoc.data());
    } else {
      console.log('📝 Creating admin document in Firestore...');
      
      // Create admin document in Firestore
      await setDoc(doc(db, 'admins', adminUID), {
        role: 'super_admin',
        email: adminEmail,
        active: true,
        createdAt: new Date(),
        createdBy: 'system_setup',
        displayName: 'Super Admin',
        permissions: {
          canManageUsers: true,
          canManageContent: true,
          canViewReports: true,
          canManageAdmins: true,
          canDeleteContent: true,
          canSuspendUsers: true
        }
      });
      
      console.log('✅ Admin document created in Firestore');
    }
    
    // Also create user document for admin in users collection
    const userDoc = await getDoc(doc(db, 'users', adminUID));
    
    if (!userDoc.exists()) {
      console.log('📝 Creating user document for admin...');
      
      await setDoc(doc(db, 'users', adminUID), {
        displayName: 'Super Admin',
        email: adminEmail,
        role: 'admin',
        bio: 'System Administrator',
        isVerified: true,
        isAdmin: true,
        createdAt: new Date(),
        followers: 0,
        following: 0
      });
      
      console.log('✅ User document created for admin');
    } else {
      console.log('ℹ️ User document already exists for admin');
    }
    
    console.log('\n🎉 Admin setup complete!');
    console.log('📧 Email:', adminEmail);
    console.log('🔐 Password:', adminPassword);
    console.log('🆔 UID:', adminUID);
    console.log('🔗 Dashboard URL: http://localhost:3000');
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    if (error.code === 'auth/user-not-found') {
      console.log('💡 Run create-admin-user.js first to create the admin user in Firebase Auth');
    }
  }
  
  process.exit(0);
}

setupAdminUser();