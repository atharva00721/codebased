export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") ?? "world";

  return Response.json({
    greeting: `Hello ${text}`,
  });
}
