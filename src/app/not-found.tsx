import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-black text-primary mb-2">404</h1>
      <h2 className="text-xl font-bold text-foreground mb-4">Page Not Found</h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition"
      >
        Return Home
      </Link>
    </div>
  );
}

