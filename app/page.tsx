import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '台指期即時',
  description: '台指期即時價格',
};

async function getPrice() {
  const res = await fetch('https://txf-proxy.vercel.app/api/taifex', {
    next: { revalidate: 30 }, // 每 30 秒自動重新抓資料
  });
  if (!res.ok) throw new Error('Failed to fetch');
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
    <main className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md">
        {/* 標題 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">台指期</h1>
          <span className="text-[#888] text-sm">即時</span>
        </div>

        {data.ok ? (
          <>
            {/* 價格 */}
            <div className="text-center mb-6">
              <div className={`text-7xl font-light tracking-tighter ${isUp ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                {data.price.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}
              </div>
              <div className={`text-2xl mt-1 flex items-center justify-center gap-2 ${isUp ? 'text-[#00FF88]' : 'text-[#FF4444]'}`}>
                {isUp ? '▲' : '▼'} {data.change.toFixed(2)} ({data.changePct.toFixed(2)}%)
              </div>
            </div>

            {/* 合約 + 時間 */}
            <div className="bg-[#1A1A1A] rounded-2xl p-5 text-center">
              <div className="text-[#AAA] text-sm mb-1">合約</div>
              <div className="text-xl font-medium">{data.contractName}</div>
              <div className="text-[#888] text-xs mt-4">
                更新時間：{data.updateTime || new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>

            {/* 自動刷新提示 */}
            <div className="text-center text-[#666] text-xs mt-8">
              每 30 秒自動更新 • 拉頁面可手動刷新
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">❌</div>
            <div className="text-xl">載入失敗</div>
          </div>
        )}
      </div>
    </main>
  );
}