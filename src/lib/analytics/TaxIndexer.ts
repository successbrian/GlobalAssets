/**
 * ============================================================================
 * THE TAX INDEXER - Truth Engine
 * ============================================================================
 * Monitors CivitasFeeSplitter contract events and indexes tax contributions
 * Maps tokens to projects and updates metrics in real-time
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';

// Types for FeeSplitter events
interface FeesReceivedEvent {
  token: string;
  amount: string;
  timestamp: number;
  blockNumber: number;
  transactionHash: string;
}

interface ProjectMetrics {
  id: string;
  project_id: string;
  project_name: string;
  project_symbol: string;
  project_logo: string;
  tax_contribution_24h: number;
  tax_contribution_total: number;
  volume_24h: number;
  rank_position: number;
  is_burning_hot: boolean;
  bond_locked_until: string | null;
}

interface TaxIndexerConfig {
  supabaseUrl: string;
  supabaseKey: string;
  feeSplitterAddress: string;
  rpcUrl: string;
  pollIntervalMs: number;
}

class TaxIndexer {
  private supabase: ReturnType<typeof createClient>;
  private config: TaxIndexerConfig;
  private isRunning: boolean = false;
  private lastBlockNumber: number = 0;
  private tokenToProjectCache: Map<string, string> = new Map();

  constructor(config: TaxIndexerConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  /**
   * Start the tax indexer background process
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[TaxIndexer] Already running');
      return;
    }

    console.log('[TaxIndexer] Starting truth engine...');
    this.isRunning = true;

    // Initialize token-to-project cache
    await this.refreshTokenProjectMapping();

    // Start polling for new events
    this.pollLoop();
  }

  /**
   * Stop the tax indexer
   */
  stop(): void {
    console.log('[TaxIndexer] Stopping truth engine...');
    this.isRunning = false;
  }

  /**
   * Main polling loop for FeeSplitter events
   */
  private async pollLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.scanForEvents();
        await this.recalculateRankings();
      } catch (error) {
        console.error('[TaxIndexer] Poll error:', error);
      }

      await this.sleep(this.config.pollIntervalMs);
    }
  }

  /**
   * Scan for new FeeSplitter events since last block
   */
  private async scanForEvents(): Promise<void> {
    const latestBlock = await this.getLatestBlockNumber();
    
    if (this.lastBlockNumber === 0) {
      this.lastBlockNumber = latestBlock - 100; // Start from recent blocks
    }

    // In production, use contract event filters
    // For now, simulate event polling
    const events = await this.simulateFeeReceivedEvents();
    
    for (const event of events) {
      if (event.blockNumber > this.lastBlockNumber) {
        await this.processTaxEvent(event);
      }
    }

    this.lastBlockNumber = latestBlock;
  }

  /**
   * Process a tax event - map token to project and record contribution
   */
  private async processTaxEvent(event: FeesReceivedEvent): Promise<void> {
    const projectId = await this.findProjectByToken(event.token);
    
    if (!projectId) {
      console.warn(`[TaxIndexer] Unknown token: ${event.token}`);
      return;
    }

    // Calculate tax amount (assuming 1% tribute)
    const taxAmount = parseFloat(event.amount) * 0.01;

    // Record the tax event
    const { error } = await this.supabase
      .from('civitas_tax_events')
      .insert({
        project_id: projectId,
        token_address: event.token,
        amount: parseFloat(event.amount),
        tax_amount: taxAmount,
        block_number: event.blockNumber,
        transaction_hash: event.transactionHash,
        event_type: 'fee_received'
      });

    if (error) {
      console.error('[TaxIndexer] Failed to record tax event:', error);
    } else {
      console.log(`[TaxIndexer] Recorded ${taxAmount} tax from project ${projectId}`);
    }
  }

  /**
   * Find project by token address
   */
  private async findProjectByToken(tokenAddress: string): Promise<string | null> {
    // Check cache first
    if (this.tokenToProjectCache.has(tokenAddress)) {
      return this.tokenToProjectCache.get(tokenAddress)!;
    }

    // Query database
    const { data, error } = await this.supabase
      .from('civitas_foundry_projects')
      .select('id')
      .eq('token_address', tokenAddress.toLowerCase())
      .single();

    if (error || !data) {
      return null;
    }

    this.tokenToProjectCache.set(tokenAddress, data.id);
    return data.id;
  }

  /**
   * Refresh token-to-project mapping cache
   */
  private async refreshTokenProjectMapping(): Promise<void> {
    const { data, error } = await this.supabase
      .from('civitas_foundry_projects')
      .select('id, token_address');

    if (error) {
      console.error('[TaxIndexer] Failed to refresh cache:', error);
      return;
    }

    for (const project of data) {
      if (project.token_address) {
        this.tokenToProjectCache.set(
          project.token_address.toLowerCase(),
          project.id
        );
      }
    }

    console.log(`[TaxIndexer] Cached ${data.length} project tokens`);
  }

  /**
   * Recalculate rankings and burning hot status
   */
  private async recalculateRankings(): Promise<void> {
    // Update 24h metrics
    await this.supabase.rpc('civitas_recalculate_24h_metrics');

    // Mark burning hot projects
    await this.supabase.rpc('civitas_mark_burning_hot');

    // Update rankings
    await this.supabase.rpc('civitas_update_rankings');
  }

  /**
   * Get latest block number from RPC
   */
  private async getLatestBlockNumber(): Promise<number> {
    // In production, call actual RPC
    return this.lastBlockNumber + 1;
  }

  /**
   * Simulate FeeSplitter events (replace with actual event filtering)
   */
  private async simulateFeeReceivedEvents(): Promise<FeesReceivedEvent[]> {
    // This would be replaced with actual contract event scanning
    // using ethers.js or viem contract filters
    
    // For demo, return empty array (no new events)
    return [];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get ranked projects for Radar UI
   */
  async getRankedProjects(): Promise<ProjectMetrics[]> {
    const { data, error } = await this.supabase
      .from('civitas_project_metrics')
      .select(`
        id,
        project_id,
        tax_contribution_24h,
        tax_contribution_total,
        volume_24h,
        rank_position,
        is_burning_hot,
        project:civitas_foundry_projects!project_id(
          name,
          symbol,
          logo_url,
          bond_locked_until
        )
      `)
      .order('tax_contribution_total', { ascending: false });

    if (error) {
      console.error('[TaxIndexer] Failed to get ranked projects:', error);
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      project_id: item.project_id,
      project_name: item.project?.name || 'Unknown',
      project_symbol: item.project?.symbol || '???',
      project_logo: item.project?.logo_url || '',
      tax_contribution_24h: item.tax_contribution_24h || 0,
      tax_contribution_total: item.tax_contribution_total || 0,
      volume_24h: item.volume_24h || 0,
      rank_position: item.rank_position || 0,
      is_burning_hot: item.is_burning_hot || false,
      bond_locked_until: item.project?.bond_locked_until || null
    }));
  }
}

// Export singleton factory
export function createTaxIndexer(config: TaxIndexerConfig): TaxIndexer {
  return new TaxIndexer(config);
}

// Export class for testing
export { TaxIndexer };

// Export types
export type { FeesReceivedEvent, ProjectMetrics, TaxIndexerConfig };
