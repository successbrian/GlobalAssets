# @successbrian/global-assets

Shared code for Empire Ecosystem sites - authentication, analytics, fingerprinting, and more.

## Installation

```bash
npm install @successbrian/global-assets
```

Or from GitHub:

```bash
npm install github:successbrian/GlobalAssets
```

## What's Included

### Authentication & Identity
- `ecosystemAuth` - Unified authentication across all ecosystem sites
- `useUnifiedAuth` - React hook for unified auth state

### Utilities
- `fingerprint` - Browser fingerprinting for device identification
- `analytics` - GA4 analytics integration

## Usage

### Import everything:
```typescript
import { 
  ecosystemSignup, 
  ecosystemLogin, 
  getEcosystemUser,
  useUnifiedAuth,
  fingerprint,
  initAnalytics 
} from '@successbrian/global-assets';
```

### Import specific modules:
```typescript
// Just fingerprint
import { fingerprint } from '@successbrian/global-assets/utils/fingerprint';

// Just analytics  
import { initAnalytics } from '@successbrian/global-assets/utils/analytics';

// Just auth
import { ecosystemSignup } from '@successbrian/global-assets/lib/ecosystemAuth';

// Just the hook
import { useUnifiedAuth } from '@successbrian/global-assets/hooks/useUnifiedAuth';
```

## Environment Variables

For full functionality, configure these in your `.env`:

```
# ContactFlowCRM (source of truth)
VITE_CONTACTFLOW_URL=https://your-site.systeme.io
VITE_CONTACTFLOW_API_KEY=your-api-key

# Supabase (for local user data)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key

# Analytics
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

## For Development

Clone this repo alongside your project, then in your project's package.json:

```json
{
  "dependencies": {
    "@successbrian/global-assets": "file:../GlobalAssets"
  }
}
```

Then run `npm install` in your project.

## Publishing to npm

```bash
npm login
npm publish --access public
```

The package will be available at: https://www.npmjs.com/package/@successbrian/global-assets

## Repository

- GitHub: https://github.com/successbrian/GlobalAssets
- Issues: https://github.com/successbrian/GlobalAssets/issues
