import { NextResponse } from 'next/server';

export async function GET() {
  // CORS 設定
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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
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
        AscDesc: "A",
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const json = await response.json();
    const list = json.RtData?.QuoteList || [];

    let d = null;
    for (let item of list) {
      if (item.CLastPrice && item.CLastPrice !== "-") {
        d = item;
        break;
      }
    }

    if (!d) {
      return NextResponse.json({ ok: false, reason: "no data" }, { headers, status: 200 });
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
      contractName: d.CContractName || d.DispCName || "",
      updateTime: d.CTime || "",
    }, { headers });

  } catch (e) {
    console.error("TAIFEX API 錯誤:", e);
    return NextResponse.json(
      { ok: false, reason: e.message },
      { headers, status: 500 }
    );
  }
}

// 處理 OPTIONS 請求（CORS）
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
// 已從手機修正