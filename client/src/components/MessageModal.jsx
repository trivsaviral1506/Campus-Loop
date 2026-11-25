import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MessageModal({ requestId, itemTitle, otherPartyName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/messages/request/${requestId}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // 3s polling for active chat
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const res = await axios.post(`/messages/request/${requestId}`, { content: content.trim() });
      setMessages(prev => [...prev, res.data]);
      setContent('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card glass-panel w-full max-w-lg p-0 flex flex-col overflow-hidden shadow-2xl animate-fade-in" style={{ height: '520px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--bg-dark)]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
            <div>
              <h4 className="text-sm font-bold m-0 leading-tight">{otherPartyName || 'Exchange Chat'}</h4>
              <p className="text-xs text-[var(--text-muted)] m-0 truncate max-w-xs">{itemTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] transition">
            <X size={18} />
          </button>
        </div>

        {/* Message feed */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
          {loading && messages.length === 0 ? (
            <div className="m-auto text-sm text-[var(--text-muted)]">Loading conversation...</div>
          ) : messages.length === 0 ? (
            <div className="m-auto text-center p-6 text-[var(--text-muted)] text-sm">
              No messages yet.<br />Coordinate pickup location, timing, and details here!
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender?._id === user?._id || m.sender === user?._id;
              return (
                <div key={m._id} className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                  <span className="text-[10px] text-[var(--text-muted)] mb-1 px-1">
                    {isMe ? 'You' : m.sender?.name} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-[var(--primary)] text-white rounded-br-xs shadow-md' 
                      : 'bg-[var(--bg-dark)] text-[var(--text-main)] border border-[var(--border)] rounded-bl-xs'
                  }`}>
                    {m.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Send bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-[var(--border)] bg-[var(--bg-dark)]/40 flex gap-2">
          <input 
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 m-0 px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--bg-card)]"
          />
          <button 
            type="submit" 
            disabled={!content.trim() || sending}
            className="btn btn-primary px-4 py-2.5 rounded-xl text-sm"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

