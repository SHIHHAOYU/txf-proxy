export default function Home() {
  return (
    <main style={{
      height: "100vh",
      backgroundColor: "#0F0F0F",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontFamily: "system-ui"
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>期 台股指數近月</h1>
        <p style={{ color: "#888", marginBottom: "30px" }}>正在跳轉到鉅亨網即時行情...</p>
        
        {/* 自動跳轉 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.location.href = "https://invest.cnyes.com/futures/TWF/TXF";
          `
        }} />
      </div>
    </main>
  );
}