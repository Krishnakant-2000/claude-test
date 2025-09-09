# AmaPlayer - Firebase Database Schemas

## Firestore Collections Architecture

### 1. Users Collection (`users`)
```javascript
{
  uid: "user_12345", // Document ID matches Firebase Auth UID
  displayName: "John Athlete",
  email: "john@example.com",
  photoURL: "https://storage.googleapis.com/...",
  bio: "Professional basketball player",
  sport: "Basketball",
  role: "athlete", // athlete | coach | organization | fan
  location: {
    city: "Los Angeles",
    state: "California", 
    country: "USA"
  },
  skills: ["Shooting", "Defense", "Leadership"],
  achievements: ["State Champion 2023", "MVP Award"],
  stats: {
    followers: 1245,
    following: 234,
    posts: 156,
    stories: 89
  },
  isVerified: false,
  isPublic: true,
  gender: "male", // male | female | other | prefer_not_to_say
  age: 24,
  dateOfBirth: "1999-03-15", // Optional, used for age calculation
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastActiveAt: Timestamp,
  settings: {
    privacy: {
      showEmail: false,
      showLocation: true,
      allowMessages: true
    },
    notifications: {
      likes: true,
      comments: true,
      follows: true,
      messages: true
    },
    language: "en"
  }
}
```

### 2. Posts Collection (`posts`)
```javascript
{
  postId: "post_12345", // Auto-generated document ID
  userId: "user_12345",
  userDisplayName: "John Athlete",
  userPhotoURL: "https://storage.googleapis.com/...",
  caption: "Just finished an amazing training session! 💪",
  mediaType: "image", // image | video | text
  mediaUrl: "https://storage.googleapis.com/...", // Optional for text posts
  mediaMetadata: {
    width: 1080,
    height: 1080,
    size: 2048000, // bytes
    duration: 15.5, // seconds (for videos)
    thumbnail: "https://storage.googleapis.com/..." // for videos
  },
  sport: "Basketball",
  location: {
    city: "Los Angeles",
    venue: "Staples Center"
  },
  tags: ["training", "basketball", "workout"],
  mentions: ["@coach_mike", "@teammate_sarah"],
  likes: 234,
  likedBy: ["user_123", "user_456"], // First 50 users for quick access
  comments: 45,
  shares: 12,
  views: 1245, // For video posts
  isPublic: true,
  isPinned: false,
  timestamp: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  moderationStatus: "approved", // pending | approved | rejected | flagged
  contentFlags: {
    hasInappropriateContent: false,
    hasViolentContent: false,
    hasSpamContent: false,
    flaggedByUsers: 0,
    lastReviewed: Timestamp
  }
}
```

### 3. Comments Collection (`comments`)
```javascript
{
  commentId: "comment_12345",
  postId: "post_12345",
  userId: "user_12345",
  userDisplayName: "John Athlete", 
  userPhotoURL: "https://storage.googleapis.com/...",
  text: "Great post! Keep up the good work!",
  mediaUrl: "https://storage.googleapis.com/...", // Optional attached media
  mediaType: "image", // image | video | null
  parentCommentId: null, // For reply threads
  likes: 12,
  likedBy: ["user_123", "user_456"],
  replies: 3, // Count of direct replies
  mentions: ["@john_athlete"],
  timestamp: Timestamp,
  isEdited: false,
  editedAt: null,
  moderationStatus: "approved",
  contentFlags: {
    hasInappropriateContent: false,
    flaggedByUsers: 0
  }
}
```

### 4. Stories Collection (`stories`)
```javascript
{
  storyId: "story_12345",
  userId: "user_12345",
  userDisplayName: "John Athlete",
  userPhotoURL: "https://storage.googleapis.com/...",
  mediaType: "image", // image | video
  mediaUrl: "https://storage.googleapis.com/...",
  thumbnail: "https://storage.googleapis.com/...", // For videos
  caption: "Training session complete! 💪",
  timestamp: Timestamp,
  expiresAt: Timestamp, // 24 hours from creation
  viewCount: 89,
  viewers: ["user_123", "user_456"], // Array of user IDs who viewed
  isHighlight: false,
  highlightId: null, // If saved to highlight
  sharingEnabled: true,
  publicLink: "https://amaplayer.app/story/story_12345",
  location: {
    city: "Los Angeles",
    venue: "Training Center"
  },
  sport: "Basketball",
  createdAt: Timestamp
}
```

