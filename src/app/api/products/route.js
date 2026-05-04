import { readUsers, readProducts } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const adminUsername = searchParams.get('adminUsername');

    const users = await readUsers();
    const user = users.find(u => u.username === adminUsername);

    if (!user || (!user.canSeePrices && user.role !== 'admin')) {
        return NextResponse.json({ success: false, message: 'Acceso denegado' }, { status: 403 });
    }

    try {
        const products = await readProducts();
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Error al leer productos' }, { status: 500 });
    }
}
