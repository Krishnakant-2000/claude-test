// Upload Test Runner Component
// Admin component for running upload tests to verify Firebase Storage configuration

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { runUploadTests, runStoriesUploadTest } from '../../tests/uploadTests';
import './UploadTestRunner.css';

export default function UploadTestRunner() {
  const { currentUser, isGuest } = useAuth();
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  // Check if user has admin privileges
  const isAdmin = currentUser && 
    (currentUser.email?.includes('admin') || currentUser.email?.includes('test'));

  const runFullTestSuite = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentTest('Initializing test suite...');
    setTestResults(null);
    
    try {
      setCurrentTest('Running comprehensive upload tests...');
      const results = await runUploadTests();
      setTestResults(results);
      setCurrentTest('Tests completed');
    } catch (error) {
      console.error('Test suite failed:', error);
      setTestResults({
        summary: { total: 0, passed: 0, failed: 1, skipped: 0 },
        details: [{ testName: 'Test Suite', status: 'FAIL', message: error.message }],
        success: false
      });
    }
    
    setIsRunning(false);
  };

  const runStoriesTestOnly = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentTest('Testing stories upload...');
    setTestResults(null);
    
    try {
      const results = await runStoriesUploadTest();
      setTestResults(results);
      setCurrentTest('Stories tests completed');
    } catch (error) {
      console.error('Stories test failed:', error);
      setTestResults({
        summary: { total: 0, passed: 0, failed: 1, skipped: 0 },
        details: [{ testName: 'Stories Upload', status: 'FAIL', message: error.message }],
        success: false
      });
    }
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults(null);
    setCurrentTest('');
  };

  if (isGuest) {
    return (
      <div className="upload-test-runner guest-restricted">
        <h2>🧪 Upload Test Runner</h2>
        <p>This feature is only available to authenticated users.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="upload-test-runner admin-only">
        <h2>🧪 Upload Test Runner</h2>
        <p>This feature is only available to admin users.</p>
        <p className="hint">Admin access is granted to users with 'admin' or 'test' in their email address.</p>
      </div>
    );
  }

  return (
    <div className="upload-test-runner">
      <div className="test-header">
        <h2>🧪 Firebase Storage Upload Tests</h2>
        <p>Comprehensive testing suite for verifying upload functionality</p>
      </div>

      <div className="test-controls">
        <button 
          onClick={runFullTestSuite} 
          disabled={isRunning}
          className="btn-primary"
        >
          {isRunning ? '⏳ Running Tests...' : '🚀 Run All Tests'}
        </button>
        
        <button 
          onClick={runStoriesTestOnly} 
          disabled={isRunning}
          className="btn-secondary"
        >
          {isRunning ? '⏳ Testing...' : '📱 Test Stories Only'}
        </button>
        
        {testResults && (
          <button onClick={clearResults} className="btn-clear">
            🗑️ Clear Results
          </button>
        )}
      </div>

      {isRunning && (
        <div className="test-progress">
          <div className="progress-indicator">
            <div className="spinner"></div>
            <span>{currentTest}</span>
          </div>
        </div>
      )}

      {testResults && (
        <div className="test-results">
          <div className={`results-summary ${testResults.success ? 'success' : 'failure'}`}>
            <h3>📊 Test Results Summary</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Tests:</span>
                <span className="stat-value">{testResults.summary.total}</span>
              </div>
              <div className="stat-item success">
                <span className="stat-label">✅ Passed:</span>
                <span className="stat-value">{testResults.summary.passed}</span>
              </div>
              <div className="stat-item failure">
                <span className="stat-label">❌ Failed:</span>
                <span className="stat-value">{testResults.summary.failed}</span>
              </div>
              <div className="stat-item skipped">
                <span className="stat-label">⏭️ Skipped:</span>
                <span className="stat-value">{testResults.summary.skipped}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Success Rate:</span>
                <span className="stat-value">
                  {testResults.summary.total > 0 
                    ? (testResults.summary.passed / testResults.summary.total * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="detailed-results">
            <h4>📋 Detailed Results</h4>
            <div className="test-list">
              {testResults.details.map((test, index) => (
                <div key={index} className={`test-result ${test.status.toLowerCase()}`}>
                  <div className="test-info">
                    <span className="test-name">{test.testName}</span>
                    <span className="test-status">{test.status}</span>
                  </div>
                  <div className="test-message">{test.message}</div>
                  {test.duration > 0 && (
                    <div className="test-duration">{test.duration}ms</div>
                  )}
                  {test.error && (
                    <div className="test-error">
                      <strong>Error:</strong> {test.error.message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {testResults.summary.failed > 0 && (
            <div className="troubleshooting">
              <h4>🔧 Troubleshooting Guide</h4>
              <div className="troubleshooting-tips">
                <div className="tip">
                  <strong>Storage Permission Errors:</strong>
                  <p>Ensure Firebase Storage rules are deployed and include all necessary paths (stories/, posts/, etc.)</p>
                </div>
                <div className="tip">
                  <strong>File Size Errors:</strong>
                  <p>Check that file size limits in storage rules match your application requirements.</p>
                </div>
                <div className="tip">
                  <strong>Authentication Errors:</strong>
                  <p>Verify user is properly authenticated and not using guest/anonymous login.</p>
                </div>
                <div className="tip">
                  <strong>Network Errors:</strong>
                  <p>Check internet connection and Firebase project configuration.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="test-info">
        <h4>ℹ️ About These Tests</h4>
        <ul>
          <li><strong>Basic Image Upload:</strong> Tests standard post image uploads</li>
          <li><strong>Stories Upload:</strong> Tests the previously failing stories image/video uploads</li>
          <li><strong>Video Validation:</strong> Verifies video file validation logic</li>
          <li><strong>Size Limits:</strong> Ensures oversized files are properly rejected</li>
          <li><strong>File Types:</strong> Validates supported vs unsupported file types</li>
          <li><strong>Multiple Paths:</strong> Tests various storage paths (posts, stories, messages, etc.)</li>
        </ul>
        
        <div className="warning">
          <strong>⚠️ Note:</strong> These tests create temporary files in Firebase Storage. 
          They are automatically cleaned up after testing, but may briefly consume storage quota.
        </div>
      </div>
    </div>
  );
}