### 5. Highlights Collection (`highlights`)
```javascript
{
  highlightId: "highlight_12345",
  userId: "user_12345",
  title: "Training Sessions",
  coverImage: "https://storage.googleapis.com/...",
  storyIds: ["story_123", "story_456", "story_789"],
  storyCount: 3,
  isPublic: true,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  viewCount: 245,
  description: "Best training moments from this month"
}
```

### 6. Story Views Collection (`storyViews`)
```javascript
{
  viewId: "view_12345",
  storyId: "story_12345",
  viewerId: "user_12345",
  viewedAt: Timestamp,
  viewDuration: 3000, // milliseconds
  deviceInfo: {
    platform: "web", // web | ios | android
    userAgent: "Mozilla/5.0..."
  }
}
```

### 7. Follows Collection (`follows`)
```javascript
{
  followId: "follow_12345", // Auto-generated
  followerId: "user_12345", // Who is following
  followerName: "John Athlete",
  followerPhotoURL: "https://storage.googleapis.com/...",
  followingId: "user_67890", // Who is being followed
  followingName: "Jane Coach",
  followingPhotoURL: "https://storage.googleapis.com/...",
  timestamp: Timestamp,
  isActive: true,
  notifications: true // Whether follower gets notifications from this user
}
```

### 8. Friend Requests Collection (`friendRequests`)
```javascript
{
  requestId: "request_12345",
  senderId: "user_12345",
  senderName: "John Athlete",
  senderPhotoURL: "https://storage.googleapis.com/...",
  receiverId: "user_67890", 
  receiverName: "Jane Coach",
  status: "pending", // pending | accepted | rejected | cancelled
  timestamp: Timestamp,
  respondedAt: Timestamp, // When accepted/rejected
  message: "Hi! I'd like to connect with you." // Optional message
}
```

### 9. Friendships Collection (`friendships`)
```javascript
{
  friendshipId: "friendship_12345",
  user1: "user_12345", // Lower UID comes first (for consistency)
  user1Name: "John Athlete",
  user2: "user_67890",
  user2Name: "Jane Coach",
  createdAt: Timestamp,
  status: "active", // active | blocked_by_user1 | blocked_by_user2
  lastInteraction: Timestamp,
  mutualFriends: 15, // Count of mutual connections
  connectionStrength: 0.85 // Algorithm-based connection score
}
```

### 10. Messages Collection (`messages`)
```javascript
{
  messageId: "message_12345",
  conversationId: "conv_user123_user456", // Consistent format: user IDs sorted
  senderId: "user_12345",
  senderName: "John Athlete",
  receiverId: "user_67890",
  receiverName: "Jane Coach",
  message: "Hey! Great training session today!",
  mediaUrl: "https://storage.googleapis.com/...", // Optional
  mediaType: "image", // image | video | audio | document | null
  messageType: "text", // text | media | system | reaction
  replyTo: null, // messageId of message being replied to
  reactions: {
    "👍": ["user_123", "user_456"],
    "❤️": ["user_789"]
  },
  timestamp: Timestamp,
  readAt: Timestamp, // When receiver read the message
  deliveredAt: Timestamp,
  isEdited: false,
  editedAt: null,
  isDeleted: false,
  deletedAt: null,
  moderationStatus: "approved"
}
```

### 11. Content Reports Collection (`contentReports`)
```javascript
{
  reportId: "report_12345",
  contentId: "post_12345", // ID of reported content
  contentType: "post", // post | comment | message | user | story
  contentOwnerId: "user_67890",
  reporterId: "user_12345",
  reporterName: "John Athlete",
  reasons: ["spam", "inappropriate_content"], // Array of violation types
  category: "content_violation", // content_violation | harassment | spam | fake_account
  description: "This post contains inappropriate content",
  evidence: {
    screenshots: ["https://storage.googleapis.com/..."],
    additionalInfo: "User repeatedly posts non-sports content"
  },
  priority: "medium", // low | medium | high | critical
  status: "pending", // pending | under_review | resolved | dismissed
  timestamp: Timestamp,
  reviewedAt: Timestamp,
  reviewedBy: "admin_user_123",
  resolution: "content_removed", // warning | content_removed | user_suspended | no_action
  resolutionNotes: "Content removed due to policy violation"
}
```

