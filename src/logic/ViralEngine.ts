// ============================================================================
// VIRAL ENGINE - "100 Likes = Auto-Create Public Page"
// ============================================================================
// Concept: Social proof triggers automatic page creation.
// Rule: If likes_count >= 100 AND !has_public_page, THEN autoCreatePublicPage().
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================================
// TYPES
// ============================================================================

export interface ShoutOutPost {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  has_public_page: boolean;  // The trigger flag
  public_page_url: string | null;
  created_at: string;
}

export interface PublicPage {
  id: string;
  user_id: string;
  post_id: string;
  slug: string;  // URL-friendly identifier
  title: string;
  content: string;
  engagement_score: number;
  is_featured: boolean;
  created_at: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VIRAL_THRESHOLD = 100;  // Likes required to trigger public page
const SLUG_PREFIX = '/page/';  // Public page URL prefix

// ============================================================================
// AUTO-CREATE PUBLIC PAGE (The Viral Engine)
// ============================================================================

export async function checkAndCreatePublicPage(postId: string): Promise<{
  success: boolean;
  pageCreated: boolean;
  error?: string;
  publicPageUrl?: string;
}> {
  try {
    // 1. Fetch the post
    const { data: post, error: postError } = await supabase
      .from('shoutout_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return { success: false, pageCreated: false, error: 'Post not found' };
    }

    // 2. Check trigger conditions
    const shouldCreatePage = 
      post.likes_count >= VIRAL_THRESHOLD && 
      !post.has_public_page;

    if (!shouldCreatePage) {
      return { 
        success: true, 
        pageCreated: false, 
        error: post.has_public_page 
          ? 'Post already has a public page' 
          : `Likes count (${post.likes_count}) below threshold (${VIRAL_THRESHOLD})`
      };
    }

    // 3. Generate unique slug for the public page
    const slug = await generateUniqueSlug(post.user_id, post.id);
    const publicPageUrl = `${SLUG_PREFIX}${slug}`;

    // 4. Create the public page
    const { data: newPage, error: pageError } = await supabase
      .from('public_pages')
      .insert({
        user_id: post.user_id,
        post_id: post.id,
        slug: slug,
        title: `Viral Post by User ${post.user_id.slice(0, 8)}`,
        content: post.content,
        engagement_score: post.likes_count,
        is_featured: false
      })
      .select()
      .single();

    if (pageError) {
      return { success: false, pageCreated: false, error: 'Failed to create public page' };
    }

    // 5. Update the post to mark it as having a public page
    const { error: updateError } = await supabase
      .from('shoutout_posts')
      .update({
        has_public_page: true,
        public_page_url: publicPageUrl
      })
      .eq('id', postId);

    if (updateError) {
      console.error('Failed to update post with public page URL:', updateError);
    }

    // 6. Notify the user
    await supabase.from('universal_inbox').insert({
      user_id: post.user_id,
      sender_id: 'system',
      origin_app: 'VextorGrid',
      message_type: 'social',
      subject: '🎉 Your Post Went Viral!',
      body: `Congratulations! Your post reached ${post.likes_count} likes and has been auto-promoted to a public page: ${publicPageUrl}`
    });

    return {
      success: true,
      pageCreated: true,
      publicPageUrl: publicPageUrl
    };

  } catch (err) {
    console.error('Viral engine error:', err);
    return { success: false, pageCreated: false, error: 'Unexpected error' };
  }
}

// ============================================================================
// HELPER: Generate Unique Slug
// ============================================================================

async function generateUniqueSlug(userId: string, postId: string): Promise<string> {
  // Create initial slug from post ID (first 8 chars)
  let baseSlug = `${userId.slice(0, 6)}${postId.slice(0, 6)}`;
  let slug = baseSlug;
  let counter = 1;

  // Keep trying until we find a unique slug
  while (true) {
    const { data: existing } = await supabase
      .from('public_pages')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!existing) {
      return slug;  // Unique slug found
    }

    // Slug exists, append counter
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ============================================================================
// BULK CHECK (For processing multiple posts)
// ============================================================================

export async function bulkCheckViralPosts(postIds: string[]): Promise<{
  checked: number;
  pagesCreated: number;
  errors: string[];
}> {
  const results = {
    checked: 0,
    pagesCreated: 0,
    errors: [] as string[]
  };

  for (const postId of postIds) {
    results.checked++;
    const result = await checkAndCreatePublicPage(postId);
    
    if (result.pageCreated) {
      results.pagesCreated++;
    } else if (result.error && !result.error.includes('below threshold')) {
      results.errors.push(`Post ${postId}: ${result.error}`);
    }
  }

  return results;
}

// ============================================================================
// MANUAL PAGE CREATION (For testing or admin use)
// ============================================================================

export async function forceCreatePublicPage(
  postId: string, 
  customTitle?: string,
  customSlug?: string
): Promise<{
  success: boolean;
  error?: string;
  publicPageUrl?: string;
}> {
  try {
    // 1. Fetch the post
    const { data: post, error: postError } = await supabase
      .from('shoutout_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      return { success: false, error: 'Post not found' };
    }

    // 2. Use custom slug or generate one
    const slug = customSlug || await generateUniqueSlug(post.user_id, post.id);
    const publicPageUrl = `${SLUG_PREFIX}${slug}`;
    const title = customTitle || `Public Page by User ${post.user_id.slice(0, 8)}`;

    // 3. Create the public page
    const { data: newPage, error: pageError } = await supabase
      .from('public_pages')
      .insert({
        user_id: post.user_id,
        post_id: post.id,
        slug: slug,
        title: title,
        content: post.content,
        engagement_score: post.likes_count,
        is_featured: false
      })
      .select()
      .single();

    if (pageError) {
      return { success: false, error: 'Failed to create public page' };
    }

    // 4. Update the post
    await supabase
      .from('shoutout_posts')
      .update({
        has_public_page: true,
        public_page_url: publicPageUrl
      })
      .eq('id', postId);

    return {
      success: true,
      publicPageUrl: publicPageUrl
    };

  } catch (err) {
    console.error('Force create page error:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

// ============================================================================
// GET VIRAL POSTS (For dashboard/monitoring)
// ============================================================================

export async function getViralCandidates(limit: number = 20): Promise<ShoutOutPost[]> {
  // Get posts that are close to viral threshold
  const { data: posts, error } = await supabase
    .from('shoutout_posts')
    .select('*')
    .lt('likes_count', VIRAL_THRESHOLD)  // Below threshold
    .eq('has_public_page', false)          // No public page yet
    .order('likes_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching viral candidates:', error);
    return [];
  }

  return posts || [];
}

export async function getFeaturedPages(limit: number = 10): Promise<PublicPage[]> {
  const { data: pages, error } = await supabase
    .from('public_pages')
    .select('*')
    .eq('is_featured', true)
    .order('engagement_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured pages:', error);
    return [];
  }

  return pages || [];
}
