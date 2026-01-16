
import React, { useState, useCallback, useMemo } from 'react';
import { AppTab, Member } from './types';
import { generateId } from './utils/helpers';
import MemberInputView from './components/MemberInputView';
import LotteryView from './components/LotteryView';
import GroupingView from './components/GroupingView';
import { Users, Ticket, LayoutGrid, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('members');
  const [members, setMembers] = useState<Member[]>([]);

  // Calculate duplicates whenever members change
  const processedMembers = useMemo(() => {
    const nameCount: Record<string, number> = {};
    members.forEach(m => {
      nameCount[m.name] = (nameCount[m.name] || 0) + 1;
    });
    return members.map(m => ({
      ...m,
      isDuplicate: nameCount[m.name] > 1
    }));
  }, [members]);

  const hasDuplicates = useMemo(() => {
    return processedMembers.some(m => m.isDuplicate);
  }, [processedMembers]);

  const handleUpdateMembers = useCallback((newNames: string[]) => {
    const newMembers = newNames.map(name => ({
      id: generateId(),
      name,
      isDuplicate: false
    }));
    setMembers(prev => [...prev, ...newMembers]);
  }, []);

  const handleSetMembers = useCallback((newNames: string[]) => {
    const newMembers = newNames.map(name => ({
      id: generateId(),
      name,
      isDuplicate: false
    }));
    setMembers(newMembers);
  }, []);

  const handleRemoveDuplicates = useCallback(() => {
    const seen = new Set<string>();
    const unique = members.filter(m => {
      if (seen.has(m.name)) return false;
      seen.add(m.name);
      return true;
    });
    setMembers(unique);
  }, [members]);

  const handleClearMembers = useCallback(() => {
    if (window.confirm('名簿をクリアしてもよろしいですか？')) {
      setMembers([]);
    }
  }, []);

  const handleDeleteMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Users className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
              HR Smart Tools
            </h1>
          </div>
          <nav className="flex space-x-1 sm:space-x-4">
            <TabButton 
              active={activeTab === 'members'} 
              onClick={() => setActiveTab('members')}
              icon={<Users size={18} />}
              label="名簿作成"
            />
            <TabButton 
              active={activeTab === 'lottery'} 
              onClick={() => setActiveTab('lottery')}
              icon={<Ticket size={18} />}
              label="抽選"
            />
            <TabButton 
              active={activeTab === 'grouping'} 
              onClick={() => setActiveTab('grouping')}
              icon={<LayoutGrid size={18} />}
              label="グループ分け"
            />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {hasDuplicates && activeTab !== 'members' && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="shrink-0" />
            <p className="text-sm font-medium">
              名簿に重複があります。「名簿作成」タブで整理することをお勧めします。
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {activeTab === 'members' && (
            <MemberInputView 
              members={processedMembers}
              onAddMembers={handleUpdateMembers}
              onSetMembers={handleSetMembers}
              onRemoveDuplicates={handleRemoveDuplicates}
              onClearMembers={handleClearMembers}
              onDeleteMember={handleDeleteMember}
            />
          )}
          {activeTab === 'lottery' && (
            <LotteryView members={processedMembers} />
          )}
          {activeTab === 'grouping' && (
            <GroupingView members={processedMembers} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 text-center text-gray-500 text-sm">
        <p>&copy; 2024 HR Smart Tools - 全ての人事・教育担当者のために</p>
      </footer>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
