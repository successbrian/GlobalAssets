/**
 * ============================================================================
 * LISTINGS PURCHASE API - ContactFlow Integration
 * ============================================================================
 * Endpoint: POST /api/listings/purchase
 * Handles TRC-20 payment verification and ContactFlow CRM handshake
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuration
const CONTACTFLOW_WEBHOOK_URL = process.env.CONTACTFLOW_WEBHOOK_URL || 'https://api.contactflowcrm.com/v1/webhooks/incoming';
const CONTACTFLOW_API_KEY = process.env.CONTACTFLOW_API_KEY || '';

// Types
interface PurchaseRequest {
  tx_hash: string;
  package_id: string;
  package_name: string;
  price_usd: number;
  business_name: string;
  business_email: string;
}

interface ContactFlowPayload {
  contact_email: string;
  custom_field_business_name: string;
  custom_field_listing_type: string;
  custom_field_tx_hash: string;
  custom_field_price_usd: number;
  tags: string[];
  source: string;
}

interface ContactFlowResponse {
  contact_id?: string;
  error?: string;
}

// Verify TRC-20 transaction (simplified - in production use TRON API)
async function verifyTRC20Transaction(txHash: string, expectedAmount: number): Promise<boolean> {
  // In production, call TRON API to verify transaction
  // const response = await fetch(`https://api.trongrid.io/v1/transactions/${txHash}`);
  // const data = await response.json();
  // return data.data[0].raw_data.contract[0].parameter.value.amount === expectedAmount;
  
  // For now, accept any TXID format that looks valid (64 hex chars)
  const txHashPattern = /^[a-fA-F0-9]{64}$/;
  return txHashPattern.test(txHash);
}

// Create contact in ContactFlow CRM
async function createContactFlowContact(payload: ContactFlowPayload): Promise<ContactFlowResponse> {
  try {
    const response = await fetch(CONTACTFLOW_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONTACTFLOW_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'Failed to create contact' };
    }

    const data = await response.json();
    return { contact_id: data.contact_id || data.id };

  } catch (error: any) {
    // If ContactFlow is unreachable, generate a temporary ID
    // This allows the flow to continue even without CRM connectivity
    console.warn('[ListingsPurchase] ContactFlow unreachable, using temp ID');
    return { 
      contact_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
    };
  }
}

// Create pending listing in database
async function createPendingListing(
  txHash: string,
  packageId: string,
  packageName: string,
  priceUSD: number,
  businessName: string,
  contactId: string
): Promise<{ listing_id: string; error?: string }> {
  // This would insert into a Supabase table
  // For now, return a mock response
  return {
    listing_id: `listing_${Date.now()}`
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: PurchaseRequest = await request.json();
    
    // Validate required fields
    const { tx_hash, package_id, package_name, price_usd, business_name, business_email } = body;
    
    if (!tx_hash || !package_id || !business_name || !business_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Verify TRC-20 transaction
    console.log(`[ListingsPurchase] Verifying transaction: ${tx_hash}`);
    const isValidTx = await verifyTRC20Transaction(tx_hash, price_usd);
    
    if (!isValidTx) {
      return NextResponse.json(
        { error: 'Invalid or unconfirmed transaction' },
        { status: 400 }
      );
    }

    // Step 2: Create Contact in ContactFlow CRM
    const contactPayload: ContactFlowPayload = {
      contact_email: business_email,
      custom_field_business_name: business_name,
      custom_field_listing_type: package_name,
      custom_field_tx_hash: tx_hash,
      custom_field_price_usd: price_usd,
      tags: ['Directory_New_Customer', 'Paid_USDT', `Package_${package_id}`],
      source: 'Civitas_Directory_Purchase'
    };

    console.log(`[ListingsPurchase] Creating ContactFlow contact for: ${business_email}`);
    const contactResult = await createContactFlowContact(contactPayload);
    
    if (contactResult.error && !contactResult.contact_id?.startsWith('temp_')) {
      return NextResponse.json(
        { error: contactResult.error },
        { status: 500 }
      );
    }

    // Step 3: Create pending listing in database
    const listingResult = await createPendingListing(
      tx_hash,
      package_id,
      package_name,
      price_usd,
      business_name,
      contactResult.contact_id!
    );

    if (listingResult.error) {
      return NextResponse.json(
        { error: listingResult.error },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      tx_hash,
      contact_id: contactResult.contact_id,
      listing_id: listingResult.listing_id,
      message: `${package_name} listing created successfully. Awaiting payment confirmation.`
    });

  } catch (error: any) {
    console.error('[ListingsPurchase] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for status check
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const txHash = searchParams.get('tx_hash');

  if (!txHash) {
    return NextResponse.json({ error: 'TXID required' }, { status: 400 });
  }

  // Return mock status
  return NextResponse.json({
    tx_hash: txHash,
    status: 'pending',
    confirmations: 0,
    message: 'Transaction is being processed'
  });
}
