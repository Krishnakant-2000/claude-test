export const samplePosts = [
  {
    id: 'sample1',
    caption: 'Beautiful sunset at the beach! 🌅 Perfect end to a wonderful day.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
    userDisplayName: 'Alex Johnson',
    timestamp: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) }, // 2 hours ago
    likes: ['user1', 'user2', 'user3'],
    comments: ['Amazing shot!', 'Love this view']
  },
  {
    id: 'sample2',
    caption: 'Coffee and coding session ☕️💻 #developer #coffee',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=600&fit=crop',
    userDisplayName: 'Sarah Chen',
    timestamp: { toDate: () => new Date(Date.now() - 4 * 60 * 60 * 1000) }, // 4 hours ago
    likes: ['user4', 'user5'],
    comments: ['Same energy!']
  },
  {
    id: 'sample3',
    caption: 'Mountain hiking adventure! The view from the top was absolutely worth it 🏔️',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
    userDisplayName: 'Mike Rodriguez',
    timestamp: { toDate: () => new Date(Date.now() - 6 * 60 * 60 * 1000) }, // 6 hours ago
    likes: ['user6'],
    comments: []
  },
  {
    id: 'sample4',
    caption: 'Delicious homemade pasta! 🍝 Recipe in my bio',
    imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&h=600&fit=crop',
    userDisplayName: 'Emma Wilson',
    timestamp: { toDate: () => new Date(Date.now() - 8 * 60 * 60 * 1000) }, // 8 hours ago
    likes: ['user7', 'user8', 'user9', 'user10'],
    comments: ['Looks amazing!', 'Recipe please!']
  },
  {
    id: 'sample5',
    caption: 'Street art discovery in downtown! 🎨 Love the creativity',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop',
    userDisplayName: 'David Kim',
    timestamp: { toDate: () => new Date(Date.now() - 12 * 60 * 60 * 1000) }, // 12 hours ago
    likes: ['user11', 'user12'],
    comments: ['Great find!']
  },
  {
    id: 'sample6',
    caption: 'Morning yoga session in the park 🧘‍♀️ Starting the day right',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop',
    userDisplayName: 'Lisa Thompson',
    timestamp: { toDate: () => new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 1 day ago
    likes: ['user13'],
    comments: []
  }
];