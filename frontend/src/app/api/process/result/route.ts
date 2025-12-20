import { BACKEND_URL } from '../../../_lib/backend';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const jobId = searchParams.get('jobId');
    if (!jobId) {
        return new Response('jobId required', { status: 400 });
    }

    const apiRes = await fetch(
        `${BACKEND_URL}/process/result?jobId=${jobId}`
    );

    if (!apiRes.ok || !apiRes.body) {
        return new Response('PDF not ready', { status: 404 });
    }

    return new Response(apiRes.body, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': apiRes.headers.get('Content-Disposition') ??
                `attachment; filename="report-${jobId}.pdf"`,
        },
    });
}
