/**
 * ============================================================================
 * LIST MY BUSINESS - Directory Sales Page
 * ============================================================================
 * Display listing packages and initiate TRC-20 payment flow
 * ============================================================================
 */

import React, { useState } from 'react';
import { CivitasPayTRC20, type PaymentPackage } from '../../components/Payments/CivitasPayTRC20';

// Listing Packages
const LISTING_PACKAGES: PaymentPackage[] = [
  {
    id: 'standard',
    name: 'Standard',
    priceUSD: 99,
    features: [
      'Business Name & Address',
      'Phone Number',
      '1 Photo',
      'Basic Search Listing',
      '1 Year Duration'
    ],
    badge: 'Most Popular'
  },
  {
    id: 'sovereign',
    name: 'Sovereign',
    priceUSD: 299,
    features: [
      'Everything in Standard',
      'Website Link',
      '"Sovereign Badge" Display',
      '"Accepts Crypto" Filter',
      'Enhanced Search Ranking',
      '1 Year Duration'
    ],
    badge: 'Best Value'
  },
  {
    id: 'empire',
    name: 'Empire',
    priceUSD: 999,
    features: [
      'Everything in Sovereign',
      '#1 Top of Search Results',
      'Blog Feature',
      'Verified Checkmark',
      'Featured Homepage Spot',
      'Lifetime Duration'
    ],
    badge: 'Premium'
  }
];

// Form state
interface BusinessInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  description?: string;
}

export function ListMyBusiness() {
  const [selectedPackage, setSelectedPackage] = useState<PaymentPackage | null>(null);
  const [step, setStep] = useState<'packages' | 'info' | 'payment'>('packages');
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: ''
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<{ txHash: string; contactId: string } | null>(null);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessInfo.name && businessInfo.email && businessInfo.phone) {
      setStep('payment');
    }
  };

  const handlePaymentSuccess = (txHash: string, contactId: string) => {
    setPaymentSuccess(true);
    setPaymentData({ txHash, contactId });
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  if (paymentSuccess && paymentData) {
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Listing Activated!</h1>
          <p className="text-gray-400 mb-6">
            Your {selectedPackage?.name} listing is being processed.
          </p>
          <div className="bg-gray-800 rounded-lg p-6 text-left mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Transaction Hash</span>
                <p className="text-blue-400 font-mono break-all">{paymentData.txHash}</p>
              </div>
              <div>
                <span className="text-gray-400">Contact ID</span>
                <p className="text-green-400 font-mono">{paymentData.contactId}</p>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            A confirmation email has been sent to {businessInfo.email}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">List Your Business</h1>
          <p className="text-xl text-gray-400">
            Join the Civitas Directory and reach crypto-native customers worldwide
          </p>
        </div>

        {step === 'packages' && (
          <>
            {/* Package Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {LISTING_PACKAGES.map((pkg) => (
                <div 
                  key={pkg.id}
                  className={`bg-gray-800 rounded-2xl p-8 relative transition-transform hover:scale-105 ${
                    pkg.badge ? 'border-2 border-blue-500' : ''
                  }`}
                >
                  {pkg.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                        {pkg.badge}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-green-400">${pkg.priceUSD}</span>
                    <span className="text-gray-400">USDT/yr</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setStep('info');
                    }}
                    className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                  >
                    Select {pkg.name}
                  </button>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex justify-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure TRC-20 Payment
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Instant Activation
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Crypto-Friendly
              </div>
            </div>
          </>
        )}

        {step === 'info' && selectedPackage && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep('packages')}
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
            >
              ← Back to Packages
            </button>
            
            <div className="bg-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Business Information</h2>
              
              <form onSubmit={handleInfoSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-400 mb-2">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your business name"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={businessInfo.email}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                      className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@business.com"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-2">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                      className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Address</label>
                  <input
                    type="text"
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Business Ave, City, Country"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Website</label>
                  <input
                    type="url"
                    value={businessInfo.website}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourbusiness.com"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-400 mb-2">Description</label>
                  <textarea
                    value={businessInfo.description}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, description: e.target.value })}
                    rows={4}
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell customers about your business..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
                >
                  Continue to Payment
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 'payment' && selectedPackage && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setStep('info')}
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"
            >
              ← Back to Information
            </button>
            
            <CivitasPayTRC20
              package={selectedPackage}
              businessName={businessInfo.name}
              businessEmail={businessInfo.email}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ListMyBusiness;
