
import React, { useState, useRef } from 'react';
import { Member, GroupResult } from '../types';
import { shuffleArray, downloadCSV, generateId } from '../utils/helpers';
import { Users, Download, SlidersHorizontal, AlertCircle, Sparkles, Upload } from 'lucide-react';

interface Props {
  members: Member[];
}

const GroupingView: React.FC<Props> = ({ members }) => {
  const [peoplePerGroup, setPeoplePerGroup] = useState<number>(3);
  const [groups, setGroups] = useState<GroupResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateGroups = () => {
    if (members.length === 0) return;

    const shuffled = shuffleArray([...members]);
    const result: GroupResult[] = [];
    
    for (let i = 0; i < shuffled.length; i += peoplePerGroup) {
      result.push({
        id: Math.floor(i / peoplePerGroup) + 1,
        members: shuffled.slice(i, i + peoplePerGroup)
      });
    }

    setGroups(result);
  };

  const handleExportCSV = () => {
    if (groups.length === 0) return;

    const header = "Group ID,Member Name\n";
    const rows = groups.flatMap(g => 
      g.members.map(m => `${g.id},${m.name}`)
    ).join("\n");

    downloadCSV('grouping_result.csv', header + rows);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      
      // Skip header if it exists
      const startIdx = (lines[0].toLowerCase().includes('id') || lines[0].toLowerCase().includes('name')) ? 1 : 0;
      
      const importedGroups: Record<number, Member[]> = {};
      
      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          const groupId = parseInt(parts[0]);
          const name = parts[1];
          if (!isNaN(groupId) && name) {
            if (!importedGroups[groupId]) importedGroups[groupId] = [];
            importedGroups[groupId].push({ id: generateId(), name, isDuplicate: false });
          }
        }
      }

      const result: GroupResult[] = Object.entries(importedGroups).map(([id, members]) => ({
        id: parseInt(id),
        members
      })).sort((a, b) => a.id - b.id);

      if (result.length > 0) {
        setGroups(result);
      } else {
        alert("有効なグループデータが見つかりませんでした。CSVの形式を確認してください（例: 1,名前）");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (members.length === 0 && groups.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <AlertCircle size={48} className="mx-auto mb-4 text-amber-500" />
        <p className="text-lg">名簿が空です。先に名簿を作成するか、既存のグループCSVを読み込んでください。</p>
        <div className="mt-6">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-all flex items-center gap-2 mx-auto"
          >
            <Upload size={18} />
            CSVからグループを読み込む
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImportCSV} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Configuration Header */}
      <div className="p-6 bg-indigo-50 border-b border-indigo-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 w-full space-y-4">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal size={18} />
              グループ分け設定
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">1グループあたりの最大人数</label>
                <input 
                  type="range" 
                  min="2" 
                  max={Math.max(2, members.length)} 
                  value={peoplePerGroup}
                  onChange={(e) => setPeoplePerGroup(parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400 px-1">
                  <span>2人</span>
                  <span>{members.length}人</span>
                </div>
              </div>
              <div className="w-20 h-12 flex items-center justify-center bg-white border-2 border-indigo-200 rounded-xl font-black text-indigo-700 text-xl shadow-inner">
                {peoplePerGroup}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={handleCreateGroups}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              新規グループ作成
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Upload size={16} />
                CSV読込
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImportCSV} />
              
              {groups.length > 0 && (
                <button
                  onClick={handleExportCSV}
                  className="flex-1 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <Download size={16} />
                  CSV保存
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="flex-1 p-6 md:p-10 bg-white overflow-y-auto">
        {groups.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <Users size={80} strokeWidth={1} className="mb-4" />
            <p className="text-lg">「新規グループ作成」または「CSV読込」を選択してください</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map((group) => (
              <div key={group.id} className="bg-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 transition-colors group">
                <div className="bg-indigo-600 px-4 py-2 flex items-center justify-between text-white">
                  <span className="font-bold text-sm">グループ {group.id}</span>
                  <span className="bg-indigo-500/50 px-2 py-0.5 rounded text-[10px] font-medium">{group.members.length}名</span>
                </div>
                <div className="p-4 flex-1">
                  <ul className="space-y-2">
                    {group.members.map((member) => (
                      <li key={member.id} className="flex items-center gap-2 text-gray-700 text-sm py-1 border-b border-gray-200/50 last:border-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <span className="font-medium">{member.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Stats bar */}
      {groups.length > 0 && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 flex items-center justify-center gap-8">
          <span>対象人数: <span className="font-bold text-gray-800">{groups.reduce((acc, g) => acc + g.members.length, 0)}</span> 名</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span>計 <span className="font-bold text-gray-800">{groups.length}</span> グループ</span>
        </div>
      )}
    </div>
  );
};

export default GroupingView;
