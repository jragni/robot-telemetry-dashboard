import { Link } from 'react-router';

export function NotFoundView() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground">
      <h1 className="font-mono text-6xl font-bold text-primary">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
      <Link
        to="/dashboard"
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
