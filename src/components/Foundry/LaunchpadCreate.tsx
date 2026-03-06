/**
 * LaunchpadCreate.tsx - Token Launchpad Creation Form
 * 
 * Features:
 * - Founder bond validation
 * - Token creation form
 * - Presale configuration
 * - Dual-currency support
 * 
 * @satoshihost: "Build the Foundry. Make them pay to play."
 */

import React, { useState, useEffect } from 'react';

// Configuration
const FOUNDER_BOND_AMOUNT = 1000; // $CVTR
const MIN_PRESALE_HARD_CAP = 10000; // USDT
const BOND_LOCK_DAYS = 365;

interface ProjectFormData {
  name: string;
  symbol: string;
  initialSupply: string;
  tokenPrice: string;
  hardCap: string;
  softCap: string;
  durationDays: string;
}

export const LaunchpadCreate: React.FC = () => {
  const [step, setStep] = useState(1);
  const [hasBond, setHasBond] = useState(false);
  const [bondInfo, setBondInfo] = useState<{
    amountLocked: number;
    daysRemaining: number;
    isSlashed: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    symbol: '',
    initialSupply: '1000000',
    tokenPrice: '0.01',
    hardCap: '50000',
    softCap: '10000',
    durationDays: '30'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check bond status on mount
  useEffect(() => {
    checkBondStatus();
  }, []);

  const checkBondStatus = async () => {
    // In production: Call BondManager.getBondInfo()
    // For demo: Mock data
    setBondInfo({
      amountLocked: 1000,
      daysRemaining: 180,
      isSlashed: false
    });
    setHasBond(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    }
    if (!formData.symbol.trim() || formData.symbol.length < 2 || formData.symbol.length > 5) {
      newErrors.symbol = 'Symbol must be 2-5 characters';
    }
    if (!formData.initialSupply || parseFloat(formData.initialSupply) < 100000) {
      newErrors.initialSupply = 'Minimum supply is 100,000';
    }
    if (!formData.tokenPrice || parseFloat(formData.tokenPrice) <= 0) {
      newErrors.tokenPrice = 'Price must be greater than 0';
    }
    if (!formData.hardCap || parseFloat(formData.hardCap) < MIN_PRESALE_HARD_CAP) {
      newErrors.hardCap = `Minimum hard cap is ${MIN_PRESALE_HARD_CAP} USDT`;
    }
    if (parseFloat(formData.softCap) > parseFloat(formData.hardCap)) {
      newErrors.softCap = 'Soft cap must be less than hard cap';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // In production: Call launchpad.createProject()
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Project created successfully! Your founder bond is now locked.');
      setStep(3);
    } catch (error) {
      alert('Error creating project: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTokenAllocation = () => {
    const supply = parseFloat(formData.initialSupply);
    const reserve = Math.floor(supply * 0.02); // 2% reserve
    const forSale = Math.floor(supply * 0.9); // 90% for presale
    const remaining = supply - reserve - forSale;

    return {
      reserve,
      forSale,
      remaining
    };
  };

  const allocation = calculateTokenAllocation();

  return (
    <div className="launchpad-create">
      {/* Progress Steps */}
      <div className="progress-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Bond Check</span>
        </div>
        <div className="step-connector" />
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Token Details</span>
        </div>
        <div className="step-connector" />
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Launch</span>
        </div>
      </div>

      {/* Step 1: Bond Check */}
      {step === 1 && (
        <section className="form-section">
          <h2>Founder's Bond Check</h2>
          
          <div className="bond-status-card">
            <div className="bond-header">
              <span className="bond-icon">🔒</span>
              <h3>1,000 $CVTR Required</h3>
            </div>
            
            {hasBond && bondInfo ? (
              <div className="bond-active">
                <div className="bond-info">
                  <div className="info-row">
                    <span className="label">Bond Amount</span>
                    <span className="value">{bondInfo.amountLocked} $CVTR</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Lock Period</span>
                    <span className="value">{BOND_LOCK_DAYS} Days</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Days Remaining</span>
                    <span className="value">{bondInfo.daysRemaining}</span>
                  </div>
                </div>
                
                <div className="lock-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${((365 - bondInfo.daysRemaining) / 365) * 100}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {Math.round(((365 - bondInfo.daysRemaining) / 365) * 100)}% Complete
                  </span>
                </div>
                
                <button 
                  className="btn-primary"
                  onClick={() => setStep(2)}
                >
                  Continue to Token Setup
                </button>
              </div>
            ) : (
              <div className="bond-required">
                <p>You need to deposit 1,000 $CVTR to create a project.</p>
                <p className="bond-benefits">
                  Benefits include:
                </p>
                <ul>
                  <li>Auto-compounding staking rewards</li>
                  <li>Governance participation</li>
                  <li>Founder badge on your project</li>
                </ul>
                <button className="btn-primary">
                  Approve & Deposit Bond
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Step 2: Token Details */}
      {step === 2 && (
        <section className="form-section">
          <h2>Token Configuration</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Token Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Texas Gold"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label>Token Symbol</label>
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                placeholder="e.g., TXG"
                maxLength={5}
                className={errors.symbol ? 'error' : ''}
              />
              {errors.symbol && <span className="error-text">{errors.symbol}</span>}
            </div>
            
            <div className="form-group">
              <label>Initial Supply</label>
              <input
                type="number"
                value={formData.initialSupply}
                onChange={(e) => setFormData({ ...formData, initialSupply: e.target.value })}
                className={errors.initialSupply ? 'error' : ''}
              />
              {errors.initialSupply && <span className="error-text">{errors.initialSupply}</span>}
            </div>
            
            <div className="form-group">
              <label>Token Price (USDT)</label>
              <input
                type="number"
                step="0.0001"
                value={formData.tokenPrice}
                onChange={(e) => setFormData({ ...formData, tokenPrice: e.target.value })}
                className={errors.tokenPrice ? 'error' : ''}
              />
              {errors.tokenPrice && <span className="error-text">{errors.tokenPrice}</span>}
            </div>
          </div>
          
          {/* Allocation Preview */}
          <div className="allocation-preview">
            <h4>Token Allocation</h4>
            <div className="allocation-grid">
              <div className="allocation-item">
                <span className="alloc-label">Reserve (2%)</span>
                <span className="alloc-value">{allocation.reserve.toLocaleString()}</span>
              </div>
              <div className="allocation-item">
                <span className="alloc-label">For Sale (90%)</span>
                <span className="alloc-value highlight">{allocation.forSale.toLocaleString()}</span>
              </div>
              <div className="allocation-item">
                <span className="alloc-label">Remaining (8%)</span>
                <span className="alloc-value">{allocation.remaining.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* Presale Configuration */}
          <h3>Presale Configuration</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Hard Cap (USDT)</label>
              <input
                type="number"
                value={formData.hardCap}
                onChange={(e) => setFormData({ ...formData, hardCap: e.target.value })}
                className={errors.hardCap ? 'error' : ''}
              />
              {errors.hardCap && <span className="error-text">{errors.hardCap}</span>}
            </div>
            
            <div className="form-group">
              <label>Soft Cap (USDT)</label>
              <input
                type="number"
                value={formData.softCap}
                onChange={(e) => setFormData({ ...formData, softCap: e.target.value })}
                className={errors.softCap ? 'error' : ''}
              />
              {errors.softCap && <span className="error-text">{errors.softCap}</span>}
            </div>
            
            <div className="form-group">
              <label>Duration (Days)</label>
              <input
                type="number"
                value={formData.durationDays}
                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
              />
            </div>
          </div>
          
          {/* Tribute Tax Notice */}
          <div className="tribute-notice">
            <span className="notice-icon">💰</span>
            <div className="notice-content">
              <h5>1% Tribute Tax</h5>
              <p>Every transfer of your token includes a 1% tax routed to the Civitas Treasury.</p>
            </div>
          </div>
          
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button 
              className="btn-primary" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <section className="form-section success">
          <div className="success-content">
            <span className="success-icon">🎉</span>
            <h2>Project Created Successfully!</h2>
            <p>Your founder bond is now locked for 365 days.</p>
            
            <div className="next-steps">
              <h4>Next Steps</h4>
              <ol>
                <li>Configure your presale parameters</li>
                <li>Share your project with the community</li>
                <li>Monitor bond status in your dashboard</li>
              </ol>
            </div>
            
            <button className="btn-primary">
              Go to Project Dashboard
            </button>
          </div>
        </section>
      )}

      <style>{`
        .launchpad-create {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Progress Steps */
        .progress-steps {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .step.active .step-number {
          background: #ffd700;
          border-color: #ffd700;
          color: #000;
        }

        .step-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .step.active .step-label {
          color: #ffd700;
        }

        .step-connector {
          width: 60px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0 1rem;
        }

        /* Form Section */
        .form-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
        }

        .form-section h2 {
          font-size: 1.5rem;
          margin: 0 0 1.5rem;
        }

        .form-section h3 {
          font-size: 1.125rem;
          margin: 2rem 0 1rem;
        }

        /* Bond Status Card */
        .bond-status-card {
          background: rgba(255, 215, 0, 0.05);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .bond-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .bond-icon {
          font-size: 1.5rem;
        }

        .bond-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: #ffd700;
        }

        .bond-info {
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .info-row .label {
          color: rgba(255, 255, 255, 0.6);
        }

        .info-row .value {
          font-weight: 600;
          color: #ffd700;
        }

        .lock-progress {
          margin-bottom: 1.5rem;
        }

        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffd700, #ffaa00);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .bond-benefits {
          margin: 1rem 0 0.5rem;
          font-weight: 600;
        }

        .bond-required ul {
          margin: 0.5rem 0 1.5rem;
          padding-left: 1.5rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Form Grid */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .form-group input {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #ffd700;
        }

        .form-group input.error {
          border-color: #ff6b6b;
        }

        .error-text {
          font-size: 0.75rem;
          color: #ff6b6b;
        }

        /* Allocation Preview */
        .allocation-preview {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }

        .allocation-preview h4 {
          margin: 0 0 1rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .allocation-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .allocation-item {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .alloc-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.25rem;
        }

        .alloc-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
        }

        .alloc-value.highlight {
          color: #ffd700;
        }

        /* Tribute Notice */
        .tribute-notice {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0, 191, 255, 0.1);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 8px;
          margin: 1.5rem 0;
        }

        .notice-icon {
          font-size: 1.5rem;
        }

        .notice-content h5 {
          margin: 0 0 0.25rem;
          color: #00bfff;
        }

        .notice-content p {
          margin: 0;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
          color: #000;
          border: none;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: transparent;
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
          border-color: #fff;
        }

        /* Success */
        .form-section.success {
          text-align: center;
        }

        .success-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        .success-content h2 {
          color: #ffd700;
        }

        .next-steps {
          text-align: left;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem auto;
          max-width: 400px;
        }

        .next-steps h4 {
          margin: 0 0 1rem;
        }

        .next-steps ol {
          margin: 0;
          padding-left: 1.5rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .next-steps li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default LaunchpadCreate;
