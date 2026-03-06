/**
 * GLOBAL ASSETS - USER RECEIPTS TABLE
 * "My Stats" Page - Jackpot Receipt History
 * 
 * Display: | Date (UTC) | Jackpot Type | Status | Pool Amount at Entry |
 */

import React from 'react';

interface Receipt {
  id: string;
  date_utc: string;
  jackpot_type: 'Mega' | 'Daily';
  status: 'Verified' | 'Pending' | 'Expired';
  pool_amount: number;
}

interface UserReceiptsTableProps {
  receipts: Receipt[];
  onViewDetails?: (receiptId: string) => void;
}

// ============================================
// COMPONENT
// ============================================

export const UserReceiptsTable: React.FC<UserReceiptsTableProps> = ({
  receipts,
  onViewDetails,
}) => {
  if (receipts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#666',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📜</div>
        <h3 style={{ color: '#888', marginBottom: '8px' }}>No Receipts Yet</h3>
        <p style={{ fontSize: '0.9rem' }}>
          Complete a jackpot entry to see your receipts here.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      overflow: 'auto',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.9rem',
      }}>
        <thead>
          <tr style={{
            borderBottom: '2px solid #333',
          }}>
            <th style={{
              padding: '12px 16px',
              textAlign: 'left',
              color: '#888',
              fontWeight: 'normal',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '1px',
            }}>
              Date (UTC)
            </th>
            <th style={{
              padding: '12px 16px',
              textAlign: 'left',
              color: '#888',
              fontWeight: 'normal',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '1px',
            }}>
              Jackpot Type
            </th>
            <th style={{
              padding: '12px 16px',
              textAlign: 'center',
              color: '#888',
              fontWeight: 'normal',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '1px',
            }}>
              Status
            </th>
            <th style={{
              padding: '12px 16px',
              textAlign: 'right',
              color: '#888',
              fontWeight: 'normal',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '1px',
            }}>
              Pool Amount at Entry
            </th>
            {onViewDetails && (
              <th style={{
                padding: '12px 16px',
                textAlign: 'center',
                color: '#888',
                fontWeight: 'normal',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '1px',
              }}>
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {receipts.map((receipt, index) => (
            <tr 
              key={receipt.id}
              style={{
                borderBottom: '1px solid #222',
                background: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
              }}
            >
              {/* Date */}
              <td style={{
                padding: '14px 16px',
                color: '#ccc',
                fontFamily: 'monospace',
              }}>
                {receipt.date_utc}
              </td>

              {/* Jackpot Type */}
              <td style={{
                padding: '14px 16px',
              }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  background: receipt.jackpot_type === 'Mega' 
                    ? 'rgba(255, 215, 0, 0.15)' 
                    : 'rgba(0, 255, 136, 0.15)',
                  color: receipt.jackpot_type === 'Mega' 
                    ? '#ffd700' 
                    : '#00ff88',
                }}>
                  {receipt.jackpot_type === 'Mega' ? '💰' : '🪙'}
                  {receipt.jackpot_type === 'Mega' ? 'Mega ($4,999)' : 'Daily Stash'}
                </span>
              </td>

              {/* Status */}
              <td style={{
                padding: '14px 16px',
                textAlign: 'center',
              }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  background: receipt.status === 'Verified' 
                    ? 'rgba(0, 255, 136, 0.2)' 
                    : receipt.status === 'Pending'
                    ? 'rgba(255, 215, 0, 0.2)'
                    : 'rgba(255, 68, 68, 0.2)',
                  color: receipt.status === 'Verified' 
                    ? '#00ff88' 
                    : receipt.status === 'Pending'
                    ? '#ffd700'
                    : '#ff4444',
                }}>
                  {receipt.status === 'Verified' ? '✅ Verified' 
                    : receipt.status === 'Pending' ? '⏳ Pending' 
                    : '❌ Expired'}
                </span>
              </td>

              {/* Pool Amount */}
              <td style={{
                padding: '14px 16px',
                textAlign: 'right',
                color: '#ffd700',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                fontSize: '1rem',
              }}>
                ${receipt.pool_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </td>

              {/* Action */}
              {onViewDetails && (
                <td style={{
                  padding: '14px 16px',
                  textAlign: 'center',
                }}>
                  <button
                    onClick={() => onViewDetails(receipt.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      border: '1px solid #444',
                      borderRadius: '4px',
                      color: '#888',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    View
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Footer */}
      <div style={{
        padding: '16px',
        borderTop: '2px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem',
        color: '#888',
      }}>
        <span>{receipts.length} Total Receipts</span>
        <span>
          ${receipts.reduce((sum, r) => sum + r.pool_amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 }))} Total Pool Entries
        </span>
      </div>
    </div>
  );
};

export default UserReceiptsTable;
