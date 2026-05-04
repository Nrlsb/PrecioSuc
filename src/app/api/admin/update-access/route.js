import { readUsers, saveUsers } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { adminUsername, targetUsername, canSeePrices, percentage } = await request.json();
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) return NextResponse.json({ success: false }, { status: 403 });

    const userIndex = users.findIndex(u => u.username === targetUsername);
    if (userIndex === -1) return NextResponse.json({ success: false, message: 'No encontrado' }, { status: 404 });

    if (canSeePrices !== undefined) users[userIndex].canSeePrices = canSeePrices;
    if (percentage !== undefined) users[userIndex].percentage = Number(percentage) || 0;

    await saveUsers(users);
    return NextResponse.json({ success: true });
}
