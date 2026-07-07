/**
 * Service Type Configuration - Single Source of Truth
 * Maps each service type to its category, conditional blocks, pricing units, and placeholders
 */

export type Category = 'adventure' | 'bloom' | 'care' | 'discover';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'time'
  | 'date_with_time'
  | 'multi_date'
  | 'date_range_with_daily_time'
  | 'recurring_schedule'
  | 'days_picker'
  | 'service_area'
  | 'multi_select'
  | 'multi_select_with_custom'
  | 'single_select'
  | 'toggle'
  | 'checkbox'
  | 'file_upload'
  | 'package_pair';

export interface FieldOption {
  value: string;
  label: string;
  hint?: string;
}

export interface ConditionalRule {
  field: string; // Field key to check, or '__delivery_mode' for core field
  equals?: string; // Value must equal this
  in?: string[]; // Value must be in this array
  filled?: boolean; // Field must have any value
}

export interface CategoryBlock {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  requiredWhenVisible?: boolean; // Required only if visible
  help?: string;
  options?: FieldOption[];
  multiple?: boolean; // For file uploads
  conditional?: ConditionalRule;
}

export interface ServiceTypeConfig {
  id: string;
  label: string;
  category: Category;
  title_placeholder: string;
  description_placeholder: string;
  pricing_unit_options: FieldOption[];
  blocks: CategoryBlock[];
  show_trial_toggle?: boolean;
}

export interface CategoryMeta {
  label: string;
  color: string;
  bg: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  adventure: { label: 'Adventure', color: '#C23B3B', bg: '#FEF2F2' },
  bloom: { label: 'Bloom', color: '#CF956D', bg: '#FFF7ED' },
  care: { label: 'Care', color: '#578F82', bg: '#F0FDF4' },
  discover: { label: 'Discover', color: '#6B5B95', bg: '#FAF5FF' },
};

// Pricing unit options by category
const ADVENTURE_PRICING: FieldOption[] = [
  { value: 'per_session_flat', label: 'Per Session (flat)', hint: 'Birthday parties, events' },
  { value: 'per_group_flat', label: 'Per Group (flat event)', hint: 'Entertainers, photographers' },
  { value: 'per_hour', label: 'Per Hour', hint: 'Hourly services' },
];

const BLOOM_PRICING: FieldOption[] = [
  { value: 'per_child_per_session', label: 'Per Child, Per Session', hint: 'Group classes' },
  { value: 'per_session_flat', label: 'Per Session (flat)', hint: '1:1 classes' },
  { value: 'package_series', label: 'Package / Series', hint: 'Multi-session courses' },
];

const CARE_PRICING: FieldOption[] = [
  { value: 'per_session_flat', label: 'Per Session (flat)', hint: '1:1 consultations' },
  { value: 'per_hour', label: 'Per Hour', hint: 'Hourly consultations' },
  { value: 'package_series', label: 'Package / Series', hint: 'Multi-session packages' },
];

const DISCOVER_PRICING: FieldOption[] = [
  { value: 'per_child_per_session', label: 'Per Child, Per Session', hint: 'Workshops, events' },
  { value: 'per_session_flat', label: 'Per Session (flat)', hint: 'Flat fee events' },
  { value: 'per_person_per_hour', label: 'Per Person, Per Hour', hint: 'Drop-in facilities' },
];

