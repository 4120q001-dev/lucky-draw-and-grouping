
import React, { useState } from 'react';
import { Member } from '../types';
import { parseCSV, downloadCSV } from '../utils/helpers';
import { Upload, Clipboard, Trash2, UserPlus, Info, CheckCircle2, Users, Sparkles, Download } from 'lucide-react';

interface Props {
  members: Member[];
  onAddMembers: (names: string[]) => void;
  onSetMembers: (names: string[]) => void;
  onRemoveDuplicates: () => void;
  onClearMembers: () => void;
  onDeleteMember: (id: string) => void;
}

const SAMPLE_MEMBERS = [
  '佐藤 健一', '鈴木 一郎', '高橋 優子', '田中 太郎', '伊藤 美咲',
  '渡辺 剛', '山本 恵', '中村 亮', '小林 誠', '加藤 結衣',
  '吉田 拓也', '山田 花子', '佐々木 希', '山口 智久', '斎藤 飛鳥'
];

const LAST_NAMES = ['佐藤', '鈴木', '高橋', '田中', '伊藤', '渡辺', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐々木', '山口', '松本', '井上', '木村', '林', '斎藤', '清水'];
const FIRST_NAMES = ['太郎', '花子', '一郎', '京子', '健太', '美咲', '翔太', '結衣', '蓮', '陽菜', '湊', '結菜', '大翔', '凛', '悠真', '紬', '陽翔', '葵', '颯太', '陽葵'];

const MemberInputView: React.FC<Props> = ({ 
  members, onAddMembers, onSetMembers, onRemoveDuplicates, onClearMembers, onDeleteMember 
}) => {
  const [inputText, setInputText] = useState('');
  const [randomCount, setRandomCount] = useState<number>(10);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const names = parseCSV(text);
      if (names.length > 0) {
        onAddMembers(names);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handlePasteSubmit = () => {
    const names = parseCSV(inputText);
    if (names.length > 0) {
      onAddMembers(names);
      setInputText('');
    }
  };

  const handleLoadSample = () => {
    onSetMembers(SAMPLE_MEMBERS);
  };

  const handleGenerateRandom = () => {
    const count = Math.min(Math.max(1, randomCount), 500);
    const generatedNames: string[] = [];
    for (let i = 0; i < count; i++) {
      const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      generatedNames.push(`${ln} ${fn}`);
    }
    onAddMembers(generatedNames);
  };

  const handleExportMembers = () => {
    if (members.length === 0) return;
    const content = members.map(m => m.name).join('\n');
    downloadCSV('member_list.csv', content);
  };

  const duplicateCount = members.filter(m => m.isDuplicate).length;

  return (
    <div className="flex flex-col md:flex-row h-[75vh]">
      {/* Input Section */}
      <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-gray-200 bg-white overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="text-indigo-600" size={20} />
          名簿の追加
        </h2>
        
        <div className="space-y-6">
          {/* CSV Upload */}
          <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-400 transition-colors group">
            <label className="flex flex-col items-center justify-center cursor-pointer">
              <Upload className="text-gray-400 group-hover:text-indigo-500 mb-2 transition-colors" size={32} />
              <span className="text-sm font-medium text-gray-700">CSVファイルをアップロード</span>
              <span className="text-xs text-gray-500 mt-1">（名前のみ、または1列目が名前の形式）</span>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white text-sm text-gray-400">または</span>
            </div>
          </div>

          {/* Textarea Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Clipboard size={16} />
              名前を直接貼り付け
            </label>
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="1行に1人ずつ入力してください&#10;例:&#10;佐藤 健一&#10;鈴木 一郎..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              onClick={handlePasteSubmit}
              disabled={!inputText.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300"
            >
              リストに追加
            </button>
          </div>

          {/* Automatic Generation Section */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">ランダム名簿の自動生成</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  min="1" 
                  max="500" 
                  value={randomCount}
                  onChange={(e) => setRandomCount(parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  onClick={handleGenerateRandom}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Sparkles size={16} />
                  <span>{randomCount}名分を追加</span>
                </button>
              </div>
            </div>

            <button 
              onClick={handleLoadSample}
              className="w-full flex items-center justify-center gap-2 py-2 text-gray-600 hover:bg-gray-100 font-medium rounded-lg border border-gray-200 transition-colors text-sm"
            >
              <Info size={16} />
              固定のサンプル名簿を読み込む (15名)
            </button>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="w-full md:w-1/2 p-6 flex flex-col bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="text-green-600" size={20} />
            現在の名簿 ({members.length}名)
          </h2>
          <div className="flex gap-4">
            {members.length > 0 && (
              <button onClick={handleExportMembers} className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1">
                <Download size={12} />
                CSV保存
              </button>
            )}
            {members.length > 0 && (
              <button onClick={onClearMembers} className="text-xs text-red-500 hover:underline font-medium">
                すべて削除
              </button>
            )}
          </div>
        </div>

        {duplicateCount > 0 && (
          <div className="mb-4 bg-amber-100 border border-amber-200 p-3 rounded-lg flex items-center justify-between shadow-sm">
            <div className="text-sm text-amber-800 flex items-center gap-2">
              <Info size={16} />
              <span className="font-bold">{duplicateCount}件</span> の重複があります
            </div>
            <button 
              onClick={onRemoveDuplicates}
              className="bg-white px-3 py-1 rounded text-xs font-bold text-amber-700 border border-amber-300 shadow-sm hover:bg-amber-50 transition-colors"
            >
              重複を一括削除
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-inner">
          {members.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <Users size={48} strokeWidth={1} className="mb-4" />
              <p className="text-sm">名簿が空です。<br/>左側のメニューからメンバーを追加してください。</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {members.map((m) => (
                <li key={m.id} className={`p-3 flex items-center justify-between hover:bg-gray-50 group transition-colors ${m.isDuplicate ? 'bg-amber-50' : ''}`}>
                  <span className={`text-sm ${m.isDuplicate ? 'text-amber-700 font-semibold' : 'text-gray-700'}`}>
                    {m.name}
                    {m.isDuplicate && <span className="ml-2 text-[10px] bg-amber-200 px-1.5 py-0.5 rounded text-amber-800">重複</span>}
                  </span>
                  <button 
                    onClick={() => onDeleteMember(m.id)}
                    className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberInputView;
