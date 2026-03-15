export default function LoadingScreen({ label = 'Loading interface' }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel neural-outline rounded-[30px] px-8 py-7 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-cyan/25 border-t-cyan" />
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.4em] text-cyan/70">{label}</p>
      </div>
    </div>
  );
}
