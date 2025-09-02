import { NextRequest, NextResponse } from 'next/server';
import { getIP, getIPRequestCount, incrementIPRequestCount } from '../services/ai-rate-limiter';

const AI_CHAT_LIMIT = 10;
const AI_RECOMMENDATIONS_LIMIT = 200;
const WINDOW_IN_SECONDS = 60;

export async function aiRateLimiter(request: NextRequest) {
  const ip = getIP(request);
  const requestCount = await getIPRequestCount(ip);

  let limit = 0;
  if (request.nextUrl.pathname.startsWith('/api/ai-companion/chat')) {
    limit = AI_CHAT_LIMIT;
  } else if (request.nextUrl.pathname.startsWith('/api/ai-companion/recommendations')) {
    limit = AI_RECOMMENDATIONS_LIMIT;
  }

  if (limit > 0 && requestCount >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  await incrementIPRequestCount(ip, WINDOW_IN_SECONDS);
  
  return NextResponse.next();
}
