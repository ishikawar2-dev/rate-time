import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-black text-gray-800 mb-2">タイマーが見つかりません</h1>
      <p className="text-gray-500 mb-6">URLが正しいか確認してください。</p>
      <Link href="/" className="btn-primary">
        ホームに戻る
      </Link>
    </main>
  );
}
