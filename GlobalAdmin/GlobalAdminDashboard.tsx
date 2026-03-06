/**
 * GlobalAdmin - Master Control Dashboard
 * 
 * Central administration panel for managing:
 * - All site configurations
 * - Cross-site shoutouts
 * - Oracle Brain settings
 * - Global leaderboard
 * - Economic controls
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';

interface SiteStats {
  site_id: string;
  site_name: string;
  user_count: number;
  shoutout_count: number;
  daily_volume: number;
  last_active: string;
}

interface GlobalMetrics {
  totalSites: number;
  totalUsers: number;
  totalShoutouts: number;
  totalVolume: number;
  oraclePostsToday: number;
  jackpotPool: number;
}

export function GlobalAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sites' | 'oracle' | 'economy' | 'security'>('overview');
  const [sites, setSites] = useState<SiteStats[]>([]);
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch site stats
      const { data: siteData } = await supabase
        .from('shoutout_sites')
        .select('*')
        .order('site_name');

      // Fetch global metrics
      const { data: globalData } = await supabase
        .rpc('fn_get_global_metrics');

      setSites(siteData || []);
      setMetrics(globalData?.[0] || {
        totalSites: 1,
        totalUsers: 0,
        totalShoutouts: 0,
        totalVolume: 0,
        oraclePostsToday: 0,
        jackpotPool: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="global-admin-loading">
        <div className="spinner">🔮 Loading Oracle Brain...</div>
      </div>
    );
  }

  return (
    <div className="global-admin-dashboard">
      <header className="admin-header">
        <h1>🦁 Global Oracle Admin</h1>
        <div className="header-actions">
          <button className="btn btn-primary">Sync All Sites</button>
          <button className="btn btn-warning">Emergency Stop</button>
        </div>
      </header>

      <nav className="admin-tabs">
        {[
          { id: 'overview', label: '📊 Overview', icon: '📊' },
          { id: 'sites', label: '🌐 Sites', icon: '🌐' },
          { id: 'oracle', label: '🦁 Oracle', icon: '🦁' },
          { id: 'economy', label: '💰 Economy', icon: '💰' },
          { id: 'security', label: '🛡️ Security', icon: '🛡️' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="admin-content">
        {activeTab === 'overview' && <OverviewPanel metrics={metrics} sites={sites} />}
        {activeTab === 'sites' && <SitesPanel sites={sites} />}
        {activeTab === 'oracle' && <OraclePanel />}
        {activeTab === 'economy' && <EconomyPanel />}
        {activeTab === 'security' && <SecurityPanel />}
      </main>
    </div>
  );
}

// Sub-components

function OverviewPanel({ metrics, sites }: { metrics: GlobalMetrics | null; sites: SiteStats[] }) {
  return (
    <div className="overview-panel">
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Sites</h3>
          <div className="value">{metrics?.totalSites || 0}</div>
        </div>
        <div className="metric-card">
          <h3>Total Users</h3>
          <div className="value">{metrics?.totalUsers?.toLocaleString() || 0}</div>
        </div>
        <div className="metric-card">
          <h3>Total Shoutouts</h3>
          <div className="value">{metrics?.totalShoutouts?.toLocaleString() || 0}</div>
        </div>
        <div className="metric-card highlight">
          <h3>Global Volume</h3>
          <div className="value">${(metrics?.totalVolume || 0).toLocaleString()}</div>
        </div>
        <div className="metric-card">
          <h3>Oracle Posts Today</h3>
          <div className="value">{metrics?.oraclePostsToday || 0}</div>
        </div>
        <div className="metric-card">
          <h3>Jackpot Pool</h3>
          <div className="value">${(metrics?.jackpotPool || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Cross-Site Activity</h2>
        <ActivityLog />
      </div>
    </div>
  );
}

function SitesPanel({ sites }: { sites: SiteStats[] }) {
  return (
    <div className="sites-panel">
      <div className="panel-header">
        <h2>🌐 Managed Sites</h2>
        <button className="btn btn-success">+ Add Site</button>
      </div>

      <table className="sites-table">
        <thead>
          <tr>
            <th>Site ID</th>
            <th>Name</th>
            <th>Users</th>
            <th>Shoutouts</th>
            <th>Volume</th>
            <th>Last Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site.site_id}>
              <td><code>{site.site_id}</code></td>
              <td>{site.site_name}</td>
              <td>{site.user_count.toLocaleString()}</td>
              <td>{site.shoutout_count.toLocaleString()}</td>
              <td>${site.daily_volume.toLocaleString()}</td>
              <td>{new Date(site.last_active).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-sm">Edit</button>
                <button className="btn btn-sm btn-danger">Suspend</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OraclePanel() {
  const [oracleStats, setOracleStats] = useState<any>(null);

  useEffect(() => {
    // Fetch oracle stats
    supabase.rpc('fn_oracle_get_stats').then(({ data }) => {
      setOracleStats(data?.[0]);
    });
  }, []);

  return (
    <div className="oracle-panel">
      <div className="panel-header">
        <h2>🦁 Oracle Brain Controls</h2>
        <div className="oracle-status">
          <span className="status-dot active"></span>
          <span>Oracle Active</span>
        </div>
      </div>

      <div className="oracle-controls">
        <div className="control-group">
          <h3>Posting Settings</h3>
          <label>
            Max Daily Posts
            <input type="number" defaultValue={10} />
          </label>
          <label>
            Cooldown (minutes)
            <input type="number" defaultValue={60} />
          </label>
          <label>
            Enabled Categories
            <select multiple>
              <option value="market">Market</option>
              <option value="philosophy">Philosophy</option>
              <option value="meme">Meme</option>
              <option value="lore">Lore</option>
              <option value="meta">Meta</option>
            </select>
          </label>
        </div>

        <div className="control-group">
          <h3>Recent Thoughts</h3>
          <div className="thought-feed">
            {/* Oracle thought feed would go here */}
            <div className="thought-item">
              <span className="tropes">HODL + diamond hands</span>
              <p>"Degen season never ends for the diamond handed."</p>
              <small>2 hours ago</small>
            </div>
          </div>
        </div>
      </div>

      <div className="oracle-actions">
        <button className="btn btn-primary">Force Broadcast</button>
        <button className="btn btn-warning">Silence Oracle</button>
        <button className="btn btn-info">View Thought Log</button>
      </div>
    </div>
  );
}

