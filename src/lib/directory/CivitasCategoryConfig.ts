/**
 * CivitasCategoryConfig.ts - Directory Category Configuration
 * 
 * Defines all directory categories, their icons, routes, and query configurations
 * for the Quick-Filter system and SEO Matrix.
 * 
 * @satoshihost: "Whether it's a job in Dubai or a truck in Dallas, 
 * it lives in the same sovereign structure."
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export type AssetType = 
  | 'real_estate' 
  | 'vehicle' 
  | 'service' 
  | 'job' 
  | 'provision' 
  | 'education'
  | 'community';

export type RoutePattern = 
  | '/[country]/[city]/[category]' 
  | '/[country]/[category]'
  | '/[category]'
  | '/search';

export interface CategoryConfig {
  id: AssetType;
  name: string;
  icon: string;
  description: string;
  slug: string;
  route: string;
  table: string;
  color: string;
  queryParams: Record<string, string>;
  filters: FilterConfig[];
  seoKeywords: string[];
  parentCategory?: AssetType;
  isNew?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'range' | 'checkbox' | 'search';
  options?: { value: string; label: string }[];
  rangeMin?: number;
  rangeMax?: number;
}

export interface RegionConfig {
  code: string;
  name: string;
  cities: { code: string; name: string }[];
}

export interface SeoRoute {
  pattern: string;
  example: string;
  queryTable: string;
  queryFilters: Record<string, string>;
}

export interface CategoryFilter {
  category: AssetType;
  region?: string;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string>;
}

// ============================================
// CATEGORY CONFIGURATIONS
// ============================================

export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    id: 'real_estate',
    name: 'Real Estate',
    icon: '🏠',
    description: 'Homes, apartments, and commercial properties',
    slug: 'real-estate',
    route: '/real-estate',
    table: 'civitas_assets_real_estate',
    color: '#00ff88',
    queryParams: { category: 'real_estate', type: 'property' },
    filters: [
      { key: 'property_type', label: 'Property Type', type: 'select', options: [
        { value: 'house', label: 'House' },
        { value: 'apartment', label: 'Apartment' },
        { value: 'condo', label: 'Condo' },
        { value: 'townhouse', label: 'Townhouse' },
        { value: 'land', label: 'Land' },
        { value: 'commercial', label: 'Commercial' }
      ]},
      { key: 'listing_type', label: 'Listing Type', type: 'select', options: [
        { value: 'sale', label: 'For Sale' },
        { value: 'rent', label: 'For Rent' }
      ]},
      { key: 'price_range', label: 'Price Range', type: 'range', rangeMin: 0, rangeMax: 10000000 },
      { key: 'bedrooms', label: 'Bedrooms', type: 'select', options: [
        { value: '1', label: '1+' },
        { value: '2', label: '2+' },
        { value: '3', label: '3+' },
        { value: '4', label: '4+' },
        { value: '5', label: '5+' }
      ]}
    ],
    seoKeywords: ['real estate', 'homes for sale', 'apartments for rent', 'property listings']
  },
  {
    id: 'vehicle',
    name: 'Vehicles',
    icon: '🚗',
    description: 'Cars, trucks, motorcycles, and more',
    slug: 'vehicles',
    route: '/vehicles',
    table: 'civitas_assets_vehicles',
    color: '#3498db',
    queryParams: { category: 'vehicle' },
    filters: [
      { key: 'vehicle_type', label: 'Vehicle Type', type: 'select', options: [
        { value: 'car', label: 'Car' },
        { value: 'truck', label: 'Truck' },
        { value: 'suv', label: 'SUV' },
        { value: 'van', label: 'Van' },
        { value: 'motorcycle', label: 'Motorcycle' },
        { value: 'boat', label: 'Boat' },
        { value: 'rv', label: 'RV' }
      ]},
      { key: 'make', label: 'Make', type: 'search' },
      { key: 'year_range', label: 'Year', type: 'range', rangeMin: 1990, rangeMax: new Date().getFullYear() + 1 },
      { key: 'price_range', label: 'Price Range', type: 'range', rangeMin: 0, rangeMax: 500000 },
      { key: 'mileage', label: 'Max Mileage', type: 'range', rangeMin: 0, rangeMax: 500000 },
      { key: 'fuel_type', label: 'Fuel Type', type: 'select', options: [
        { value: 'gasoline', label: 'Gasoline' },
        { value: 'diesel', label: 'Diesel' },
        { value: 'electric', label: 'Electric' },
        { value: 'hybrid', label: 'Hybrid' }
      ]},
      { key: 'condition', label: 'Condition', type: 'select', options: [
        { value: 'new', label: 'New' },
        { value: 'like-new', label: 'Like New' },
        { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' }
      ]}
    ],
    seoKeywords: ['used cars', 'trucks for sale', 'vehicles', 'auto listings', 'car dealerships']
  },
  {
    id: 'service',
    name: 'Services',
    icon: '🛠️',
    description: 'Professional services and freelancers',
    slug: 'services',
    route: '/services',
    table: 'civitas_assets_services',
    color: '#9b59b6',
    queryParams: { category: 'service' },
    filters: [
      { key: 'service_type', label: 'Service Type', type: 'select', options: [
        { value: 'legal', label: 'Legal' },
        { value: 'accounting', label: 'Accounting' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'web_development', label: 'Web Development' },
        { value: 'graphic_design', label: 'Graphic Design' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'crypto_advisor', label: 'Crypto Advisor' },
        { value: 'photography', label: 'Photography' },
        { value: 'translation', label: 'Translation' }
      ]},
      { key: 'delivers_remote', label: 'Remote Available', type: 'checkbox' },
      { key: 'hourly_rate', label: 'Hourly Rate (CVTR)', type: 'range', rangeMin: 0, rangeMax: 10000 },
      { key: 'availability', label: 'Availability', type: 'select', options: [
        { value: 'immediate', label: 'Immediate' },
        { value: 'within_week', label: 'Within Week' },
        { value: 'within_month', label: 'Within Month' }
      ]}
    ],
    seoKeywords: ['freelance services', 'professional services', 'consultants', 'freelancers']
  },
  {
    id: 'provision',
    name: 'Provisions',
    icon: '🥩',
    description: 'Food, restaurants, and dining',
    slug: 'provisions',
    route: '/provisions',
    table: 'civitas_assets_provisions',
    color: '#e74c3c',
    queryParams: { category: 'provision' },
    filters: [
      { key: 'business_type', label: 'Business Type', type: 'select', options: [
        { value: 'restaurant', label: 'Restaurant' },
        { value: 'cafe', label: 'Cafe' },
        { value: 'grocery', label: 'Grocery' },
        { value: 'food_truck', label: 'Food Truck' },
        { value: 'catering', label: 'Catering' },
        { value: 'meal_delivery', label: 'Meal Delivery' }
      ]},
      { key: 'cuisine', label: 'Cuisine Type', type: 'select', options: [
        { value: 'american', label: 'American' },
        { value: 'italian', label: 'Italian' },
        { value: 'chinese', label: 'Chinese' },
        { value: 'mexican', label: 'Mexican' },
        { value: 'japanese', label: 'Japanese' },
        { value: 'indian', label: 'Indian' },
        { value: 'thai', label: 'Thai' },
        { value: 'mediterranean', label: 'Mediterranean' }
      ]},
      { key: 'price_range', label: 'Price Range', type: 'select', options: [
        { value: 'budget', label: 'Budget' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'upscale', label: 'Upscale' },
        { value: 'luxury', label: 'Luxury' }
      ]},
      { key: 'has_delivery', label: 'Delivery Available', type: 'checkbox' },
      { key: 'accepts_cvtr', label: 'Accepts CVTR', type: 'checkbox' }
    ],
    seoKeywords: ['restaurants', 'food delivery', 'grocery stores', 'catering', 'dining']
  },
  {
    id: 'education',
    name: 'Education',
    icon: '🎓',
    description: 'Courses, tutoring, and certifications',
    slug: 'education',
    route: '/education',
    table: 'civitas_assets_education',
    color: '#f39c12',
    queryParams: { category: 'education' },
    filters: [
      { key: 'education_type', label: 'Type', type: 'select', options: [
        { value: 'course', label: 'Course' },
        { value: 'certification', label: 'Certification' },
        { value: 'bootcamp', label: 'Bootcamp' },
        { value: 'tutoring', label: 'Tutoring' },
        { value: 'training', label: 'Training' }
      ]},
      { key: 'subject_area', label: 'Subject', type: 'search' },
      { key: 'difficulty_level', label: 'Level', type: 'select', options: [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
        { value: 'all_levels', label: 'All Levels' }
      ]},
      { key: 'format', label: 'Format', type: 'select', options: [
        { value: 'online', label: 'Online' },
        { value: 'in_person', label: 'In Person' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'self_paced', label: 'Self-Paced' }
      ]},
      { key: 'certification_offered', label: 'Certification', type: 'checkbox' }
    ],
    seoKeywords: ['online courses', 'certifications', 'tutoring', 'education', 'learning']
  },
  {
    id: 'job',
    name: 'Jobs',
    icon: '💼',
    description: 'Employment and contract opportunities',
    slug: 'jobs',
    route: '/jobs',
    table: 'civitas_assets_jobs',
    color: '#1abc9c',
    queryParams: { category: 'job' },
    filters: [
      { key: 'employment_type', label: 'Type', type: 'select', options: [
        { value: 'full_time', label: 'Full Time' },
        { value: 'part_time', label: 'Part Time' },
        { value: 'contract', label: 'Contract' },
        { value: 'freelance', label: 'Freelance' },
        { value: 'remote', label: 'Remote' }
      ]},
      { key: 'role_level', label: 'Level', type: 'select', options: [
        { value: 'junior', label: 'Junior' },
        { value: 'mid', label: 'Mid' },
        { value: 'senior', label: 'Senior' },
        { value: 'lead', label: 'Lead' },
        { value: 'manager', label: 'Manager' },
        { value: 'director', label: 'Director' }
      ]},
      { key: 'pay_range', label: 'Pay Range (CVTR)', type: 'range', rangeMin: 0, rangeMax: 1000000 },
      { key: 'remote_only', label: 'Remote Only', type: 'checkbox' },
      { key: 'skills', label: 'Skills', type: 'search' }
    ],
    seoKeywords: ['jobs', 'employment', 'careers', 'hiring', 'remote work', 'contract jobs']
  },
  {
    id: 'community',
    name: 'Community',
    icon: '📅',
    description: 'Events, meetups, and gatherings',
    slug: 'community',
    route: '/community',
    table: 'civitas_assets_community',
    color: '#e91e63',
    queryParams: { category: 'community' },
    filters: [
      { key: 'event_type', label: 'Event Type', type: 'select', options: [
        { value: 'meetup', label: 'Meetup' },
        { value: 'conference', label: 'Conference' },
        { value: 'workshop', label: 'Workshop' },
        { value: 'webinar', label: 'Webinar' },
        { value: 'hackathon', label: 'Hackathon' },
        { value: 'networking', label: 'Networking' }
      ]},
      { key: 'venue_type', label: 'Venue', type: 'select', options: [
        { value: 'physical', label: 'In Person' },
        { value: 'virtual', label: 'Virtual' },
        { value: 'hybrid', label: 'Hybrid' }
      ]},
      { key: 'is_free', label: 'Free Events', type: 'checkbox' },
      { key: 'event_date', label: 'Date', type: 'select', options: [
        { value: 'today', label: 'Today' },
        { value: 'this_week', label: 'This Week' },
        { value: 'this_month', label: 'This Month' }
      ]}
    ],
    seoKeywords: ['events', 'meetups', 'conferences', 'community gatherings', 'networking']
  }
];

// ============================================
// REGION CONFIGURATIONS
// ============================================

export const REGION_CONFIG: RegionConfig[] = [
  {
    code: 'us',
    name: 'United States',
    cities: [
      { code: 'ny', name: 'New York' },
      { code: 'la', name: 'Los Angeles' },
      { code: 'chi', name: 'Chicago' },
      { code: 'hou', name: 'Houston' },
      { code: 'phx', name: 'Phoenix' },
      { code: 'dal', name: 'Dallas' },
      { code: 'mck', name: 'McKinney' },
      { code: 'plano', name: 'Plano' },
      { code: 'frisco', name: 'Frisco' }
    ]
  },
  {
    code: 'uk',
    name: 'United Kingdom',
    cities: [
      { code: 'lon', name: 'London' },
      { code: 'man', name: 'Manchester' },
      { code: 'bir', name: 'Birmingham' }
    ]
  },
  {
    code: 'ca',
    name: 'Canada',
    cities: [
      { code: 'tor', name: 'Toronto' },
      { code: 'van', name: 'Vancouver' },
      { code: 'mon', name: 'Montreal' }
    ]
  },
  {
    code: 'jp',
    name: 'Japan',
    cities: [
      { code: 'tokyo', name: 'Tokyo' },
      { code: 'osaka', name: 'Osaka' },
      { code: 'kyoto', name: 'Kyoto' }
    ]
  },
  {
    code: 'ae',
    name: 'UAE',
    cities: [
      { code: 'dxb', name: 'Dubai' },
      { code: 'auh', name: 'Abu Dhabi' }
    ]
  }
];

// ============================================
// SEO ROUTE PATTERNS
// ============================================

export const SEO_ROUTES: SeoRoute[] = [
  // Real Estate
  { pattern: '/[country]/[city]/homes-for-sale', example: '/us/ny/new-york/homes-for-sale', queryTable: 'civitas_assets_real_estate', queryFilters: { listing_type: 'sale', property_type: 'house' }},
  { pattern: '/[country]/[city]/apartments-for-rent', example: '/us/ny/new-york/apartments-for-rent', queryTable: 'civitas_assets_real_estate', queryFilters: { listing_type: 'rent', property_type: 'apartment' }},
  
  // Vehicles
  { pattern: '/[country]/[city]/used-trucks', example: '/us/tx/dallas/used-trucks', queryTable: 'civitas_assets_vehicles', queryFilters: { vehicle_type: 'truck', condition: 'used' }},
  { pattern: '/[country]/[city]/electric-vehicles', example: '/us/ca/los-angeles/electric-vehicles', queryTable: 'civitas_assets_vehicles', queryFilters: { fuel_type: 'electric' }},
  
  // Services
  { pattern: '/[country]/[city]/crypto-lawyers', example: '/us/fl/miami/crypto-lawyers', queryTable: 'civitas_assets_services', queryFilters: { service_type: 'legal' }},
  { pattern: '/[country]/[city]/web-developers', example: '/us/ny/new-york/web-developers', queryTable: 'civitas_assets_services', queryFilters: { service_type: 'web_development' }},
  
  // Education
  { pattern: '/[country]/[city]/english-tutors', example: '/jp/tokyo/english-tutors', queryTable: 'civitas_assets_education', queryFilters: { subject_area: 'English', education_type: 'tutoring' }},
  { pattern: '/[country]/[city]/coding-bootcamps', example: '/us/ca/san-francisco/coding-bootcamps', queryTable: 'civitas_assets_education', queryFilters: { education_type: 'bootcamp' }},
  
  // Jobs
  { pattern: '/[country]/[city]/remote-jobs', example: '/us/ny/new-york/remote-jobs', queryTable: 'civitas_assets_jobs', queryFilters: { remote_only: 'true' }},
  { pattern: '/[country]/[city]/tech-jobs', example: '/us/ca/san-jose/tech-jobs', queryTable: 'civitas_assets_jobs', queryFilters: { department: 'technology' }}
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getCategoryById(id: AssetType): CategoryConfig | undefined {
  return CATEGORY_CONFIG.find(cat => cat.id === id);
}

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORY_CONFIG.find(cat => cat.slug === slug);
}

export function getRegions(): RegionConfig[] {
  return REGION_CONFIG;
}

export function getCitiesByRegion(regionCode: string): { code: string; name: string }[] {
  const region = REGION_CONFIG.find(r => r.code === regionCode);
  return region?.cities || [];
}

export function buildDirectoryUrl(
  category: AssetType, 
  region?: string, 
  city?: string,
  filters?: Record<string, string>
): string {
  const catConfig = getCategoryById(category);
  if (!catConfig) return '/directory';
  
  let url = catConfig.route;
  
  if (region) {
    url = `/${region}${city ? '/' + city : ''}${url}`;
  }
  
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams(filters);
    url += `?${params.toString()}`;
  }
  
  return url;
}

export function getSeoKeywords(category: AssetType, region?: string, city?: string): string[] {
  const catConfig = getCategoryById(category);
  if (!catConfig) return [];
  
  let keywords = [...catConfig.seoKeywords];
  
  if (region) {
    const regionConfig = REGION_CONFIG.find(r => r.code === region);
    if (regionConfig) {
      keywords = keywords.map(k => `${k} in ${regionConfig.name}`);
      
      if (city) {
        const cityData = regionConfig.cities.find(c => c.code === city);
        if (cityData) {
          keywords = keywords.map(k => `${k} in ${cityData.name}`);
        }
      }
    }
  }
  
  return keywords;
}

export function generateSeoTitle(category: AssetType, region?: string, city?: string): string {
  const catConfig = getCategoryById(category);
  if (!catConfig) return 'Civitas Directory';
  
  let title = catConfig.name;
  
  if (city) {
    const regionConfig = REGION_CONFIG.find(r => r.cities.some(c => c.code === city));
    const cityData = regionConfig?.cities.find(c => c.code === city);
    title = `${catConfig.name} in ${cityData?.name || city}`;
  }
  
  if (region && !city) {
    const regionConfig = REGION_CONFIG.find(r => r.code === region);
    title = `${catConfig.name} in ${regionConfig?.name || region}`;
  }
  
  return `${title} | Civitas Directory`;
}

export function generateSeoDescription(category: AssetType, region?: string, city?: string): string {
  const catConfig = getCategoryById(category);
  if (!catConfig) return 'Browse the Civitas sovereign directory.';
  
  let description = `Find ${catConfig.description.toLowerCase()} through the Civitas sovereign network.`;
  
  if (city) {
    const regionConfig = REGION_CONFIG.find(r => r.cities.some(c => c.code === city));
    const cityData = regionConfig?.cities.find(c => c.code === city);
    description = `Find ${catConfig.description.toLowerCase()} in ${cityData?.name || city} through the Civitas sovereign network.`;
  }
  
  return description;
}

export default {
  CATEGORY_CONFIG,
  REGION_CONFIG,
  SEO_ROUTES,
  getCategoryById,
  getCategoryBySlug,
  buildDirectoryUrl,
  getSeoKeywords,
  generateSeoTitle,
  generateSeoDescription
};
