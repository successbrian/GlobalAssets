/**
 * SitemapGenerator.ts - Dynamic Sitemap Generator for Civitas
 * 
 * Features:
 * - Generates sitemap-merchants.xml for all /merchant/[id] routes
 * - Generates sitemap-realestate.xml for all /[country]/[city]/[category] routes
 * - Sets changefreq to daily and priority to 0.9 for listing pages
 * - Integrates with Supabase to fetch active listings
 */

// Simple types for browser-compatible code
interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: { hreflang: string; href: string }[];
}

// Site configuration
const SITE_URL = 'https://civitasreserve.com';
const SITE_ALTERNATES: Record<string, string> = {
  en: 'https://civitasreserve.com/en',
  es: 'https://civitasreserve.com/es',
  zh: 'https://civitasreserve.com/zh'
};

/**
 * Generate merchants sitemap - static version for development
 */
export function getStaticMerchantsSitemap(): string {
  const entries: SitemapEntry[] = [
    { loc: SITE_URL, changefreq: 'weekly', priority: 1.0 },
    { loc: `${SITE_URL}/merchants`, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/merchant/metrocity-coffee`, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/merchant/downtown-bakery`, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/merchant/city-view-realty`, changefreq: 'daily', priority: 0.9 }
  ];

  return generateSitemapXml(entries);
}

/**
 * Generate real estate sitemap - static version for development
 */
export function getStaticRealEstateSitemap(): string {
  const entries: SitemapEntry[] = [
    { loc: `${SITE_URL}/realestate`, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/realestate/sale`, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/realestate/rent`, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/realestate/us/ny/new-york`, changefreq: 'daily', priority: 0.8 },
    { loc: `${SITE_URL}/realestate/us/ny/new-york/apartments`, changefreq: 'daily', priority: 0.85 },
    { loc: `${SITE_URL}/realestate/us/tx/dallas/houses`, changefreq: 'daily', priority: 0.85 }
  ];

  return generateSitemapXml(entries);
}

/**
 * Generate sitemap index XML
 */
export function getSitemapIndexXml(): string {
  const today = getTodayDate();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-merchants.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-realestate.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

/**
 * Generate sitemap index for localized sites
 */
export function getLocalizedSitemapIndex(): string {
  const today = getTodayDate();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <sitemap>
    <loc>${SITE_URL}/sitemap-merchants.xml</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link href="${SITE_URL}/en/sitemap-merchants.xml" hreflang="en" rel="alternate" />
    <xhtml:link href="${SITE_URL}/es/sitemap-merchants.xml" hreflang="es" rel="alternate" />
    <xhtml:link href="${SITE_URL}/zh/sitemap-merchants.xml" hreflang="zh" rel="alternate" />
  </sitemap>
  <sitemap>
    <loc>${SITE_URL}/sitemap-realestate.xml</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link href="${SITE_URL}/en/sitemap-realestate.xml" hreflang="en" rel="alternate" />
    <xhtml:link href="${SITE_URL}/es/sitemap-realestate.xml" hreflang="es" rel="alternate" />
    <xhtml:link href="${SITE_URL}/zh/sitemap-realestate.xml" hreflang="zh" rel="alternate" />
  </sitemap>
</sitemapindex>`;
}

/**
 * Generate sitemap XML from entries
 */
function generateSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.map(entry => {
    let url = `  <url>
    <loc>${escapeXml(entry.loc)}</loc>`;
    
    if (entry.lastmod) {
      url += `
    <lastmod>${entry.lastmod}</lastmod>`;
    }
    
    if (entry.changefreq) {
      url += `
    <changefreq>${entry.changefreq}</changefreq>`;
    }
    
    if (entry.priority !== undefined) {
      url += `
    <priority>${entry.priority.toFixed(1)}</priority>`;
    }
    
    if (entry.alternates) {
      for (const alt of entry.alternates) {
        url += `
    <xhtml:link href="${escapeXml(alt.href)}" hreflang="${alt.hreflang}" rel="alternate" />`;
      }
    }
    
    url += `
  </url>`;
    
    return url;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// API endpoints for server-side rendering
export const API_ENDPOINTS = {
  merchants: '/api/sitemap/merchants',
  realestate: '/api/sitemap/realestate',
  index: '/api/sitemap/index'
};

export default {
  getStaticMerchantsSitemap,
  getStaticRealEstateSitemap,
  getSitemapIndexXml,
  getLocalizedSitemapIndex,
  API_ENDPOINTS
};
