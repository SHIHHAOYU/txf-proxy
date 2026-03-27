import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '期 台股指數近月',
};

async function getPrice() {
  const res = await fetch('https://txf-proxy.vercel.app/api/taifex', {
    next: { revalidate: 30 },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed');
  return res.json();
}

export default async function Home() {
  let data;
  try {
    data = await getPrice();
  } catch (e) {
    data = { ok: false };
  }

  const isUp = data.ok && data.change >= 0;

  return (
    <main className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-8">期 台股指數近月</h1>

        {data.ok ? (
          <>
            <div className={`text-8xl font-light tracking-tighter mb-2 ${isUp ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
              {data.price.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-3xl flex items-center justify-center gap-3 ${isUp ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
              {isUp ? '▲' : '▼'} {data.change.toFixed(2)} ({data.changePct.toFixed(2)}%)
            </div>
            <div className="mt-8 text-[#888] text-sm">
              更新時間：{new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </>
        ) : (
          <div className="text-2xl text-red-400">載入失敗</div>
        )}

        <div className="text-[#555] text-xs mt-12">
          每 30 秒自動更新 • 下拉可手動刷新
        </div>
      </div>
    </main>
  );
}