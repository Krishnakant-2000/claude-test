import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  User,
  Calendar,
  FileVideo,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MoreVertical
} from 'lucide-react';
import { videoVerificationService, TalentVideo } from '../services/videoVerificationService';

const VideoVerification: React.FC = () => {
  const [videos, setVideos] = useState<TalentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<TalentVideo | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    console.log('🎬 ADMIN: LoadVideos function called');
    try {
      setLoading(true);
      console.log('🔄 ADMIN: Calling getAllVideos...');
      const allVideos = await videoVerificationService.getAllVideos();
      console.log('📊 ADMIN: Received videos:', allVideos.length, allVideos);
      setVideos(allVideos);
    } catch (error) {
      console.error('❌ ADMIN: Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(video => {
    if (statusFilter !== 'all' && video.verificationStatus !== statusFilter) return false;
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      return (
        video.title?.toLowerCase().includes(searchLower) ||
        video.userDisplayName?.toLowerCase().includes(searchLower) ||
        video.description?.toLowerCase().includes(searchLower) ||
        video.category?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const handleApproveVideo = async (video: TalentVideo) => {
    setReviewing(video.id);
    try {
      await videoVerificationService.approveVideo(video.id!);
      await loadVideos();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error approving video:', error);
    } finally {
      setReviewing(null);
    }
  };

  const handleRejectVideo = async (video: TalentVideo) => {
    const reason = prompt('Enter rejection reason (optional):');
    setReviewing(video.id);
    
    try {
      await videoVerificationService.rejectVideo(video.id!, reason || undefined);
      await loadVideos();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error rejecting video:', error);
    } finally {
      setReviewing(null);
    }
  };

  const handleFlagVideo = async (video: TalentVideo) => {
    const reason = prompt('Enter flag reason:');
    if (!reason) return;

    try {
      await videoVerificationService.flagVideo(video.id!, reason);
      await loadVideos();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Error flagging video:', error);
    }
  };

  const VideoDetailsModal: React.FC<{ video: TalentVideo; onClose: () => void }> = ({ video, onClose }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-95vh overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">Video Review</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Player */}
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-full object-contain"
                  src={video.videoUrl}
                  poster={video.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApproveVideo(video)}
                  disabled={reviewing === video.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                >
                  {reviewing === video.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4" />
                      <span>Approve</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleRejectVideo(video)}
                  disabled={reviewing === video.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                >
                  {reviewing === video.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <ThumbsDown className="w-4 h-4" />
                      <span>Reject</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleFlagVideo(video)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Flag</span>
                </button>
              </div>
            </div>

            {/* Video Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {video.title || 'Untitled Video'}
                </h3>
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    video.verificationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    video.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {video.verificationStatus === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {video.verificationStatus === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                    {video.verificationStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {video.verificationStatus.charAt(0).toUpperCase() + video.verificationStatus.slice(1)}
                  </span>
                  {video.category && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {video.category.charAt(0).toUpperCase() + video.category.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{video.userDisplayName || 'Unknown User'}</p>
                    <p className="text-sm text-gray-600">{video.userEmail}</p>
                    <p className="text-sm text-gray-500">User ID: {video.userId}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {video.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{video.description}</p>
                </div>
              )}

              {/* Video Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{video.views || 0}</p>
                  <p className="text-sm text-gray-600">Views</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{video.likes || 0}</p>
                  <p className="text-sm text-gray-600">Likes</p>
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">File Size:</span>
                  <span className="text-gray-900">
                    {video.fileSize ? `${(video.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900">{video.duration ? `${video.duration}s` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Upload Date:</span>
                  <span className="text-gray-900">
                    {video.uploadedAt ? new Date(video.uploadedAt.toDate()).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Review History */}
              {video.reviewedAt && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Last Review:</strong> {new Date(video.reviewedAt.toDate()).toLocaleString()}
                  </p>
                  {video.reviewedBy && (
                    <p className="text-sm text-yellow-700">by {video.reviewedBy}</p>
                  )}
                  {video.rejectionReason && (
                    <p className="text-sm text-yellow-700 mt-1">
                      <strong>Reason:</strong> {video.rejectionReason}
                    </p>
                  )}
                </div>
              )}

              {/* Flags */}
              {video.flags && video.flags.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium mb-2">Flags:</p>
                  {video.flags.map((flag, index) => (
                    <div key={index} className="text-sm text-red-700">
                      <p><strong>{flag.reason}</strong></p>
                      <p className="text-xs">by {flag.flaggedBy} on {new Date(flag.flaggedAt.toDate()).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Video Verification</h1>
        <p className="text-gray-600 mt-1">Review and verify talent showcase videos</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.filter(v => v.verificationStatus === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.filter(v => v.verificationStatus === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.filter(v => v.verificationStatus === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileVideo className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Videos</p>
              <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos by title, user, or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-video bg-gray-100 relative cursor-pointer" onClick={() => {
              setSelectedVideo(video);
              setShowVideoModal(true);
            }}>
              <img
                src={video.thumbnail || '/api/placeholder/400/225'}
                alt={video.title || 'Video thumbnail'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                <PlayCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute top-2 left-2">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white ${
                  video.verificationStatus === 'approved' ? 'bg-green-600' :
                  video.verificationStatus === 'rejected' ? 'bg-red-600' :
                  'bg-yellow-600'
                }`}>
                  {video.verificationStatus === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {video.verificationStatus === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                  {video.verificationStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                  {video.verificationStatus.charAt(0).toUpperCase() + video.verificationStatus.slice(1)}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                  {video.title || 'Untitled Video'}
                </h3>
                <div className="relative">
                  <button
                    onClick={() => setActionMenuOpen(actionMenuOpen === video.id ? null : video.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {actionMenuOpen === video.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setSelectedVideo(video);
                            setShowVideoModal(true);
                            setActionMenuOpen(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4 inline mr-2" />
                          Review
                        </button>
                        {video.verificationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveVideo(video)}
                              disabled={reviewing === video.id}
                              className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <ThumbsUp className="w-4 h-4 inline mr-2" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectVideo(video)}
                              disabled={reviewing === video.id}
                              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <ThumbsDown className="w-4 h-4 inline mr-2" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleFlagVideo(video)}
                          className="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100"
                        >
                          <AlertTriangle className="w-4 h-4 inline mr-2" />
                          Flag
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                <User className="w-3 h-3" />
                <span>{video.userDisplayName || 'Unknown User'}</span>
              </div>

              {video.uploadedAt && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(video.uploadedAt.toDate()).toLocaleDateString()}</span>
                </div>
              )}

              {video.verificationStatus === 'pending' && (
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleApproveVideo(video)}
                    disabled={reviewing === video.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs py-2 px-3 rounded"
                  >
                    {reviewing === video.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mx-auto" />
                    ) : (
                      'Approve'
                    )}
                  </button>
                  <button
                    onClick={() => handleRejectVideo(video)}
                    disabled={reviewing === video.id}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs py-2 px-3 rounded"
                  >
                    {reviewing === video.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mx-auto" />
                    ) : (
                      'Reject'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <FileVideo className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No videos have been submitted for review yet.'
            }
          </p>
        </div>
      )}

      {/* Video Details Modal */}
      {showVideoModal && selectedVideo && (
        <VideoDetailsModal
          video={selectedVideo}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
        />
      )}
    </div>
  );
};

export default VideoVerification;