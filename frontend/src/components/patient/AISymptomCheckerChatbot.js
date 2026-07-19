// src/components/patient/AISymptomCheckerChatbot.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { analyzeSymptoms } from '../../services/aiSymptomCheckerService';
import './AISymptomCheckerChatbot.css';

const QUICK_SUGGESTIONS = [
  'Fever & cough for 3 days',
  'Persistent headache',
  'Stomach pain & nausea',
  'Sore throat',
];

const formatTime = (ts) => new Date(ts || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatAiResponse = (payload) => {
  const analysis = payload?.analysis || {};
  const doctors = Array.isArray(payload?.recommendedDoctors) ? payload.recommendedDoctors : [];
  const disclaimer = payload?.disclaimer || analysis?.disclaimer;

  const lines = [];

  if (analysis.analysis) lines.push(`Analysis:\n${analysis.analysis}`);
  if (analysis.possibleConditions) lines.push(`Possible conditions:\n${analysis.possibleConditions}`);
  if (analysis.urgencyLevel) lines.push(`Urgency level: ${analysis.urgencyLevel}`);
  if (analysis.recommendedSpecialty) lines.push(`Recommended specialty: ${analysis.recommendedSpecialty}`);

  if (doctors.length > 0) {
    lines.push(
      'Recommended doctors:',
      ...doctors.map((d) => `• Dr. ${d?.name || 'Unknown'} (ID: ${d?.id ?? 'N/A'}) — ${d?.specialty || 'N/A'}`)
    );
  } else {
    lines.push('Recommended doctors: (none found)');
  }

  if (disclaimer) lines.push(`\nDisclaimer:\n${disclaimer}`);

  return lines.filter(Boolean).join('\n\n');
};

const extractBackendError = (err) => {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (data?.message) return `HTTP ${status}: ${data.message}`;

  if (data?.errors && typeof data.errors === 'object') {
    const fieldErrors = Object.entries(data.errors)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    return `HTTP ${status}:\n${fieldErrors}`;
  }

  if (typeof data === 'string') return `HTTP ${status}: ${data}`;

  if (status) return `HTTP ${status}: Request failed`;

  return err?.message || 'Request failed';
};

const AISymptomCheckerChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'bot',
      text: "Tell me your symptoms (e.g., 'fever + cough for 3 days'). I’ll suggest a specialty and available doctors.",
      ts: Date.now()
    }
  ]);

  const listRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  const send = async (preset) => {
    const trimmed = (typeof preset === 'string' ? preset : input).trim();
    if (!trimmed || loading) return;

    setError('');
    setLoading(true);
    setInput('');

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await analyzeSymptoms(trimmed);
      const botText = formatAiResponse(res.data);
      const botMsg = { id: `b-${Date.now()}`, role: 'bot', text: botText || 'No response from AI service.', ts: Date.now() };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const msg = extractBackendError(err);
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: 'bot', text: 'I could not analyze symptoms right now. Please try again.', ts: Date.now() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const clearChat = async () => {
    if (!await window.confirm('Clear symptom checker chat?')) return;
    setError('');
    setInput('');
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        text: "Tell me your symptoms (e.g., 'fever + cough for 3 days'). I’ll suggest a specialty and available doctors.",
        ts: Date.now()
      }
    ]);
  };

  const showSuggestions = messages.length <= 1 && !loading;

  return (
    <div className="ai-chat-widget">
      {open && (
        <div className="ai-chat" role="dialog" aria-label="AI Symptom Checker">
          <div className="ai-chat-head">
            <div className="ai-chat-avatar" aria-hidden="true">🩺</div>
            <div className="ai-chat-head-text">
              <h2 className="ai-chat-title">AI Symptom Checker</h2>
              <span className="ai-chat-status">
                <span className="ai-chat-status-dot" aria-hidden="true" />
                Powered by AI · Online
              </span>
            </div>
            <div className="ai-chat-head-actions">
              <button type="button" className="ai-chat-head-btn" onClick={clearChat} disabled={loading}>
                Clear
              </button>
              <button type="button" className="ai-chat-head-btn" onClick={() => setOpen(false)} aria-label="Minimize chat">
                ✕
              </button>
            </div>
          </div>

          <div ref={listRef} className="ai-chat-log">
            {messages.map((m) => (
              <div key={m.id} className={`ai-chat-row ${m.role === 'user' ? 'ai-chat-row-user' : 'ai-chat-row-bot'}`}>
                <div className="ai-chat-mini-avatar" aria-hidden="true">{m.role === 'user' ? '🙂' : '🤖'}</div>
                <div className="ai-chat-bubble-wrap">
                  <div className="ai-chat-bubble">{m.text}</div>
                  <span className="ai-chat-time">{formatTime(m.ts)}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-chat-row ai-chat-row-bot">
                <div className="ai-chat-mini-avatar" aria-hidden="true">🤖</div>
                <div className="ai-chat-bubble-wrap">
                  <div className="ai-chat-bubble ai-chat-typing" aria-label="AI is typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
          </div>

          {showSuggestions && (
            <div className="ai-chat-suggestions">
              {QUICK_SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="ai-chat-suggestion" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="ai-chat-input-row">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Describe your symptoms…"
              className="ai-chat-input"
              disabled={loading}
            />
            <button type="button" onClick={() => send()} disabled={!canSend} className="ai-chat-send" aria-label="Send">
              {loading ? '…' : '➤'}
            </button>
          </div>

          {error && <div className="ai-chat-error">{error}</div>}

          <div className="ai-chat-disclaimer">
            AI guidance only — not a medical diagnosis. Consult a doctor for medical advice.
          </div>
        </div>
      )}

      <button
        type="button"
        className="ai-chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close symptom checker' : 'Open AI symptom checker'}
        title={open ? 'Close' : 'AI Symptom Checker'}
      >
        {open ? '✕' : '🩺'}
        {!open && <span className="ai-chat-fab-ping" aria-hidden="true" />}
      </button>
    </div>
  );
};

export default AISymptomCheckerChatbot;
