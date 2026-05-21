import { useGame } from '../hooks/useGame';
import { CATEGORIES } from '../data/categories';
import { Button } from './ui/Button';
import type { CategoryId } from '../types';

export function CategorySelect() {
  const { selectCategory, resetGame } = useGame();

  function handleSelect(id: CategoryId) {
    selectCategory(id);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Choose a Category</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">Pick the buzzword pack for your meeting</p>

        <div className="flex flex-col gap-4">
          {CATEGORIES.map((cat) => {
            const preview = cat.words.slice(0, 3).join(', ');
            return (
              <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className="group w-full rounded-xl border-2 border-gray-200 bg-white p-5 text-left hover:border-indigo-400 hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{cat.name}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{cat.description}</p>
                    <p className="text-xs text-gray-400 truncate">
                      e.g. <em>{preview}…</em>
                    </p>
                  </div>
                  <span className="text-indigo-400 group-hover:text-indigo-600 text-xl">→</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" onClick={resetGame}>
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
}
