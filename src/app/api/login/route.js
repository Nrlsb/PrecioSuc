import { readUsers } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { username, password } = await request.json();
        const users = await readUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            return NextResponse.json({
                success: true,
                user: {
                    username: user.username,
                    role: user.role || 'user',
                    canSeePrices: user.role === 'admin' ? true : (user.canSeePrices || false),
                    percentage: user.percentage || 0
                }
            });
        } else {
            return NextResponse.json({ success: false, message: 'Credenciales inválidas' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Error en el servidor' }, { status: 500 });
    }
}
