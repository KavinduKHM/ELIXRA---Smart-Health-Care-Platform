// src/components/patient/AISymptomCheckerChatbot.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { analyzeSymptoms } from '../../services/aiSymptomCheckerService';

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
  const [open, setOpen] = useState(true);
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

  const send = async () => {
    const trimmed = input.trim();
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

  const clearChat = () => {
    if (!window.confirm('Clear symptom checker chat?')) return;
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

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ margin: 0 }}>AI Symptom Checker (Chatbot)</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setOpen((v) => !v)}>{open ? 'Hide' : 'Show'}</button>
          <button onClick={clearChat} disabled={loading}>Clear</button>
        </div>
      </div>

      {open && (
        <>
          <div
            ref={listRef}
            style={{
              marginTop: 10,
              height: 240,
              overflowY: 'auto',
              background: '#fafafa',
              border: '1px solid #eee',
              borderRadius: 8,
              padding: 10
            }}
          >
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                <div
                  style={{
                    maxWidth: '85%',
                    whiteSpace: 'pre-wrap',
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: m.role === 'user' ? '#d9e8ff' : '#fff',
                    border: '1px solid #e6e6e6'
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type symptoms and press Enter to send (Shift+Enter for newline)"
              style={{ flex: 1, resize: 'vertical' }}
              disabled={loading}
            />
            <button onClick={send} disabled={!canSend} style={{ minWidth: 90 }}>
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: 8, color: '#b00020', whiteSpace: 'pre-wrap' }}>
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AISymptomCheckerChatbot;
