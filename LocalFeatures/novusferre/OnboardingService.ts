/**
 * NOVUSFERRE - ONBOARDING SERVICE
 * CRM Gatekeeper & User Registration
 * 
 * "Trust. Iron. Empire."
 */

import { 
  User, 
  WALLET_TYPE, 
  GENDER_PREFERENCE,
  CONSTANTS,
  OnboardingAgreement,
  CRMContact,
} from './novusferreTypes';

// ============================================
// DATABASE INTERFACE
// ============================================

interface Database {
  table(name: string): {
    where(col: string, val: unknown): any;
    select(...cols: string[]): any;
    update(data: Record<string, unknown>): any;
    insert(data: Record<string, unknown>): any;
    first(): any;
    count(): Promise<number>;
  };
}

// ============================================
// TYPES
// ============================================

interface RegistrationData {
  email: string;
  wallet_type?: WALLET_TYPE;
  gender_preference?: GENDER_PREFERENCE;
  agreed_to_purge: boolean;
  agreed_to_lease: boolean;
}

interface RegistrationResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface AgentAssignment {
  agent_id: string;
  agent_name: string;
  penalty_applied: boolean;
  penalty_reason?: string;
}

// ============================================
// ONBOARDING SERVICE
// ============================================

export class OnboardingService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Register new user (CRM validated)
   */
  async registerUser(data: RegistrationData): Promise<RegistrationResult> {
    try {
      // Validate agreements
      if (!data.agreed_to_purge) {
        return { 
          success: false, 
          error: 'Must agree to 14-day Message Purge policy' 
        };
      }

      if (!data.agreed_to_lease) {
        return { 
          success: false, 
          error: 'Must agree to 90-day Lease policy' 
        };
      }

      // Check if email exists
      const existing = await this.db.table('users').where('email', data.email).first();
      if (existing) {
        return { success: false, error: 'Email already registered' };
      }

      // Create CRM contact
      const crmContact: CRMContact = {
        id: crypto.randomUUID(),
        email: data.email,
        first_name: '',
        last_name: '',
        phone: '',
        source: 'novusferre_signup',
        status: 'new',
        assigned_agent_id: null,
        created_at: new Date().toISOString(),
      };

      await this.db.table('crm_contacts').insert(crmContact);

      // Create user
      const user: User = {
        id: crypto.randomUUID(),
        email: data.email,
        wallet_type: data.wallet_type || WALLET_TYPE.STANDARD,
        wallet_balance: 0,
        credits_balance: 100, // Welcome bonus
        total_spent: 0,
        total_earned: 0,
        followers_count: 0,
        following_count: 0,
        is_verified: false,
        is_backstage: false,
        crm_contact_id: crmContact.id,
        agent_id: null,
        gender_preference: data.gender_preference || GENDER_PREFERENCE.ALL,
        platform_penalty: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await this.db.table('users').insert({
        id: user.id,
        email: user.email,
        wallet_type: user.wallet_type,
        wallet_balance: user.wallet_balance,
        credits_balance: user.credits_balance,
        total_spent: user.total_spent,
        total_earned: user.total_earned,
        followers_count: user.followers_count,
        following_count: user.following_count,
        is_verified: user.is_verified,
        is_backstage: user.is_backstage,
        crm_contact_id: user.crm_contact_id,
        agent_id: user.agent_id,
        gender_preference: user.gender_preference,
        platform_penalty: user.platform_penalty,
        created_at: user.created_at,
        updated_at: user.updated_at,
      });

      // Record agreement
      await this.db.table('onboarding_agreements').insert({
        user_id: user.id,
        agreed_to_purge: data.agreed_to_purge,
        agreed_to_lease: data.agreed_to_lease,
        agreed_to_backstage: false,
        signature: crypto.randomUUID(),
        agreed_at: new Date().toISOString(),
      });

      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Register new creator (starts in Backstage Lounge)
   */
  async registerCreator(
    data: RegistrationData & { 
      agent_id?: string;
      has_competing_platform_history?: boolean;
    }
  ): Promise<RegistrationResult> {
    try {
      // Validate agreements
      if (!data.agreed_to_purge || !data.agreed_to_lease) {
        return { 
          success: false, 
          error: 'Must agree to all platform policies' 
        };
      }

      // Check agent penalty
      let penalty = 0;
      if (data.has_competing_platform_history) {
        penalty = 15; // -15% volume penalty
      }

      // Register as user first
      const userResult = await this.registerUser({
        ...data,
        agreed_to_purge: true,
        agreed_to_lease: true,
      });

      if (!userResult.success) {
        return userResult;
      }

      // Move to Backstage Lounge
      await this.db.table('users')
        .where('id', userResult.user!.id)
        .update({
          is_backstage: true,
          agent_id: data.agent_id || null,
          platform_penalty: penalty,
        });

      // Update agreement to include backstage
      await this.db.table('onboarding_agreements')
        .where('user_id', userResult.user!.id)
        .update({ agreed_to_backstage: true });

      // Apply Type B discount if specified
      if (data.wallet_type === WALLET_TYPE.RESTRICTED) {
        await this.db.table('wallets')
          .where('user_id', userResult.user!.id)
          .update({ balance_credits: 200 }); // Type B bonus
      }

      return {
        success: true,
        user: {
          ...userResult.user!,
          is_backstage: true,
          agent_id: data.agent_id || null,
          platform_penalty: penalty,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Approve creator from Backstage to Public
   */
  async approveCreator(userId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.db.table('users').where('id', userId).first();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (!user.is_backstage) {
        return { success: false, error: 'Creator is not in Backstage Lounge' };
      }

      // Release from Backstage
      await this.db.table('users')
        .where('id', userId)
        .update({
          is_backstage: false,
          is_verified: true,
        });

      // Log approval
      await this.db.table('backstage_approvals').insert({
        user_id: userId,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get onboarding statistics
   */
  async getOnboardingStats(): Promise<{
    total_users: number;
    total_creators: number;
    backstage_count: number;
    approved_today: number;
    pending_approvals: number;
  }> {
    const totalUsers = await this.db.table('users').count();
    const creators = await this.db.table('users').where('agent_id', '!=', null).count();
    const backstage = await this.db.table('users').where('is_backstage', true).count();
    
    const today = new Date().toISOString().split('T')[0];
    const approvedToday = await this.db.table('backstage_approvals')
      .where('approved_at', 'like', `${today}%`)
      .count();

    return {
      total_users: totalUsers,
      total_creators: creators,
      backstage_count: backstage,
      approved_today: approvedToday,
      pending_approvals: backstage,
    };
  }

  /**
   * Check if user has competing platform penalty
   */
  async checkAgentPenalty(agentId: string): Promise<AgentAssignment> {
    const agent = await this.db.table('users').where('id', agentId).first();
    
    return {
      agent_id: agentId,
      agent_name: agent?.email || 'Unknown',
      penalty_applied: agent?.platform_penalty === 15,
      penalty_reason: agent?.platform_penalty === 15 
        ? 'History on competing platforms (Twitter/Instagram)' 
        : undefined,
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let onboardingServiceInstance: OnboardingService | null = null;

export function getOnboardingService(db: Database): OnboardingService {
  if (!onboardingServiceInstance) {
    onboardingServiceInstance = new OnboardingService(db);
  }
  return onboardingServiceInstance;
}

export { RegistrationData, RegistrationResult, AgentAssignment };
