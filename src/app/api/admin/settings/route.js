import { readUsers, readSettings, saveSettings } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const adminUsername = searchParams.get('adminUsername');
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) return NextResponse.json({ success: false }, { status: 403 });

    const settings = await readSettings();
    return NextResponse.json(settings);
}

export async function POST(request) {
    const { adminUsername, usd_billete, usd_divisa } = await request.json();
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) return NextResponse.json({ success: false }, { status: 403 });

    await saveSettings({
        usd_billete: Number(usd_billete) || 1,
        usd_divisa: Number(usd_divisa) || 1
    });

    return NextResponse.json({ success: true });
}
