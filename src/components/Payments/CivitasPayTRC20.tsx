/**
 * ============================================================================
 * CIVITAS PAY - TRC-20 Edition
 * ============================================================================
 * USDT TRC-20 Payment Gateway
 * Features: Vault Address, QR Code, TXID Verification, ContactFlow Integration
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';

// QR Code generation (simple SVG-based)
const QRCodeSVG = ({ value, size = 200 }: { value: string; size?: number }) => {
  // Simple QR representation - in production use a proper QR library
  return (
    <div 
      className="bg-white p-4 rounded-lg inline-block"
      style={{ width: size, height: size }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        {/* QR Code pattern - simplified */}
        <rect fill="white" width={size} height={size} />
        <g fill="black">
          {/* Position detection patterns */}
          <rect x="10" y="10" width="50" height="50" />
          <rect x="15" y="15" width="40" height="40" fill="white" />
          <rect x="20" y="20" width="30" height="30" />
          
          <rect x={size - 60} y="10" width="50" height="50" />
          <rect x={size - 55} y="15" width="40" height="40" fill="white" />
          <rect x={size - 50} y="20" width="30" height="30" />
          
          <rect x="10" y={size - 60} width="50" height="50" />
          <rect x="15" y={size - 55} width="40" height="40" fill="white" />
          <rect x="20" y={size - 50} width="30" height="30" />
          
          {/* Data pattern (simplified representation) */}
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              <rect x={70 + i * 12} y="10" width="8" height="8" />
              <rect x="10" y={70 + i * 12} width="8" height="8" />
            </React.Fragment>
          ))}
        </g>
        {/* Text representation of the payment URI */}
        <text 
          x="50%" 
          y={size - 15} 
          textAnchor="middle" 
          fontSize="8" 
          fill="#666"
        >
          Scan to Pay USDT-TRC20
        </text>
      </svg>
    </div>
  );
};

// Types
interface PaymentPackage {
  id: string;
  name: string;
  priceUSD: number;
  features: string[];
  badge?: string;
}

interface PaymentProps {
  package: PaymentPackage;
  businessName: string;
  businessEmail: string;
  onSuccess: (txHash: string, contactId: string) => void;
  onError: (error: string) => void;
}

// Configuration (from environment)
const TRC20_CONFIG = {
  vaultAddress: import.meta.env.VITE_TRC20_VAULT_ADDRESS || 'TJuL5fv3r1WCj7L7C8X4Z2Hh5Z8w9XxYzQr',
  explorerUrl: import.meta.env.VITE_TRON_EXPLORER_URL || 'https://tronscan.org/#/transaction',
  apiEndpoint: '/api/listings/purchase',
};

export function CivitasPayTRC20({ package: pkg, businessName, businessEmail, onSuccess, onError }: PaymentProps) {
  const [txHash, setTxHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  // Generate TRC-20 payment URI
  const paymentURI = `USDT-TRC20:${TRC20_CONFIG.vaultAddress}?amount=${pkg.priceUSD}`;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(TRC20_CONFIG.vaultAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyPayment = async () => {
    if (!txHash.trim()) {
      onError('Please enter the transaction hash');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('verifying');

    try {
      const response = await fetch(TRC20_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_hash: txHash.trim(),
          package_id: pkg.id,
          package_name: pkg.name,
          price_usd: pkg.priceUSD,
          business_name: businessName,
          business_email: businessEmail
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      setVerificationStatus('success');
      onSuccess(txHash, data.contact_id);

    } catch (error: any) {
      setVerificationStatus('error');
      onError(error.message || 'Verification failed. Please check your TXID.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">₮</span>
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">Civitas Pay</h2>
          <p className="text-gray-400 text-sm">USDT TRC-20 Payment Gateway</p>
        </div>
      </div>

      {/* Package Summary */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">Package</span>
          <span className="text-white font-semibold">{pkg.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Amount Due</span>
          <span className="text-green-400 font-bold text-xl">${pkg.priceUSD} USDT</span>
        </div>
      </div>

      {/* QR Code */}
      <div className="text-center mb-6">
        <QRCodeSVG value={paymentURI} size={180} />
        <p className="text-gray-400 text-sm mt-2">Scan with your TRON wallet</p>
      </div>

      {/* Vault Address */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <label className="text-gray-400 text-sm block mb-2">Official Civitas Vault Address</label>
        <div className="flex items-center gap-2">
          <code className="text-blue-400 text-xs flex-1 break-all">
            {TRC20_CONFIG.vaultAddress}
          </code>
          <button
            onClick={copyAddress}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {copied ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      {/* TXID Input */}
      <div className="mb-6">
        <label className="text-gray-400 text-sm block mb-2">Transaction Hash (TXID)</label>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="Paste your TRON transaction hash here..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <p className="text-gray-500 text-xs mt-1">
          Find your TXID in your TRON wallet transaction history
        </p>
      </div>

      {/* Verify Button */}
      <button
        onClick={verifyPayment}
        disabled={isVerifying || !txHash.trim()}
        className={`w-full py-4 rounded-lg font-bold text-white transition-all ${
          isVerifying 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-500 active:transform active:scale-95'
        }`}
      >
        {isVerifying ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Verifying Payment...
          </span>
        ) : (
          '✓ Verify Payment & Activate'
        )}
      </button>

      {/* Status Messages */}
      {verificationStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-900/30 border border-green-500/50 rounded-lg">
          <p className="text-green-400 text-center font-semibold">✓ Payment Verified!</p>
          <p className="text-gray-400 text-center text-sm mt-1">
            Your {pkg.name} listing is being activated...
          </p>
        </div>
      )}

      {verificationStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-center font-semibold">Verification Failed</p>
          <p className="text-gray-400 text-center text-sm mt-1">
            Please check your TXID and try again
          </p>
        </div>
      )}

      {/* Footer */}
      <p className="text-gray-500 text-xs text-center mt-6">
        Payments are processed on the TRON network. 
        <br />
        Contact support if you need assistance.
      </p>
    </div>
  );
}

// Export for easy access
export default CivitasPayTRC20;

// Export types
export type { PaymentPackage, PaymentProps };
