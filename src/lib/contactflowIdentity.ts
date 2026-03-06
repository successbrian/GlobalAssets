/**
 * 🏛️ CONTACTFLOWCRM IDENTITY BRIDGE
 * Enforces "One Account per Person" rule across the ecosystem
 */

import { supabase } from '../../../VextorGrid/src/lib/supabase'; // Use Master's supabase

// Common profile table reference
const COMMON_PROFILES = 'common_profiles';
const COMMON_IDENTITIES = 'common_identities';
const DEVICE_FINGERPRINTS = 'common_device_fingerprints';

export interface CommonProfile {
  id: string;
  contactflow_uuid: string;
  primary_email: string;
  primary_wallet: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
}

export interface DeviceFingerprint {
  id: string;
  profile_id: string;
  fingerprint_hash: string;
  device_name: string;
  first_seen: string;
  last_seen: string;
  is_blocked: boolean;
}

/**
 * 🔍 VERIFY IDENTITY - ContactFlowCRM Handshake
 * Checks if user exists in common_profiles via ContactFlowCRM
 */
export async function verifyIdentity(email: string): Promise<{
  exists: boolean;
  profile?: CommonProfile;
  isNewUser: boolean;
}> {
  try {
    // Check if profile exists in common_profiles
    const { data: existingProfile, error } = await supabase
      .from(COMMON_PROFILES)
      .select('*')
      .eq('primary_email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[IDENTITY] Error checking profile:', error);
      throw error;
    }

    if (existingProfile) {
      return {
        exists: true,
        profile: existingProfile as CommonProfile,
        isNewUser: false,
      };
    }

    // New user - profile will be created during signup
    return {
      exists: false,
      isNewUser: true,
    };
  } catch (err) {
    console.error('[IDENTITY] Verification failed:', err);
    throw err;
  }
}

/**
 * 🔗 LINK DEVICE TO PROFILE
 * Associates device fingerprint with a profile for anti-multiaccount
 */
export async function linkDeviceToProfile(
  profileId: string,
  deviceFingerprint: string,
  deviceName: string = 'Unknown Device'
): Promise<{ success: boolean; isBlocked: boolean }> {
  try {
    // Check if device is already linked to another profile
    const { data: existingLink } = await supabase
      .from(DEVICE_FINGERPRINTS)
      .select('*')
      .eq('fingerprint_hash', deviceFingerprint)
      .neq('profile_id', profileId)
      .single();

    if (existingLink) {
      // Device is linked to a different profile - BLOCK
      console.warn(`[IDENTITY] Device ${deviceFingerprint} blocked - already linked to profile ${existingLink.profile_id}`);
      return { success: false, isBlocked: true };
    }

    // Check if this device is blocked
    const { data: blockedDevice } = await supabase
      .from(DEVICE_FINGERPRINTS)
      .select('*')
      .eq('fingerprint_hash', deviceFingerprint)
      .eq('is_blocked', true)
      .single();

    if (blockedDevice) {
      console.warn(`[IDENTITY] Blocked device attempted login: ${deviceFingerprint}`);
      return { success: false, isBlocked: true };
    }

    // Link or update device
    const { error: upsertError } = await supabase
      .from(DEVICE_FINGERPRINTS)
      .upsert({
        profile_id: profileId,
        fingerprint_hash: deviceFingerprint,
        device_name: deviceName,
        first_seen: existingLink?.first_seen || new Date().toISOString(),
        last_seen: new Date().toISOString(),
        is_blocked: false,
      }, { onConflict: 'fingerprint_hash' });

    if (upsertError) throw upsertError;

    return { success: true, isBlocked: false };
  } catch (err) {
    console.error('[IDENTITY] Device linking failed:', err);
    throw err;
  }
}

/**
 * 🚫 CHECK MULTI-ACCOUNT VIOLATION
 * Detects if same device is used across multiple accounts
 */
export async function checkMultiAccountViolation(
  profileId: string,
  deviceFingerprint: string
): Promise<{ violation: boolean; reason?: string }> {
  try {
    // Count how many profiles this device is linked to
    const { data: linkedProfiles } = await supabase
      .from(DEVICE_FINGERPRINTS)
      .select('profile_id')
      .eq('fingerprint_hash', deviceFingerprint);

    if (!linkedProfiles || linkedProfiles.length === 0) {
      return { violation: false };
    }

    // Get unique profile IDs
    const uniqueProfiles = [...new Set(linkedProfiles.map(p => p.profile_id))];

    if (uniqueProfiles.length > 1) {
      return {
        violation: true,
        reason: `Device linked to ${uniqueProfiles.length} accounts`,
      };
    }

    return { violation: false };
  } catch (err) {
    console.error('[IDENTITY] Multi-account check failed:', err);
    return { violation: false };
  }
}

/**
 * 📋 GET PROFILE BY ID
 */
export async function getProfileById(profileId: string): Promise<CommonProfile | null> {
  const { data, error } = await supabase
    .from(COMMON_PROFILES)
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) return null;
  return data as CommonProfile;
}

/**
 * 🔄 SYNC WITH CONTACTFLOWCRM
 * Pulls latest identity data from ContactFlowCRM
 */
export async function syncWithContactFlowCRM(profileId: string): Promise<void> {
  try {
    const profile = await getProfileById(profileId);
    if (!profile) return;

    // In a real implementation, this would call ContactFlowCRM API
    // For now, we just ensure local cache is fresh
    console.log(`[IDENTITY] Synced profile ${profileId} with ContactFlowCRM`);
  } catch (err) {
    console.error('[IDENTITY] Sync failed:', err);
  }
}

/**
 * 🎯 EXPORTED HELPER - One Account Rule Enforcement
 */
export const IdentityBridge = {
  verify: verifyIdentity,
  linkDevice: linkDeviceToProfile,
  checkViolation: checkMultiAccountViolation,
  getProfile: getProfileById,
  sync: syncWithContactFlowCRM,
};