// Adventure category blocks
const ADVENTURE_BLOCKS: CategoryBlock[] = [
  {
    key: 'availability_type',
    label: 'Availability Type',
    type: 'single_select',
    required: true,
    options: [
      { value: 'year_round', label: 'Available year-round (parents request, partner confirms)' },
      { value: 'specific_dates', label: 'Available on specific dates' },
      { value: 'specific_days', label: 'Available on specific days of the week' },
    ],
  },
  {
    key: 'specific_dates',
    label: 'Specific Dates',
    type: 'multi_date',
    conditional: { field: 'availability_type', equals: 'specific_dates' },
  },
  {
    key: 'days_of_week_available',
    label: 'Days of Week Available',
    type: 'days_picker',
    conditional: { field: 'availability_type', equals: 'specific_days' },
  },
  {
    key: 'min_group_size',
    label: 'Min Group Size',
    type: 'number',
    required: true,
    help: 'Smallest group you will service',
  },
  {
    key: 'max_group_size',
    label: 'Max Group Size',
    type: 'number',
    required: true,
    help: 'Maximum guests/portions/audience you can handle',
  },
  {
    key: 'service_area',
    label: 'Service Area',
    type: 'service_area',
    required: true,
    help: 'Select zones you serve in Delhi NCR',
  },
  {
    key: 'travel_fee',
    label: 'Travel Fee (₹)',
    type: 'currency',
    help: 'Flat fee for locations outside your primary service area (optional)',
  },
  {
    key: 'lead_time_required',
    label: 'Lead Time Required',
    type: 'single_select',
    required: true,
    options: [
      { value: '24_hours', label: '24 hours' },
      { value: '48_hours', label: '48 hours' },
      { value: '72_hours', label: '72 hours' },
      { value: '1_week', label: '1 week' },
      { value: '2_weeks', label: '2 weeks' },
    ],
    help: 'Minimum advance notice you need to deliver',
  },
  {
    key: 'whats_included',
    label: "What's Included",
    type: 'textarea',
    required: true,
    help: 'What you provide as part of the price — items, decor, crew, equipment, materials',
  },
  {
    key: 'what_parent_arranges',
    label: 'What Parent Needs to Arrange',
    type: 'textarea',
    help: 'What the parent must arrange — venue, power outlets, food, seating (optional)',
  },
];

// Bloom category blocks
const BLOOM_BLOCKS: CategoryBlock[] = [
  {
    key: 'days_of_week',
    label: 'Days of Week',
    type: 'days_picker',
    required: false,
    help: 'Days when this batch runs (optional)',
  },
  {
    key: 'class_start_time',
    label: 'Class Start Time',
    type: 'time',
    required: false,
    help: 'Optional - specify if you have a fixed start time',
  },
  {
    key: 'batch_start_date',
    label: 'Batch Start Date',
    type: 'date',
    required: true,
    help: 'When this batch begins (cannot be in the past)',
  },
  {
    key: 'term_length',
    label: 'Term Length',
    type: 'single_select',
    required: true,
    options: [
      { value: '1_month', label: '1 month' },
      { value: '3_months', label: '3 months' },
      { value: '6_months', label: '6 months' },
      { value: '1_year', label: '1 year' },
      { value: 'single_session', label: 'Single session' },
      { value: 'custom', label: 'Custom' },
    ],
  },
  {
    key: 'custom_term_weeks',
    label: 'Custom Term Length (weeks)',
    type: 'number',
    conditional: { field: 'term_length', equals: 'custom' },
    requiredWhenVisible: true,
  },
  {
    key: 'min_class_size',
    label: 'Min Class Size',
    type: 'number',
    required: true,
    help: 'Minimum students needed for batch to run',
  },
  {
    key: 'max_class_size',
    label: 'Max Class Size',
    type: 'number',
    required: true,
    help: 'Maximum students per batch',
  },
  {
    key: 'skill_level',
    label: 'Skill Level',
    type: 'single_select',
    required: true,
    options: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
      { value: 'all_levels', label: 'All Levels' },
    ],
  },
  {
    key: 'venue_address',
    label: 'Venue Address',
    type: 'text',
    conditional: { field: '__delivery_mode', in: ['partner_venue', 'hybrid'] },
    requiredWhenVisible: true,
    help: 'Where classes are held',
  },
  {
    key: 'service_area',
    label: 'Service Area',
    type: 'service_area',
    conditional: { field: '__delivery_mode', in: ['parent_location', 'hybrid'] },
    requiredWhenVisible: true,
  },
  {
    key: 'trial_class_available',
    label: 'Trial Class Available',
    type: 'toggle',
  },
  {
    key: 'trial_price',
    label: 'Trial Price (₹)',
    type: 'currency',
    conditional: { field: 'trial_class_available', equals: 'true' },
  },
  {
    key: 'trial_first_booking_only',
    label: 'Valid for first booking only',
    type: 'checkbox',
    conditional: { field: 'trial_class_available', equals: 'true' },
  },
  {
    key: 'instructor_credentials',
    label: 'Instructor Credentials',
    type: 'file_upload',
    multiple: true,
    help: 'PDF/JPG/PNG, max 5MB (optional but encouraged)',
  },
  {
    key: 'whats_included',
    label: "What's Included",
    type: 'textarea',
    help: 'Instruments, mats, art supplies, snacks (optional)',
  },
  {
    key: 'what_to_bring',
    label: 'What to Bring',
    type: 'textarea',
    help: 'Water bottle, dance attire, yoga mat, etc. (optional)',
  },
];

