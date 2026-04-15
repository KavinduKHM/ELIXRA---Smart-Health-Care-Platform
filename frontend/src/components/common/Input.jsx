import clsx from 'clsx';

export default function Input({ label, error, className, ...props }) {
  return (
    <label className={clsx('block', className)}>
      {label ? <div className="mb-1 text-sm font-medium text-slate-700">{label}</div> : null}
      <input
        className={clsx(
          'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100',
          error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-100'
        )}
        {...props}
      />
      {error ? <div className="mt-1 text-sm text-rose-600">{error}</div> : null}
    </label>
  );
}
