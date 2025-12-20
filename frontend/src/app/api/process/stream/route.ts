import { BACKEND_URL } from '../../../_lib/backend';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const jobId = searchParams.get('jobId');
    if (!jobId) {
        return new Response('jobId required', { status: 400 });
    }

    const apiRes = await fetch(
        `${BACKEND_URL}/process/stream?jobId=${jobId}`,
        {
            headers: {
                Accept: 'text/event-stream',
            },
        }
    );

    if (!apiRes.ok || !apiRes.body) {
        return new Response('Failed to connect to SSE', { status: 500 });
    }

    return new Response(apiRes.body, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    });
}
