export default function Logo() {
  return (
    <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-ev-blue to-ev-green flex items-center justify-center flex-shrink-0">
        <img src="/image/logo.jpg" alt="logo" />
      </div>
      <div className="min-w-0">
        <h1 className="text-lg font-bold text-foreground truncate">
          EV Warranty
        </h1>
        <p className="text-xs text-muted-foreground truncate">
          Management System
        </p>
      </div>
    </div>
  );
}
