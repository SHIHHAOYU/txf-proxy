import { NextResponse } from 'next/server';

export async function GET() {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const response = await fetch("https://mis.taifex.com.tw/futures/api/getQuoteList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://mis.taifex.com.tw/futures/RegularSession/EquityIndices/Futures/",
        "Origin": "https://mis.taifex.com.tw",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        MarketType: "0",
        SymbolType: "F",
        KindID: "1",
        CID: "TXF",
        ExpireMonth: "",
        RowSize: "全部",
        PageNo: "",
        SortColumn: "",
        AscDesc: "A"
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    const list = json.RtData?.QuoteList || [];

    // 抓第一筆有價格的台指期近月（早盤/夜盤都會正確）
    let d = list.find(item => item.CLastPrice && item.CLastPrice !== "-");

    if (!d) {
      return NextResponse.json({ ok: false, reason: "no futures data" }, { headers, status: 200 });
    }

    const price = parseFloat(d.CLastPrice);
    const prev = parseFloat(d.CRefPrice);
    const change = price - prev;
    const changePct = prev !== 0 ? (change / prev) * 100 : 0;

    return NextResponse.json({
      ok: true,
      price,
      change,
      changePct: parseFloat(changePct.toFixed(2)),
      contractName: "期 台股指數近月",
      updateTime: d.CTime || "",
      session: "早盤", // 之後 Widget 會根據時間自動判斷
    }, { headers });

  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : String(e);
    console.error("TAIFEX API 錯誤:", e);
    return NextResponse.json({ ok: false, reason: errorMsg }, { headers, status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}