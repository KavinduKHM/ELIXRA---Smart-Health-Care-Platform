import { useEffect, useRef, useState } from 'react';
import Card from '../common/Card';
import Spinner from '../common/Spinner';
import { getSessionDetails } from '../../services/telemedicine.service';

export default function WaitingRoom({ sessionId, onActive, pollMs = 3000 }) {
  const [status, setStatus] = useState('SCHEDULED');
  const firedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return undefined;

    let cancelled = false;

    const tick = async () => {
      try {
        const details = await getSessionDetails(sessionId);
        if (cancelled) return;

        const nextStatus = details?.status || 'SCHEDULED';
        setStatus(nextStatus);

        if (nextStatus === 'ACTIVE' && !firedRef.current) {
          firedRef.current = true;
          if (typeof onActive === 'function') onActive();
        }
      } catch {
        // Ignore transient polling errors.
      }
    };

    tick();
    const interval = setInterval(tick, pollMs);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [onActive, pollMs, sessionId]);

  return (
    <Card>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Spinner /> Waiting for the call to start
      </div>
      <div className="mt-2 text-xs font-semibold text-slate-600">Session status: {status}</div>
    </Card>
  );
}
