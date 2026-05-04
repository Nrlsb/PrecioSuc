import { readUsers } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const adminUsername = searchParams.get('adminUsername');
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) return NextResponse.json({ success: false }, { status: 403 });

    const safeUsers = users.map(({ password, ...u }) => u);
    return NextResponse.json(safeUsers);
}
