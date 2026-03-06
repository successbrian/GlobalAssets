/**
 * NOVUSFERRE - SATOSHI GHOST
 * The Gossip Protocol - Flirty Tabloid Notifications
 * 
 * "The whispers you can't ignore."
 * 
 * GHOST HEARTBEAT: SLOW_BURN mode
 * - Fires randomly every 12-24 hours
 * - Multi-site enabled (Global Shoutout Board)
 */

import { 
  GhostNotification, 
  GhostMessage,
  NOTIFICATION_TYPE,
  CONSTANTS,
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

interface GhostTone {
  flirty: string[];
  tabloid: string[];
  cheeky: string[];
  urgent: string[];
  slow_drip: string[];
}

interface GhostHeartbeatConfig {
  mode: 'SLOW_BURN' | 'ACTIVE' | 'SILENT';
  minIntervalHours: number;
  maxIntervalHours: number;
  lastFiredAt: string | null;
  nextFireWindow: string | null;
}

interface NotificationResult {
  success: boolean;
  notification_id?: string;
  error?: string;
}

interface MultiSitePayload {
  ghost_id: string;
  content: string;
  tone: string;
  sites: string[]; // Array of site IDs to broadcast to
  fired_at: string;
}

// ============================================
// STAGE-SPECIFIC GHOST MESSAGES (NEW)
// ============================================

const STAGE_VAULT = {
  stage_start: [
    "🎤 The Novusferre Stage is wide open tonight! [CREATOR] just hopped on for FREE, but the crowd is making them rich with gifts. Who's next?",
    "🔥 HOT STAGE ALERT: [CREATOR] just went live! No cover charge, but the Heat Meter is already turning red. Get in here!",
    "💸 FREE ENTRY but expensive vibes - [CREATOR] is performing NOW and the gifts are raining down!",
    "🎪 The circus is in town! [CREATOR] just hit the stage. Come see what all the fuss is about!",
  ],
  stage_heat: [
    "🌡️ I see a lot of 'Free' streams tonight, but only [CREATOR] has the 'Heat Meter' in the red. The audience knows who the real star is. 🔥",
    "🔥 BURNING UP: [CREATOR]'s heat meter just hit [HEAT]%. This is getting spicy!",
    "💰 Someone just sent [GIFT] to [CREATOR]! The crowd is losing their minds!",
    "🎯 [CREATOR] is dominating the Hot or Not board tonight. Bow down, peasants!",
  ],
  stage_action: [
    "⚡ ACTION on the Stage! [CREATOR] just got [GIFT_COUNT] gifts in [TIME] minutes. The algorithm is trembling!",
    "🚀 The Stage is ON FIRE tonight! [CREATOR] just jumped to #1 on the leaderboard. Can anyone catch them?",
    "💎 Only [CREATOR] could turn a 'Free Entry' night into a jackpot. The gifts keep coming!",
    "🌟 I've been watching stages for centuries, and [CREATOR]? They've got THE IT factor tonight.",
  ],
  voting_boost: [
    "📢 [USER] just voted for [CREATOR]! Every vote counts in the Hot or Not rankings!",
    "🗳️ The people have spoken! [CREATOR] is climbing the ranks thanks to YOUR votes!",
    "💪 Support your favorites! [USER] dropped a vote on [CREATOR]. Join the movement!",
  ],
  end_of_stream: [
    "📴 That's a wrap! [CREATOR]'s stage just ended with [VOTES] votes and [GIFTS] in gifts. What a show!",
    "🌙 [CREATOR] has left the building! The Stage will remember tonight's performance.",
    "🎭 And scene! [CREATOR] signed off with a bang. See you next time, superstar!",
  ],
};

// ============================================
// GHOST CONTENT LIBRARY
// ============================================

const GHOST_VAULT: GhostTone = {
  flirty: [
    "Someone's feeling generous tonight... 💋",
    "Ooh la la! Hot stuff coming through!",
    "The vibes are immaculate and the credits are flowing!",
    "Feeling naughty? We approve. 😏",
    "Your wallet can't handle this heat! 🔥",
    "That's how you make an entrance!",
    "Someone's about to have a very good night...",
    "The Empire loves a bold move!",
  ],
  tabloid: [
    "EXCLUSIVE: Big spender alert!",
    "Sources say... someone's making moves!",
    "Breaking: Love is in the air (and in the credits)!",
    "The rumor mill is spinning!",
    "Insiders report major activity!",
    "Word on the street is... 🔥",
    "Hollywood could never!",
  ],
  cheeky: [
    "Did someone say 'treat yourself'? We heard you!",
    "Your bank account is crying but your followers are cheering!",
    "Spending like there's no tomorrow!",
    "Living dangerously on the edge!",
    "The Empire loves a bold move!",
    "No regrets, just vibes!",
    "Go off, queen! 👑",
  ],
  urgent: [
    "48 HOURS to save your reputation!",
    "The clock is ticking... 👀",
    "Final warning from the Backstage Lounge!",
    "Time's almost up, darling!",
    "Don't say we didn't warn you!",
    "Your 14 days are almost up!",
  ],
  // SLOW BURN: Mystery mix for low-traffic launch
  slow_drip: [
    "I've been peeking Backstage... Someone is looking dangerous today. Is anyone bold enough to bring them to the Main Stage?",
    "Just watched a Face-Off that was so close it nearly crashed the jitter engine. Someone's coming for the crown. 👑",
    "The Backstage Lounge is getting crowded. I count 40 hot souls waiting for their moment. Who's going to be the first 'Citizen' to unlock the gates?",
    "Quiet night? Not Backstage. I just saw a 'Naughty Gift' fly past that would make a sailor blush. 💋",
    "Word is... a certain someone hit the floor today. 14 days to reconsider everything. 😈",
    "The ghosts are restless tonight. Someone's about to make a very expensive mistake... or a very smart one.",
    "I've seen things... private things. The Backstage keeps secrets, but I don't. 💫",
    "New energy detected on the grid. Someone's waking up the algorithm. Sleepers, beware! 🌙",
    "The Empire never sleeps, and neither do I. Tonight's whisper: someone's portfolio is about to explode. 📈",
    "Beauty is in the eye of the beholder, but tonight? Tonight, everyone's eyes are on the same person.",
  ],
};

// ============================================
// GHOST NOTIFICATION ENGINE
// ============================================

export class SatoshiGhost {
  private db: Database;
  private readonly LAB_ACCOUNT = CONSTANTS.BRIAN_LAB_ACCOUNT;
  private heartbeatConfig: GhostHeartbeatConfig;

  constructor(db: Database) {
    this.db = db;
    // SLOW_BURN mode: Random 12-24 hour intervals
    this.heartbeatConfig = {
      mode: 'SLOW_BURN',
      minIntervalHours: 12,
      maxIntervalHours: 24,
      lastFiredAt: null,
      nextFireWindow: null,
    };
  }

  // ============================================
  // GHOST HEARTBEAT (SLOW_BURN MODE)
  // ============================================

  /**
   * Check if it's time for Ghost Heartbeat
   * Returns true if should fire (random 12-24h window)
   */
  async shouldFireHeartbeat(): Promise<boolean> {
    if (this.heartbeatConfig.mode === 'SILENT') {
      return false;
    }

    const now = new Date().toISOString();

    // First fire always allowed
    if (!this.heartbeatConfig.lastFiredAt) {
      return true;
    }

    // Check if we're in the fire window
    if (this.heartbeatConfig.nextFireWindow) {
      const windowStart = new Date(this.heartbeatConfig.nextFireWindow);
      const nowDate = new Date();
      
      if (nowDate >= windowStart) {
        // Reset for next cycle
        this.heartbeatConfig.lastFiredAt = now;
        this.heartbeatConfig.nextFireWindow = null;
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate next fire window (12-24 hours randomly)
   */
  private calculateNextFireWindow(): string {
    const hoursToWait = Math.floor(
      Math.random() * (this.heartbeatConfig.maxIntervalHours - this.heartbeatConfig.minIntervalHours + 1)
    ) + this.heartbeatConfig.minIntervalHours;
    
    const nextWindow = new Date(Date.now() + hoursToWait * 60 * 60 * 1000);
    return nextWindow.toISOString();
  }

  /**
   * Execute Slow Burn Heartbeat
   * Posts mystery content to Global Shoutout Board (multi-site)
   */
  async executeHeartbeat(): Promise<{
    success: boolean;
    content?: string;
    sites_broadcast?: string[];
    error?: string;
  }> {
    try {
      // Pick random SLOW_DRIP content
      const templates = GHOST_VAULT.slow_drip;
      const content = templates[Math.floor(Math.random() * templates.length)];

      // Multi-site broadcast payload
      const payload: MultiSitePayload = {
        ghost_id: crypto.randomUUID(),
        content: `SatoshiGhost: ${content}`,
        tone: 'slow_drip',
        sites: ['civitas', 'vextor', 'novus', 'global'], // Empire sites
        fired_at: new Date().toISOString(),
      };

      // Broadcast to Global Shoutout Board (multi-site enabled)
      await this.db.table('global_shoutouts').insert({
        id: payload.ghost_id,
        content: payload.content,
        tone: payload.tone,
        source: 'satoshi_ghost',
        sites_targeted: JSON.stringify(payload.sites),
        is_public: true,
        created_at: payload.fired_at,
      });

      // Also post to individual site ghost_notifications
      for (const site of payload.sites) {
        await this.db.table(`${site}_ghost_notifications`).insert({
          id: payload.ghost_id,
          content: payload.content,
          tone: payload.tone,
          is_public: true,
          created_at: payload.fired_at,
        });
      }

      // Update heartbeat config
      this.heartbeatConfig.lastFiredAt = payload.fired_at;
      this.heartbeatConfig.nextFireWindow = this.calculateNextFireWindow();

      return {
        success: true,
        content: payload.content,
        sites_broadcast: payload.sites,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get heartbeat status
   */
  getHeartbeatStatus(): GhostHeartbeatConfig & {
    hoursUntilNextWindow: number | null;
    templatePoolSize: number;
  } {
    let hoursUntilNext: number | null = null;

    if (this.heartbeatConfig.nextFireWindow) {
      const windowStart = new Date(this.heartbeatConfig.nextFireWindow).getTime();
      const now = Date.now();
      hoursUntilNext = Math.max(0, Math.ceil((windowStart - now) / (1000 * 60 * 60)));
    }

    return {
      ...this.heartbeatConfig,
      hoursUntilNextWindow: hoursUntilNext,
      templatePoolSize: GHOST_VAULT.slow_drip.length,
    };
  }

  // ============================================
  // CRM TRIGGER: GRAND ENTRY
  // ============================================

  /**
   * Trigger Grand Entry Ghost post when creator is approved
   * Called from OnboardingService.approveCreator()
   */
  async announceGrandEntry(
    creatorName: string,
    creatorId: string
  ): Promise<NotificationResult> {
    const content = `GOSSIP ALERT: ${creatorName} has officially left the Backstage Lounge. The Market is OPEN. Who's making the first move? 💰💰💰`;
    
    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.BATTLE_RESULT, // Reusing for visibility
      title: "👑 GRAND ENTRY 👑",
      content: content,
      tone: 'tabloid',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      tone: notification.tone,
      target_audience: notification.target_audience,
      is_public: notification.is_public,
      created_at: notification.created_at,
    });

    // Also announce to Global Shoutout Board
    await this.db.table('global_shoutouts').insert({
      id: notification.id,
      content: notification.content,
      tone: notification.tone,
      source: 'satoshi_ghost_grand_entry',
      sites_targeted: JSON.stringify(['civitas', 'vextor', 'novus', 'global']),
      is_public: true,
      created_at: notification.created_at,
    });

    return { success: true, notification_id: notification.id };
  }

  // ============================================
  // STANDARD GHOST NOTIFICATIONS
  // ============================================

  /**
   * Announce high-value gift (Naughty Gift)
   */
  async announceNaughtyGift(
    senderName: string,
    recipientName: string,
    amount: number,
    isLabTransaction: boolean = false
  ): Promise<NotificationResult> {
    // Muzzle Lab transactions
    if (isLabTransaction) {
      return { success: true };
    }

    const tone = GHOST_VAULT.flirty[Math.floor(Math.random() * GHOST_VAULT.flirty.length)];
    const content = `${tone}\n\n${senderName} just sent ${recipientName} a steamy ${amount} Credit gift! 💋`;

    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.GIFT_SENT,
      title: "💋 Naughty Gift Alert!",
      content: content,
      tone: 'flirty',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      tone: notification.tone,
      target_audience: notification.target_audience,
      is_public: notification.is_public,
      created_at: notification.created_at,
    });

    return { success: true, notification_id: notification.id };
  }

  /**
   * Announce battle winner (Daily Face-Off)
   */
  async announceBattleResult(
    winnerName: string,
    loserName: string,
    votesWinner: number,
    votesLoser: number
  ): Promise<NotificationResult> {
    const tone = GHOST_VAULT.tabloid[Math.floor(Math.random() * GHOST_VAULT.tabloid.length)];
    const content = `${tone}\n\n${winnerName} DOMINATED with ${votesWinner} votes vs ${loserName}'s ${votesLoser}!`;

    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.BATTLE_RESULT,
      title: "🏆 Daily Face-Off Results!",
      content: content,
      tone: 'tabloid',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      tone: notification.tone,
      target_audience: notification.target_audience,
      is_public: notification.is_public,
      created_at: notification.created_at,
    });

    return { success: true, notification_id: notification.id };
  }

  /**
   * Send purge warning (48 hours)
   */
  async sendPurgeWarning(
    userId: string, 
    userName: string, 
    hoursRemaining: number
  ): Promise<NotificationResult> {
    const tone = GHOST_VAULT.urgent[Math.floor(Math.random() * GHOST_VAULT.urgent.length)];
    const content = `${tone}\n\n${userName}, you have ${hoursRemaining} hours before the 14-day purge!`;

    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.PURGE_WARNING,
      title: "⏰ Backstage Warning!",
      content: content,
      tone: 'urgent',
      target_audience: 'specific_user',
      specific_user_id: userId,
      is_public: false,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      tone: notification.tone,
      target_audience: notification.target_audience,
      specific_user_id: notification.specific_user_id,
      is_public: notification.is_public,
      created_at: notification.created_at,
    });

    // Send as personal message
    await this.db.table('ghost_messages').insert({
      id: crypto.randomUUID(),
      notification_id: notification.id,
      recipient_id: userId,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return { success: true, notification_id: notification.id };
  }

  /**
   * Announce purge execution
   */
  async announcePurgeExecution(userName: string): Promise<NotificationResult> {
    const tone = GHOST_VAULT.cheeky[Math.floor(Math.random() * GHOST_VAULT.cheeky.length)];
    const content = `${tone}\n\n${userName} has been moved to the Backstage Lounge. Out of sight, never forgotten! 👋`;

    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.PURGE_EXECUTED,
      title: "👋 Bye Bye!",
      content: content,
      tone: 'cheeky',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      tone: notification.tone,
      target_audience: notification.target_audience,
      is_public: notification.is_public,
      created_at: notification.created_at,
    });

    return { success: true, notification_id: notification.id };
  }

  /**
   * Announce market spike
   */
  async announceMarketSpike(userName: string, percentage: number): Promise<NotificationResult> {
    const tone = GHOST_VAULT.tabloid[Math.floor(Math.random() * GHOST_VAULT.tabloid.length)];
    const content = `${tone}\n\n${userName}'s market just spiked by ${percentage}%! Buy low, baby! 📈`;

    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.MARKET_SPIKE,
      title: "📈 Someone's Getting Popular!",
      content: content,
      tone: 'tabloid',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      tone: notification.tone,
      target_audience: notification.target_audience,
      is_public: notification.is_public,
      created_at: notification.created_at,
    });

    return { success: true, notification_id: notification.id };
  }

  /**
   * Announce Backstage count
   */
  async announceBackstageCount(count: number): Promise<NotificationResult> {
    const content = `The Backstage Lounge is getting crowded. I count ${count} hot souls waiting for their moment. Who's going to be the first 'Citizen' to unlock the gates? 💫`;

    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.PURGE_WARNING,
      title: "🎭 Backstage Watch",
      content: content,
      tone: 'slow_drip',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      tone: notification.tone,
      target_audience: notification.target_audience,
      is_public: notification.is_public,
      created_at: notification.created_at,
    });

    return { success: true, notification_id: notification.id };
  }

  // ============================================
  // QUERY METHODS
  // ============================================

  /**
   * Get notifications for user
   */
  async getUserNotifications(userId: string, limit: number = 20): Promise<GhostMessage[]> {
    return await this.db.table('ghost_messages')
      .where('recipient_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .select('*');
  }

  /**
   * Get public feed
   */
  async getPublicFeed(limit: number = 20): Promise<GhostNotification[]> {
    return await this.db.table('ghost_notifications')
      .where('is_public', true)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .select('*');
  }

  /**
   * Get Global Shoutout Board (multi-site)
   */
  async getGlobalShoutouts(limit: number = 20): Promise<any[]> {
    return await this.db.table('global_shoutouts')
      .where('is_public', true)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .select('*');
  }

  /**
   * Mark notification as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await this.db.table('ghost_messages')
      .where('id', messageId)
      .update({ is_read: true });
  }

  /**
   * Check if should be muffled (Lab transactions)
   */
  shouldMuffle(userId: string): boolean {
    return userId === this.LAB_ACCOUNT;
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  /**
   * Set Ghost mode
   */
  setMode(mode: 'SLOW_BURN' | 'ACTIVE' | 'SILENT'): void {
    this.heartbeatConfig.mode = mode;
    
    if (mode === 'ACTIVE') {
      this.heartbeatConfig.minIntervalHours = 1;
      this.heartbeatConfig.maxIntervalHours = 4;
    } else if (mode === 'SILENT') {
      this.heartbeatConfig.nextFireWindow = null;
    } else {
      // SLOW_BURN
      this.heartbeatConfig.minIntervalHours = 12;
      this.heartbeatConfig.maxIntervalHours = 24;
    }
  }

  // ============================================
  // STAGE ANNOUNCEMENTS (NEW)
  // ============================================

  /**
   * Announce when a creator starts a live stage (FREE ENTRY)
   */
  async announceStageStart(creatorName: string): Promise<NotificationResult> {
    const template = STAGE_VAULT.stage_start[Math.floor(Math.random() * STAGE_VAULT.stage_start.length)];
    const content = template.replace('[CREATOR]', creatorName);
    
    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.STAGE_START,
      title: "🎤 LIVE NOW!",
      content: content,
      tone: 'tabloid',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert(notification);
    return { success: true, notification_id: notification.id };
  }

  /**
   * Announce stage heat level update
   */
  async announceStageHeat(creatorName: string, heatLevel: number, giftName?: string): Promise<NotificationResult> {
    let template: string;
    if (giftName) {
      template = STAGE_VAULT.stage_heat[Math.floor(Math.random() * STAGE_VAULT.stage_heat.length)];
      template = template.replace('[CREATOR]', creatorName).replace('[GIFT]', giftName);
    } else {
      template = STAGE_VAULT.stage_heat[Math.floor(Math.random() * STAGE_VAULT.stage_heat.length)];
      template = template.replace('[CREATOR]', creatorName).replace('[HEAT]', `${heatLevel.toFixed(0)}`);
    }
    
    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.STAGE_HEAT,
      title: heatLevel > 70 ? "🔥 ON FIRE!" : "🌡️ HEATING UP",
      content: template,
      tone: 'tabloid',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert(notification);
    return { success: true, notification_id: notification.id };
  }

  /**
   * Announce stage action (gifts flooding in)
   */
  async announceStageAction(creatorName: string, giftCount: number): Promise<NotificationResult> {
    const template = STAGE_VAULT.stage_action[Math.floor(Math.random() * STAGE_VAULT.stage_action.length)];
    const content = template.replace('[CREATOR]', creatorName).replace('[GIFT_COUNT]', `${giftCount}`);
    
    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.STAGE_ACTION,
      title: "⚡ STAGE ALERT",
      content: content,
      tone: 'tabloid',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert(notification);
    return { success: true, notification_id: notification.id };
  }

  /**
   * Announce vote (Hot or Not)
   */
  async announceVote(userName: string, creatorName: string): Promise<NotificationResult> {
    const template = STAGE_VAULT.voting_boost[Math.floor(Math.random() * STAGE_VAULT.voting_boost.length)];
    const content = template.replace('[USER]', userName).replace('[CREATOR]', creatorName);
    
    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.VOTE,
      title: "🗳️ VOTE CAST!",
      content: content,
      tone: 'cheeky',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert(notification);
    return { success: true, notification_id: notification.id };
  }

  /**
   * Announce stage ended
   */
  async announceStageEnd(creatorName: string, votes: number, giftRevenue: number): Promise<NotificationResult> {
    const template = STAGE_VAULT.end_of_stream[Math.floor(Math.random() * STAGE_VAULT.end_of_stream.length)];
    const content = template.replace('[CREATOR]', creatorName)
      .replace('[VOTES]', `${votes}`)
      .replace('[GIFTS]', `${giftRevenue.toFixed(2)}`);
    
    const notification: GhostNotification = {
      id: crypto.randomUUID(),
      type: NOTIFICATION_TYPE.STAGE_END,
      title: "📴 STAGE CLOSED",
      content: content,
      tone: 'tabloid',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    };

    await this.db.table('ghost_notifications').insert(notification);
    return { success: true, notification_id: notification.id };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let satoshiGhostInstance: SatoshiGhost | null = null;

export function getSatoshiGhost(db: Database): SatoshiGhost {
  if (!satoshiGhostInstance) {
    satoshiGhostInstance = new SatoshiGhost(db);
  }
  return satoshiGhostInstance;
}

export { GhostTone, NotificationResult, GhostHeartbeatConfig, MultiSitePayload, GHOST_VAULT };
