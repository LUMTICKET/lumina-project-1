export async function GET() {
  return Response.json({
    data: {
      name: "Lumina API",
      version: "v1",
      health: "/api/health",
      basePath: "/api/v1",
    },
  });
}
