import { useGameStore } from '../store/gameStore';
import { formatUSD, formatOG } from '../utils/format';
import { X, Loader2, CheckCircle, Trophy, AlertTriangle, RotateCcw, Activity, Zap } from 'lucide-react';

export default function AddMoneyModal() {
  const { 
    showAddMoneyModal, 
    setShowAddMoneyModal, 
    addMoneyStep, 
    setAddMoneyStep,
    contributionAmount,
    setContributionAmount,
    addContribution,
    currentRound,
    ogPrice,
    priceChange,
    isPriceLoading,
    lastPriceUpdate,
    startNewRound,
    resetModals
  } = useGameStore();
  
  const { potUSDValue, potOGAmount, target, status } = currentRound;
  const quickAmounts = [100, 500, 1000, 5000, 10000];
  const ogAmount = parseFloat(contributionAmount) || 0;
  const usdValue = ogAmount * ogPrice;
  const newUSDValue = potUSDValue + usdValue;
  const newOGAmount = potOGAmount + ogAmount;
  const isExactHit = Math.abs(newUSDValue - target) < 0.01;
  const isPositiveChange = priceChange >= 0;
  
  const ogFor1Dollar = 1 / ogPrice;
  const ogFor10Dollars = 10 / ogPrice;
  const ogFor100Dollars = 100 / ogPrice;
  
  const handleClose = () => {
    resetModals();
  };
  
  const handleQuickSelect = (value: number) => {
    setContributionAmount(value.toString());
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setContributionAmount(value);
  };
  
  const handleContinue = () => {
    setAddMoneyStep('confirm');
  };
  
  const handleConfirm = () => {
    addContribution(ogAmount);
  };
  
  const handleNewRound = () => {
    startNewRound();
    handleClose();
  };
  
  const formatOGInput = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  if (!showAddMoneyModal) return null;
  
  const renderContent = () => {
    switch (addMoneyStep) {
      case 'input':
        return (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add 0G</h2>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-[var(--accent-light)] rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-3 p-3 rounded-xl bg-[var(--accent)]/5 border-2 border-[var(--accent)]/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                  Live 0G Price
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                  <span>LIVE</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black">${ogPrice.toFixed(4)}</span>
                  <span className={`text-sm font-semibold ${isPositiveChange ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                    {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                </div>
                {lastPriceUpdate && (
                  <span className="text-xs text-[var(--muted)]">
                    {Math.floor((Date.now() - lastPriceUpdate) / 1000)}s ago
                  </span>
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
                <span className="font-semibold">Conversions:</span> {ogFor1Dollar.toFixed(2)} 0G = $1 | {ogFor10Dollars.toFixed(1)} 0G = $10 | {ogFor100Dollars.toFixed(1)} 0G = $100
              </div>
            </div>
            
            <div className="mb-3 p-3 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--warning)] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--muted)]">
                  <span className="font-semibold text-[var(--warning)]">Price changes constantly!</span> The pot value shifts with every price update. Your timing matters!
                </p>
              </div>
            </div>
            
            <div className="mb-2 p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">Current Pot</span>
                <div className="text-right">
                  <span className="font-bold">{formatUSD(potUSDValue)}</span>
                  <span className="text-xs text-[var(--muted)] ml-2">({formatOG(potOGAmount)} 0G)</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[var(--text)] mb-2">
                Amount (0G Tokens)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={contributionAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-4 py-4 text-2xl font-bold bg-[var(--bg)] border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[var(--muted)]">0G</span>
              </div>
              {ogAmount > 0 && (
                <div className="mt-2 p-2 rounded-lg bg-[var(--success)]/5 border border-[var(--success)]/20">
                  <p className="text-sm font-semibold text-[var(--success)]">
                    ≈ {formatUSD(usdValue)} at current price
                  </p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Price: ${ogPrice.toFixed(4)}/0G
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-1 px-1">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  onClick={() => handleQuickSelect(val)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    contributionAmount === val.toString() 
                      ? 'bg-[var(--accent)] text-white' 
                      : 'bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent)]'
                  }`}
                >
                  {formatOG(val)} 0G
                </button>
              ))}
            </div>
            
            {ogAmount > 0 && (
              <div className={`p-4 rounded-2xl mb-5 ${
                isExactHit 
                  ? 'bg-[var(--success)]/10 border-2 border-[var(--success)]' 
                  : 'bg-[var(--bg)] border border-[var(--border)]'
              }`}>
                {isExactHit ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--success)]/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-[var(--success)]" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--success)]">Perfect Hit!</p>
                      <p className="text-sm text-[var(--muted)]">
                        You'll win $1,000,000!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted)]">New pot value</span>
                      <span className="font-bold text-lg">{formatUSD(newUSDValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--muted)]">Total 0G in pot</span>
                      <span className="font-semibold">{formatOG(newOGAmount)} 0G</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={handleContinue}
              disabled={ogAmount <= 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                ogAmount > 0 
                  ? 'bg-[var(--accent)] text-white hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed'
              }`}
            >
              Continue
            </button>
          </>
        );
        
      case 'confirm':
        return (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Confirm Deposit</h2>
              <button 
                onClick={() => setAddMoneyStep('input')}
                className="p-2 hover:bg-[var(--accent-light)] rounded-full transition-colors"
                aria-label="Back"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-3 rounded-xl bg-[var(--accent)]/5 border border-[var(--accent)]/20">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-[var(--success)]" />
                <span className="text-xs font-semibold text-[var(--accent)]">PRICE AT CONFIRMATION</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">${ogPrice.toFixed(4)}</span>
                <span className="text-sm text-[var(--muted)]">per 0G token</span>
              </div>
            </div>
            
            <div className="text-center py-6">
              <p className="text-sm text-[var(--muted)] mb-1">You're depositing</p>
              <p className="text-4xl font-black mb-1">{formatOGInput(ogAmount)} 0G</p>
              <p className="text-sm text-[var(--muted)]">
                ≈ {formatUSD(usdValue)}
              </p>
              
              {isExactHit && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--success)]/10 rounded-full mt-4">
                  <Trophy className="w-5 h-5 text-[var(--success)]" />
                  <span className="font-semibold text-[var(--success)]">You could win $1,000,000!</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3 mb-6 text-sm bg-[var(--bg)] rounded-2xl p-4">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Current pot</span>
                <span className="font-semibold">{formatUSD(potUSDValue)} ({formatOG(potOGAmount)} 0G)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Your deposit</span>
                <span className="font-semibold text-[var(--success)]">+{formatOG(ogAmount)} 0G</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">0G Price (live)</span>
                <span className="font-semibold">${ogPrice.toFixed(4)}</span>
              </div>
              <div className="h-px bg-[var(--border)]" />
              <div className="flex justify-between">
                <span className="font-semibold">New pot value</span>
                <span className="font-bold text-lg">{formatUSD(newUSDValue)}</span>
              </div>
            </div>
            
            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-white bg-[var(--accent)]"
            >
              Deposit {formatOG(ogAmount)} 0G
            </button>
          </>
        );
        
      case 'processing':
        return (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[var(--accent)]" />
            <h2 className="text-xl font-bold mb-2">Processing...</h2>
            <p className="text-[var(--muted)]">Depositing {formatOG(ogAmount)} 0G</p>
          </div>
        );
        
      case 'success':
        return (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[var(--success)]" />
            </div>
            <h2 className="text-xl font-bold mb-2">Deposited!</h2>
            <p className="text-[var(--muted)] mb-2">
              {formatOG(ogAmount)} 0G added to Round #{currentRound.roundNumber}
            </p>
            <p className="text-sm text-[var(--muted)] mb-6">
              ≈ {formatUSD(usdValue)}
            </p>
            <button
              onClick={handleClose}
              className="w-full py-4 rounded-2xl font-bold bg-[var(--accent)] text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Done
            </button>
          </div>
        );
        
      case 'won':
        return (
          <div className="text-center py-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 animate-ping opacity-20">
                <Trophy className="w-20 h-20 mx-auto text-[var(--gold)]" />
              </div>
              <Trophy className="w-20 h-20 mx-auto text-[var(--gold)] relative" />
            </div>
            <h2 className="text-2xl font-black mb-1">YOU WON!</h2>
            <p className="text-5xl font-black text-[var(--success)] mb-3">
              {formatUSD(1000000)}
            </p>
            <p className="text-[var(--muted)] mb-6 text-sm">
              You hit exactly {formatUSD(target)}! Prize will be sent to your wallet.
            </p>
            <button
              onClick={handleNewRound}
              className="w-full py-4 rounded-2xl font-bold bg-[var(--success)] text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Play Next Round
            </button>
          </div>
        );
        
      case 'failed':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[var(--error)]/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[var(--error)]" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-[var(--error)]">Round Failed</h2>
            <p className="text-[var(--muted)] mb-2">
              The pot value went to {formatUSD(newUSDValue)}
            </p>
            <p className="text-sm text-[var(--muted)] mb-6">
              Claim your refund in Round History
            </p>
            <button
              onClick={handleNewRound}
              className="w-full py-4 rounded-2xl font-bold bg-[var(--accent)] text-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Play Next Round
            </button>
          </div>
        );
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={() => addMoneyStep !== 'processing' && handleClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      <div 
        className="relative w-full max-w-sm bg-[var(--surface)] rounded-3xl p-6 animate-fade-in-up shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>
  );
}
