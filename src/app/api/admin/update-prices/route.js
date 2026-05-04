import { readUsers } from '@/lib/db';
import { convertExcelToJson } from '@/lib/convert';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { adminUsername } = await request.json();
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) return NextResponse.json({ success: false }, { status: 403 });

    try {
        const result = await convertExcelToJson();
        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
