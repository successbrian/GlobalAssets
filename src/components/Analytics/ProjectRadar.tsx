/**
 * ============================================================================
 * THE RADAR DASHBOARD - CoinMarketCap Style Ranking
 * ============================================================================
 * Ranks Foundry projects by "Tribute Paid" instead of Market Cap
 * Highlights "Burning Hot" projects with visual effects
 * ============================================================================
 */

import React, { useEffect, useState } from 'react';
import { createTaxIndexer, type ProjectMetrics, type TaxIndexerConfig } from '../../lib/analytics/TaxIndexer';

// Icons
const FireIcon = () => (
  <svg className="w-4 h-4 text-orange-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.814-.96-1.806-.93-2.855a1 1 0 00-.395-.81c-.807-.14-1.683.18-2.25.372a1 1 0 00-.265.538c-.12.345-.16.728-.08 1.097a3.636 3.636 0 00.264.535 5.302 5.302 0 01.397 1.76c.145.606.33 1.195.55 1.767.22.572.548 1.11.964 1.588a10.16 10.16 0 002.09 1.428c.567.323 1.22.548 1.865.636a9.432 9.432 0 002.05-1.13c.32-.355.55-.81.645-1.33a1 1 0 00-.16-1.05 2.288 2.288 0 01-.69-.63c-.07-.13-.195-.235-.36-.3-.164-.066-.34-.05-.506.04a2.65 2.65 0 01-.62.22c-.215.05-.44.015-.63-.07a2.644 2.644 0 01-.54-.32 4.52 4.52 0 00-.63-.39 4.646 4.646 0 00-1.14-.08 5.02 5.02 0 00-1.13.19 4.54 4.54 0 00-.89.42c-.215.16-.38.385-.47.65a2.62 2.62 0 01-.27.62c-.04.11-.03.23.03.34a2.6 2.6 0 00.32.37c.12.1.29.14.46.1a2.64 2.64 0 001.02-.36 4.66 4.66 0 00.56-.47c.11-.13.27-.195.44-.19.17.005.33.06.46.16a3.66 3.66 0 01.5.53c.095.15.23.26.39.32.16.06.34.06.5 0a3.67 3.67 0 01.58-.13c.21-.01.42.02.61.1.2.07.37.2.5.36.13.16.2.37.19.58a2.65 2.65 0 01-.18.74c-.11.21-.3.38-.53.48-.23.1-.48.1-.72 0a2.65 2.65 0 01-.71-.41 3.62 3.62 0 01-.47-.52 4.64 4.64 0 00-.53-.52 3.66 3.66 0 00-.6-.41 2.67 2.67 0 00-.67-.25c-.23-.06-.48-.06-.71 0a4.65 4.65 0 00-1.27.5c-.17.11-.31.27-.4.45a2.64 2.64 0 01-.52.5c-.19.14-.42.22-.65.24h-.01c-.23 0-.46-.07-.65-.21a2.64 2.64 0 01-.43-.47 4.62 4.62 0 00-.6-.54c-.23-.18-.5-.3-.78-.35-.28-.05-.57-.02-.85.09-.28.11-.53.3-.73.55a2.64 2.64 0 01-.89.56c-.24.07-.49.08-.73.03-.24-.05-.47-.16-.67-.33-.2-.17-.36-.39-.48-.64a2.66 2.66 0 01-.17-1.02c.03-.34.13-.67.29-.96.16-.29.4-.53.69-.7.29-.17.62-.24.96-.21.34.03.66.16.92.38.26.22.46.52.58.86.12.34.14.71.07 1.06-.07.35-.24.67-.5.93a2.65 2.65 0 01-.83.62c-.32.15-.67.19-1.01.13-.34-.06-.66-.24-.91-.51a2.64 2.64 0 01-.55-.79c-.1-.24-.12-.5-.06-.75.06-.25.19-.48.38-.66a2.65 2.65 0 011.17-.71c.36-.1.73-.06 1.07.11.34.17.63.44.83.79.2.35.31.76.31 1.18 0 .42-.11.83-.31 1.18a2.64 2.64 0 01-.83.79 2.65 2.65 0 01-1.07.11 2.65 2.65 0 01-1.17-.71 2.65 2.65 0 01-.38-.66c-.06-.25-.04-.51.06-.75a2.64 2.64 0 01.55-.79c.25-.27.57-.45.91-.51.34-.06.69-.02 1.01.13.32.18.6.4.83.62.26.26.43.58.5.93.07.35.05.72-.07 1.06a2.65 2.65 0 01-.58.86c-.26.22-.58.35-.92.38-.34.03-.67-.04-.96-.21-.29-.17-.53-.41-.69-.7a2.65 2.65 0 01-.29-.96c-.03-.34.01-.69.17-1.02.12-.25.28-.47.48-.64.2-.17.43-.28.67-.33.24-.05.49-.04.73.03.33.15.63.37.89.56.2.25.39.54.49.86.12.32.16.67.11 1.01-.05.34-.2.66-.43.93-.23.27-.52.47-.85.59-.33.12-.68.14-1.02.07-.34-.07-.66-.24-.92-.5-.26-.26-.44-.58-.53-.93-.09-.35-.06-.72.08-1.06.14-.34.37-.62.67-.82.3-.2.65-.3 1.01-.28h.01c.23.02.46.1.65.24.19.14.33.33.43.55.1.22.14.47.12.72-.02.25-.1.49-.23.7a2.65 2.65 0 01-.5.58c-.22.19-.48.32-.76.38-.28.06-.57.05-.85-.03-.28-.08-.54-.23-.76-.44a2.65 2.65 0 01-.48-.62 2.65 2.65 0 01-.18-.73c-.01-.25.05-.5.17-.72.12-.22.3-.41.52-.56.22-.15.47-.24.73-.26h.01c.25-.01.5.06.71.2.21.14.39.34.51.58.12.24.17.51.14.78-.03.27-.14.52-.31.73a2.65 2.65 0 01-.53.51c-.23.17-.5.27-.78.3-.28.03-.56-.02-.82-.14-.26-.12-.49-.31-.67-.55a2.65 2.65 0 01-.28-.76c-.04-.26.01-.52.15-.76.14-.24.34-.44.58-.58.24-.14.52-.21.81-.21h.01c.29.02.57.12.81.29.24.17.44.4.57.67.13.27.18.57.14.87a2.65 2.65 0 01-.21.83c-.12.26-.31.48-.54.65-.23.17-.5.27-.78.31-.28.04-.56-.01-.83-.14a2.65 2.65 0 01-.78-.51c-.2-.19-.35-.43-.44-.69-.09-.26-.11-.54-.06-.81.05-.27.17-.52.34-.73.17-.21.39-.37.63-.47.24-.1.5-.14.77-.1.27.03.52.14.73.31.21.17.38.4.49.66.11.26.14.54.09.82-.05.28-.17.54-.35.76-.18.22-.41.39-.67.5-.26.11-.54.16-.83.13-.29-.03-.56-.14-.79-.33-.23-.19-.41-.44-.53-.73-.12-.29-.15-.6-.09-.91.06-.31.2-.6.41-.84z" clipRule="evenodd" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

const UnlockIcon = () => (
  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 019.9-1h1.1A5 5 0 0117 7v2a2 2 0 01-2 2H5zm6 5V7a3 3 0 10-6 0v2h6z" clipRule="evenodd" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
    <path d="M11.39.845a.642.642 0 00-.503-.297l-.107.009C9.598.28 8.456.003 7.125 0a5.45 5.45 0 00-4.587 2.614A5.456 5.456 0 00.5 5.5v1.027c0 2.313 1.425 4.441 3.568 5.331a1.026 1.026 0 00.774 0 10.01 10.01 0 00.387-.132l.082-.057a1.26 1.26 0 00.28-.26l.05-.07a.636.636 0 01.075-.087l.01-.008a.639.639 0 00.14-.22l.008-.017a.636.636 0 00.053-.21V5.94a.637.637 0 00-.268-.527l-.011-.008a.637.637 0 00-.203-.11l-.05-.018a.636.636 0 00-.182-.046H2.8a.637.637 0 00-.636.637v.002a.637.637 0 00.064.256l.007.019.018.044.032.07.029.054.037.058.043.054.05.049.053.041.056.034.058.026.058.017.058.008h.002l4.32-.002a.637.637 0 00.578-.4l.01-.028.02-.058.024-.063.026-.058.028-.051.028-.045.029-.038.028-.031.027-.024.025-.017.023-.01.02-.004h2.172l.034.003.054.012.057.022.054.027.048.03.042.032.036.034.03.035.023.035.016.035.01.034.004.032-.001.001V9.5a5.454 5.454 0 01-1.5-3.5h1.5a3.5 3.5 0 003.5-3.5V2.5a.637.637 0 00-.636-.637h-.003a.637.637 0 00-.636.636v.002a.637.637 0 00.032.183l.01.029.018.046.027.058.034.063.04.06.045.055.05.049.053.042.056.034.058.025.058.016.057.007h.001l4.32-.002a.637.637 0 00.578-.4l.01-.028.02-.058.024-.063.026-.058.028-.051.028-.045.029-.038.028-.031.027-.024.025-.017.023-.01.02-.004h2.172l.034.003.054.012.057.022.054.027.048.03.042.032.036.034.03.035.023.035.016.035.01.034.004.032v2.072a.637.637 0 00.268.527l.011.008a.637.637 0 00.203.11l.05.018a.637.637 0 00.182.046h.004a.637.637 0 00.636-.637v-1.027c0-2.313-1.425-4.441-3.568-5.331a1.026 1.026 0 00-.774 0 10.01 10.01 0 00-.387.132l-.082.057a1.26 1.26 0 00-.28.26l-.05.07a.636.636 0 00-.075.087l-.01.008a.639.639 0 00-.14.22l-.008.017a.636.636 0 00-.053.21V5.94a.637.637 0 00.268-.527l.011-.008a.637.637 0 00.203-.11l.05-.018a.637.637 0 00.182-.046h.002l4.32-.002a.637.637 0 00.578-.4l.01-.028.02-.058.024-.063.026-.058.028-.051.028-.045.029-.038.028-.031.027-.024.025-.017.023-.01.02-.004h2.172l.034.003.054.012.057.022.054.027.048.03.042.032.036.034.03.035.023.035.016.035.01.034.004.032-.001.001z" />
  </svg>
);

// Default configuration
const DEFAULT_CONFIG: TaxIndexerConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  feeSplitterAddress: import.meta.env.VITE_FEE_SPLITTER_ADDRESS || '',
  rpcUrl: import.meta.env.VITE_RPC_URL || '',
  pollIntervalMs: 30000 // 30 seconds
};

