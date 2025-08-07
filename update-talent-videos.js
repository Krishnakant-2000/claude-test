// Script to update existing talent videos with verification fields
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

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

async function updateTalentVideos() {
  try {
    console.log('🔐 Signing in as admin...');
    
    // Sign in as admin to get proper permissions
    await signInWithEmailAndPassword(auth, 'admin@amaplayer.com', 'Admin@123456');
    console.log('✅ Signed in successfully');
    
    console.log('🎬 Fetching talent videos...');
    const videosSnapshot = await getDocs(collection(db, 'talentVideos'));
    console.log(`📹 Found ${videosSnapshot.size} talent videos`);
    
    if (videosSnapshot.size === 0) {
      console.log('ℹ️ No talent videos found to update');
      return;
    }
    
    let updatedCount = 0;
    
    for (const videoDoc of videosSnapshot.docs) {
      const videoData = videoDoc.data();
      const videoId = videoDoc.id;
      
      console.log(`🔄 Processing video: ${videoId}`);
      console.log(`   User: ${videoData.userDisplayName || 'Unknown'}`);
      console.log(`   File: ${videoData.fileName || 'Unknown'}`);
      
      // Check if video already has verification fields
      if (videoData.hasOwnProperty('isVerified') && videoData.hasOwnProperty('verificationStatus')) {
        console.log(`   ✅ Already has verification fields, skipping`);
        continue;
      }
      
      // Add verification fields
      const updates = {
        isVerified: false,
        verificationStatus: 'pending',
        reviewedAt: null,
        verifiedAt: null,
        verifiedBy: null,
        reviewedBy: null,
        rejectionReason: null,
        adminNotes: null,
        flags: []
      };
      
      try {
        await updateDoc(doc(db, 'talentVideos', videoId), updates);
        console.log(`   ✅ Updated with verification fields`);
        updatedCount++;
      } catch (error) {
        console.error(`   ❌ Error updating video ${videoId}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Update complete!`);
    console.log(`📊 Summary:`);
    console.log(`   Total videos: ${videosSnapshot.size}`);
    console.log(`   Updated videos: ${updatedCount}`);
    console.log(`   Skipped videos: ${videosSnapshot.size - updatedCount}`);
    
  } catch (error) {
    console.error('❌ Error updating talent videos:', error.message);
  }
  
  process.exit(0);
}

updateTalentVideos();