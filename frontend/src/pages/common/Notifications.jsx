import { useQuery } from '@tanstack/react-query';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../hooks/useAuth';
import { listNotificationsForUser } from '../../services/notification.service';

export default function Notifications() {
  const { userId } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => listNotificationsForUser(userId),
    enabled: Boolean(userId),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="mt-1 text-sm text-slate-600">Your recent updates.</p>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner /> Loading notifications
          </div>
        ) : error ? (
          <div className="text-sm text-rose-600">Failed to load notifications.</div>
        ) : (
          <div className="space-y-3">
            {(Array.isArray(data) ? data : data?.items || []).length === 0 ? (
              <div className="text-sm text-slate-600">No notifications yet.</div>
            ) : (
              (Array.isArray(data) ? data : data?.items || []).map((n) => (
                <div key={n.id || `${n.createdAt}-${n.message}`} className="rounded-xl border border-slate-200 p-3">
                  <div className="text-sm font-semibold">{n.title || 'Update'}</div>
                  <div className="mt-1 text-sm text-slate-700">{n.message || n.content || JSON.stringify(n)}</div>
                  {n.createdAt ? <div className="mt-1 text-xs text-slate-500">{String(n.createdAt)}</div> : null}
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
