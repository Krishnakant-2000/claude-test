// Comprehensive sports categorization for AmaPlayer
export const SPORTS_CATEGORIES = {
  "Team Sports": {
    "Ball Sports": [
      "Football/Soccer", "Basketball", "American Football", "Rugby", "Volleyball", 
      "Baseball", "Softball", "Water Polo", "Handball", "Netball"
    ],
    "Field Sports": [
      "Cricket", "Field Hockey", "Ice Hockey", "Lacrosse"
    ]
  },
  "Individual Sports": {
    "Racket Sports": [
      "Tennis", "Badminton", "Table Tennis", "Squash", "Racquetball"
    ],
    "Combat Sports": [
      "Boxing", "Wrestling", "Mixed Martial Arts (MMA)", "Karate", "Taekwondo", 
      "Judo", "Brazilian Jiu-Jitsu", "Muay Thai", "Kickboxing", "Kung Fu"
    ],
    "Track & Field": [
      "Sprinting", "Long Distance Running", "Marathon", "Hurdles", "Pole Vault", 
      "High Jump", "Long Jump", "Shot Put", "Discus", "Javelin", "Decathlon", "Heptathlon"
    ],
    "Aquatic Sports": [
      "Swimming", "Diving", "Synchronized Swimming", "Open Water Swimming"
    ],
    "Gymnastics": [
      "Artistic Gymnastics", "Rhythmic Gymnastics", "Trampoline"
    ]
  },
  "Extreme Sports": [
    "Rock Climbing", "Skateboarding", "Surfing", "Snowboarding", "Skiing", 
    "BMX", "Parkour", "Bungee Jumping", "Skydiving", "Base Jumping",
    "Wingsuit Flying", "Motocross"
  ],
  "Traditional Indian Sports": [
    "Kabaddi", "Kho Kho", "Mallakhamb", "Pehlwani", "Gatka", "Kalaripayattu",
    "Silambam", "Thang-Ta", "Lathi"
  ],
  "Other Sports": [
    "Golf", "Cycling", "Archery", "Shooting", "Equestrian", "Sailing", 
    "Rowing", "Weightlifting", "Powerlifting", "Bodybuilding", "Crossfit",
    "Fencing", "Billiards", "Bowling", "Darts", "Chess", "E-Sports"
  ]
};

// Get all sports as a flat array
export const getAllSports = () => {
  const allSports = [];
  Object.values(SPORTS_CATEGORIES).forEach(category => {
    if (typeof category === 'object' && !Array.isArray(category)) {
      // Handle nested categories (like Team Sports and Individual Sports)
      Object.values(category).forEach(subcategory => {
        allSports.push(...subcategory);
      });
    } else {
      // Handle flat arrays (like Extreme Sports, Traditional Indian Sports)
      allSports.push(...category);
    }
  });
  return allSports.sort();
};

// Get sports by category
export const getSportsByCategory = (category) => {
  const categoryData = SPORTS_CATEGORIES[category];
  if (!categoryData) return [];
  
  if (typeof categoryData === 'object' && !Array.isArray(categoryData)) {
    // Nested category
    const sports = [];
    Object.values(categoryData).forEach(subcategory => {
      sports.push(...subcategory);
    });
    return sports.sort();
  } else {
    // Flat array
    return categoryData.sort();
  }
};

// Search sports by name
export const searchSports = (searchTerm) => {
  if (!searchTerm) return getAllSports();
  
  const allSports = getAllSports();
  return allSports.filter(sport => 
    sport.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Get popular sports (commonly played)
export const getPopularSports = () => [
  "Cricket", "Football/Soccer", "Basketball", "Tennis", "Badminton",
  "Swimming", "Running", "Cycling", "Boxing", "Kabaddi",
  "Field Hockey", "Volleyball", "Table Tennis", "Wrestling"
];