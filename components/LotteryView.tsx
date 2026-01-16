
import React, { useState, useEffect, useRef } from 'react';
import { Member } from '../types';
import { shuffleArray } from '../utils/helpers';
// Added missing 'Ticket' icon to the imports
import { Trophy, RefreshCcw, History, AlertCircle, Ticket } from 'lucide-react';
import confetti from 'https://cdn.skypack.dev/canvas-confetti';

interface Props {
  members: Member[];
}

const LotteryView: React.FC<Props> = ({ members }) => {
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [candidates, setCandidates] = useState<Member[]>([]);
  const [winner, setWinner] = useState<Member | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<Member[]>([]);
  const [rollingName, setRollingName] = useState<string>('');
  
  const rollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Initial sync
    setCandidates([...members]);
  }, [members]);

  const startLottery = () => {
    if (candidates.length === 0) return;
    
    setIsRolling(true);
    setWinner(null);

    let count = 0;
    const maxRolls = 30;
    const shuffled = shuffleArray([...candidates]);

    rollIntervalRef.current = window.setInterval(() => {
      setRollingName(shuffled[count % shuffled.length].name);
      count++;
      
      if (count >= maxRolls) {
        finishLottery();
      }
    }, 80);
  };

  const finishLottery = () => {
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
    
    const finalCandidates = [...candidates];
    const randomIndex = Math.floor(Math.random() * finalCandidates.length);
    const selectedWinner = finalCandidates[randomIndex];
    
    setWinner(selectedWinner);
    setRollingName(selectedWinner.name);
    setIsRolling(false);
    setHistory(prev => [selectedWinner, ...prev]);

    if (!allowDuplicates) {
      setCandidates(prev => prev.filter(c => c.id !== selectedWinner.id));
    }

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4F46E5', '#6366F1', '#818CF8']
    });
  };

  const resetLottery = () => {
    setCandidates([...members]);
    setWinner(null);
    setHistory([]);
    setRollingName('');
  };

  if (members.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
        <p className="text-lg">名簿が空です。先に名簿を作成してください。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[70vh]">
      {/* Settings & Main Area */}
      <div className="flex-1 p-6 md:p-10 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-gray-100">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">抽選設定</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">抽選対象数</span>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                {candidates.length}名
              </span>
            </div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </div>
              <span className="text-sm text-gray-700 font-medium">同じ人の重複当選を許可する</span>
            </label>
            <div className="pt-2">
               <p className="text-xs text-gray-500 italic">
                 {!allowDuplicates ? '※一度当選した人は候補から除外されます。' : '※一度当選した人も再度当選する可能性があります。'}
               </p>
            </div>
          </div>
        </div>

        {/* Animation Area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
          <div className={`relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden flex items-center justify-center border-4 ${winner ? 'border-yellow-400 bg-yellow-50 shadow-lg' : 'border-indigo-100 bg-indigo-50'} transition-all duration-500`}>
            {isRolling || rollingName ? (
              <div className="text-center animate-pulse">
                <p className="text-indigo-400 font-bold text-lg mb-2">{isRolling ? '抽選中...' : 'おめでとうございます！'}</p>
                <div className="text-4xl md:text-6xl font-black text-indigo-900 px-4">
                  {rollingName}
                </div>
              </div>
            ) : (
              <div className="text-center text-indigo-300 px-8">
                <Trophy size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl font-bold">抽選を始めましょう</p>
              </div>
            )}
            
            {winner && (
              <div className="absolute top-4 right-4 animate-bounce">
                <Trophy className="text-yellow-500 drop-shadow-md" size={40} />
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4 w-full max-w-lg">
            <button
              onClick={startLottery}
              disabled={isRolling || candidates.length === 0}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-xl font-bold rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              <Ticket size={24} />
              抽選する
            </button>
            <button
              onClick={resetLottery}
              disabled={isRolling}
              className="p-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-2xl text-gray-400 transition-colors shadow-sm"
              title="リセット"
            >
              <RefreshCcw size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* History Area */}
      <div className="w-full lg:w-80 bg-gray-50 p-6 flex flex-col border-l border-gray-100">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <History size={18} />
          当選履歴
        </h3>
        <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200">
          {history.length === 0 ? (
            <p className="p-8 text-center text-gray-400 text-sm">履歴はありません</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {history.map((m, i) => (
                <li key={`${m.id}-${i}`} className="p-4 flex items-center justify-between animate-fade-in-down">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                      {history.length - i}
                    </span>
                    <span className="font-semibold text-gray-800">{m.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotteryView;
