import express from 'express';
import cors from 'cors';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertExcelToJson } from './convert.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const USERS_FILE = path.join(__dirname, 'users.json');
const SETTINGS_FILE = path.join(__dirname, 'settings.json');


app.use(cors());
app.use(express.json());

// Helper para leer usuarios
async function readUsers() {
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

// Helper para guardar usuarios
async function saveUsers(users) {
    await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Helper para leer settings
async function readSettings() {
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

// Helper para guardar settings
async function saveSettings(settings) {
    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}


// Endpoint de login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const users = await readUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({
            success: true,
            user: {
                username: user.username,
                role: user.role || 'user',
                canSeePrices: user.role === 'admin' ? true : (user.canSeePrices || false),
                percentage: user.percentage || 0
            }
        });
    } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
});

// Endpoint de registro (Solo para admins)
app.post('/api/register', async (req, res) => {
    const { username, password, role, adminUsername, percentage } = req.body;

    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) {
        return res.status(403).json({ success: false, message: 'No tienes permisos para crear usuarios' });
    }

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }

    users.push({
        username,
        password,
        role: role || 'user',
        canSeePrices: (role === 'admin'), // Admins ven precios por defecto
        percentage: Number(percentage) || 0
    });
    await saveUsers(users);

    res.json({ success: true, message: 'Usuario registrado con éxito' });
});

// Endpoint para obtener productos (Solo para admins)
app.get('/api/products', async (req, res) => {
    const { adminUsername } = req.query;
    const users = await readUsers();
    const user = users.find(u => u.username === adminUsername);

    if (!user || (!user.canSeePrices && user.role !== 'admin')) {
        return res.status(403).json({ success: false, message: 'Acceso denegado. No tienes permiso para ver precios.' });
    }

    try {
        const data = await readFile(path.join(__dirname, 'public', 'products.json'), 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al leer productos' });
    }
});

// Endpoint para actualizar precios (Solo para admins)
app.post('/api/admin/update-prices', async (req, res) => {
    const { adminUsername } = req.body;
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) {
        return res.status(403).json({ success: false, message: 'No tienes permisos para esta acción' });
    }

    try {
        const result = await convertExcelToJson();
        res.json({ success: true, message: 'Precios actualizados', count: result.count });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error durante la conversión', error: error.message });
    }
});

// Endpoint para listar todos los usuarios (Solo Admin)
app.get('/api/admin/users', async (req, res) => {
    const { adminUsername } = req.query;
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) {
        return res.status(403).json({ success: false, message: 'No tienes permisos' });
    }

    // Retornamos usuarios sin passwords
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
});

// Endpoint para actualizar acceso (Solo Admin)
app.post('/api/admin/update-access', async (req, res) => {
    const { adminUsername, targetUsername, canSeePrices, percentage } = req.body;
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) {
        return res.status(403).json({ success: false, message: 'No tienes permisos' });
    }

    const userIndex = users.findIndex(u => u.username === targetUsername);
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    if (canSeePrices !== undefined) users[userIndex].canSeePrices = canSeePrices;
    if (percentage !== undefined) users[userIndex].percentage = Number(percentage) || 0;

    await saveUsers(users);

    res.json({ success: true, message: 'Permisos actualizados' });
});

// Endpoint para obtener settings (Solo Admin)
app.get('/api/admin/settings', async (req, res) => {
    const { adminUsername } = req.query;
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) {
        return res.status(403).json({ success: false, message: 'No tienes permisos' });
    }

    const settings = await readSettings();
    res.json(settings);
});

// Endpoint para guardar settings (Solo Admin)
app.post('/api/admin/settings', async (req, res) => {
    const { adminUsername, usd_billete, usd_divisa } = req.body;
    const users = await readUsers();
    const admin = users.find(u => u.username === adminUsername && u.role === 'admin');

    if (!admin) {
        return res.status(403).json({ success: false, message: 'No tienes permisos' });
    }

    await saveSettings({
        usd_billete: Number(usd_billete) || 1,
        usd_divisa: Number(usd_divisa) || 1
    });

    res.json({ success: true, message: 'Configuración guardada' });
});

app.listen(PORT, () => {

    console.log(`Servidor de autenticación corriendo en http://localhost:${PORT}`);
});
