/**
 * ECOSYSTEM AUTH - Unified Authentication Module
 * 
 * SOURCE OF TRUTH for authentication across all ecosystem sites.
 * This module provides unified login/signup that:
 * - Creates users in ContactFlowCRM first on signup
 * - Assigns new leads to Brian Lathe if no referrer
 * - Syncs with Systeme.io for tags/automations
 * - Returns unified user data with ecosystem_uid
 * 
 * Usage:
 *   import { ecosystemSignup, getEcosystemUser, ecosystemAuth } from 'global-assets'
 * 
 * Or reference as npm dependency: @successbrian/global-assets
 */

import { createClient } from '@supabase/supabase-js';
import type { User, AuthResponse } from '@supabase/supabase-js';

// =============================================================================
// CONFIGURATION
// =============================================================================

// CRITICAL: Unified Supabase URL - MUST be used by ALL ecosystem sites
const SUPABASE_URL = 'https://hrlajcabqsoirtrbfvxd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybGFqY2FicXNvaXJ0cmJmdnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDEzNjQsImV4cCI6MjA4NTMxNzM2NH0.jmTQf4k0La8q01ExKcIBkLuCKw5TcLmcvhCAQdRFV2o';

// Brian Lathe's email - used to look up user ID for sponsor assignment
const BRIAN_LATHE_EMAIL = 'brian.lathe@outlook.com';

// ContactFlowCRM API Configuration
const CRM_API_URL = typeof window !== 'undefined' 
  ? (window as any).ENV?.NEXT_PUBLIC_CRM_API_URL || 'https://api.contactflowcrm.com'
  : 'https://api.contactflowcrm.com';
const CRM_API_KEY = typeof window !== 'undefined' 
  ? (window as any).ENV?.CRM_API_KEY 
  : undefined;

// Systeme.io API Configuration
const SYSTEME_API_URL = typeof window !== 'undefined'
  ? (window as any).ENV?.NEXT_PUBLIC_SYSTEME_API_URL || 'https://api.systeme.io'
  : 'https://api.systeme.io';
const SYSTEME_API_KEY = typeof window !== 'undefined'
  ? (window as any).ENV?.SYSTEME_API_KEY
  : undefined;

// =============================================================================
// TYPES
// =============================================================================

export interface EcosystemUser {
  id: string;
  ecosystem_uid: string;
  email: string;
  whatsapp?: string;
  full_name?: string;
  referrer_id?: string;
  sponsor_id?: string;
  site_id?: string;
  created_at: string;
  tags: string[];
}

export interface SignupParams {
  email: string;
  password?: string;
  fullName?: string;
  whatsapp?: string;
  referrerCode?: string;
  siteId?: string;
  metadata?: Record<string, any>;
}

export interface SignupResult {
  success: boolean;
  user?: User;
  ecosystemUser?: EcosystemUser;
  ecosystemUid?: string;
  requiresVerification?: boolean;
  error?: string;
}

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient(): ReturnType<typeof createClient> {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'ecosystem-auth-v1',
        },
      },
    });
  }
  return supabaseClient;
}

// =============================================================================
// ECOSYSTEM UID MANAGEMENT
// =============================================================================

const ECOSYSTEM_UID_KEY = 'ecosystem_uid';

export function getEcosystemUid(): string {
  if (typeof window === 'undefined') {
    // Server-side: generate a random UID
    return generateUid();
  }
  
  let uid = localStorage.getItem(ECOSYSTEM_UID_KEY);
  
  if (!uid) {
    uid = generateUid();
    localStorage.setItem(ECOSYSTEM_UID_KEY, uid);
  }
  
  return uid;
}

