import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: "Webhook endpoint is active! Send a POST request to trigger it." });
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  console.log("this webhook is hit", data);

  return NextResponse.json({ message: "ok" });
}