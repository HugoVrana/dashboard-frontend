import { NextRequest, NextResponse } from 'next/server';
import {LogCreate} from "@/app/models/log/logCreate";
import {LokiStream, toLokiFormat} from "@/app/models/log/lokiStream";

export async function POST(request: NextRequest) : Promise<NextResponse> {
    try {
        const logEntry : LogCreate = await request.json();
        const lokiStream : LokiStream = toLokiFormat(logEntry);

        const lokiUrl : string | undefined = process.env.NEXT_PUBLIC_LOKI_URL;
        const lokiToken : string | undefined = process.env.NEXT_PUBLIC_LOKI_TOKEN;

        if (!lokiUrl || !lokiToken) {
            return NextResponse.json(
                { error: 'Loki configuration missing' },
                { status: 500 }
            );
        }

        const response : Response = await fetch(lokiUrl, {
            method: 'POST',
            body: JSON.stringify(lokiStream),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lokiToken}`,
            }
        });

        if (!response.ok) {
            const errorText : string = await response.text();
            console.error('Loki push failed:', response.status, errorText);
            return NextResponse.json(
                { error: 'Failed to push to Loki', status: response.status },
                { status: response.status }
            );
        }

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error('Failed to send log to Loki:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}