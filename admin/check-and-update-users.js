// Script to check and display users data for admin dashboard
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc } = require('firebase/firestore');
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

async function checkUsersData() {
  try {
    console.log('🔐 Signing in as admin...');
    
    // Sign in as admin to get proper permissions
    await signInWithEmailAndPassword(auth, 'admin@amaplayer.com', 'Admin@123456');
    console.log('✅ Signed in successfully');
    
    console.log('👥 Fetching users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`📋 Found ${usersSnapshot.size} users`);
    
    if (usersSnapshot.size === 0) {
      console.log('ℹ️ No users found in the users collection');
      return;
    }
    
    console.log('\n📊 User Details:');
    console.log('================');
    
    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      console.log(`\n🆔 User ID: ${userId}`);
      console.log(`📧 Email: ${userData.email || 'Not set'}`);
      console.log(`👤 Display Name: ${userData.displayName || 'Not set'}`);
      console.log(`🏷️ Role: ${userData.role || 'Not set'}`);
      console.log(`✅ Verified: ${userData.isVerified || false}`);
      console.log(`👥 Followers: ${userData.followers || 0}`);
      console.log(`👥 Following: ${userData.following || 0}`);
      console.log(`📝 Bio: ${userData.bio || 'Not set'}`);
      console.log(`📍 Location: ${userData.location || 'Not set'}`);
      console.log(`🏃 Sport: ${userData.sport || 'Not set'}`);
      console.log(`🎂 Age: ${userData.age || 'Not set'}`);
      console.log(`⚧️ Gender: ${userData.gender || 'Not set'}`);
      console.log(`📅 Created: ${userData.createdAt ? 'Has timestamp' : 'No timestamp'}`);
    });
    
    console.log('\n🎬 Checking talent videos...');
    const videosSnapshot = await getDocs(collection(db, 'talentVideos'));
    console.log(`📹 Found ${videosSnapshot.size} talent videos`);
    
    if (videosSnapshot.size > 0) {
      console.log('\n🎥 Video Details:');
      console.log('=================');
      
      videosSnapshot.forEach((videoDoc) => {
        const videoData = videoDoc.data();
        const videoId = videoDoc.id;
        
        console.log(`\n🆔 Video ID: ${videoId}`);
        console.log(`👤 User: ${videoData.userDisplayName || 'Unknown'}`);
        console.log(`👤 User ID: ${videoData.userId || 'Unknown'}`);
        console.log(`📁 File: ${videoData.fileName || 'Unknown'}`);
        console.log(`📅 Uploaded: ${videoData.uploadedAt ? 'Has timestamp' : 'No timestamp'}`);
        console.log(`✅ Verified: ${videoData.isVerified || false}`);
        console.log(`📊 Status: ${videoData.verificationStatus || 'Unknown'}`);
        console.log(`👁️ Views: ${videoData.views || 0}`);
        console.log(`❤️ Likes: ${videoData.likes || 0}`);
      });
    }
    
    console.log('\n🎉 Data check complete!');
    console.log(`📊 Summary:`);
    console.log(`   Users: ${usersSnapshot.size}`);
    console.log(`   Videos: ${videosSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error checking data:', error.message);
  }
  
  process.exit(0);
}

checkUsersData();