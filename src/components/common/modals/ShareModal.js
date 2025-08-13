// Share modal for posts with social media integration
import React, { memo, useState, useCallback } from 'react';
import { X, Copy, Check, Share2, MessageSquare, Mail, ExternalLink } from 'lucide-react';
import LazyImage from '../ui/LazyImage';
import './Modal.css';

const ShareModal = memo(({ post, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(post.sharesCount || 0);

  // Generate shareable URL
  const shareUrl = `${window.location.origin}/post/${post.id}`;

  // Handle copy to clipboard
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Increment share count
      setShareCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setShareCount(prev => prev + 1);
      } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Unable to copy link. Please copy manually: ' + shareUrl);
      }
      
      textArea.remove();
    }
  }, [shareUrl]);

  // Handle external sharing
  const handleExternalShare = useCallback((platform) => {
    const text = post.caption ? `${post.caption}\n\n` : '';
    const shareText = `${text}Check out this amazing post on AmaPlayer!`;
    
    let shareLink = '';
    
    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent('Check out this AmaPlayer post')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`;
        break;
      case 'sms':
        shareLink = `sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
    setShareCount(prev => prev + 1);
  }, [post.caption, shareUrl]);

  // Handle native sharing (if supported)
  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;

    try {
      const shareData = {
        title: 'AmaPlayer Post',
        text: post.caption || 'Check out this amazing post on AmaPlayer!',
        url: shareUrl
      };

      await navigator.share(shareData);
      setShareCount(prev => prev + 1);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    }
  }, [post.caption, shareUrl]);

  const formatTime = useCallback((timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>Share Post</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Post Preview */}
        <div className="post-preview">
          <div className="user-info">
            <LazyImage
              src={post.userPhotoURL}
              alt={post.userDisplayName}
              className="user-avatar small"
              placeholder="/default-avatar.jpg"
            />
            <div className="user-details">
              <h4>{post.userDisplayName}</h4>
              <span className="post-time">{formatTime(post.createdAt)}</span>
            </div>
          </div>
          {post.caption && <p className="post-caption">{post.caption}</p>}
          <div className="share-stats">
            <span>{shareCount} shares</span>
          </div>
        </div>

        {/* Copy Link Section */}
        <div className="share-section">
          <h4>Share Link</h4>
          <div className="copy-link-container">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="share-url-input"
            />
            <button 
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyLink}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Share Options */}
        <div className="share-section">
          <h4>Share to</h4>
          <div className="share-options">
            {/* Native Share (if supported) */}
            {navigator.share && (
              <button 
                className="share-option native-share"
                onClick={handleNativeShare}
              >
                <div className="share-icon">
                  <Share2 size={24} />
                </div>
                <span>Share</span>
              </button>
            )}

            {/* WhatsApp */}
            <button 
              className="share-option whatsapp"
              onClick={() => handleExternalShare('whatsapp')}
            >
              <div className="share-icon">
                <MessageSquare size={24} />
              </div>
              <span>WhatsApp</span>
            </button>

            {/* Twitter */}
            <button 
              className="share-option twitter"
              onClick={() => handleExternalShare('twitter')}
            >
              <div className="share-icon">
                <ExternalLink size={24} />
              </div>
              <span>Twitter</span>
            </button>

            {/* Facebook */}
            <button 
              className="share-option facebook"
              onClick={() => handleExternalShare('facebook')}
            >
              <div className="share-icon">
                <ExternalLink size={24} />
              </div>
              <span>Facebook</span>
            </button>

            {/* Telegram */}
            <button 
              className="share-option telegram"
              onClick={() => handleExternalShare('telegram')}
            >
              <div className="share-icon">
                <ExternalLink size={24} />
              </div>
              <span>Telegram</span>
            </button>

            {/* Email */}
            <button 
              className="share-option email"
              onClick={() => handleExternalShare('email')}
            >
              <div className="share-icon">
                <Mail size={24} />
              </div>
              <span>Email</span>
            </button>

            {/* SMS */}
            <button 
              className="share-option sms"
              onClick={() => handleExternalShare('sms')}
            >
              <div className="share-icon">
                <MessageSquare size={24} />
              </div>
              <span>SMS</span>
            </button>
          </div>
        </div>

        {/* Share Tips */}
        <div className="share-tips">
          <p>💡 <strong>Tip:</strong> Sharing helps content creators reach more people and grow the AmaPlayer community!</p>
        </div>
      </div>
    </div>
  );
});

export default ShareModal;