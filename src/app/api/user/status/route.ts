/**
 * ============================================================================
 * USER STATUS API - Badge Verification Endpoint
 * ============================================================================
 * Endpoint: GET /api/user/status?wallet=[address]
 * Returns Civitas verification status for cross-site identity bridge
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

// Types
interface UserStatusResponse {
  wallet_address: string;
  is_citizen: boolean;
  is_landowner: boolean;
  is_founder: boolean;
  cvtr_balance: string;
  owned_properties: number;
  launched_projects: number;
  citizen_since: string | null;
  last_updated: string;
}

// Configuration
const CITIZEN_THRESHOLD = 1000; // 1,000 $CVTR required

/**
 * Get user status from database
 * In production, this would query actual database tables
 */
async function getUserStatus(walletAddress: string): Promise<UserStatusResponse> {
  // Mock data for demo - in production, query database
  // This would join: civitas_token_holders, civitas_assets_merchants, civitas_foundry_projects
  
  const mockDatabase: Record<string, UserStatusResponse> = {
    '0x1234567890abcdef': {
      wallet_address: '0x1234567890abcdef',
      is_citizen: true,
      is_landowner: true,
      is_founder: false,
      cvtr_balance: '2500.50',
      owned_properties: 3,
      launched_projects: 0,
      citizen_since: '2024-06-15',
      last_updated: new Date().toISOString()
    },
    '0xabcdef1234567890': {
      wallet_address: '0xabcdef1234567890',
      is_citizen: true,
      is_landowner: false,
      is_founder: true,
      cvtr_balance: '15000.00',
      owned_properties: 0,
      launched_projects: 2,
      citizen_since: '2024-01-10',
      last_updated: new Date().toISOString()
    }
  };

  // Return mock data or generate default
  const cached = mockDatabase[walletAddress.toLowerCase()];
  if (cached) {
    return cached;
  }

  // Default response for unknown wallets
  return {
    wallet_address: walletAddress,
    is_citizen: false,
    is_landowner: false,
    is_founder: false,
    cvtr_balance: '0',
    owned_properties: 0,
    launched_projects: 0,
    citizen_since: null,
    last_updated: new Date().toISOString()
  };
}

/**
 * GET /api/user/status
 * Query params: wallet (required)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('wallet');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 }
    );
  }

  // Validate wallet address format (basic check)
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return NextResponse.json(
      { error: 'Invalid wallet address format' },
      { status: 400 }
    );
  }

  try {
    console.log(`[UserStatus] Fetching status for: ${walletAddress.slice(0, 6)}...`);
    
    const status = await getUserStatus(walletAddress);
    
    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
    
  } catch (error) {
    console.error('[UserStatus] Error fetching status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/status
 * Batch fetch for multiple wallets
 */
export async function POST(request: NextRequest) {
  try {
    const { wallets } = await request.json();
    
    if (!Array.isArray(wallets) || wallets.length === 0) {
      return NextResponse.json(
        { error: 'Wallets array is required' },
        { status: 400 }
      );
    }

    // Limit batch size
    const limitedWallets = wallets.slice(0, 50);
    
    const results = await Promise.all(
      limitedWallets.map(async (wallet) => {
        const status = await getUserStatus(wallet);
        return { wallet, status };
      })
    );

    return NextResponse.json({ results });
    
  } catch (error) {
    console.error('[UserStatus] Batch fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
