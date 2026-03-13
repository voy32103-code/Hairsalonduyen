import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    const response = new NextResponse(responseStream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });

    // Send initial ping
    writer.write(encoder.encode('event: connected\ndata: {"status":"ok"}\n\n'));

    const listener = (payload: { event: string; data: any }) => {
        try {
            writer.write(encoder.encode(`event: ${payload.event}\ndata: ${JSON.stringify(payload.data)}\n\n`));
        } catch (error) {
            console.error('Error writing to SSE stream', error);
        }
    };

    globalEmitter.on('sse', listener);

    // Keep alive every 20s
    const keepAlive = setInterval(() => {
        writer.write(encoder.encode(': ping\n\n')).catch(() => clearInterval(keepAlive));
    }, 20000);

    request.signal.addEventListener('abort', () => {
        globalEmitter.off('sse', listener);
        clearInterval(keepAlive);
        writer.close();
    });

    return response;
}

// Allow other parts of the app to send events – exported for use in server actions
// SSE global event emitter (in-process, single-instance dev mode)
const { EventEmitter } = require('events');
const globalEmitter: any = (global as any).__sseEmitter || ((global as any).__sseEmitter = new EventEmitter());

export function broadcastSSE(event: string, data: object) {
    globalEmitter.emit('sse', { event, data });
}
