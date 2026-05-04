import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'users.json');
const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');
const PRODUCTS_FILE = path.join(process.cwd(), 'public', 'products.json');

export async function readUsers() {
    try {
        const data = await readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

export async function saveUsers(users) {
    await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

export async function readSettings() {
    try {
        const data = await readFile(SETTINGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { usd_billete: 1, usd_divisa: 1 };
        }
        throw error;
    }
}

export async function saveSettings(settings) {
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export async function readProducts() {
    try {
        const data = await readFile(PRODUCTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}
