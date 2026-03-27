export default async function handler(req, res) {
  // CORS 設定
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
        RowSize: "全部",     // 改成「全部」最穩定
        PageNo: "",
        SortColumn: "",
        AscDesc: "A"
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const list = json.RtData?.QuoteList || [];   // ← 這裡改了！

    // 找第一筆有即時價格的合約（通常是近月）
    let d = null;
    for (let item of list) {
      if (item.CLastPrice && item.CLastPrice !== "-") {
        d = item;
        break;
      }
    }

    if (!d) {
      return res.status(200).json({ ok: false, reason: "no data" });
    }

    const price = parseFloat(d.CLastPrice);
    const prev = parseFloat(d.CRefPrice);
    const change = price - prev;
    const changePct = prev !== 0 ? (change / prev) * 100 : 0;

    res.status(200).json({
      ok: true,
      price: price,
      change: change,
      changePct: parseFloat(changePct.toFixed(2)),
      contractName: d.CContractName || d.D