function generateUid(): string {
  return `eco_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

// =============================================================================
// BRIAN LATHE USER ID LOOKUP
// =============================================================================

let brianLatheUserId: string | null = null;

export async function getBrianLatheUserId(): Promise<string> {
  if (brianLatheUserId) {
    return brianLatheUserId;
  }
  
  const supabase = getSupabaseClient();
  
  // Try to find Brian Lathe by email
  const { data: user, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', BRIAN_LATHE_EMAIL)
    .maybeSingle();
  
  if (error) {
    console.error('Error finding Brian Lathe user:', error);
    // Fallback: try to find in public.profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', BRIAN_LATHE_EMAIL)
      .maybeSingle();
    
    if (profile) {
      brianLatheUserId = profile.id;
      return brianLatheUserId!;
    }
    
    throw new Error('Brian Lathe user not found in system');
  }
  
  if (user) {
    brianLatheUserId = user.id;
    return brianLatheUserId!;
  }
  
  throw new Error('Brian Lathe user not found in system');
}

// =============================================================================
// CONTACTFLOWCRM INTEGRATION
// =============================================================================

/**
 * Create or update user in ContactFlowCRM
 * This is called FIRST before creating Supabase auth user
 */
export async function createOrUpdateContactFlowCRM(params: {
  email: string;
  fullName?: string;
  whatsapp?: string;
  referrerCode?: string;
  siteId: string;
}): Promise<{ contactId: string; ecosystemUid: string; isNew: boolean }> {
  const supabase = getSupabaseClient();
  const ecosystemUid = getEcosystemUid();
  
  // Check if contact already exists
  const { data: existingContact } = await supabase
    .from('contacts')
    .select('id, ecosystem_uid')
    .eq('email', params.email)
    .maybeSingle();
  
  if (existingContact) {
    // Update existing contact
    await supabase
      .from('contacts')
      .update({
        full_name: params.fullName,
        whatsapp_number: params.whatsapp,
        referrer_code: params.referrerCode,
        site_id: params.siteId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingContact.id);
    
    return {
      contactId: existingContact.id,
      ecosystemUid: existingContact.ecosystem_uid || ecosystemUid,
      isNew: false,
    };
  }
  
  // Determine sponsor - use referrer if provided, otherwise use Brian Lathe
  let sponsorId: string | undefined;
  
  if (params.referrerCode) {
    // Look up referrer
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', params.referrerCode)
      .maybeSingle();
    
    if (referrer) {
      sponsorId = referrer.id;
    }
  }
  
  // If no referrer, assign to Brian Lathe
  if (!sponsorId) {
    try {
      sponsorId = await getBrianLatheUserId();
    } catch (e) {
      console.warn('Could not assign Brian Lathe as sponsor:', e);
    }
  }
  
  // Create new contact
  const { data: newContact, error } = await supabase
    .from('contacts')
    .insert({
      email: params.email,
      full_name: params.fullName,
      whatsapp_number: params.whatsapp,
      referrer_code: params.referrerCode,
      sponsor_id: sponsorId,
      site_id: params.siteId,
      ecosystem_uid: ecosystemUid,
      tags: ['new_signup', params.siteId],
    })
    .select('id, ecosystem_uid')
    .single();
  
  if (error) {
    console.error('Error creating ContactFlowCRM contact:', error);
    throw new Error('Failed to create contact in CRM');
  }
  
  return {
    contactId: newContact.id,
    ecosystemUid: newContact.ecosystem_uid,
    isNew: true,
  };
}

// =============================================================================
// SYSTEME.IO INTEGRATION
// =============================================================================

/**
 * Sync user with Systeme.io for tags and automations
 */
export async function syncWithSystemeIo(params: {
  email: string;
  fullName?: string;
  tags: string[];
  siteId: string;
}): Promise<void> {
  if (!SYSTEME_API_KEY) {
    console.warn('Systeme.io API key not configured - skipping sync');
    return;
  }
  
  try {
    // Create or update contact in Systeme.io
    await fetch(`${SYSTEME_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SYSTEME_API_KEY}`,
      },
      body: JSON.stringify({
        email: params.email,
        firstName: params.fullName?.split(' ')[0] || '',
        lastName: params.fullName?.split(' ').slice(1).join(' ') || '',
        tags: params.tags,
        metadata: {
          site_id: params.siteId,
          ecosystem_signup: true,
          signup_date: new Date().toISOString(),
        },
      }),
    });
    
    console.log('✅ Synced with Systeme.io');
  } catch (error) {
    console.error('Error syncing with Systeme.io:', error);
    // Don't throw - this is a non-critical operation
  }
}

// =============================================================================
// UNIFIED SIGNUP FLOW
// =============================================================================

/**
 * Main signup function - creates user in ContactFlowCRM FIRST, then Supabase
 * 
 * This is the recommended way to create new users across the ecosystem
 */
export async function ecosystemSignup(params: SignupParams): Promise<SignupResult> {
  const supabase = getSupabaseClient();
  const siteId = params.siteId || 'default-site';
  
  try {
    // STEP 1: Create/validate contact in ContactFlowCRM FIRST
    const crmResult = await createOrUpdateContactFlowCRM({
      email: params.email,
      fullName: params.fullName,
      whatsapp: params.whatsapp,
      referrerCode: params.referrerCode,
      siteId,
    });
    
    // STEP 2: Create Supabase auth user (or get existing)
    let authResult: AuthResponse;
    
    // Check if user already exists
    const { data: existingUser } = await supabase.auth.getUser();
    
    if (existingUser?.user) {
      // User already logged in or exists - just link them
      authResult = { data: { user: existingUser.user }, error: null };
    } else {
      // Create new auth account
      authResult = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            whatsapp: params.whatsapp,
            contact_id: crmResult.contactId,
            ecosystem_uid: crmResult.ecosystemUid,
            site_id: siteId,
            ...params.metadata,
          },
        },
      });
    }
    
    if (authResult.error) {
      return {
        success: false,
        error: authResult.error.message,
        ecosystemUid: crmResult.ecosystemUid,
      };
    }
    
    // STEP 3: Sync with Systeme.io
    const ecosystemUid = getEcosystemUid();
    await syncWithSystemeIo({
      email: params.email,
      fullName: params.fullName,
      tags: crmResult.isNew ? ['new_signup', siteId] : ['existing_user', siteId],
      siteId,
    });
    
    // STEP 4: Return unified user data
    return {
      success: true,
      user: authResult.data.user || undefined,
      ecosystemUid: crmResult.ecosystemUid,
      requiresVerification: !authResult.data.session,
    };
    
  } catch (error) {
    console.error('Ecosystem signup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// =============================================================================
// LOGIN FLOW
// =============================================================================

/**
 * Login with email (sends magic link)
 */
export async function ecosystemLogin(email: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Redirect after verification
      emailRedirectTo: typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : undefined,
    },
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true };
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * Get current session
 */
export async function getSession() {
  const supabase = getSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign out
 */
export async function signOut() {
  const supabase = getSupabaseClient();
  await supabase.auth.signOut();
  
  // Clear ecosystem UID on sign out (optional - you may want to keep it)
  // localStorage.removeItem(ECOSYSTEM_UID_KEY);
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  const supabase = getSupabaseClient();
  return supabase.auth.onAuthStateChange(callback);
}

// =============================================================================
// GET ECOSYSTEM USER
// =============================================================================

/**
 * Get the ecosystem user profile
 */
export async function getEcosystemUser(): Promise<EcosystemUser | null> {
  const supabase = getSupabaseClient();
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  
  if (!profile) {
    return null;
  }
  
  return {
    id: profile.id,
    ecosystem_uid: profile.ecosystem_uid || '',
    email: profile.email || user.email || '',
    full_name: profile.full_name || undefined,
    whatsapp: profile.whatsapp_number || undefined,
    referrer_id: profile.referrer_id || undefined,
    sponsor_id: profile.sponsor_id || undefined,
    site_id: profile.site_id || undefined,
    created_at: profile.created_at,
    tags: profile.tags || [],
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getSupabaseClient,
  getEcosystemUid,
  ecosystemSignup,
  ecosystemLogin,
  getSession,
  getCurrentUser,
  signOut,
  onAuthStateChange,
  getEcosystemUser,
  getBrianLatheUserId,
};
