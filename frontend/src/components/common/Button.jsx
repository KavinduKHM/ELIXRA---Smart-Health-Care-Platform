import clsx from 'clsx';

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  className,
  disabled,
  children,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    secondary: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  };

  return (
    <Comp
      className={clsx(base, variants[variant], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </Comp>
  );
}
