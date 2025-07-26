export const sampleStories = [
  {
    id: 'story1',
    userId: 'athlete1',
    userDisplayName: 'Priya Sharma',
    userPhotoURL: 'https://images.unsplash.com/photo-1494790108755-2616c2d3e781?w=100&h=100&fit=crop&crop=face',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=800&fit=crop',
    caption: 'Morning training session complete! 💪 Ready for the championship!',
    timestamp: { toDate: () => new Date(Date.now() - 1 * 60 * 60 * 1000) }, // 1 hour ago
    expiresAt: { toDate: () => new Date(Date.now() + 23 * 60 * 60 * 1000) }, // expires in 23 hours
    viewCount: 15,
    viewers: ['user1', 'user2', 'user3'],
    isHighlight: false,
    sharingEnabled: true
  },
  {
    id: 'story2',
    userId: 'athlete2',
    userDisplayName: 'Rahul Singh',
    userPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&h=800&fit=crop',
    caption: 'Cricket practice at dawn 🏏 The grind never stops!',
    timestamp: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) }, // 2 hours ago
    expiresAt: { toDate: () => new Date(Date.now() + 22 * 60 * 60 * 1000) }, // expires in 22 hours
    viewCount: 28,
    viewers: ['user4', 'user5', 'user6'],
    isHighlight: false,
    sharingEnabled: true
  },
  {
    id: 'story3',
    userId: 'athlete3',
    userDisplayName: 'Aisha Patel',
    userPhotoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=600&h=800&fit=crop',
    caption: 'Badminton tournament prep! 🏸 Feeling confident and ready',
    timestamp: { toDate: () => new Date(Date.now() - 3 * 60 * 60 * 1000) }, // 3 hours ago
    expiresAt: { toDate: () => new Date(Date.now() + 21 * 60 * 60 * 1000) }, // expires in 21 hours
    viewCount: 42,
    viewers: ['user7', 'user8', 'user9', 'user10'],
    isHighlight: false,
    sharingEnabled: true
  },
  {
    id: 'story4',
    userId: 'athlete4',
    userDisplayName: 'Arjun Kumar',
    userPhotoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=800&fit=crop',
    caption: 'Football training in progress ⚽ Team chemistry is building!',
    timestamp: { toDate: () => new Date(Date.now() - 4 * 60 * 60 * 1000) }, // 4 hours ago
    expiresAt: { toDate: () => new Date(Date.now() + 20 * 60 * 60 * 1000) }, // expires in 20 hours
    viewCount: 35,
    viewers: ['user11', 'user12'],
    isHighlight: false,
    sharingEnabled: true
  },
  {
    id: 'story5',
    userId: 'athlete5',
    userDisplayName: 'Sneha Reddy',
    userPhotoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=600&h=800&fit=crop',
    caption: 'Swimming laps at 5 AM 🏊‍♀️ Dedication pays off!',
    timestamp: { toDate: () => new Date(Date.now() - 5 * 60 * 60 * 1000) }, // 5 hours ago
    expiresAt: { toDate: () => new Date(Date.now() + 19 * 60 * 60 * 1000) }, // expires in 19 hours
    viewCount: 22,
    viewers: ['user13', 'user14', 'user15'],
    isHighlight: false,
    sharingEnabled: true
  },
  {
    id: 'story6',
    userId: 'athlete1',
    userDisplayName: 'Priya Sharma',
    userPhotoURL: 'https://images.unsplash.com/photo-1494790108755-2616c2d3e781?w=100&h=100&fit=crop&crop=face',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1550259979-ed79b48d2a30?w=600&h=800&fit=crop',
    caption: 'Post-workout recovery meal 🥗 Nutrition is key to performance!',
    timestamp: { toDate: () => new Date(Date.now() - 6 * 60 * 60 * 1000) }, // 6 hours ago
    expiresAt: { toDate: () => new Date(Date.now() + 18 * 60 * 60 * 1000) }, // expires in 18 hours
    viewCount: 18,
    viewers: ['user16', 'user17'],
    isHighlight: false,
    sharingEnabled: true
  },
  {
    id: 'story7',
    userId: 'athlete6',
    userDisplayName: 'Vikram Joshi',
    userPhotoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=800&fit=crop',
    caption: 'Basketball shootaround 🏀 Practice makes perfect!',
    timestamp: { toDate: () => new Date(Date.now() - 7 * 60 * 60 * 1000) }, // 7 hours ago
    expiresAt: { toDate: () => new Date(Date.now() + 17 * 60 * 60 * 1000) }, // expires in 17 hours
    viewCount: 31,
    viewers: ['user18', 'user19', 'user20'],
    isHighlight: false,
    sharingEnabled: true
  },
  {
    id: 'story8',
    userId: 'athlete7',
    userDisplayName: 'Kavya Nair',
    userPhotoURL: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=800&fit=crop',
    caption: 'Yoga for flexibility and mental focus 🧘‍♀️ Mind-body connection',
    timestamp: { toDate: () => new Date(Date.now() - 8 * 60 * 60 * 1000) }, // 8 hours ago
    expiresAt: { toDate: () => new Date(Date.now() + 16 * 60 * 60 * 1000) }, // expires in 16 hours
    viewCount: 25,
    viewers: ['user21', 'user22'],
    isHighlight: false,
    sharingEnabled: true
  }
];

// Sample highlights data
export const sampleHighlights = [
  {
    id: 'highlight1',
    userId: 'athlete1',
    title: 'Training Sessions',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=800&fit=crop',
    storyIds: ['story1', 'story6'],
    createdAt: { toDate: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    updatedAt: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) },
    isPublic: true
  },
  {
    id: 'highlight2',
    userId: 'athlete2',
    title: 'Cricket Journey',
    coverImage: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=600&h=800&fit=crop',
    storyIds: ['story2'],
    createdAt: { toDate: () => new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    updatedAt: { toDate: () => new Date(Date.now() - 4 * 60 * 60 * 1000) },
    isPublic: true
  }
];