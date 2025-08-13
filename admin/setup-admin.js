// Setup script to create initial admin user
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  // In production, use proper service account
  type: "service_account",
  project_id: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.REACT_APP_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
});

async function setupInitialAdmin() {
  const db = admin.firestore();
  
  try {
    // Create first super admin user
    // Replace with actual admin user ID
    const adminUID = 'admin_user_id_here'; // Get this from Firebase Auth console
    const adminEmail = 'admin@amaplayer.com';
    
    await db.collection('admins').doc(adminUID).set({
      role: 'super_admin',
      email: adminEmail,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'system_setup'
    });
    
    console.log('✅ Initial admin user created successfully');
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(adminUID, { 
      admin: true, 
      role: 'super_admin' 
    });
    
    console.log('✅ Admin custom claims set');
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  }
  
  process.exit(0);
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupInitialAdmin();
}

module.exports = { setupInitialAdmin };