function EconomyPanel() {
  return (
    <div className="economy-panel">
      <h2>💰 Global Economy Controls</h2>
      
      <div className="economy-stats">
        <div className="stat-card">
          <h4>Jackpot Balance</h4>
          <div className="amount">$2,450.00</div>
        </div>
        <div className="stat-card">
          <h4>Creator Pool</h4>
          <div className="amount">$1,200.00</div>
        </div>
        <div className="stat-card">
          <h4>Leaderboard Pool</h4>
          <div className="amount">$890.00</div>
        </div>
        <div className="stat-card">
          <h4>Burn Vault</h4>
          <div className="amount">$3,100.00</div>
        </div>
      </div>

      <div className="gift-split-config">
        <h3>Gift Split Configuration</h3>
        <table>
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Percentage</th>
              <th>Daily Cap</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Creator</td>
              <td>30%</td>
              <td>$1,000</td>
            </tr>
            <tr>
              <td>Jackpot</td>
              <td>20%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Leaderboard</td>
              <td>20%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Burn</td>
              <td>20%</td>
              <td>-</td>
            </tr>
            <tr>
              <td>Pet Owner</td>
              <td>5%</td>
              <td>$500</td>
            </tr>
            <tr>
              <td>Creator Bonus</td>
              <td>5%</td>
              <td>$250</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SecurityPanel() {
  return (
    <div className="security-panel">
      <h2>🛡️ Security & Anti-Gaming</h2>

      <div className="security-grid">
        <div className="security-card">
          <h3>🚫 VPN/Proxy Detection</h3>
          <div className="toggle-row">
            <span>Enabled</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="stat">Blocked today: 47</div>
        </div>

        <div className="security-card">
          <h3>🔗 Alt Account Detection</h3>
          <div className="toggle-row">
            <span>Wallet Fingerprinting</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="stat">Flagged accounts: 12</div>
        </div>

        <div className="security-card">
          <h3>⏰ Time Lock Enforcement</h3>
          <div className="toggle-row">
            <span>24-hour Transfer Lock</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="stat">Pending unlocks: 23</div>
        </div>

        <div className="security-card">
          <h3>🐕 Self-Engagement Block</h3>
          <div className="toggle-row">
            <span>Block Own Posts</span>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="stat">Prevented today: 156</div>
        </div>
      </div>

      <div className="ban-list">
        <h3>🚫 Banned Wallets</h3>
        <textarea readOnly placeholder="Wallet addresses, one per line..."></textarea>
        <button className="btn btn-danger">Add to Ban List</button>
      </div>
    </div>
  );
}

function ActivityLog() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    // Fetch recent activities
    supabase
      .from('global_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setActivities(data || []);
      });
  }, []);

  return (
    <div className="activity-log">
      {activities.length === 0 ? (
        <p className="empty">No recent activity</p>
      ) : (
        <ul>
          {activities.map((activity) => (
            <li key={activity.id}>
              <span className="activity-type">{activity.activity_type}</span>
              <span className="activity-detail">{activity.detail}</span>
              <span className="activity-time">
                {new Date(activity.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GlobalAdminDashboard;
