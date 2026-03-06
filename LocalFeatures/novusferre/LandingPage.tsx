/**
 * NOVUSFERRE - LANDING PAGE
 * "The Hottest Stage in the Digital World"
 * 
 * Theme: Midnight Purple background, Neon Magenta & Electric Gold highlights
 */

import React from 'react';

export const NovusferreLandingPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0D0D1A',
      color: '#FFFFFF',
      fontFamily: 'Georgia, serif',
    }}>
      {/* Hero Section */}
      <header style={{
        background: 'linear-gradient(135deg, #1A0D2E 0%, #0D0D1A 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        borderBottom: '2px solid #FF00FF',
      }}>
        <h1 style={{
          fontSize: '4rem',
          color: '#FFD700',
          textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
          marginBottom: '20px',
          letterSpacing: '4px',
        }}>
          NOVUSFERRE
        </h1>
        <p style={{
          fontSize: '1.5rem',
          color: '#FF00FF',
          fontStyle: 'italic',
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6',
        }}>
          THE HOTTEST STAGE IN THE DIGITAL WORLD
          <br />
          <span style={{ color: '#FFFFFF', fontSize: '1.2rem' }}>
            Where the girls and boys are naughty, the vibes are elite, and your judgment is the only thing that matters.
          </span>
        </p>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '60px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* CTA Section */}
        <section style={{
          textAlign: 'center',
          marginBottom: '80px',
        }}>
          <button style={{
            background: 'linear-gradient(135deg, #FF00FF 0%, #FFD700 100%)',
            border: 'none',
            padding: '20px 60px',
            fontSize: '1.5rem',
            color: '#0D0D1A',
            fontWeight: 'bold',
            cursor: 'pointer',
            borderRadius: '50px',
            boxShadow: '0 0 30px rgba(255, 0, 255, 0.5)',
            transition: 'transform 0.3s ease',
          }}>
            ENTER THE STAGE
          </button>
          <p style={{
            marginTop: '20px',
            color: '#888888',
            fontSize: '1rem',
          }}>
            Join 50,000+ members already judging
          </p>
        </section>

        {/* Features Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px',
          marginBottom: '80px',
        }}>
          {/* Hot or Not Battles */}
          <div style={{
            background: 'rgba(255, 0, 255, 0.1)',
            border: '1px solid #FF00FF',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
          }}>
            <h2 style={{
              color: '#FF00FF',
              fontSize: '2rem',
              marginBottom: '20px',
            }}>
              🔥 HOT OR NOT
            </h2>
            <p style={{ lineHeight: '1.8' }}>
              Two creators enter, one winner leaves. Vote on who deserves the spotlight.
              Winners get market boosts. Losers... fade away.
            </p>
          </div>

          {/* Elite Trading */}
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            border: '1px solid #FFD700',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
          }}>
            <h2 style={{
              color: '#FFD700',
              fontSize: '2rem',
              marginBottom: '20px',
            }}>
              💰 ELITE TRADING
            </h2>
            <p style={{ lineHeight: '1.8' }}>
              Buy and sell access to the most desirable creators.
              30% markup on all gifts. 60% of every transaction is BURNED.
            </p>
          </div>

          {/* Backstage Lounge */}
          <div style={{
            background: 'rgba(100, 100, 255, 0.1)',
            border: '1px solid #6464FF',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
          }}>
            <h2 style={{
              color: '#6464FF',
              fontSize: '2rem',
              marginBottom: '20px',
            }}>
              🎭 BACKSTAGE LOUNGE
            </h2>
            <p style={{ lineHeight: '1.8' }}>
              New creators start here. Fresh. Private. Exclusive.
              14-day message purge keeps things spicy.
              Ready for your debut?
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section style={{
          marginBottom: '80px',
        }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            color: '#FFD700',
            marginBottom: '50px',
          }}>
            HOW IT WORKS
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px',
          }}>
            {[
              { step: '1', title: 'Join the Stage', desc: 'Sign up and agree to the 14-day purge. No boring social noise.' },
              { step: '2', title: 'Judge & Vote', desc: 'Spend 0.10 Credits per vote. Boost your favorites.' },
              { step: '3', desc: 'Trade & Earn', desc: 'Buy access. Sell positions. Burn 60% of every transaction.' },
              { step: '4', title: 'Rise or Fall', desc: 'Win battles, get market boosts. Hit the floor, face the purge.' },
            ].map((item, i) => (
              <div key={i} style={{
                textAlign: 'center',
                padding: '30px',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #FF00FF 0%, #FFD700 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#0D0D1A',
                }}>
                  {item.step}
                </div>
                <h3 style={{ color: '#FFFFFF', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ color: '#888888', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section style={{
          background: 'linear-gradient(135deg, #1A0D2E 0%, #0D0D1A 100%)',
          border: '2px solid #FF00FF',
          borderRadius: '30px',
          padding: '60px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
          }}>
            <div>
              <div style={{ fontSize: '3rem', color: '#FFD700', fontWeight: 'bold' }}>50K+</div>
              <div style={{ color: '#888888' }}>Active Members</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', color: '#FF00FF', fontWeight: 'bold' }}>$2.4M</div>
              <div style={{ color: '#888888' }}>Trading Volume</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', color: '#6464FF', fontWeight: 'bold' }}>14K+</div>
              <div style={{ color: '#888888' }}>Daily Votes</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', color: '#FFD700', fontWeight: 'bold' }}>60%</div>
              <div style={{ color: '#888888' }}>Burn Rate</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{
        background: '#0D0D1A',
        borderTop: '1px solid #333',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#666666', fontSize: '0.9rem' }}>
          © 2024 Novusferre. Iron. Wheat. Empire.
        </p>
        <p style={{ color: '#444444', fontSize: '0.8rem', marginTop: '10px' }}>
          The 14-day Message Purge keeps our community fresh. All messages auto-delete after 14 days.
        </p>
      </footer>
    </div>
  );
};

export default NovusferreLandingPage;
