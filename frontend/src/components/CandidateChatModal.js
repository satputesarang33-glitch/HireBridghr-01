import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Phone,
  Smartphone,
  CheckCheck,
  User,
  Zap,
  Clock
} from 'lucide-react';
import { Button } from './Button.js';
import { messagingService } from '../utils/messagingService.js';
import './CandidateChatModal.css';

export function CandidateChatModal({ isOpen, onClose, candidate }) {
  if (!isOpen || !candidate) return null;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [channel, setChannel] = useState('IN_APP'); // 'IN_APP' | 'SMS' | 'WHATSAPP'
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (candidate?.id) {
      setMessages(messagingService.getCandidateMessages(candidate.id));
    }
  }, [candidate?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = messagingService.sendCandidateMessage({
      candidateId: candidate.id,
      sender: 'Elena Rostova (Recruiter)',
      senderType: 'RECRUITER',
      text: inputText,
      channel
    });

    setMessages([...messagingService.getCandidateMessages(candidate.id)]);
    setInputText('');
  };

  const insertTemplate = (templateText) => {
    setInputText(templateText);
  };

  return (
    <div className="ats-modal-overlay" onClick={onClose}>
      <div className="ats-chat-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ats-modal-header border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Direct Candidate Messaging</h3>
              <p className="text-[11px] text-slate-500">
                Conversation with <strong className="text-slate-700">{candidate.name}</strong> • {candidate.phone || '+1 (555) 000-0000'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="ats-modal-close-btn text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selection Bar */}
        <div className="flex items-center justify-between px-6 py-2 bg-slate-50 border-b border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-500">Delivery Channel:</span>
          <div className="flex gap-1.5">
            {[
              { id: 'IN_APP', label: 'In-App Portal Chat', icon: MessageSquare },
              { id: 'SMS', label: 'SMS Text Message', icon: Smartphone },
              { id: 'WHATSAPP', label: 'WhatsApp Alert', icon: Phone },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setChannel(id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                  channel === id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto bg-slate-50/50 flex-1">
          {messages.map((m) => {
            const isRecruiter = m.senderType === 'RECRUITER';
            return (
              <div
                key={m.id}
                className={`ats-chat-bubble ${isRecruiter ? 'recruiter' : 'candidate'}`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 mb-1">
                  <span className="font-bold">{m.sender}</span>
                  <span className="font-mono">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="whitespace-pre-line">{m.text}</p>
                {m.channel && m.channel !== 'IN_APP' && (
                  <span className="text-[9px] block text-right opacity-70 mt-1 uppercase font-mono">
                    via {m.channel}
                  </span>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Message Templates */}
        <div className="px-6 py-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[10px] text-slate-500 bg-white">
          <span className="font-bold shrink-0 text-slate-400">Templates:</span>
          {[
            'Hi, your interview starts in 15 minutes!',
            'Could you please share your updated portfolio?',
            'Congratulations! We have extended an offer.'
          ].map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertTemplate(tmpl)}
              className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap shrink-0 border border-slate-200"
            >
              {tmpl.slice(0, 30)}...
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Type a message via ${channel}...`}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
          />
          <Button type="submit" variant="primary" size="sm" icon={Send} disabled={!inputText.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CandidateChatModal;
