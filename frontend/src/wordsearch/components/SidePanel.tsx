import { useState } from 'react';
import { Send, Check, MessageCircle, List, Sparkles } from 'lucide-react';
import { CELL_SIZE,GAP_SIZE } from '../constants';
import Div from '../../components/DivWrapper';
interface SidePanelProps {
    theme:string;
    wordsToFind: string[];
    wordsFound: string[];
    gridSize:number
}
// =============================================================================
// SIDE PANEL COMPONENT
// =============================================================================

export default function SidePanel({theme, wordsToFind, wordsFound,gridSize }: SidePanelProps) {
  const totalSize = gridSize * CELL_SIZE + (gridSize - 1) * GAP_SIZE;
  
  const [activeTab, setActiveTab] = useState<'words' | 'chat'>('words');
  const [message, setMessage] = useState('');

  const foundCount = wordsFound.length;
  const totalCount = wordsToFind.length;

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Envoyer le message via WebSocket
      console.log('Message envoyé:', message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Thème */}
      <div className="backdrop-blur-xl bg-linear-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl px-6 py-3 shadow-lg">
        <div className="flex items-center gap-2 justify-center">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-sm text-gray-400">Thème :</span>
          <span className="font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {theme}
          </span>
        </div>
      </div>

      {/* Panel */}
      <Div 
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ height: `${totalSize}px` }}
      >
        {/* Onglets */}
        <div className="flex border-b border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('words')}
            className={`flex-1 py-3 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'words'
                ? 'bg-white/10 text-white border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <List className="w-4 h-4" />
            <span>
              Mots <span className="text-xs">({foundCount}/{totalCount})</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'chat'
                ? 'bg-white/10 text-white border-b-2 border-pink-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </button>
        </div>

        {/* Progression */}
        <div className="p-4 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progression</span>
            <span className="text-sm font-bold text-purple-400">
              {Math.round((foundCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <Div
              className="h-full bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full shadow-lg shadow-purple-500/50"
              style={{ width: `${(foundCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'words' ? (
            <>
              {wordsToFind.map((word, i) => {
                const isFound = wordsFound.includes(word);

                return (
                  <div
                    key={i}
                    className={`group p-3 rounded-xl transition-all duration-200 flex items-center justify-between ${
                      isFound
                        ? 'bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <span className={`font-medium ${isFound ? 'text-purple-300 line-through' : 'text-gray-300'}`}>
                      {word}
                    </span>
                    {isFound && (
                      <div className="w-6 h-6 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/50">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <div className="space-y-4">
              {/* Messages demo */}
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-sm shrink-0">
                  🎮
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-bold text-blue-400">Adversaire</span>
                    <span className="text-xs text-gray-500">12:34</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg rounded-tl-none p-2">
                    <p className="text-sm text-gray-300">Bien joué !</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-row-reverse">
                <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-sm shrink-0">
                  😊
                </div>
                <div className="flex-1 text-right">
                  <div className="flex items-baseline gap-2 justify-end mb-1">
                    <span className="text-xs text-gray-500">12:35</span>
                    <span className="text-sm font-bold text-pink-400">Moi</span>
                  </div>
                  <div className="bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg rounded-tr-none p-2 inline-block">
                    <p className="text-sm text-gray-300">Merci !</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input chat */}
        {activeTab === 'chat' && (
          <div className="p-3 border-t border-white/10 bg-white/5 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all"
                placeholder="Écrivez un message..."
              />
              <div
                onClick={handleSendMessage}
                className="p-2.5 rounded-xl bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
      </Div>
    </div>
  );
}