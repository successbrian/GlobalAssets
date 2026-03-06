/**
 * QuickFilterPills.tsx - Directory Quick-Filter Icons Component
 * 
 * Displays the 6 main directory pillars as clickable filter pills:
 * - 🏠 Real Estate
 * - 🚗 Vehicles
 * - 🛠️ Services
 * - 🥩 Provisions
 * - 🎓 Education
 * - 💼 Jobs
 */

import React, { useState } from 'react';
import { CATEGORY_CONFIG, AssetType, CategoryConfig } from '../../lib/directory/CivitasCategoryConfig';

interface QuickFilterPillsProps {
  onSelect?: (category: AssetType) => void;
  selectedCategory?: AssetType | null;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
  showLabels?: boolean;
}

const CategoryPill: React.FC<{
  category: CategoryConfig;
  isSelected: boolean;
  onClick: () => void;
  variant: 'default' | 'compact' | 'featured';
  showLabel: boolean;
}> = ({ category, isSelected, onClick, variant, showLabel }) => {
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: variant === 'compact' ? '0.5rem 0.75rem' : '0.75rem 1rem',
    borderRadius: '50px',
    border: isSelected ? `2px solid ${category.color}` : '2px solid rgba(255, 255, 255, 0.1)',
    background: isSelected 
      ? `linear-gradient(135deg, ${category.color}22 0%, ${category.color}11 100%)`
      : 'rgba(255, 255, 255, 0.03)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: variant === 'compact' ? 'auto' : '120px',
    justifyContent: 'center'
  };

  const iconStyles: React.CSSProperties = {
    fontSize: variant === 'compact' ? '1.25rem' : '1.5rem',
    filter: isSelected ? 'none' : 'grayscale(50%)'
  };

  const labelStyles: React.CSSProperties = {
    fontSize: variant === 'compact' ? '0.75rem' : '0.875rem',
    fontWeight: isSelected ? 600 : 400,
    color: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.7)',
    whiteSpace: 'nowrap'
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (!isSelected) {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
      e.currentTarget.style.transform = 'translateY(-1px)';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (!isSelected) {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
      e.currentTarget.style.transform = 'translateY(0)';
    }
  };

  return (
    <button
      onClick={onClick}
      style={baseStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`View ${category.name}`}
      title={category.description}
    >
      <span style={iconStyles}>{category.icon}</span>
      {showLabel && <span style={labelStyles}>{category.name}</span>}
    </button>
  );
};

export const QuickFilterPills: React.FC<QuickFilterPillsProps> = ({
  onSelect,
  selectedCategory = null,
  variant = 'default',
  className = '',
  showLabels = true
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<AssetType | null>(null);

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    justifyContent: 'center',
    padding: variant === 'featured' ? '1.5rem' : '1rem',
    background: variant === 'featured' 
      ? 'linear-gradient(180deg, rgba(255, 215, 0, 0.05) 0%, rgba(0, 0, 0, 0) 100%)'
      : 'transparent',
    borderRadius: variant === 'featured' ? '12px' : '0',
    border: variant === 'featured' ? '1px solid rgba(255, 215, 0, 0.2)' : 'none'
  };

  return (
    <div className={`quick-filter-pills ${className}`}>
      {variant === 'featured' && (
        <div className="filter-header" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h3 style={{ 
            color: '#ffd700', 
            fontSize: '0.875rem', 
            fontWeight: 600, 
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: 0
          }}>
            Explore the Directory
          </h3>
          {hoveredCategory && (
            <p style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.75rem',
              marginTop: '0.25rem'
            }}>
              {CATEGORY_CONFIG.find(c => c.id === hoveredCategory)?.description}
            </p>
          )}
        </div>
      )}

      <div style={containerStyles}>
        {CATEGORY_CONFIG.map((category) => (
          <CategoryPill
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onClick={() => onSelect?.(category.id)}
            variant={variant}
            showLabel={showLabels}
          />
        ))}
      </div>

      <style>{`
        .quick-filter-pills {
          width: 100%;
        }

        @media (max-width: 768px) {
          .quick-filter-pills {
            justify-content: flex-start;
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }
          
          .quick-filter-pills button {
            min-width: auto;
            padding: 0.5rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

// Compact horizontal scroll version
export const QuickFilterScroll: React.FC<QuickFilterPillsProps> = ({
  onSelect,
  selectedCategory = null,
  className = ''
}) => {
  return (
    <div className={`quick-filter-scroll ${className}`}>
      <div className="scroll-container">
        {CATEGORY_CONFIG.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect?.(category.id)}
            className={`scroll-item ${selectedCategory === category.id ? 'selected' : ''}`}
            style={{
              '--category-color': category.color
            } as React.CSSProperties}
          >
            <span className="item-icon">{category.icon}</span>
            <span className="item-name">{category.name}</span>
          </button>
        ))}
      </div>

      <style>{`
        .quick-filter-scroll {
          width: 100%;
          overflow: hidden;
        }
        
        .scroll-container {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.5rem 0;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 215, 0, 0.3) transparent;
        }
        
        .scroll-container::-webkit-scrollbar {
          height: 4px;
        }
        
        .scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scroll-container::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 4px;
        }
        
        .scroll-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
          flex-shrink: 0;
        }
        
        .scroll-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--category-color);
        }
        
        .scroll-item.selected {
          background: linear-gradient(135deg, var(--category-color)22 0%, var(--category-color)11 100%);
          border-color: var(--category-color);
        }
        
        .item-icon {
          font-size: 1.5rem;
        }
        
        .item-name {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
          font-weight: 500;
        }
        
        .scroll-item.selected .item-name {
          color: #fff;
        }
      `}</style>
    </div>
  );
};

// Featured hero version
export const QuickFilterFeatured: React.FC<QuickFilterPillsProps> = ({
  onSelect,
  selectedCategory = null
}) => {
  return (
    <div className="quick-filter-featured">
      <div className="featured-grid">
        {CATEGORY_CONFIG.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect?.(category.id)}
            className={`featured-card ${selectedCategory === category.id ? 'selected' : ''}`}
            style={{
              '--category-color': category.color
            } as React.CSSProperties}
          >
            <span className="featured-icon">{category.icon}</span>
            <div className="featured-content">
              <span className="featured-name">{category.name}</span>
              <span className="featured-desc">{category.description}</span>
            </div>
            {selectedCategory === category.id && (
              <span className="selected-indicator" style={{ backgroundColor: category.color }} />
            )}
          </button>
        ))}
      </div>

      <style>{`
        .quick-filter-featured {
          width: 100%;
        }
        
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .featured-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          position: relative;
          overflow: hidden;
        }
        
        .featured-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: var(--category-color);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .featured-card:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .featured-card.selected {
          background: linear-gradient(135deg, var(--category-color)15 0%, var(--category-color)08 100%);
          border-color: var(--category-color);
        }
        
        .featured-card.selected::before {
          opacity: 1;
        }
        
        .featured-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }
        
        .featured-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }
        
        .featured-name {
          color: #fff;
          font-weight: 600;
          font-size: 0.9rem;
        }
        
        .featured-desc {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .selected-indicator {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default QuickFilterPills;