export function ProjectRadar() {
  const [projects, setProjects] = useState<ProjectMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [indexer] = useState(() => createTaxIndexer(DEFAULT_CONFIG));

  useEffect(() => {
    async function loadProjects() {
      try {
        const rankedProjects = await indexer.getRankedProjects();
        setProjects(rankedProjects);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('[ProjectRadar] Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProjects();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadProjects, 60000);
    
    return () => clearInterval(interval);
  }, [indexer]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getRankBadge = (rank: number): React.ReactNode => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="text-gray-500 font-mono">#{rank}</span>;
  };

  const getBondStatus = (lockedUntil: string | null): React.ReactNode => {
    if (!lockedUntil) return <span className="flex items-center gap-1 text-gray-400">🔓 Unlocked</span>;
    const isLocked = new Date(lockedUntil) > new Date();
    return isLocked ? (
      <span className="flex items-center gap-1 text-green-500">🔒 Locked</span>
    ) : (
      <span className="flex items-center gap-1 text-yellow-500">🔓 Expired</span>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrophyIcon />
          <h1 className="text-2xl font-bold text-white">Project Radar</h1>
        </div>
        <div className="text-sm text-gray-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Total Projects</div>
          <div className="text-2xl font-bold text-white">{projects.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">🔥 Burning Hot</div>
          <div className="text-2xl font-bold text-orange-500">
            {projects.filter(p => p.is_burning_hot).length}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">24h Tribute</div>
          <div className="text-2xl font-bold text-green-500">
            {formatCurrency(projects.reduce((sum, p) => sum + p.tax_contribution_24h, 0))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-gray-400 text-sm">Total Tribute</div>
          <div className="text-2xl font-bold text-blue-500">
            {formatCurrency(projects.reduce((sum, p) => sum + p.tax_contribution_total, 0))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Rank</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Project</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Tribute (24h)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Tribute (Total)</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Volume (24h)</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-300">Bond Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading radar data...
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No projects found. Launch some coins to see them here!
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr 
                  key={project.id}
                  className={`border-t border-gray-700 hover:bg-gray-750 transition-colors ${
                    project.is_burning_hot 
                      ? 'bg-orange-500/10 border-orange-500/30' 
                      : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {getRankBadge(project.rank_position)}
                      {project.is_burning_hot && (
                        <FireIcon />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {project.project_logo ? (
                        <img 
                          src={project.project_logo} 
                          alt={project.project_name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                          {project.project_symbol.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white">{project.project_name}</div>
                        <div className="text-sm text-gray-400">{project.project_symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className={`font-mono ${project.is_burning_hot ? 'text-orange-400 font-bold' : 'text-green-400'}`}>
                      {formatCurrency(project.tax_contribution_24h)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-mono text-blue-400">
                      {formatCurrency(project.tax_contribution_total)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-mono text-gray-300">
                      {formatCurrency(project.volume_24h)}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {getBondStatus(project.bond_locked_until)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <FireIcon />
          <span>Burning Hot (&gt;$1,000/24h)</span>
        </div>
        <div className="flex items-center gap-2">
          <LockIcon />
          <span>Bond Locked (Safe)</span>
        </div>
        <div className="flex items-center gap-2">
          <UnlockIcon />
          <span>Unlocked (Caution)</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectRadar;
