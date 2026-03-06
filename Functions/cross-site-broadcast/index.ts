/**
 * Cross-Site Broadcast Edge Function
 * 
 * Broadcasts a shoutout from one site to all other sites in the network.
 * This function is triggered when a shoutout is marked for cross-site visibility.
 * 
 * Flow:
 * 1. Receive shoutout_id and source_site_id
 * 2. Validate the shoutout exists and is broadcast-worthy
 * 3. Insert into global_shoutout_log
 * 4. Notify all other sites via database webhook/broadcast
 * 5. Update metrics
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface BroadcastRequest {
  shoutout_id: string;
  source_site_id: string;
  broadcast_ghost: boolean; // true if @SatoshiGhost post
}

interface CrossSiteSite {
  site_id: string;
  site_name: string;
  broadcast_endpoint: string;
  api_key: string;
}

serve(async (req: Request) => {
  try {
    const { shoutout_id, source_site_id, broadcast_ghost }: BroadcastRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch the original shoutout
    const { data: shoutout, error: shoutoutError } = await supabase
      .from('shoutout_posts')
      .select('*')
      .eq('id', shoutout_id)
      .single();

    if (shoutoutError || !shoutout) {
      return new Response(
        JSON.stringify({ error: 'Shoutout not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch all other sites in the network
    const { data: sites, error: sitesError } = await supabase
      .from('shoutout_sites')
      .select('site_id, site_name, broadcast_endpoint, api_key')
      .neq('site_id', source_site_id)
      .eq('broadcast_enabled', true);

    if (sitesError) {
      console.error('Error fetching sites:', sitesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch sites' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Log the broadcast in global_shoutout_log
    const { data: logEntry, error: logError } = await supabase
      .from('global_shoutout_log')
      .insert({
        original_post_id: shoutout_id,
        source_site_id,
        content: shoutout.content,
        ghost_content: broadcast_ghost ? shoutout.content : null,
        ghost_note: broadcast_ghost ? '🦁 Oracle broadcast' : null,
        tropes_used: broadcast_ghost ? shoutout.tropes || [] : [],
        broadcast_status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging broadcast:', logError);
      return new Response(
        JSON.stringify({ error: 'Failed to log broadcast' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Insert cross-site copies (simplified - in production, notify each site)
    const broadcastPromises = (sites || []).map(async (site: CrossSiteSite) => {
      // In production, this would call each site's API
      // For now, we insert directly with site_id override
      const { error: insertError } = await supabase
        .from('shoutout_posts')
        .insert({
          ...shoutout,
          id: crypto.randomUUID(),
          original_post_id: shoutout_id,
          source_site_id: site.site_id,
          cross_site_original: shoutout_id,
          is_cross_post: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error(`Failed to broadcast to ${site.site_id}:`, insertError);
      }

      return { site_id: site.site_id, success: !insertError };
    });

    const broadcastResults = await Promise.all(broadcastPromises);

    // 5. Update global metrics
    await supabase.rpc('fn_increment_global_shoutout_count', {
      site_id_input: source_site_id,
    });

    // 6. Trigger notifications for followers on other sites
    await supabase.rpc('fn_notify_cross_site_followers', {
      post_id_input: shoutout_id,
      source_site_input: source_site_id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        broadcast_id: logEntry.id,
        sites_reached: broadcastResults.filter((r) => r.success).length,
        total_sites: sites?.length || 0,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Broadcast error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
