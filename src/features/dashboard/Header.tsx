function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              ROBOT TELEMETRY DASHBOARD
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              RCS-1 // TELEOPERATION INTERFACE
              {/* TODO add current robot name and view here */}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