### 12. Moderation Logs Collection (`moderationLogs`)
```javascript
{
  logId: "log_12345",
  moderatorId: "admin_user_123",
  moderatorName: "Admin John",
  action: "remove_content", // remove_content | warn_user | suspend_user | approve_content
  targetType: "post", // post | comment | user | story | message
  targetId: "post_12345",
  targetOwnerId: "user_67890",
  reason: "Inappropriate content",
  details: {
    reportId: "report_12345",
    automated: false,
    policyViolation: "community_guidelines_section_2",
    appealable: true
  },
  timestamp: Timestamp,
  ip: "192.168.1.1",
  userAgent: "Mozilla/5.0..."
}
```

### 13. User Violations Collection (`userViolations`)
```javascript
{
  userId: "user_12345", // Document ID is the user ID
  totalViolations: 3,
  violations: [
    {
      violationId: "violation_123",
      type: "inappropriate_content",
      severity: "medium", // low | medium | high | critical
      contentId: "post_12345",
      reportId: "report_12345",
      action: "content_removed",
      timestamp: Timestamp,
      appealStatus: "not_appealed" // not_appealed | appealed | appeal_approved | appeal_denied
    }
  ],
  warningsCount: 1,
  suspensionsCount: 0,
  accountStatus: "active", // active | warned | suspended | banned
  lastViolation: Timestamp,
  riskScore: 0.3, // 0.0 to 1.0 - higher means more risk
  notes: "User warned about content policy compliance"
}
```

### 14. Conversations Collection (`conversations`)
```javascript
{
  conversationId: "conv_user123_user456",
  participants: ["user_12345", "user_67890"],
  participantDetails: {
    "user_12345": {
      name: "John Athlete",
      photoURL: "https://storage.googleapis.com/...",
      lastSeen: Timestamp,
      unreadCount: 2
    },
    "user_67890": {
      name: "Jane Coach", 
      photoURL: "https://storage.googleapis.com/...",
      lastSeen: Timestamp,
      unreadCount: 0
    }
  },
  lastMessage: {
    senderId: "user_12345",
    message: "See you at practice!",
    timestamp: Timestamp,
    messageType: "text"
  },
  messageCount: 45,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isArchived: false,
  isMuted: false,
  isBlocked: false,
  blockedBy: null // userId of who blocked the conversation
}
```

### 15. Notifications Collection (`notifications`)
```javascript
{
  notificationId: "notification_12345",
  userId: "user_12345", // Who receives the notification
  type: "like", // like | comment | follow | message | mention | story_view
  fromUserId: "user_67890",
  fromUserName: "Jane Coach",
  fromUserPhotoURL: "https://storage.googleapis.com/...",
  contentId: "post_12345", // Related content ID
  contentType: "post", // post | comment | story | message
  message: "Jane Coach liked your post",
  isRead: false,
  timestamp: Timestamp,
  readAt: Timestamp,
  actionUrl: "/post/post_12345", // Deep link to related content
  metadata: {
    postCaption: "Training session complete!",
    postThumbnail: "https://storage.googleapis.com/..."
  }
}
```

## Index Requirements

### Composite Indexes Needed:
1. **Posts**: `userId` + `timestamp` (desc)
2. **Posts**: `sport` + `timestamp` (desc) 
3. **Posts**: `isPublic` + `timestamp` (desc)
4. **Stories**: `expiresAt` + `timestamp` (desc)
5. **Stories**: `userId` + `expiresAt` + `timestamp` (desc)
6. **Messages**: `conversationId` + `timestamp` (desc)
7. **Follows**: `followerId` + `timestamp` (desc)
8. **Follows**: `followingId` + `timestamp` (desc)
9. **Comments**: `postId` + `timestamp` (desc)
10. **Notifications**: `userId` + `isRead` + `timestamp` (desc)
11. **Content Reports**: `status` + `priority` + `timestamp` (desc)
12. **User Violations**: `accountStatus` + `riskScore` (desc)

## Security Rules Implementation

All collections implement:
- **Authentication**: Users must be logged in
- **Authorization**: Users can only modify their own content
- **Validation**: Data structure and content validation
- **Content Filtering**: Basic inappropriate content detection
- **Guest Restrictions**: Read-only access for anonymous users
- **Admin Access**: Special permissions for moderators and admins

## Performance Considerations

1. **Pagination**: All lists use cursor-based pagination
2. **Denormalization**: User details cached in posts/comments for performance
3. **Counters**: Stats like followers/posts stored as separate fields
4. **Indexing**: Strategic composite indexes for common queries
5. **Clean-up**: Automated removal of expired stories and old data
6. **Caching**: Frequently accessed data cached client-side