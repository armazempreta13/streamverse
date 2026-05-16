import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h2 className="text-4xl font-bold mb-4">404 - Not Found</h2>
      <p className="mb-8">Could not find requested resource</p>
      <Link href="/" className="bg-[#7B2EFF] text-white px-6 py-2 rounded-lg font-bold">
        Return Home
      </Link>
    </div>
  );
}
