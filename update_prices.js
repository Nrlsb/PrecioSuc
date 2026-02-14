import ExcelJS from 'exceljs';
import { read, utils } from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const SOURCE_FILE = path.join(__dirname, 'public', 'Lista001.xlsx');
const TARGET_FILE = path.join(__dirname, 'public', 'ListaDeProductos.xlsx');
const TARGET_SHEET_NAME = '001';

const KEY_COLUMN = 'Cod.Producto';
const TARGET_PRICE_COLUMN_HEADER = 'Precio Venta';

async function updatePrices() {
    console.log('--- Iniciando actualización de precios (JS) ---');

    if (!fs.existsSync(SOURCE_FILE)) {
        console.error(`ERROR: No se encontró el archivo origen: ${SOURCE_FILE}`);
        return;
    }

    console.log(`Leyendo archivo origen: ${SOURCE_FILE}`);
    const sourceWorkbook = read(fs.readFileSync(SOURCE_FILE));
    const sourceSheetName = sourceWorkbook.SheetNames[0];
    const sourceSheet = sourceWorkbook.Sheets[sourceSheetName];
    const sourceData = utils.sheet_to_json(sourceSheet);

    if (sourceData.length === 0) {
        console.error('ERROR: El archivo origen parece estar vacío.');
        return;
    }

    // Identificar columna de precio en origen
    const firstRow = sourceData[0];
    const keys = Object.keys(firstRow);
    let sourcePriceCol = keys.find(k => k.toLowerCase().replace(/\s+/g, '') === 'precioventa');
    if (!sourcePriceCol) sourcePriceCol = keys.find(k => k.toLowerCase().includes('precio'));

    if (!sourcePriceCol) {
        console.error('ERROR: No se detectó columna de precio en el origen.');
        return;
    }

    const priceMap = new Map();
    sourceData.forEach(row => {
        const code = String(row[KEY_COLUMN] || '').trim();
        const price = row[sourcePriceCol];
        if (code && price !== undefined) {
            priceMap.set(code, price);
        }
    });

    console.log(`  -> Se cargaron ${priceMap.size} precios.`);

    if (!fs.existsSync(TARGET_FILE)) {
        console.error(`ERROR: No existe el archivo destino: ${TARGET_FILE}`);
        return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TARGET_FILE);
    const worksheet = workbook.getWorksheet(TARGET_SHEET_NAME);

    if (!worksheet) {
        console.error(`ERROR: No se encontró la hoja '${TARGET_SHEET_NAME}'.`);
        return;
    }

    // Encontrar índices de columnas en el destino (ExcelJS es 1-based)
    let keyColIdx = -1;
    let priceColIdx = -1;
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
        const val = String(cell.value || '').trim();
        if (val === KEY_COLUMN) keyColIdx = colNumber;
        if (val === TARGET_PRICE_COLUMN_HEADER) priceColIdx = colNumber;
    });

    if (keyColIdx === -1 || priceColIdx === -1) {
        console.error('ERROR: No se encontraron las columnas necesarias en el destino.');
        return;
    }

    let updates = 0;
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const code = String(row.getCell(keyColIdx).value || '').trim();
        if (priceMap.has(code)) {
            const newPrice = priceMap.get(code);
            if (row.getCell(priceColIdx).value != newPrice) {
                row.getCell(priceColIdx).value = newPrice;
                updates++;
            }
        }
    });

    const outputFile = path.join(__dirname, 'public', 'ListaDeProductos_Updated.xlsx');
    await workbook.xlsx.writeFile(outputFile);
    console.log(`\n¡Éxito! Precios actualizados: ${updates}`);
    console.log(`Archivo generado: ${outputFile}`);
}

updatePrices().catch(err => console.error(err));
