export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const response = await fetch("https://mis.taifex.com.tw/futures/api/getQuoteList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://mis.taifex.com.tw/futures/RegularSession/EquityIndices/Futures/"
      },
      body: JSON.stringify({ MarketType: "0", CommodityID: "TXF", RowCount: 5 })
    });

    const json = await response.json();
    const list = json.RTList;

    let d = null;
    for (let i = 0; i < list.length; i++) {
      if (list[i].CLastPrice && list[i].CLastPrice !== "-") {
        d = list[i];
        break;
      }
    }

    if (!d) {
      return res.status(200).json({ ok: false, reason: "no data" });
    }

    const price = parseFloat(d.CLastPrice);
    const prev = parseFloat(d.CRefPrice);
    const change = price - prev;
    const changePct = (change / prev) * 100;

    res.status(200).json({
      ok: true,
      price: price,
      change: change,
      changePct: changePct,
      contractName: d.CContractName || ""
    });

  } catch (e) {
    res.status(200).json({ ok: false, reason: e.message });
  }
}