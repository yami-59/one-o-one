import { useState, useEffect, useRef } from 'react';

export const GameChat = ({ messages, onSend }: { messages: any[], onSend: (text: string) => void }) => {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (input.trim()) {
            onSend(input);
            setInput("");
        }
    };

    return (
        <div style={{
            position: 'fixed', 
            bottom: '30px', 
            left: '30px', 
            width: '300px', 
            height: '240px', 
            background: 'rgba(30, 10, 50, 0.6)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            display: 'flex', 
            flexDirection: 'column', 
            padding: '12px',
            border: '1px solid rgba(123, 47, 247, 0.3)', 
            color: 'white', 
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
            <div ref={scrollRef} style={{ 
                flex: 1, 
                overflowY: 'auto', 
                fontSize: '13px', 
                marginBottom: '10px',
                paddingRight: '5px'
            }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: '6px', lineHeight: '1.4' }}>
                        <b style={{ color: '#d48dff' }}>
                            {m.sender.startsWith('guest-') ? m.sender.substring(0, 12) : m.sender}: 
                        </b>
                        <span style={{ marginLeft: '6px', opacity: 0.9 }}>{m.content}</span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                    style={{ 
                        flex: 1, 
                        background: 'rgba(255, 255, 255, 0.1)', 
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: 'white', 
                        padding: '8px 12px',
                        fontSize: '13px',
                        outline: 'none'
                    }}
                    placeholder="Envoyer un mot..."
                    value={input} 
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button 
                    onClick={handleSend} 
                    style={{ 
                        background: '#7b2ff7', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px',
                        padding: '0 15px',
                        cursor: 'pointer',
                        transition: '0.2s',
                        fontSize: '16px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#9d5cff'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#7b2ff7'}
                >
                    ✈️
                </button>
            </div>
        </div>
    );
};