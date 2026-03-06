// ============================================================================
// PET MARKET - "Tagged" Social Asset Logic
// ============================================================================
// Concept: Pets are Assets. They do NOT eat. Their value floats based on 
// Trading and Gifting. This is the "Tagged" style economy.
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (import from environment variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// TYPES
// ============================================================================

export interface Pet {
  id: string;
  user_id: string;
  pet_name: string;
  pet_type: string;
  xp_level: number;
  current_price: number;  // The "Tagged" price - floats with trades
  total_gifts_received: number;  // Social heat
  last_traded_at: string;
  created_at: string;
}

export interface PetTransaction {
  id: string;
  pet_id: string;
  from_user_id: string;
  to_user_id: string;
  transaction_type: 'buy' | 'gift';
  amount_paid: number;  // In DoughDiamonds or USD equivalent
  previous_price: number;
  new_price: number;
  treasury_tax: number;  // 5% goes to CIVITAS stakers
  created_at: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const BUYER_PREMIUM = 0.10;      // Buyer pays Current Price + 10%
const SELLER_PROFIT_MARGIN = 0.05; // Seller gets Previous Price + 5%
const TREASURY_TAX = 0.05;         // 5% to CIVITAS stakers
const GIFT_INFLATION_RATE = 0.50;  // Pet Value increases by 50% of Gift Cost

// ============================================================================
// BUYING A PET (Asset Flip)
// ============================================================================

export async function buyPet(petId: string, buyerId: string): Promise<{
  success: boolean;
  error?: string;
  newOwnerId?: string;
  newPrice?: number;
}> {
  try {
    // 1. Fetch the pet with current owner info
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (petError || !pet) {
      return { success: false, error: 'Pet not found' };
    }

    if (pet.user_id === buyerId) {
      return { success: false, error: 'You already own this pet' };
    }

    const previousPrice = pet.current_price || 0;
    
    // 2. Calculate the transaction economics
    const buyerPays = previousPrice * (1 + BUYER_PREMIUM);  // Current + 10%
    const sellerReceives = previousPrice * (1 + SELLER_PROFIT_MARGIN);  // Previous + 5%
    const treasuryTax = previousPrice * TREASURY_TAX;  // 5% to stakers
    const newPrice = buyerPays;  // Pet Value updates to NEW Sold Price

    // 3. Verify buyer has sufficient funds (DoughDiamonds or USD equivalent)
    const { data: buyer, error: buyerError } = await supabase
      .from('users')
      .select('dough_diamonds, universal_credits')
      .eq('id', buyerId)
      .single();

    if (buyerError || !buyer) {
      return { success: false, error: 'Buyer not found' };
    }

    const buyerCanAfford = buyer.dough_diamonds >= buyerPays || 
                          buyer.universal_credits >= buyerPays;
    
    if (!buyerCanAfford) {
      return { success: false, error: 'Insufficient funds to buy this pet' };
    }

    // 4. Execute the transaction - deduct from buyer
    const { error: deductError } = await supabase.rpc('deduct_user_balance', {
      user_id_input: buyerId,
      dough_diamonds_amount: buyerPays,
      universal_credits_amount: 0
    });

    if (deductError) {
      return { success: false, error: 'Failed to deduct payment' };
    }

    // 5. Transfer ownership
    const { error: transferError } = await supabase
      .from('pets')
      .update({
        user_id: buyerId,
        current_price: newPrice,
        last_traded_at: new Date().toISOString()
      })
      .eq('id', petId);

    if (transferError) {
      // Rollback - refund buyer
      await supabase.rpc('add_user_balance', {
        user_id_input: buyerId,
        dough_diamonds_amount: buyerPays,
        universal_credits_amount: 0
      });
      return { success: false, error: 'Transfer failed - payment refunded' };
    }

    // 6. Record the transaction
    const { error: txError } = await supabase
      .from('pet_transactions')
      .insert({
        pet_id: petId,
        from_user_id: pet.user_id,
        to_user_id: buyerId,
        transaction_type: 'buy',
        amount_paid: buyerPays,
        previous_price: previousPrice,
        new_price: newPrice,
        treasury_tax: treasuryTax
      });

    if (txError) {
      console.error('Failed to record transaction:', txError);
    }

    // 7. Notify Universal Inbox
    await supabase.from('universal_inbox').insert({
      user_id: buyerId,
      sender_id: 'system',
      origin_app: 'DoughDiamonds',
      message_type: 'system',
      subject: 'Pet Acquired!',
      body: `You now own ${pet.pet_name} for ${buyerPays} credits. Its market value is now ${newPrice}.`
    });

    return {
      success: true,
      newOwnerId: buyerId,
      newPrice: newPrice
    };

  } catch (err) {
    console.error('Buy pet error:', err);
    return { success: false, error: 'Unexpected error during purchase' };
  }
}

// ============================================================================
// GIFTING A PET (Social Heat - Closed Loop)
// ============================================================================
// CRITICAL: Gifts must be purchased with Universal Credits (Real Money IN).
// This drives real asset value up, not in-game currency.
// ============================================================================

export async function giftPet(petId: string, giftorId: string, giftCostCredits: number): Promise<{
  success: boolean;
  error?: string;
  newPetValue?: number;
}> {
  try {
    // 1. Fetch the pet
    const { data: pet, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single();

    if (petError || !pet) {
      return { success: false, error: 'Pet not found' };
    }

    const previousPrice = pet.current_price || 0;

    // 2. Calculate the social inflation (50% of Credit Cost = Real Money In)
    const valueIncrease = giftCostCredits * GIFT_INFLATION_RATE;
    const newPrice = previousPrice + valueIncrease;

    // 3. CRITICAL: Verify giftor has sufficient UNIVERSAL CREDITS (not DoughDiamonds)
    // This enforces the "Closed Loop" rule: Real Money IN = Real Asset Value UP
    const { data: giftor, error: giftorError } = await supabase
      .from('users')
      .select('universal_credits')
      .eq('id', giftorId)
      .single();

    if (giftorError || !giftor) {
      return { success: false, error: 'Giftor not found' };
    }

    if (giftor.universal_credits < giftCostCredits) {
      return { success: false, error: 'Insufficient Universal Credits for gift' };
    }

    // 4. Deduct Universal Credits from giftor (Real Money IN)
    const { error: deductError } = await supabase.rpc('deduct_user_balance', {
      user_id_input: giftorId,
      dough_diamonds_amount: 0,  // NOT DoughDiamonds!
      universal_credits_amount: giftCostCredits  // REAL MONEY
    });

    if (deductError) {
      return { success: false, error: 'Failed to deduct Universal Credits' };
    }

    // 5. Update pet value (Real Asset Value UP)
    const { error: updateError } = await supabase
      .from('pets')
      .update({
        current_price: newPrice,
        total_gifts_received: (pet.total_gifts_received || 0) + giftCostCredits
      })
      .eq('id', petId);

    if (updateError) {
      // Rollback
      await supabase.rpc('add_user_balance', {
        user_id_input: giftorId,
        dough_diamonds_amount: 0,
        universal_credits_amount: giftCostCredits
      });
      return { success: false, error: 'Failed to update pet value - gift refunded' };
    }

    // 6. Record the gift transaction
    const { error: txError } = await supabase
      .from('pet_transactions')
      .insert({
        pet_id: petId,
        from_user_id: giftorId,
        to_user_id: pet.user_id,  // Gift goes to current owner
        transaction_type: 'gift',
        amount_paid: giftCostCredits,
        previous_price: previousPrice,
        new_price: newPrice,
        treasury_tax: 0  // No tax on gifts - pure social inflation
      });

    if (txError) {
      console.error('Failed to record gift:', txError);
    }

    // 7. Notify both parties
    await supabase.from('universal_inbox').insert([
      {
        user_id: giftorId,
        sender_id: 'system',
        origin_app: 'DoughDiamonds',
        message_type: 'social',
        subject: 'Gift Sent!',
        body: `You gifted ${pet.pet_name} with ${giftCostCredits} Universal Credits. Its value rose to ${newPrice}!`
      },
      {
        user_id: pet.user_id,
        sender_id: giftorId,
        origin_app: 'DoughDiamonds',
        message_type: 'social',
        subject: 'You Received a Gift!',
        body: `Someone gifted your ${pet.pet_name} with ${giftCostCredits} Universal Credits! Its value is now ${newPrice}.`
      }
    ]);

    return {
      success: true,
      newPetValue: newPrice
    };

  } catch (err) {
    console.error('Gift pet error:', err);
    return { success: false, error: 'Unexpected error during gifting' };
  }
}

// ============================================================================
// MARKET STATISTICS
// ============================================================================

export async function getPetMarketStats(): Promise<{
  totalPetsListed: number;
  totalTradingVolume: number;
  averagePetValue: number;
  topGainerPets: Pet[];
}> {
  // Get all pets with current prices
  const { data: pets } = await supabase
    .from('pets')
    .select('*')
    .order('current_price', { ascending: false });

  // Get all transactions for volume
  const { data: transactions } = await supabase
    .from('pet_transactions')
    .select('amount_paid');

  const totalPetsListed = pets?.length || 0;
  const totalTradingVolume = transactions?.reduce((sum, tx) => sum + tx.amount_paid, 0) || 0;
  const averagePetValue = pets?.length 
    ? pets.reduce((sum, p) => sum + (p.current_price || 0), 0) / pets.length 
    : 0;

  return {
    totalPetsListed,
    totalTradingVolume,
    averagePetValue,
    topGainerPets: pets?.slice(0, 10) || []
  };
}

// ============================================================================
// LIST PET FOR SALE
// ============================================================================

export async function listPetForSale(petId: string, sellerId: string, askingPrice: number): Promise<{
  success: boolean;
  error?: string;
}> {
  // Verify ownership
  const { data: pet, error } = await supabase
    .from('pets')
    .select('user_id')
    .eq('id', petId)
    .single();

  if (error || !pet) {
    return { success: false, error: 'Pet not found' };
  }

  if (pet.user_id !== sellerId) {
    return { success: false, error: 'You do not own this pet' };
  }

  // Update asking price (this becomes the new "tagged" price)
  const { error: updateError } = await supabase
    .from('pets')
    .update({ current_price: askingPrice })
    .eq('id', petId);

  if (updateError) {
    return { success: false, error: 'Failed to list pet' };
  }

  return { success: true };
}
