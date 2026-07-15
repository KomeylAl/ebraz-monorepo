export const runtime = "nodejs";

export default function RootPage() {
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Ebraz Clinic API</h1>
      <p>API is running. Use /api/v1/health for health check.</p>
    </main>
  );
}
