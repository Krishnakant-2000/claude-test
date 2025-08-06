// Admin Reports Dashboard - Basic Implementation
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Shield, Eye, CheckCircle, XCircle, Clock, Flag, User, MessageSquare, FileText, MessageCircle } from 'lucide-react';
import './AdminReports.css';

export default function AdminReports() {
  const { currentUser, isGuest } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, reviewed, high
  const [selectedReport, setSelectedReport] = useState(null);
  const [moderatorAction, setModeratorAction] = useState('');
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);
  const [adminStatus, setAdminStatus] = useState({ isAdmin: false, loading: true, permissions: null });

  // Verify admin status using secure Cloud Function
  useEffect(() => {
    const verifyAdminStatus = async () => {
      if (!currentUser || isGuest) {
        setAdminStatus({ isAdmin: false, loading: false, permissions: null });
        return;
      }

      try {
        const functions = getFunctions();
        const verifyAdminRole = httpsCallable(functions, 'verifyAdminRole');
        const result = await verifyAdminRole();
        
        const { isAdmin, permissions } = result.data;
        setAdminStatus({ 
          isAdmin: isAdmin && permissions?.canManageReports, 
          loading: false,
          permissions
        });
      } catch (error) {
        console.error('Error verifying admin status:', error);
        setAdminStatus({ isAdmin: false, loading: false, permissions: null });
      }
    };

    verifyAdminStatus();
  }, [currentUser, isGuest]);

  useEffect(() => {
    if (!adminStatus.isAdmin) {
      setLoading(false);
      return;
    }

    // Fetch content reports
    const q = query(
      collection(db, 'contentReports'), 
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = [];
      snapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() });
      });
      setReports(reportsData);
      setLoading(false);
    });

    return unsubscribe;
  }, [adminStatus.isAdmin]);

  const filteredReports = reports.filter(report => {
    switch (filter) {
      case 'pending':
        return report.status === 'pending';
      case 'reviewed':
        return report.status === 'reviewed' || report.status === 'resolved';
      case 'high':
        return report.priority === 'high';
      default:
        return true;
    }
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="status-pending" />;
      case 'reviewed':
        return <Eye size={16} className="status-reviewed" />;
      case 'resolved':
        return <CheckCircle size={16} className="status-resolved" />;
      case 'dismissed':
        return <XCircle size={16} className="status-dismissed" />;
      default:
        return <Clock size={16} className="status-pending" />;
    }
  };

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'post':
        return <FileText size={16} />;
      case 'message':
        return <MessageSquare size={16} />;
      case 'user':
        return <User size={16} />;
      case 'comment':
        return <MessageCircle size={16} />;
      default:
        return <Flag size={16} />;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      default:
        return 'priority-low';
    }
  };

  const handleReportAction = async (reportId, action, notes = '') => {
    setActionInProgress(true);
    
    try {
      // Use secure Cloud Function for handling reports
      const functions = getFunctions();
      const handleContentReport = httpsCallable(functions, 'handleContentReport');
      
      await handleContentReport({
        reportId,
        action,
        notes
      });
      
      console.log(`✅ Report ${reportId} marked as ${action}`);
      
      // Close details view
      setSelectedReport(null);
      setModeratorAction('');
      setModeratorNotes('');
      
    } catch (error) {
      console.error('❌ Error updating report:', error);
      alert('Failed to update report: ' + error.message);
    }
    
    setActionInProgress(false);
  };

  const handleDeleteContent = async (contentId, contentType) => {
    if (!window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      // Use secure Cloud Function for content deletion
      const functions = getFunctions();
      const deleteContent = httpsCallable(functions, 'deleteContent');
      
      await deleteContent({
        contentId,
        contentType,
        reason: 'Admin deletion via reports dashboard'
      });
      
      console.log(`✅ Deleted ${contentType} ${contentId}`);
      alert('Content deleted successfully');
      
    } catch (error) {
      console.error('❌ Error deleting content:', error);
      alert('Failed to delete content: ' + error.message);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const formatReasons = (reasons) => {
    return reasons.map(reason => 
      reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');
  };

  if (isGuest || !currentUser) {
    return (
      <div className="admin-access-denied">
        <Shield size={48} />
        <h2>Access Denied</h2>
        <p>Please sign in with an admin account to access the reports dashboard.</p>
      </div>
    );
  }

  if (adminStatus.loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (!adminStatus.isAdmin) {
    return (
      <div className="admin-access-denied">
        <Shield size={48} />
        <h2>Admin Access Required</h2>
        <p>You do not have permission to access the admin dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="admin-reports">
      <div className="admin-header">
        <div className="header-info">
          <Shield size={24} />
          <h1>Content Reports Dashboard</h1>
        </div>
        <div className="report-stats">
          <div className="stat">
            <span className="stat-number">{reports.length}</span>
            <span className="stat-label">Total Reports</span>
          </div>
          <div className="stat">
            <span className="stat-number">{reports.filter(r => r.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat">
            <span className="stat-number">{reports.filter(r => r.priority === 'high').length}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      <div className="filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Reports
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={filter === 'reviewed' ? 'active' : ''}
          onClick={() => setFilter('reviewed')}
        >
          Reviewed
        </button>
        <button 
          className={filter === 'high' ? 'active' : ''}
          onClick={() => setFilter('high')}
        >
          High Priority
        </button>
      </div>

      <div className="reports-list">
        {filteredReports.length === 0 ? (
          <div className="no-reports">
            <Flag size={48} />
            <p>No reports found for the selected filter.</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className={`report-card ${getPriorityClass(report.priority)}`}>
              <div className="report-header">
                <div className="report-type">
                  {getContentTypeIcon(report.contentType)}
                  <span>{report.contentType.charAt(0).toUpperCase() + report.contentType.slice(1)} Report</span>
                </div>
                <div className="report-status">
                  {getStatusIcon(report.status)}
                  <span>{report.status.charAt(0).toUpperCase() + report.status.slice(1)}</span>
                </div>
              </div>

              <div className="report-details">
                <div className="report-info">
                  <p><strong>Reporter:</strong> {report.reporterName} ({report.reporterEmail})</p>
                  <p><strong>Reported:</strong> {formatTimestamp(report.timestamp)}</p>
                  <p><strong>Reasons:</strong> {formatReasons(report.reasons)}</p>
                  {report.customReason && (
                    <p><strong>Additional Details:</strong> {report.customReason}</p>
                  )}
                  {report.contentPreview && (
                    <div className="content-preview">
                      <strong>Content Preview:</strong>
                      <p>"{report.contentPreview}"</p>
                    </div>
                  )}
                </div>

                <div className="report-actions">
                  <button 
                    className="view-details-btn"
                    onClick={() => setSelectedReport(report)}
                  >
                    View Details
                  </button>
                  {report.status === 'pending' && (
                    <>
                      <button 
                        className="approve-btn"
                        onClick={() => handleReportAction(report.id, 'dismissed')}
                      >
                        Dismiss
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleReportAction(report.id, 'resolved')}
                      >
                        Take Action
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="report-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="report-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Report Details</h3>
              <button onClick={() => setSelectedReport(null)}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="detail-section">
                <h4>Report Information</h4>
                <p><strong>Content Type:</strong> {selectedReport.contentType}</p>
                <p><strong>Content ID:</strong> {selectedReport.contentId}</p>
                <p><strong>Priority:</strong> {selectedReport.priority}</p>
                <p><strong>Status:</strong> {selectedReport.status}</p>
                <p><strong>Submitted:</strong> {formatTimestamp(selectedReport.timestamp)}</p>
              </div>

              <div className="detail-section">
                <h4>Reporter Information</h4>
                <p><strong>Name:</strong> {selectedReport.reporterName}</p>
                <p><strong>Email:</strong> {selectedReport.reporterEmail}</p>
              </div>

              <div className="detail-section">
                <h4>Report Reasons</h4>
                <p>{formatReasons(selectedReport.reasons)}</p>
                {selectedReport.customReason && (
                  <div className="custom-reason">
                    <strong>Additional Details:</strong>
                    <p>{selectedReport.customReason}</p>
                  </div>
                )}
              </div>

              {selectedReport.status === 'pending' && (
                <div className="action-section">
                  <h4>Moderator Action</h4>
                  <select 
                    value={moderatorAction} 
                    onChange={(e) => setModeratorAction(e.target.value)}
                  >
                    <option value="">Select Action</option>
                    <option value="content_removed">Remove Content</option>
                    <option value="user_warned">Warn User</option>
                    <option value="user_suspended">Suspend User</option>
                    <option value="no_action">No Action Needed</option>
                  </select>

                  <textarea
                    placeholder="Moderator notes..."
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                  />

                  <div className="action-buttons">
                    <button 
                      className="dismiss-btn"
                      onClick={() => handleReportAction(selectedReport.id, 'dismissed', moderatorNotes)}
                      disabled={actionInProgress}
                    >
                      Dismiss Report
                    </button>
                    <button 
                      className="resolve-btn"
                      onClick={() => handleReportAction(selectedReport.id, 'resolved', moderatorNotes)}
                      disabled={actionInProgress || !moderatorAction}
                    >
                      {actionInProgress ? 'Processing...' : 'Resolve Report'}
                    </button>
                    {selectedReport.contentType !== 'user' && (
                      <button 
                        className="delete-content-btn"
                        onClick={() => handleDeleteContent(selectedReport.contentId, selectedReport.contentType)}
                      >
                        Delete Content
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}