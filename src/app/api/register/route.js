import { readUsers, saveUsers } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const { username, password, role, adminUsername, percentage } = await request.json();
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });

    if (users.find(u => u.username === username)) {
        return NextResponse.json({ success: false, message: 'El usuario ya existe' }, { status: 400 });
    }

    users.push({
        username,
        password,
        role: role || 'user',
        canSeePrices: (role === 'admin'),
        percentage: Number(percentage) || 0
    });
    await saveUsers(users);

    return NextResponse.json({ success: true });
}
