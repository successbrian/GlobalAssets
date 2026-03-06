/**
 * ============================================================================
 * REAL ESTATE LISTING PAGE - Novusferre Integration
 * ============================================================================
 * Real Estate Details Page with Sidebar containing Novusferre promo
 * ============================================================================
 */

import React from 'react';
import { NovusferreLink } from '../../components/Promos/NovusferreLink';

// Mock listing data
interface PropertyListing {
  id: string;
  title: string;
  price: number;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  images: string[];
  agent: {
    name: string;
    phone: string;
    email: string;
  };
  features: string[];
}

export function RealEstateListing({ listingId }: { listingId: string }) {
  // Mock listing - in production, fetch from API
  const listing: PropertyListing = {
    id: listingId || '1',
    title: 'Sovereign Estate - 5 Bed, 4 Bath',
    price: 450000,
    address: '123 Liberty Lane, Civitas County, NV',
    beds: 5,
    baths: 4,
    sqft: 4200,
    description: 'Beautiful estate with panoramic views. Built with sustainable materials.',
    images: [],
    agent: {
      name: 'Alex Merchant',
      phone: '+1 (555) 123-4567',
      email: 'alex@civitas.est'
    },
    features: ['Solar Panels', 'Water Collection', 'Secure Vault', 'Guest House']
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Property Header */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
              <p className="text-gray-400 mb-4">{listing.address}</p>
              <div className="text-4xl font-bold text-green-400">
                ${listing.price.toLocaleString()}
              </div>
            </div>

            {/* Property Stats */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-white">{listing.beds}</p>
                  <p className="text-gray-400 text-sm">Beds</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{listing.baths}</p>
                  <p className="text-gray-400 text-sm">Baths</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{listing.sqft.toLocaleString()}</p>
                  <p className="text-gray-400 text-sm">Sq Ft</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">2024</p>
                  <p className="text-gray-400 text-sm">Built</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">About This Property</h2>
              <p className="text-gray-300">{listing.description}</p>
            </div>

            {/* Features */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Features</h2>
              <div className="grid grid-cols-2 gap-3">
                {listing.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-gray-300">
                    <span className="text-green-400">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Agent Contact Form */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Contact Agent</h3>
              <p className="text-gray-400 text-sm mb-4">{listing.agent.name}</p>
              
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  placeholder="I'm interested in this property..."
                  rows={4}
                  className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="button"
                  className="w-full py-4 rounded-xl font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Novusferre Promo - Inserted below Agent Contact */}
            <NovusferreLink />

            {/* Schedule Tour */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Schedule a Tour</h3>
              <input
                type="date"
                className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              />
              <button
                type="button"
                className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-500"
              >
                Book Tour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealEstateListing;
