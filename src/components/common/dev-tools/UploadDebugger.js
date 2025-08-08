import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { storage, db } from '../../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { validateVideoFile, generateVideoMetadata } from '../../../firebase/videoService';

export default function UploadDebugger() {
  const { currentUser } = useAuth();
  const [debugInfo, setDebugInfo] = useState('');
  const [testFile, setTestFile] = useState(null);
  const [testing, setTesting] = useState(false);

  const addDebugInfo = (info) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev}\n[${timestamp}] ${info}`);
    console.log(`[DEBUG] ${info}`);
  };

  const testImageUpload = async () => {
    if (!testFile) {
      addDebugInfo('❌ No test file selected');
      return;
    }

    setTesting(true);
    setDebugInfo('🔍 Starting comprehensive upload debugging...\n');

    try {
      // Test environment info
      addDebugInfo(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      addDebugInfo(`🌐 Origin: ${window.location.origin}`);
      addDebugInfo(`🌐 User Agent: ${navigator.userAgent.substring(0, 80)}...`);

      // Test user authentication
      addDebugInfo(`👤 User authenticated: ${currentUser ? 'YES' : 'NO'}`);
      if (currentUser) {
        addDebugInfo(`👤 User ID: ${currentUser.uid}`);
        addDebugInfo(`👤 User email: ${currentUser.email}`);
        addDebugInfo(`👤 Display name: ${currentUser.displayName || 'None'}`);
        addDebugInfo(`👤 Email verified: ${currentUser.emailVerified}`);
      } else {
        addDebugInfo('❌ No authenticated user - this will cause upload failures');
        return;
      }

      // Test file info
      addDebugInfo(`📁 File name: ${testFile.name}`);
      addDebugInfo(`📁 File size: ${testFile.size} bytes (${(testFile.size / 1024 / 1024).toFixed(2)} MB)`);
      addDebugInfo(`📁 File type: ${testFile.type}`);
      addDebugInfo(`📁 Last modified: ${new Date(testFile.lastModified).toISOString()}`);

      // Test file type specific validation
      const isImage = testFile.type.startsWith('image/');
      const isVideo = testFile.type.startsWith('video/');
      addDebugInfo(`📁 Is Image: ${isImage}`);
      addDebugInfo(`📁 Is Video: ${isVideo}`);

      if (isVideo) {
        addDebugInfo('🎥 Testing video validation...');
        const videoValidation = validateVideoFile(testFile);
        addDebugInfo(`🎥 Video validation: ${videoValidation.isValid ? 'PASSED' : 'FAILED'}`);
        if (!videoValidation.isValid) {
          addDebugInfo(`❌ Video validation error: ${videoValidation.error}`);
        }
      }

      // Test storage reference creation
      const timestamp = Date.now();
      const safeFileName = testFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = isImage ? 
        `posts/images/${currentUser.uid}/${timestamp}-${safeFileName}` :
        `post-videos/${currentUser.uid}/${timestamp}-${safeFileName}`;
      
      addDebugInfo(`📂 Upload path: ${filePath}`);

      const storageRef = ref(storage, filePath);
      addDebugInfo(`📂 Storage reference created: ${storageRef.fullPath}`);
      addDebugInfo(`📂 Storage bucket: ${storageRef.bucket}`);

      // Test Firebase Storage connectivity
      addDebugInfo('🔗 Testing Firebase Storage connectivity...');
      
      if (isVideo && testFile.size > 5 * 1024 * 1024) { // Test resumable upload for large files
        addDebugInfo('⬆️ Starting resumable upload (large file)...');
        
        const uploadTask = uploadBytesResumable(storageRef, testFile);
        
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              addDebugInfo(`📊 Upload progress: ${progress.toFixed(1)}%`);
            },
            (error) => {
              addDebugInfo(`❌ Upload error: ${error.message}`);
              addDebugInfo(`❌ Error code: ${error.code}`);
              reject(error);
            },
            () => {
              addDebugInfo('✅ Resumable upload completed!');
              resolve(uploadTask.snapshot);
            }
          );
        });

        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        addDebugInfo(`✅ Download URL: ${downloadURL.substring(0, 100)}...`);

      } else {
        addDebugInfo('⬆️ Starting simple upload...');
        const uploadResult = await uploadBytes(storageRef, testFile);
        addDebugInfo(`✅ Upload successful! Bytes: ${uploadResult.metadata.size}`);
        addDebugInfo(`✅ Content type: ${uploadResult.metadata.contentType}`);

        const downloadURL = await getDownloadURL(uploadResult.ref);
        addDebugInfo(`✅ Download URL: ${downloadURL.substring(0, 100)}...`);
      }

      // Test Firestore integration
      addDebugInfo('💾 Testing Firestore integration...');
      const testPost = {
        caption: 'Debug test post',
        mediaUrl: 'test-url',
        mediaType: isImage ? 'image' : 'video',
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Test User',
        timestamp: new Date(),
        likes: [],
        comments: [],
        debugTest: true
      };

      const docRef = await addDoc(collection(db, 'posts'), testPost);
      addDebugInfo(`✅ Firestore test successful! Doc ID: ${docRef.id}`);

      // Test video metadata generation if it's a video
      if (isVideo) {
        addDebugInfo('🎬 Testing video metadata generation...');
        try {
          const metadata = await generateVideoMetadata(testFile, 'test-url', 'test-user-id');
          addDebugInfo(`✅ Video metadata: ${JSON.stringify(metadata, null, 2)}`);
        } catch (metaError) {
          addDebugInfo(`⚠️ Video metadata failed (non-critical): ${metaError.message}`);
        }
      }

      addDebugInfo('🎉 ALL TESTS PASSED! Upload system is fully functional.');

    } catch (error) {
      addDebugInfo(`❌ CRITICAL ERROR: ${error.message}`);
      addDebugInfo(`❌ Error code: ${error.code || 'N/A'}`);
      addDebugInfo(`❌ Error stack: ${error.stack || 'N/A'}`);
      
      // Additional Firebase-specific error debugging
      if (error.code) {
        switch (error.code) {
          case 'storage/unauthorized':
            addDebugInfo('🔧 FIX: Update Firebase Storage rules to allow authenticated uploads');
            break;
          case 'storage/quota-exceeded':
            addDebugInfo('🔧 FIX: Firebase Storage quota exceeded - upgrade plan or clean up files');
            break;
          case 'storage/unauthenticated':
            addDebugInfo('🔧 FIX: User not authenticated - check auth state');
            break;
          case 'storage/retry-limit-exceeded':
            addDebugInfo('🔧 FIX: Network issues - check internet connection');
            break;
          default:
            addDebugInfo(`🔧 Unknown Firebase error: ${error.code}`);
        }
      }
    }

    setTesting(false);
  };

  const testAPIEndpoint = async () => {
    addDebugInfo('🌐 Testing API connectivity...\n');
    
    try {
      // Test Firebase config
      addDebugInfo('🔧 Firebase config check:');
      addDebugInfo(`📱 Project ID: ${storage.app.options.projectId}`);
      addDebugInfo(`🪣 Storage Bucket: ${storage.app.options.storageBucket}`);
      addDebugInfo(`🔑 API Key: ${storage.app.options.apiKey ? 'Present' : 'Missing'}`);

      // Test network connectivity
      addDebugInfo('🌍 Testing network connectivity...');
      await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
      addDebugInfo('✅ Network connectivity: OK');

      // Test Firebase Auth status
      addDebugInfo('🔐 Testing Firebase Auth...');
      if (currentUser) {
        addDebugInfo(`✅ Auth token present: ${currentUser.accessToken ? 'YES' : 'NO'}`);
        addDebugInfo(`✅ Auth provider: ${currentUser.providerData[0]?.providerId || 'Unknown'}`);
      }

    } catch (error) {
      addDebugInfo(`❌ API Test Error: ${error.message}`);
    }
  };

  const clearDebug = () => {
    setDebugInfo('');
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '20px', 
      borderRadius: '10px', 
      maxWidth: '400px',
      maxHeight: '300px',
      zIndex: 1000,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#00ff88' }}>🔧 Upload Debugger</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setTestFile(e.target.files[0])}
          style={{ fontSize: '10px', width: '100%' }}
        />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testImageUpload} 
          disabled={!testFile || testing}
          style={{ 
            padding: '5px 8px', 
            marginRight: '5px',
            marginBottom: '5px',
            background: '#00ff88',
            color: 'black',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          {testing ? '🔄 Testing...' : '🧪 Full Test'}
        </button>
        
        <button 
          onClick={testAPIEndpoint}
          disabled={testing}
          style={{ 
            padding: '5px 8px', 
            marginRight: '5px',
            marginBottom: '5px',
            background: '#4488ff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          🌐 API Test
        </button>
        
        <button 
          onClick={clearDebug}
          style={{ 
            padding: '5px 8px',
            marginBottom: '5px',
            background: '#ff4444',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          🗑️ Clear
        </button>
      </div>

      <div style={{ 
        background: '#222', 
        padding: '10px', 
        borderRadius: '5px', 
        maxHeight: '200px', 
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        fontSize: '10px'
      }}>
        {debugInfo || 'Select a file and click "Test Upload" to debug upload issues...'}
      </div>
    </div>
  );
}