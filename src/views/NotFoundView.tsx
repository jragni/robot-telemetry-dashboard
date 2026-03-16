import { Link } from 'react-router';

export function NotFoundView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950 text-gray-100">
      <h1 className="text-6xl font-bold text-gray-600">404</h1>
      <p className="text-xl text-gray-400">Page not found</p>
      <Link
        to="/dashboard"
        className="mt-2 rounded px-4 py-2 text-sm font-medium text-brand hover:text-brand-light underline underline-offset-4"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
