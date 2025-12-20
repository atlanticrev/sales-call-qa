import { NextResponse } from 'next/server';
import { BACKEND_URL } from '../../../_lib/backend';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const apiRes = await fetch(`${BACKEND_URL}/process/start`, {
      method: 'POST',
      body: formData,
    });

    if (!apiRes.ok) {
      const text = await apiRes.text();

      return new NextResponse(text, { status: apiRes.status });
    }

    const data = await apiRes.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Failed to start process' },
      { status: 500 }
    );
  }
}
