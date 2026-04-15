import clsx from 'clsx';

export default function Card({ className, children }) {
  return (
    <div className={clsx('rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200', className)}>
      {children}
    </div>
  );
}