// Care category blocks
const CARE_BLOCKS: CategoryBlock[] = [
  {
    key: 'session_format',
    label: 'Session Format',
    type: 'single_select',
    required: true,
    options: [
      { value: 'home_visit', label: 'Home visit' },
      { value: 'in_clinic', label: 'In-clinic' },
      { value: 'online', label: 'Online' },
      { value: 'hybrid', label: 'Hybrid (clinic + home)' },
    ],
  },
  {
    key: 'clinic_address',
    label: 'Clinic Address',
    type: 'text',
    conditional: { field: 'session_format', in: ['in_clinic', 'hybrid'] },
    requiredWhenVisible: true,
  },
  {
    key: 'service_area',
    label: 'Service Area',
    type: 'service_area',
    conditional: { field: 'session_format', in: ['home_visit', 'hybrid'] },
    requiredWhenVisible: true,
  },
  {
    key: 'travel_fee',
    label: 'Travel Fee (₹)',
    type: 'currency',
    conditional: { field: 'service_area', filled: true },
    help: 'Leave blank for no travel fee',
  },
  {
    key: 'credentials',
    label: 'Credentials & Certifications',
    type: 'file_upload',
    multiple: true,
    help: 'PDF/JPG/PNG, max 5MB per file (optional but strongly recommended)',
  },
  {
    key: 'specialisations',
    label: 'Specialisations',
    type: 'multi_select_with_custom',
    required: true,
    help: 'At least 1 specialisation required. You can add custom tags.',
  },
  {
    key: 'languages_of_practice',
    label: 'Languages of Practice',
    type: 'multi_select',
    required: true,
    options: [
      { value: 'english', label: 'English' },
      { value: 'hindi', label: 'Hindi' },
      { value: 'bengali', label: 'Bengali' },
      { value: 'tamil', label: 'Tamil' },
      { value: 'telugu', label: 'Telugu' },
      { value: 'marathi', label: 'Marathi' },
      { value: 'kannada', label: 'Kannada' },
      { value: 'malayalam', label: 'Malayalam' },
      { value: 'punjabi', label: 'Punjabi' },
      { value: 'urdu', label: 'Urdu' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    key: 'package_pricing_available',
    label: 'Package Pricing Available',
    type: 'toggle',
  },
  {
    key: 'package_details',
    label: 'Package Details',
    type: 'package_pair',
    conditional: { field: 'package_pricing_available', equals: 'true' },
    requiredWhenVisible: true,
    help: 'Number of sessions and total package price',
  },
  {
    key: 'first_consultation_free',
    label: 'First Consultation Free',
    type: 'toggle',
  },
];

// Discover category blocks
const DISCOVER_BLOCKS: CategoryBlock[] = [
  {
    key: 'event_type',
    label: 'Event Type',
    type: 'single_select',
    required: true,
    options: [
      { value: 'single_day', label: 'Single-day event' },
      { value: 'multi_day', label: 'Multi-day event (camp/programme)' },
      { value: 'recurring', label: 'Recurring activity (weekly/monthly)' },
    ],
  },
  {
    key: 'event_date',
    label: 'Event Date & Time',
    type: 'date_with_time',
    conditional: { field: 'event_type', equals: 'single_day' },
    requiredWhenVisible: true,
  },
  {
    key: 'event_date_range',
    label: 'Event Date Range',
    type: 'date_range_with_daily_time',
    conditional: { field: 'event_type', equals: 'multi_day' },
    requiredWhenVisible: true,
    help: 'Start date, end date, and daily start/end times',
  },
  {
    key: 'recurring_schedule',
    label: 'Recurring Schedule',
    type: 'recurring_schedule',
    conditional: { field: 'event_type', equals: 'recurring' },
    requiredWhenVisible: false,
    help: 'Optional - specify days, time, and frequency if applicable',
  },
  {
    key: 'min_participants',
    label: 'Min Participants',
    type: 'number',
    required: true,
    help: 'Minimum needed for event to run',
  },
  {
    key: 'max_participants',
    label: 'Max Participants',
    type: 'number',
    required: true,
    help: 'Maximum capacity',
  },
  {
    key: 'venue_address',
    label: 'Venue Address',
    type: 'text',
    required: true,
    help: 'Where the event takes place',
  },
  {
    key: 'indoor_outdoor',
    label: 'Indoor / Outdoor',
    type: 'single_select',
    required: true,
    options: [
      { value: 'indoor', label: 'Indoor' },
      { value: 'outdoor', label: 'Outdoor' },
      { value: 'mixed', label: 'Mixed' },
    ],
  },
  {
    key: 'whats_included',
    label: "What's Included",
    type: 'textarea',
    required: true,
    help: 'Materials, snacks, meals, take-home items, certificates',
  },
  {
    key: 'what_to_bring',
    label: 'What to Bring',
    type: 'textarea',
    help: 'What child should bring (optional)',
  },
  {
    key: 'meals_included',
    label: 'Meals Included',
    type: 'single_select',
    conditional: { field: 'event_type', equals: 'multi_day' },
    options: [
      { value: 'yes_included', label: 'Yes — included in price' },
      { value: 'no', label: 'No' },
      { value: 'optional_addon', label: 'Optional add-on' },
    ],
  },
  {
    key: 'transport_pickup_drop',
    label: 'Transport / Pickup-Drop',
    type: 'single_select',
    conditional: { field: 'event_type', equals: 'multi_day' },
    options: [
      { value: 'not_provided', label: 'Not provided' },
      { value: 'select_zones', label: 'Available for select zones' },
      { value: 'all_zones', label: 'Available for all zones' },
    ],
  },
  {
    key: 'transport_service_area',
    label: 'Transport Service Area',
    type: 'service_area',
    conditional: { field: 'transport_pickup_drop', equals: 'select_zones' },
    requiredWhenVisible: true,
  },
];

// Service type configurations
export const SERVICE_TYPE_CONFIGS: Record<string, ServiceTypeConfig> = {
  // ADVENTURE
  birthday_planners: {
    id: 'birthday_planners',
    label: "Kids' Birthday Party Planners",
    category: 'adventure',
    title_placeholder: 'e.g., Superhero Birthday Party Package',
    description_placeholder:
      'Describe what you bring to a party — themes, decor, entertainment, games. Mention your team size, setup time needed, and what parents will love about your approach…',
    pricing_unit_options: ADVENTURE_PRICING,
    blocks: ADVENTURE_BLOCKS,
  },
  entertainment_performers: {
    id: 'entertainment_performers',
    label: 'Entertainment & Live Performers',
    category: 'adventure',
    title_placeholder: 'e.g., Magic Show for Kids 5-10',
    description_placeholder:
      'Describe your performance style, what props or tricks you bring, age range that works best, the energy of your act, and what you provide vs. what the parent arranges…',
    pricing_unit_options: ADVENTURE_PRICING,
    blocks: ADVENTURE_BLOCKS,
  },
  themed_parties_decor: {
    id: 'themed_parties_decor',
    label: 'Themed Parties & Decor',
    category: 'adventure',
    title_placeholder: 'e.g., Princess Theme Party Decor Setup',
    description_placeholder:
      'Describe the themes you specialise in, how elaborate your setups can get, setup and teardown time, and what you include in a standard package…',
    pricing_unit_options: ADVENTURE_PRICING,
    blocks: ADVENTURE_BLOCKS,
  },
  cakes_return_favours: {
    id: 'cakes_return_favours',
    label: 'Cakes & Return Favours',
    category: 'adventure',
    title_placeholder: 'e.g., Custom Birthday Cakes & Favours',
    description_placeholder:
      'Tell parents about your baking style, the themes you can customise, ingredients and dietary options, and your delivery areas and lead times…',
    pricing_unit_options: ADVENTURE_PRICING,
    blocks: ADVENTURE_BLOCKS,
  },
  photography_videography: {
    id: 'photography_videography',
    label: 'Photography & Videography',
    category: 'adventure',
    title_placeholder: 'e.g., Kids Birthday Photography Package',
    description_placeholder:
      "Share your shooting style, what's included in a typical session, how long after the event parents can expect final deliverables, and what makes your work stand out…",
    pricing_unit_options: ADVENTURE_PRICING,
    blocks: ADVENTURE_BLOCKS,
  },
  games_interactive_zones: {
    id: 'games_interactive_zones',
    label: 'Games & Interactive Zones',
    category: 'adventure',
    title_placeholder: 'e.g., Interactive Game Zone Setup',
    description_placeholder:
      'Describe what you bring to a party — themes, decor, entertainment, games. Mention your team size, setup time needed, and what parents will love about your approach…',
    pricing_unit_options: ADVENTURE_PRICING,
    blocks: ADVENTURE_BLOCKS,
  },
  creative_diy_activities: {
    id: 'creative_diy_activities',
    label: 'Creative & DIY Activities',
    category: 'adventure',
    title_placeholder: 'e.g., DIY Craft Activity Station',
    description_placeholder:
      'Describe what you bring to a party — themes, decor, entertainment, games. Mention your team size, setup time needed, and what parents will love about your approach…',
    pricing_unit_options: ADVENTURE_PRICING,
    blocks: ADVENTURE_BLOCKS,
  },
  premium_experience_addons: {
    id: 'premium_experience_addons',
    label: 'Premium Experience Add-ons',
    category: 'adventure',
    title_placeholder: 'e.g., Premium Party Experience Package',
    description_placeholder:
      'Describe what you bring to a party — themes, decor, entertainment, games. Mention your team size, setup time needed, and what parents will love about your approach…',
    pricing_unit_options: ADVENTURE_PRICING,
    blocks: ADVENTURE_BLOCKS,
  },

  // BLOOM
  dance_movement: {
    id: 'dance_movement',
    label: 'Dance & Movement Classes',
    category: 'bloom',
    title_placeholder: 'e.g., Contemporary Dance for 6–10 year olds',
    description_placeholder:
      'Describe your teaching style, the music or mediums you work with, what a typical class looks like, and what parents can expect their child to learn…',
    pricing_unit_options: BLOOM_PRICING,
    blocks: BLOOM_BLOCKS,
    show_trial_toggle: true,
  },
  music_classes: {
    id: 'music_classes',
    label: 'Music Classes',
    category: 'bloom',
    title_placeholder: 'e.g., Beginner Piano Lessons for Kids',
    description_placeholder:
      'Describe your teaching style, the music or mediums you work with, what a typical class looks like, and what parents can expect their child to learn…',
    pricing_unit_options: BLOOM_PRICING,
    blocks: BLOOM_BLOCKS,
    show_trial_toggle: true,
  },
  arts_crafts: {
    id: 'arts_crafts',
    label: 'Arts & Crafts',
    category: 'bloom',
    title_placeholder: 'e.g., Creative Arts & Crafts Classes',
    description_placeholder:
      'Describe your teaching style, the music or mediums you work with, what a typical class looks like, and what parents can expect their child to learn…',
    pricing_unit_options: BLOOM_PRICING,
    blocks: BLOOM_BLOCKS,
    show_trial_toggle: true,
  },
  sports_coaching: {
    id: 'sports_coaching',
    label: 'Sports Coaching',
    category: 'bloom',
    title_placeholder: 'e.g., Football Coaching for Beginners',
    description_placeholder:
      'Walk parents through your coaching philosophy, what skill levels you work with, how a typical session is structured, and what progress their child can expect…',
    pricing_unit_options: BLOOM_PRICING,
    blocks: BLOOM_BLOCKS,
    show_trial_toggle: true,
  },
  child_yoga_mindfulness: {
    id: 'child_yoga_mindfulness',
    label: 'Child Yoga & Mindfulness',
    category: 'bloom',
    title_placeholder: 'e.g., Mindful Yoga for Kids 5-8',
    description_placeholder:
      'Share your approach to teaching mindfulness to children, what a session feels like, the tools and stories you use, and what parents often notice at home…',
    pricing_unit_options: BLOOM_PRICING,
    blocks: BLOOM_BLOCKS,
    show_trial_toggle: true,
  },
  phonics_literacy: {
    id: 'phonics_literacy',
    label: 'Phonics & Literacy',
    category: 'bloom',
    title_placeholder: 'e.g., Phonics & Reading for Early Learners',
    description_placeholder:
      'Explain your literacy approach, how you work with different learning speeds, what a class covers, and the reading milestones children typically reach with you…',
    pricing_unit_options: BLOOM_PRICING,
    blocks: BLOOM_BLOCKS,
    show_trial_toggle: true,
  },
  montessori_education: {
    id: 'montessori_education',
    label: 'Montessori Education',
    category: 'bloom',
    title_placeholder: 'e.g., Montessori Early Learning Programme',
    description_placeholder:
      'Describe your curriculum approach, the age groups you serve, daily structure, and what early childhood milestones parents can expect you to support…',
    pricing_unit_options: BLOOM_PRICING,
    blocks: BLOOM_BLOCKS,
  },
  sensory_play: {
    id: 'sensory_play',
    label: 'Sensory Play',
    category: 'bloom',
    title_placeholder: 'e.g., Sensory Play Sessions for Toddlers',
    description_placeholder:
      'Describe your curriculum approach, the age groups you serve, daily structure, and what early childhood milestones parents can expect you to support…',
    pricing_unit_options: BLOOM_PRICING,
    blocks: BLOOM_BLOCKS,
  },
  early_childhood_education: {
    id: 'early_childhood_education',
    label: 'Early Childhood Education',
    category: 'bloom',
    title_placeholder: 'e.g., Early Learning Programme for 2-4 year olds',
    description_placeholder:
      'Describe your curriculum approach, the age groups you serve, daily structure, and what early childhood milestones parents can expect you to support…',
    pricing_unit_options: BLOOM_PRICING,
    blocks: BLOOM_BLOCKS,
  },

  // CARE
  child_psychology: {
    id: 'child_psychology',
    label: 'Child Psychology & Counselling',
    category: 'care',
    title_placeholder: 'e.g., Child Counselling for Anxiety & Behavioural Issues',
    description_placeholder:
      'Share your therapeutic approach, the age groups and concerns you specialise in, what a first session looks like, and what parents and children can expect over time…',
    pricing_unit_options: CARE_PRICING,
    blocks: CARE_BLOCKS,
  },
  child_physiotherapy: {
    id: 'child_physiotherapy',
    label: 'Child Physiotherapy',
    category: 'care',
    title_placeholder: 'e.g., Pediatric Physiotherapy for Developmental Delays',
    description_placeholder:
      'Describe your clinical approach, the conditions and developmental goals you work with, how sessions are structured, and what improvement parents can expect to see…',
    pricing_unit_options: CARE_PRICING,
    blocks: CARE_BLOCKS,
  },
  pediatric_ot: {
    id: 'pediatric_ot',
    label: 'Pediatric Occupational Therapy',
    category: 'care',
    title_placeholder: 'e.g., Occupational Therapy for Sensory Processing',
    description_placeholder:
      'Describe your clinical approach, the conditions and developmental goals you work with, how sessions are structured, and what improvement parents can expect to see…',
    pricing_unit_options: CARE_PRICING,
    blocks: CARE_BLOCKS,
  },
  lactation_postnatal: {
    id: 'lactation_postnatal',
    label: 'Lactation Consultation',
    category: 'care',
    title_placeholder: 'e.g., Lactation Support & Breastfeeding Consultation',
    description_placeholder:
      'Tell parents about your consulting approach, the challenges you support with, what a home visit or consultation looks like, and how you support recovery and feeding…',
    pricing_unit_options: CARE_PRICING,
    blocks: CARE_BLOCKS,
  },
  infant_postnatal_care: {
    id: 'infant_postnatal_care',
    label: 'Infant & Postnatal Care',
    category: 'care',
    title_placeholder: 'e.g., Postnatal Care & Newborn Support',
    description_placeholder:
      'Tell parents about your consulting approach, the challenges you support with, what a home visit or consultation looks like, and how you support recovery and feeding…',
    pricing_unit_options: CARE_PRICING,
    blocks: CARE_BLOCKS,
  },
  pediatric_nutrition: {
    id: 'pediatric_nutrition',
    label: 'Pediatric Nutrition',
    category: 'care',
    title_placeholder: 'e.g., Child Nutrition Consultation & Meal Planning',
    description_placeholder:
      'Share your approach to child nutrition, the concerns you commonly address, how consultations are structured, and what meal and lifestyle support you provide…',
    pricing_unit_options: CARE_PRICING,
    blocks: CARE_BLOCKS,
  },
  infant_massage: {
    id: 'infant_massage',
    label: 'Infant Massage Therapy',
    category: 'care',
    title_placeholder: 'e.g., Infant Massage & Relaxation Therapy',
    description_placeholder:
      'Describe your technique, the age range you work with, what a typical session involves, safety measures, and the benefits parents often see in their baby…',
    pricing_unit_options: CARE_PRICING,
    blocks: CARE_BLOCKS,
  },
  infant_grooming: {
    id: 'infant_grooming',
    label: 'Infant Grooming & Hygiene',
    category: 'care',
    title_placeholder: 'e.g., Infant Grooming & Hygiene Services',
    description_placeholder:
      'Describe your technique, the age range you work with, what a typical session involves, safety measures, and the benefits parents often see in their baby…',
    pricing_unit_options: CARE_PRICING,
    blocks: CARE_BLOCKS,
  },
  infant_ear_piercing: {
    id: 'infant_ear_piercing',
    label: 'Infant Ear Piercing',
    category: 'care',
    title_placeholder: 'e.g., Safe Infant Ear Piercing Service',
    description_placeholder:
      'Describe your technique, the age range you work with, what a typical session involves, safety measures, and the benefits parents often see in their baby…',
    pricing_unit_options: CARE_PRICING,
    blocks: CARE_BLOCKS,
  },

  // DISCOVER
  workshops_events: {
    id: 'workshops_events',
    label: 'Workshops & Events',
    category: 'discover',
    title_placeholder: 'e.g., Science Workshop for Curious Minds',
    description_placeholder:
      "Walk parents through what the workshop covers, the outcomes their child will take away, what's included in the fee, and anything the child should bring along…",
    pricing_unit_options: DISCOVER_PRICING,
    blocks: DISCOVER_BLOCKS,
  },
  camps_holiday_programmes: {
    id: 'camps_holiday_programmes',
    label: 'Camps & Holiday Programmes',
    category: 'discover',
    title_placeholder: 'e.g., Summer Adventure Camp 2026',
    description_placeholder:
      "Describe your camp theme and structure, a typical day, what's included (meals, materials, transport), the outcomes children leave with, and your experience running camps…",
    pricing_unit_options: DISCOVER_PRICING,
    blocks: DISCOVER_BLOCKS,
  },
  community_social_activities: {
    id: 'community_social_activities',
    label: 'Community & Social Activities',
    category: 'discover',
    title_placeholder: 'e.g., Weekend Community Playgroup',
    description_placeholder:
      'Tell parents what your community offers, who typically attends, what sessions look like, and the friendships or skills children often build through participation…',
    pricing_unit_options: DISCOVER_PRICING,
    blocks: DISCOVER_BLOCKS,
  },
};

// Helper functions
export function listServiceTypes(): ServiceTypeConfig[] {
  return Object.values(SERVICE_TYPE_CONFIGS);
}

export async function getServiceTypeConfig(serviceTypeId: string): Promise<ServiceTypeConfig | null> {
  return SERVICE_TYPE_CONFIGS[serviceTypeId] || null;
}

export function getServiceTypesByCategory(category: Category): ServiceTypeConfig[] {
  return Object.values(SERVICE_TYPE_CONFIGS).filter((config) => config.category === category);
}
