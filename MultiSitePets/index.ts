/**
 * @global-assets/pets
 * Pet Market System V3 - Human Asset Trading with Exclusive Ownership
 * 
 * "Human assets are the new currency. Exclusive ownership enforced."
 */

// Core Components
export { default as PetOverlay } from './PetOverlay';
export { default as AssetStatusCard } from './AssetStatusCard';
export { default as PetPortfolio } from './PetPortfolio';

// Engine Functions
export * from './ValuationEngine';

// Hooks
export { usePetMarket, usePortfolioSummary } from './usePetMarket';

// Types
export * from './types';
