import { useState } from 'react';
import { Send } from 'lucide-react';

interface SidePanelProps {
  wordsToFind: string[];
  wordsFound: string[];
}

export default function SidePanel({ wordsToFind, wordsFound }: SidePanelProps) {
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
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col h-[500px] lg:h-auto">
      {/* Onglets */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('words')}
          className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${
            activeTab === 'words'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Mots ({foundCount}/{totalCount})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider transition-colors ${
            activeTab === 'chat'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Chat
        </button>
      </div>

      {/* Contenu */}
      <div className="grow p-4 bg-gray-900/50 max-h-150">
        {activeTab === 'words' ? (
          <div className="space-y-2 ">
            {wordsToFind.map((word, i) => {
              const isFound = wordsFound.includes(word);

              return (
                <div
                  key={i}
                  className={`p-2 rounded flex justify-between items-center ${
                    isFound
                      ? 'bg-brand-pink/20 text-brand-pink line-through'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  <span>{word}</span>
                  {isFound && i === 0 && (
                    <span className="text-xs bg-brand-pink text-white px-1 rounded">
                      MOI
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="text-brand-blue font-bold">
              Adv: <span className="text-white font-normal">Bien joué !</span>
            </div>
            <div className="text-brand-pink font-bold">
              Moi: <span className="text-white font-normal">Merci : </span>
            </div>
          </div>
        )}
      </div>

      {/* Input chat */}
      {activeTab === 'chat' && (
        <div className="p-3 bg-gray-800 border-t border-gray-700 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="grow bg-gray-900 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-pink"
            placeholder="Message..."
          />
          <div
            onClick={handleSendMessage}
            className="bg-brand-pink p-2 rounded text-white hover:bg-brand-pink/80 transition-colors"
          >
            <Send size={16} />
          </div>
        </div>
      )}
    </div>
  );
}