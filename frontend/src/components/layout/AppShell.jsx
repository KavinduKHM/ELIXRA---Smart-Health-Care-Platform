import Navbar from './Navbar';

export default function AppShell({ role, children }) {
  return (
    <div className="min-h-full">
      <Navbar role={role} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
