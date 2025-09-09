// Comprehensive coaching profile data for AmaPlayer
export const COACHING_LEVELS = {
  "License Levels": [
    "FIFA A License", "FIFA B License", "FIFA C License", "FIFA D License",
    "UEFA A License", "UEFA B License", "UEFA Pro License",
    "AFC A License", "AFC B License", "AFC C License",
    "AIFF A License", "AIFF B License", "AIFF C License",
    "Basketball Level 1", "Basketball Level 2", "Basketball Level 3",
    "Cricket Level 1", "Cricket Level 2", "Cricket Level 3",
    "Athletics Level 1", "Athletics Level 2", "Athletics Level 3",
    "Swimming Level 1", "Swimming Level 2", "Swimming Level 3",
    "No Formal License"
  ],
  "Experience Levels": [
    "Beginner Coach (0-2 years)",
    "Intermediate Coach (3-5 years)", 
    "Experienced Coach (6-10 years)",
    "Senior Coach (11-15 years)",
    "Expert Coach (16+ years)"
  ],
  "Coaching Positions": [
    "Head Coach", "Assistant Coach", "Specialized Trainer",
    "Fitness Coach", "Goalkeeping Coach", "Technical Coach",
    "Youth Development Coach", "Academy Director",
    "Performance Analyst", "Mental Performance Coach"
  ]
};

export const COACHING_SPECIALIZATIONS = {
  "Football/Soccer": [
    "Goalkeeper Training", "Defensive Tactics", "Attacking Strategies",
    "Set Pieces", "Youth Development", "Fitness Training",
    "Technical Skills", "Mental Coaching"
  ],
  "Basketball": [
    "Offensive Systems", "Defensive Strategies", "Player Development",
    "Shooting Techniques", "Conditioning", "Team Chemistry"
  ],
  "Cricket": [
    "Batting Techniques", "Bowling Coaching", "Wicket Keeping",
    "Fielding Drills", "Match Strategy", "Youth Development"
  ],
  "Tennis": [
    "Serve Techniques", "Groundstrokes", "Net Play",
    "Mental Toughness", "Match Strategy", "Junior Development"
  ],
  "Swimming": [
    "Stroke Technique", "Competitive Training", "Endurance Building",
    "Starting Techniques", "Turn Techniques", "Race Strategy"
  ],
  "General": [
    "Fitness Training", "Injury Prevention", "Sports Psychology",
    "Nutrition Guidance", "Team Building", "Leadership Development"
  ]
};

export const ORGANIZATION_TYPES = [
  "Professional Club", "Academy", "School/College", "University",
  "Sports Institute", "Government Sports Center", "Private Training Center",
  "Community Club", "NGO/Foundation", "Freelance/Independent"
];

export const AGE_GROUPS = [
  "Under-8", "Under-10", "Under-12", "Under-14", "Under-16",
  "Under-18", "Under-21", "Senior (18+)", "Professional",
  "Masters (35+)", "All Age Groups"
];

export const EMPLOYMENT_TYPES = [
  "Full-time", "Part-time", "Contract", "Freelance", 
  "Volunteer", "Seasonal", "Internship"
];

export const COACHING_CERTIFICATIONS = [
  // General Sports
  "Certified Strength and Conditioning Specialist (CSCS)",
  "National Academy of Sports Medicine (NASM)",
  "Youth Sports Coaching Certification",
  "Sports Psychology Certification",
  "First Aid/CPR Certification",
  
  // Football/Soccer
  "FIFA Coaching Badge", "UEFA Coaching License", "AFC Coaching Certificate",
  "AIFF Coaching Certificate", "Grassroots Football Certificate",
  
  // Basketball
  "FIBA Coaching License", "Basketball Coaching Certification",
  "Youth Basketball Development Certificate",
  
  // Cricket
  "ICC Coaching Certificate", "BCCI Coaching License",
  "Level 1/2/3 Cricket Coaching",
  
  // Athletics
  "World Athletics Coaching Certificate",
  "Track and Field Coaching License",
  
  // Swimming
  "Swimming Coaching Certification",
  "Water Safety Instructor",
  "Competitive Swimming Coach License",
  
  // Other
  "Tennis Professional Certification",
  "Badminton Coaching License",
  "Wrestling Coaching Certificate"
];

export const ACHIEVEMENT_CATEGORIES = [
  "Championship Titles", "Tournament Victories", "Player Development",
  "Team Performance", "Individual Recognition", "Innovation Awards",
  "Community Impact", "Long Service Awards"
];

// Helper functions
export const getSpecializationsBySport = (sport) => {
  return COACHING_SPECIALIZATIONS[sport] || COACHING_SPECIALIZATIONS["General"];
};

export const getCoachingLevelsByCategory = (category) => {
  return COACHING_LEVELS[category] || [];
};

export const getAllCertifications = () => {
  return COACHING_CERTIFICATIONS.sort();
};