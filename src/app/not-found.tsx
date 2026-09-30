import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-7xl font-bold text-brand">404</p>
      <h1 className="mt-2 text-3xl">This thread seems to be loose</h1>
      <p className="mt-2 text-neutral-600">The page you are looking for doesn&apos;t exist.</p>
      <Link href="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
