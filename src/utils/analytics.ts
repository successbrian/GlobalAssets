/**
 * GA4 Analytics Utility
 * Provides GA4 User-ID tracking for analytics across all ecosystem sites
 * 
 * Usage:
 *   import { initializeGA4, trackPageView, trackEvent } from '@successbrian/global-assets'
 * 
 * Initialize in your app root:
 *   initializeGA4('G-XXXXXXXXXX')
 */

// Extend Window interface for GA4
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

export interface GA4Config {
  measurementId: string
}

/**
 * Initialize GA4 with User-ID
 */
export const initializeGA4 = (measurementId: string): void => {
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []
  
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  
  gtag('js', new Date())
  gtag('config', measurementId, {
    send_page_view: false
  })
}

/**
 * Set GA4 User-ID for cross-session tracking
 */
export const setGA4UserId = (userId: string): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('set', 'user_id', userId)
  }
}

/**
 * Track page view with User-ID
 */
export const trackPageView = (
  pagePath: string,
  pageTitle: string,
  userId?: string
): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const config: any = {
      page_path: pagePath,
      page_title: pageTitle
    }
    
    if (userId) {
      config.user_id = userId
    }
    
    (window as any).gtag('event', 'page_view', config)
  }
}

/**
 * Track custom event with User-ID
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>,
  userId?: string
): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    const params: any = { ...eventParams }
    
    if (userId) {
      params.user_id = userId
    }
    
    (window as any).gtag('event', eventName, params)
  }
}

/**
 * Track user path selection
 */
export const trackPathSelection = (
  path: 'reader' | 'builder',
  userId: string
): void => {
  trackEvent('path_selection', {
    selected_path: path,
    timestamp: new Date().toISOString()
  }, userId)
}

/**
 * Track login event
 */
export const trackLogin = (
  userId: string,
  loginMethod: string
): void => {
  trackEvent('login', {
    method: loginMethod,
    timestamp: new Date().toISOString()
  }, userId)
}

/**
 * Track signup event
 */
export const trackSignup = (
  userId: string,
  signupMethod: string,
  siteId: string
): void => {
  trackEvent('sign_up', {
    method: signupMethod,
    site_id: siteId,
    timestamp: new Date().toISOString()
  }, userId)
}

/**
 * Track page scroll depth
 */
export const trackScrollDepth = (
  depth: number,
  userId?: string
): void => {
  trackEvent('scroll', {
    depth_percent: depth,
    timestamp: new Date().toISOString()
  }, userId)
}

/**
 * Track banner impression
 */
export const trackBannerImpression = (
  bannerId: string,
  campaignId: string,
  userId?: string
): void => {
  trackEvent('banner_impression', {
    banner_id: bannerId,
    campaign_id: campaignId
  }, userId)
}

/**
 * Track banner click
 */
export const trackBannerClick = (
  bannerId: string,
  campaignId: string,
  userId?: string
): void => {
  trackEvent('banner_click', {
    banner_id: bannerId,
    campaign_id: campaignId
  }, userId)
}

/**
 * Track email open
 */
export const trackEmailOpen = (
  emailId: string,
  contactId: string,
  userId?: string
): void => {
  trackEvent('email_open', {
    email_id: emailId,
    contact_id: contactId
  }, userId)
}

/**
 * Track website visit
 */
export const trackWebsiteVisit = (
  source: string,
  medium: string,
  campaign?: string,
  userId?: string
): void => {
  trackEvent('website_visit', {
    source,
    medium,
    campaign
  }, userId)
}

export default {
  initializeGA4,
  setGA4UserId,
  trackPageView,
  trackEvent,
  trackPathSelection,
  trackLogin,
  trackSignup,
  trackScrollDepth,
  trackBannerImpression,
  trackBannerClick,
  trackEmailOpen,
  trackWebsiteVisit,
}
