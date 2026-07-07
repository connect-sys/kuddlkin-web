export interface ServiceType {
  id: string;
  label: string;
  category: 'adventure' | 'bloom' | 'care' | 'discover';
}

export const serviceTypeRegistry: ServiceType[] = [
  // Adventure
  { id: 'birthday_planners', label: "Kids' Birthday Party Planners", category: 'adventure' },
  { id: 'entertainment_performers', label: 'Entertainment & Live Performers', category: 'adventure' },
  { id: 'themed_parties_decor', label: 'Themed Parties & Decor', category: 'adventure' },
  { id: 'cakes_return_favours', label: 'Cakes & Return Favours', category: 'adventure' },
  { id: 'photography_videography', label: 'Photography & Videography', category: 'adventure' },
  { id: 'games_interactive_zones', label: 'Games & Interactive Zones', category: 'adventure' },
  { id: 'creative_diy_activities', label: 'Creative & DIY Activities', category: 'adventure' },
  { id: 'premium_experience_addons', label: 'Premium Experience Add-ons', category: 'adventure' },

  // Bloom
  { id: 'dance_movement', label: 'Dance & Movement Classes', category: 'bloom' },
  { id: 'music_classes', label: 'Music Classes', category: 'bloom' },
  { id: 'arts_crafts', label: 'Arts & Crafts', category: 'bloom' },
  { id: 'sports_coaching', label: 'Sports Coaching', category: 'bloom' },
  { id: 'child_yoga_mindfulness', label: 'Child Yoga & Mindfulness', category: 'bloom' },
  { id: 'phonics_literacy', label: 'Phonics & Literacy', category: 'bloom' },
  { id: 'montessori_education', label: 'Montessori Education', category: 'bloom' },
  { id: 'sensory_play', label: 'Sensory Play', category: 'bloom' },
  { id: 'early_childhood_education', label: 'Early Childhood Education', category: 'bloom' },

  // Care
  { id: 'child_psychology', label: 'Child Psychology & Counselling', category: 'care' },
  { id: 'child_physiotherapy', label: 'Child Physiotherapy', category: 'care' },
  { id: 'pediatric_ot', label: 'Pediatric Occupational Therapy', category: 'care' },
  { id: 'lactation_postnatal', label: 'Lactation Consultation', category: 'care' },
  { id: 'infant_postnatal_care', label: 'Infant & Postnatal Care', category: 'care' },
  { id: 'pediatric_nutrition', label: 'Pediatric Nutrition', category: 'care' },
  { id: 'infant_massage', label: 'Infant Massage Therapy', category: 'care' },
  { id: 'infant_grooming', label: 'Infant Grooming & Hygiene', category: 'care' },
  { id: 'infant_ear_piercing', label: 'Infant Ear Piercing', category: 'care' },

  // Discover
  { id: 'workshops_events', label: 'Workshops & Events', category: 'discover' },
  { id: 'camps_holiday_programmes', label: 'Camps & Holiday Programmes', category: 'discover' },
  { id: 'community_social_activities', label: 'Community & Social Activities', category: 'discover' },
];

export const categoryColors: Record<string, string> = {
  adventure: '#C23B3B',
  bloom: '#CF956D',
  care: '#578F82',
  discover: '#6B5B95',
};
