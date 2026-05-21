import { GameProvider } from './context/GameContext';
import { useGame } from './hooks/useGame';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';

function GameRouter() {
  const { state } = useGame();

  switch (state.status) {
    case 'setup':
      return <CategorySelect />;
    case 'playing':
      return <GameBoard />;
    case 'won':
      return <WinScreen />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
