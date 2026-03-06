/**
 * Novusferre Top Banner
 * The Iron & Wheat Empire Banner
 * 
 * "Iron. Wheat. Empire."
 */

import React, { useState, useEffect } from 'react';

interface NovusferreStats {
  ironProduced: number;
  wheatHarvested: number;
  empireCitizens: number;
}

export function NovusferreBanner() {
  const [stats, setStats] = useState<NovusferreStats>({
    ironProduced: 84729,
    wheatHarvested: 1258403,
    empireCitizens: 45218,
  });

  // Animate numbers on mount
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ironProduced: prev.ironProduced + Math.floor(Math.random() * 3),
        wheatHarvested: prev.wheatHarvested + Math.floor(Math.random() * 7),
        empireCitizens: prev.empireCitizens + Math.floor(Math.random() * 2),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-b-4 border-amber-600">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center shadow-lg">
              {/* Wheat/Iron Icon */}
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 8 6 8 10C8 14 12 18 12 18C12 18 16 14 16 10C16 6 12 2 12 2Z" />
                <path d="M12 18V22" stroke="currentColor" strokeWidth="2" />
                <path d="M8 10H16" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-500 tracking-wider">NOVUSFERRE</h1>
              <p className="text-xs text-stone-400 italic">"Iron. Wheat. Empire."</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-stone-300 hover:text-amber-400 transition-colors text-sm font-medium">
              IRON
            </a>
            <a href="#" className="text-stone-300 hover:text-amber-400 transition-colors text-sm font-medium">
              WHEAT
            </a>
            <a href="#" className="text-stone-300 hover:text-amber-400 transition-colors text-sm font-medium">
              EMPIRE
            </a>
            <a href="#" className="text-stone-300 hover:text-amber-400 transition-colors text-sm font-medium">
              MARKETPLACE
            </a>
            <a href="#" className="text-stone-300 hover:text-amber-400 transition-colors text-sm font-medium">
              ABOUT
            </a>
          </nav>

          {/* Stats Section */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-stone-500 uppercase tracking-wide">Iron Produced</p>
              <p className="text-lg font-bold text-stone-200 font-mono">
                {stats.ironProduced.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-8 bg-stone-600"></div>
            <div className="text-right">
              <p className="text-xs text-stone-500 uppercase tracking-wide">Wheat Harvested</p>
              <p className="text-lg font-bold text-amber-400 font-mono">
                {stats.wheatHarvested.toLocaleString()}
              </p>
            </div>
            <div className="w-px h-8 bg-stone-600"></div>
            <div className="text-right">
              <p className="text-xs text-stone-500 uppercase tracking-wide">Citizens</p>
              <p className="text-lg font-bold text-emerald-400 font-mono">
                {stats.empireCitizens.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-stone-300 hover:text-amber-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NovusferreBanner;
