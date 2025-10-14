'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to registration page
    router.push('/register');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
  <div className="text-gray-900 text-center">
        <h1 className="text-4xl font-bold mb-4">🔥 ActiveCAMPUS GO</h1>
        <p className="text-xl">Redirecting to registration...</p>
      </div>
    </div>
  );
}
