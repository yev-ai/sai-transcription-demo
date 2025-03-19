import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  const session = await auth();
  try {
    console.log(`Session/Route access`, session);

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(`OPENAI_API_KEY is not set`);
    }
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        instructions: `TODO`,
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch session data' }, { status: 500 });
  }
}
