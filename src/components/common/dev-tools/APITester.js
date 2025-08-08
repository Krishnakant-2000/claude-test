import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { storage, db, auth } from '../../../firebase/firebase';

export default function APITester() {
  const { currentUser } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState('');
  const [testing, setTesting] = useState(false);

  const addResult = (info) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => `${prev}\n[${timestamp}] ${info}`);
    console.log(`[API-TEST] ${info}`);
  };

  const testFirebaseAPIs = async () => {
    setTesting(true);
    setTestResults('🔍 Starting comprehensive Firebase API testing...\n');

    try {
      // Test 1: Firebase Configuration
      addResult('📱 Testing Firebase Configuration...');
      addResult(`Project ID: ${auth.app.options.projectId}`);
      addResult(`API Key: ${auth.app.options.apiKey ? 'Present' : 'Missing'}`);
      addResult(`Auth Domain: ${auth.app.options.authDomain}`);
      addResult(`Storage Bucket: ${auth.app.options.storageBucket}`);
      addResult(`Messaging Sender ID: ${auth.app.options.messagingSenderId}`);

      // Test 2: Authentication API
      addResult('\n🔐 Testing Authentication API...');
      if (currentUser) {
        addResult(`✅ User authenticated: ${currentUser.email}`);
        addResult(`✅ User ID: ${currentUser.uid}`);
        addResult(`✅ Email verified: ${currentUser.emailVerified}`);
        
        // Test token refresh
        try {
          const token = await currentUser.getIdToken(true);
          addResult(`✅ Auth token refreshed: ${token.substring(0, 50)}...`);
        } catch (tokenError) {
          addResult(`❌ Token refresh failed: ${tokenError.message}`);
        }
      } else {
        addResult('❌ No authenticated user');
      }

      // Test 3: Firestore API
      addResult('\n💾 Testing Firestore API...');
      try {
        const { collection, getDocs, addDoc } = await import('firebase/firestore');
        
        // Test read permissions
        const postsRef = collection(db, 'posts');
        const snapshot = await getDocs(postsRef);
        addResult(`✅ Firestore read: ${snapshot.size} posts found`);

        // Test write permissions (if authenticated)
        if (currentUser) {
          const testDoc = {
            test: true,
            timestamp: new Date(),
            userId: currentUser.uid,
            message: 'API test document'
          };
          
          const docRef = await addDoc(collection(db, 'api-tests'), testDoc);
          addResult(`✅ Firestore write: Test doc created ${docRef.id}`);
        }
      } catch (firestoreError) {
        addResult(`❌ Firestore error: ${firestoreError.message}`);
      }

      // Test 4: Storage API
      addResult('\n🗄️ Testing Firebase Storage API...');
      try {
        const { ref, listAll } = await import('firebase/storage');
        
        // Test storage access
        const storageRef = ref(storage, 'posts');
        await listAll(storageRef);
        addResult(`✅ Storage access: Can list storage contents`);
        
        // Test storage metadata
        const testRef = ref(storage, 'test-file.txt');
        addResult(`✅ Storage ref created: ${testRef.fullPath}`);
        
      } catch (storageError) {
        addResult(`❌ Storage error: ${storageError.message}`);
      }

      // Test 5: Network Connectivity
      addResult('\n🌐 Testing Network Connectivity...');
      try {
        const response = await fetch('https://firebase.googleapis.com/v1beta1/projects');
        addResult(`✅ Firebase API reachable: ${response.status}`);
      } catch (networkError) {
        addResult(`❌ Network error: ${networkError.message}`);
      }

      // Test 6: CORS and Browser Permissions
      addResult('\n🔒 Testing Browser Permissions...');
      addResult(`Origin: ${window.location.origin}`);
      addResult(`Protocol: ${window.location.protocol}`);
      addResult(`User Agent: ${navigator.userAgent.substring(0, 80)}...`);
      
      // Test localStorage
      try {
        localStorage.setItem('test', 'value');
        localStorage.removeItem('test');
        addResult(`✅ LocalStorage: Working`);
      } catch (storageError) {
        addResult(`❌ LocalStorage: ${storageError.message}`);
      }

      addResult('\n🎉 API testing completed!');

    } catch (error) {
      addResult(`❌ CRITICAL API ERROR: ${error.message}`);
      addResult(`Stack: ${error.stack}`);
    }

    setTesting(false);
  };

  const testUploadEndpoints = async () => {
    setTesting(true);
    setTestResults('🔍 Testing Upload Endpoints...\n');

    try {
      // Test upload permissions
      addResult('⬆️ Testing upload permissions...');
      
      if (!currentUser) {
        addResult('❌ Cannot test uploads - user not authenticated');
        return;
      }

      const { ref, uploadBytes } = await import('firebase/storage');
      
      // Create a small test file
      const testBlob = new Blob(['test upload content'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test-upload.txt', { type: 'text/plain' });
      
      addResult(`📁 Test file created: ${testFile.name} (${testFile.size} bytes)`);

      // Test different upload paths
      const paths = [
        `posts/images/${currentUser.uid}/test-image.jpg`,
        `post-videos/${currentUser.uid}/test-video.mp4`,
        `api-tests/${currentUser.uid}/test-file.txt`
      ];

      for (const path of paths) {
        try {
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, testFile);
          addResult(`✅ Upload test passed: ${path}`);
        } catch (uploadError) {
          addResult(`❌ Upload test failed: ${path} - ${uploadError.message}`);
        }
      }

    } catch (error) {
      addResult(`❌ Upload endpoint error: ${error.message}`);
    }

    setTesting(false);
  };

  const exportResults = () => {
    const results = testResults;
    const blob = new Blob([results], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firebase-api-test-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '350px',
          right: '20px',
          background: '#ff6b35',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '10px 15px',
          cursor: 'pointer',
          fontSize: '12px',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        🧪 API Tester
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: 'rgba(0,0,0,0.95)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      maxWidth: '500px',
      maxHeight: '400px',
      zIndex: 1000,
      fontSize: '12px',
      fontFamily: 'monospace',
      border: '2px solid #ff6b35'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0, color: '#ff6b35' }}>🧪 Firebase API Tester</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button
          onClick={testFirebaseAPIs}
          disabled={testing}
          style={{
            padding: '8px 12px',
            marginRight: '10px',
            marginBottom: '5px',
            background: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          {testing ? '🔄 Testing...' : '🔥 Test Firebase APIs'}
        </button>

        <button
          onClick={testUploadEndpoints}
          disabled={testing}
          style={{
            padding: '8px 12px',
            marginRight: '10px',
            marginBottom: '5px',
            background: '#35a7ff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          ⬆️ Test Uploads
        </button>

        <button
          onClick={exportResults}
          disabled={!testResults}
          style={{
            padding: '8px 12px',
            marginBottom: '5px',
            background: '#35ff6b',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          💾 Export
        </button>
      </div>

      <div style={{
        background: '#111',
        padding: '10px',
        borderRadius: '5px',
        maxHeight: '250px',
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        fontSize: '10px',
        border: '1px solid #333'
      }}>
        {testResults || 'Click a test button to start API diagnostics...'}
      </div>
    </div>
  );
}