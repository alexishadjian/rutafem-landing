import { NextResponse } from 'next/server';

const N8N_WEBHOOK_URL = process.env.N8N_NEW_USER_WEBHOOK_URL;

export async function POST() {
    if (!N8N_WEBHOOK_URL) {
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }
    try {
        const res = await fetch(N8N_WEBHOOK_URL, { method: 'POST' });
        if (!res.ok) throw new Error(`Webhook failed: ${res.status}`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('n8n new-user webhook:', error);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}
