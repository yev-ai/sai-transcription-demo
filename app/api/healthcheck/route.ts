import os from "os";

export async function GET() {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const ramUsedMB = (memoryUsage.rss / 1024 / 1024).toFixed(2);
  const ramTotalMB = (os.totalmem() / 1024 / 1024).toFixed(2);

  const response = {
    status: "ok",
    uptime_seconds: uptime.toFixed(2),
    ram: {
      used_mb: ramUsedMB,
      total_mb: ramTotalMB,
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
