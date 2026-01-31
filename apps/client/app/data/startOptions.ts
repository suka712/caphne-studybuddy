export const majorOptions = [
  { group: 'Computer Science', items: [
    { value: 'software-engineering', label: 'Software Engineering' },
    { value: 'ai-engineering', label: 'AI Engineering' },
    { value: 'cyber-security', label: 'Cyber Security' },
    { value: 'data-science', label: 'Data Science' },
  ]},
  { group: 'Business', items: [
    { value: 'business-analytics', label: 'Business Analytics' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'finance', label: 'Finance' },
  ]},
  { group: 'Medicine', items: [
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'medical-tech', label: 'Medical Technology' },
  ]},
  { group: 'Law', items: [
    { value: 'law', label: 'Law' },
    { value: 'political-science', label: 'Political Science' },
  ]},
  { group: 'Other', items: [
    { value: 'other', label: 'Other' },
  ]},
]

export const yearOptions = [
  { value: 'year-1', label: 'Year 1' },
  { value: 'year-2', label: 'Year 2' },
  { value: 'year-3', label: 'Year 3' },
  { value: 'year-4', label: 'Year 4' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'other', label: 'Other' },
]


export const goalOptions = [
  { id: 'study-buddy', label: 'Find study buddy', icon: 'streamline-pixel:education-graduation-cap' },
  { id: 'project-teammate', label: 'Project teammate', icon: 'streamline-pixel:user-profile-focus' },
  { id: 'learn-new', label: 'Learn something new', icon: 'streamline-pixel:bookmarks' },
  { id: 'sports-buddy', label: 'Sports/gym buddy', icon: 'streamline-pixel:sport-fitness-dumbbell-weight-lift' },
  { id: 'meet-people', label: 'Meet new people', icon: 'streamline-pixel:user-profile-focus' },
  { id: 'share-skills', label: 'Share skills/mentor', icon: 'streamline-pixel:interface-essential-star-2' },
]

export const vibeOptions = [
  'Introvert', 'Extrovert', 'Night owl', 'Early bird', 'Chill', 'Grinder'
]

export const interestCategories = [
  {
    id: 'academic',
    label: 'Academic',
    icon: 'streamline-pixel:education-graduation-cap',
    options: ['Study groups', 'Exam prep', 'Research', 'Thesis/Capstone', 'Tutoring']
  },
  {
    id: 'tech',
    label: 'Tech',
    icon: 'streamline-pixel:computer-desktop',
    options: ['Programming', 'Web Dev', 'Mobile Dev', 'Data/AI', 'Design/UI', 'Security/CTF', 'DevOps']
  },
  {
    id: 'business',
    label: 'Business',
    icon: 'streamline-pixel:money-graph-arrow-increase',
    options: ['Startups', 'Marketing', 'Case competitions', 'Networking', 'Finance']
  },
  {
    id: 'creative',
    label: 'Creative',
    icon: 'streamline-pixel:interface-essential-star-2',
    options: ['Music', 'Art', 'Content creation', 'Photography', 'Video editing', 'Writing']
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    icon: 'streamline-pixel:food-drink-desert-cake',
    options: ['Football', 'Basketball', 'Gym', 'Gaming', 'Anime', 'Coffee/hangouts', 'Reading', 'Travel']
  },
  {
    id: 'career',
    label: 'Career',
    icon: 'streamline-pixel:money-bag-dollar',
    options: ['Internships', 'Interview prep', 'Resume review', 'Portfolio', 'LinkedIn']
  },
]
