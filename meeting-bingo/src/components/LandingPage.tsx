import { useGame } from '../hooks/useGame';
import { Button } from './ui/Button';

export function LandingPage() {
  const { startSetup } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Meeting Bingo</h1>
        <p className="text-lg text-gray-600 mb-6">
          Turn your next corporate meeting into a game. Auto-fills when buzzwords are spoken.
        </p>

        {/* Privacy message — must be visible before mic permission is requested */}
        <div className="mb-8 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
          <span>🔒</span>
          <span>Audio processed locally. Never recorded.</span>
        </div>

        <Button size="lg" onClick={startSetup} className="w-full sm:w-auto">
          New Game
        </Button>
      </div>
    </div>
  );
}
