import { Header } from './components/Header';
import { PotDisplay } from './components/PotDisplay';
import { MillyAgent } from './components/MillyAgent';
import { ContributionForm } from './components/ContributionForm';
import { RecentActivity } from './components/RecentActivity';
import { RoundHistory } from './components/RoundHistory';
import { WinnerHistory } from './components/WinnerHistory';
import { GameInfo } from './components/GameInfo';

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-24">
          {/* Current Round */}
          <PotDisplay />
          
          {/* AI Game Master */}
          <MillyAgent />
          
          {/* Deposit Form (only for active rounds) */}
          <ContributionForm />
          
          {/* Recent Activity */}
          <RecentActivity />
          
          {/* Previous Rounds */}
          <RoundHistory />
          
          {/* Game Info */}
          <GameInfo />
        </main>

        <footer className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-[var(--muted)] bg-[var(--bg)]/80 backdrop-blur-sm border-t border-[var(--border)]">
          <p>Powered by 0G Labs • Million Pot Game</p>
        </footer>
      </div>

      <WinnerHistory />
    </div>
  );
}
