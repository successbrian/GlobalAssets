/**
 * Unified Auth Hook
 * Provides ecosystem-wide user authentication and tracking
 * Integrates with ContactFlowCRM for unified user identity
 * 
 * Usage:
 *   import { useUnifiedAuth } from '@successbrian/global-assets'
 * 
 *   const { login, logout, user, isAuthenticated } = useUnifiedAuth({ siteId: 'my-site' })
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// CONFIGURATION
// =============================================================================

// CRITICAL: Unified Supabase URL
const SUPABASE_URL = 'https://hrlajcabqsoirtrbfvxd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybGFqY2FicXNvaXJ0cmJmdnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDEzNjQsImV4cCI6MjA4NTMxNzM2NH0.jmTQf4k0La8q01ExKcIBkLuCKw5TcLmcvhCAQdRFV2o';

// Storage keys
const STORAGE_KEYS = {
  ECOSYSTEM_UID: 'ecosystem_uid',
  SESSION_ID: 'eco_session_id',
  FINGERPRINT: 'eco_fingerprint',
  FIRST_SEEN: 'eco_first_seen',
  VISIT_COUNT: 'eco_visit_count'
} as const;

// =============================================================================
// TYPES
// =============================================================================

export interface UnifiedUser {
  ecosystem_uid: string
  supabase_user_id: string | null
  email: string | null
  whatsapp_number: string | null
  trust_velocity: number
  silo_level: number
  duplication_count: number
  active_sites: string[]
  primary_site: string | null
  first_seen: string
  last_active: string
}

export interface UnifiedAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: UnifiedUser | null
  ecosystemUid: string | null
  sessionId: string | null
  fingerprint: string | null
  error: string | null
}

export interface LoginResult {
  success: boolean
  legacyBuilder?: boolean
  siloLevel?: number
  isNewUser?: boolean
  ecosystemUid?: string
}

export interface UseUnifiedAuthOptions {
  siteId: string
}

// =============================================================================
// FINGERPRINT (Inline to avoid dependency issues)
// =============================================================================

interface FingerprintData {
  fingerprint: string
  userAgent: string
  platform: string
  language: string
  screenResolution: string
  timezone: string
  cookiesEnabled: boolean
  doNotTrack: boolean
}

const generateFingerprint = async (): Promise<string> => {
  try {
    const components: string[] = []
    components.push(navigator.userAgent)
    components.push(navigator.platform)
    components.push(navigator.language)
    components.push(`${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`)
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone)
    
    const data = components.join('|')
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return Math.random().toString(36).substring(2)
  }
}

const getFingerprintData = async (): Promise<FingerprintData> => {
  const fingerprint = await generateFingerprint()
  return {
    fingerprint,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1'
  }
}

// =============================================================================
// GA4 (Inline to avoid dependency issues)
// =============================================================================

const setGA4UserId = (userId: string): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('set', 'user_id', userId)
  }
}

const trackEvent = (eventName: string, eventParams?: Record<string, any>): void => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams)
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

const generateEcosystemUid = (): string => {
  return Math.random().toString(16).substring(2, 9).padStart(7, '0')
}

const getOrCreateEcosystemUid = (): string => {
  let uid = localStorage.getItem(STORAGE_KEYS.ECOSYSTEM_UID)
    
  if (!uid) {
    uid = generateEcosystemUid()
    localStorage.setItem(STORAGE_KEYS.ECOSYSTEM_UID, uid)
    const firstSeen = new Date().toISOString()
    localStorage.setItem(STORAGE_KEYS.FIRST_SEEN, firstSeen)
    localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, '1')
  } else {
    const count = parseInt(localStorage.getItem(STORAGE_KEYS.VISIT_COUNT) || '0')
    localStorage.setItem(STORAGE_KEYS.VISIT_COUNT, String(count + 1))
  }
    
  return uid
}

const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID)
    
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId)
  }
    
  return sessionId
}

// =============================================================================
// Main Hook
// =============================================================================

export function useUnifiedAuth(options: UseUnifiedAuthOptions) {
  const { siteId } = options
  const [state, setState] = useState<UnifiedAuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    ecosystemUid: null,
    sessionId: null,
    fingerprint: null,
    error: null
  })

  // Initialize Supabase client
  const [supabase] = useState(() => 
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  )

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const ecosystemUid = getOrCreateEcosystemUid()
        const sessionId = getOrCreateSessionId()
        
        let fingerprint = localStorage.getItem(STORAGE_KEYS.FINGERPRINT)
        if (!fingerprint) {
          fingerprint = await generateFingerprint()
          localStorage.setItem(STORAGE_KEYS.FINGERPRINT, fingerprint)
        }
        
        // Set GA4 User-ID
        setGA4UserId(ecosystemUid)
        
        // Try to fetch user from unified_users
        const { data: unifiedUser } = await supabase
          .from('unified_users')
          .select('*')
          .eq('ecosystem_uid', ecosystemUid)
          .single()
        
        // Track page view activity
        if (unifiedUser) {
          await trackActivityEvent(ecosystemUid, 'page_view', {
            path: window.location.pathname
          })
            
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: unifiedUser,
            ecosystemUid,
            sessionId,
            fingerprint,
            error: null
          })
        } else {
          setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            ecosystemUid,
            sessionId,
            fingerprint,
            error: null
          })
        }
      } catch (error) {
        console.error('Error initializing unified auth:', error)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to initialize authentication'
        }))
      }
    }
    
    initialize()
  }, [supabase, siteId])

  /**
   * Sync user to ContactFlowCRM unified_users table
   */
  const syncUserToCRM = async (
    ecosystemUid: string,
    email: string,
    fingerprint: string,
    deviceInfo: FingerprintData | null
  ): Promise<UnifiedUser | null> => {
    try {
      // First try to find existing user by email
      const { data: existingUser } = await supabase
        .from('unified_users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (existingUser) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('unified_users')
          .update({
            last_active: new Date().toISOString(),
            active_sites: [...(existingUser.active_sites || []), siteId].filter((v, i, a) => a.indexOf(v) === i),
            primary_site: existingUser.primary_site || siteId
          })
          .eq('ecosystem_uid', existingUser.ecosystem_uid)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating unified user:', updateError)
          return existingUser
        }
        
        await trackDevice(updatedUser.ecosystem_uid, fingerprint, deviceInfo)
        return updatedUser
      }
      
      // Check if ecosystem_uid exists
      const { data: uidUser } = await supabase
        .from('unified_users')
        .select('*')
        .eq('ecosystem_uid', ecosystemUid)
        .single()
      
      if (uidUser) {
        const { data: updatedUser, error: updateError } = await supabase
          .from('unified_users')
          .update({
            email,
            last_active: new Date().toISOString(),
            active_sites: [...(uidUser.active_sites || []), siteId].filter((v, i, a) => a.indexOf(v) === i),
            primary_site: uidUser.primary_site || siteId
          })
          .eq('ecosystem_uid', ecosystemUid)
          .select()
          .single()
        
        if (updateError) {
          console.error('Error updating unified user with email:', updateError)
          return uidUser
        }
        
        await trackDevice(updatedUser.ecosystem_uid, fingerprint, deviceInfo)
        return updatedUser
      }
      
      // Create new unified user
      const { data: newUser, error: insertError } = await supabase
        .from('unified_users')
        .insert({
          ecosystem_uid: ecosystemUid,
          email,
          trust_velocity: 0,
          silo_level: 0,
          duplication_count: 0,
          active_sites: [siteId],
          primary_site: siteId,
          first_seen: new Date().toISOString(),
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('Error creating unified user:', insertError)
        const { data: fallbackUser } = await supabase
          .from('unified_users')
          .select('*')
          .eq('ecosystem_uid', ecosystemUid)
          .single()
        return fallbackUser
      }
      
      await trackDevice(newUser.ecosystem_uid, fingerprint, deviceInfo)
      return newUser
    } catch (error) {
      console.error('Error syncing user to CRM:', error)
      return null
    }
  }

  /**
   * Track user device
   */
  const trackDevice = async (
    ecosystemUid: string,
    fingerprint: string,
    deviceInfo: FingerprintData | null
  ): Promise<void> => {
    try {
      const userAgent = deviceInfo?.userAgent || navigator.userAgent
      const isMobile = /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini/i.test(userAgent)
      const deviceType = isMobile ? 'mobile' : 'desktop'
      
      let browser = 'unknown'
      let os = 'unknown'
      
      if (userAgent.includes('Firefox')) browser = 'Firefox'
      else if (userAgent.includes('Chrome')) browser = 'Chrome'
      else if (userAgent.includes('Safari')) browser = 'Safari'
      else if (userAgent.includes('Edge')) browser = 'Edge'
      
      if (userAgent.includes('Windows')) os = 'Windows'
      else if (userAgent.includes('Mac')) os = 'macOS'
      else if (userAgent.includes('Linux')) os = 'Linux'
      else if (userAgent.includes('Android')) os = 'Android'
      else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'
      
      const { data: existingDevice } = await supabase
        .from('user_devices')
        .select('*')
        .eq('ecosystem_uid', ecosystemUid)
        .eq('device_hash', fingerprint)
        .single()
      
      if (existingDevice) {
        await supabase
          .from('user_devices')
          .update({
            last_seen: new Date().toISOString(),
            visit_count: (existingDevice.visit_count || 0) + 1
          })
          .eq('id', existingDevice.id)
      } else {
        await supabase
          .from('user_devices')
          .insert({
            ecosystem_uid: ecosystemUid,
            device_hash: fingerprint,
            device_type: deviceType,
            browser,
            browser_version: '',
            os,
            os_version: '',
            screen_resolution: deviceInfo?.screenResolution || '',
            timezone: deviceInfo?.timezone || '',
            language: deviceInfo?.language || '',
            is_primary: true,
            is_verified: false,
            visit_count: 1,
            first_seen: new Date().toISOString(),
            last_seen: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Error tracking device:', error)
    }
  }

  /**
   * Track login event in CRM
   */
  const trackLoginEvent = async (
    ecosystemUid: string,
    email: string,
    sessionId: string,
    fingerprint: string,
    deviceInfo: FingerprintData | null
  ): Promise<void> => {
    try {
      const { data: user } = await supabase
        .from('unified_users')
        .select('supabase_user_id')
        .eq('ecosystem_uid', ecosystemUid)
        .single()
      
      // Try RPC first
      const { error } = await supabase.rpc('track_login', {
        p_ecosystem_uid: ecosystemUid,
        p_site_id: siteId,
        p_user_id: user?.supabase_user_id || null,
        p_user_agent: navigator.userAgent,
        p_device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
        p_fingerprint_hash: fingerprint,
        p_login_method: 'password'
      })
      
      if (error) {
        // Fallback: insert directly
        const { data: loginData } = await supabase
          .from('user_login_history')
          .select('login_count')
          .eq('ecosystem_uid', ecosystemUid)
          .order('login_count', { ascending: false })
          .limit(1)
          .single()
        
        const loginCount = (loginData?.login_count || 0) + 1
        
        await supabase
          .from('user_login_history')
          .insert({
            ecosystem_uid: ecosystemUid,
            site_id: siteId,
            user_agent: navigator.userAgent,
            device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
            fingerprint_hash: fingerprint,
            login_method: 'password',
            login_count: loginCount,
            session_id: sessionId
          })
      }
      
      trackEvent('ecosystem_login', {
        uid: ecosystemUid,
        method: 'password',
        site: siteId,
        email_hash: btoa(email).substring(0, 10)
      })
    } catch (error) {
      console.error('Error tracking login event:', error)
    }
  }

  /**
   * Track activity in CRM
   */
  const trackActivityEvent = async (
    ecosystemUid: string,
    activityType: string,
    activityData: Record<string, unknown> = {},
    pageUrl?: string,
    pageTitle?: string
  ): Promise<void> => {
    try {
      const sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID)
      
      const { error } = await supabase.rpc('track_activity', {
        p_ecosystem_uid: ecosystemUid,
        p_site_id: siteId,
        p_activity_type: activityType,
        p_activity_data: JSON.stringify(activityData),
        p_page_url: pageUrl || window.location.href,
        p_page_title: pageTitle || document.title,
        p_user_agent: navigator.userAgent,
        p_referrer: document.referrer,
        p_session_id: sessionId
      })
      
      if (error) {
        await supabase
          .from('user_activity_log')
          .insert({
            ecosystem_uid: ecosystemUid,
            site_id: siteId,
            activity_type: activityType,
            activity_data: activityData,
            page_url: pageUrl || window.location.href,
            page_title: pageTitle || document.title,
            user_agent: navigator.userAgent,
            referrer: document.referrer,
            session_id: sessionId
          })
      }
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }

  /**
   * Login function
   */
  const login = useCallback(async (email: string, _password: string): Promise<LoginResult> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const ecosystemUid = getOrCreateEcosystemUid()
      const sessionId = getOrCreateSessionId()
      const fingerprint = localStorage.getItem(STORAGE_KEYS.FINGERPRINT) || await generateFingerprint()
      const deviceInfo = await getFingerprintData()
      
      // Sync user to CRM
      const unifiedUser = await syncUserToCRM(ecosystemUid, email, fingerprint, deviceInfo)
      
      if (unifiedUser) {
        await trackLoginEvent(ecosystemUid, email, sessionId, fingerprint, deviceInfo)
        setGA4UserId(ecosystemUid)
        
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: unifiedUser,
          ecosystemUid,
          sessionId,
          fingerprint,
          error: null
        })
        
        return {
          success: true,
          legacyBuilder: unifiedUser.silo_level > 0,
          siloLevel: unifiedUser.silo_level,
          ecosystemUid
        }
      }
      
      return { success: false }
    } catch (error) {
      console.error('Login error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed'
      }))
      return { success: false }
    }
  }, [supabase, siteId])

  /**
   * Logout function
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      if (state.ecosystemUid) {
        await trackActivityEvent(state.ecosystemUid, 'logout', {
          email: state.user?.email || 'unknown'
        })
      }
      
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        ecosystemUid: state.ecosystemUid,
        sessionId: state.sessionId,
        fingerprint: state.fingerprint,
        error: null
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [state.ecosystemUid, state.user?.email, state.sessionId, state.fingerprint, supabase, siteId])

  /**
   * Track activity
   */
  const trackActivity = useCallback(async (
    activityType: string,
    activityData: Record<string, unknown> = {}
  ): Promise<void> => {
    if (state.ecosystemUid) {
      await trackActivityEvent(state.ecosystemUid, activityType, activityData)
    }
  }, [state.ecosystemUid, supabase, siteId])

  return {
    ...state,
    login,
    logout,
    trackActivity
  }
}

export default useUnifiedAuth
