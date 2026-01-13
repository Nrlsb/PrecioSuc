import ExcelJS from 'exceljs';
import * as xlsx from 'xlsx';
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

    // 1. Read Source (Lista001.xlsx) using xlsx (SheetJS)
    // It's fast and easy for reading values.
    if (!fs.existsSync(SOURCE_FILE)) {
        console.error(`ERROR: No se encontró el archivo origen: ${SOURCE_FILE}`);
        return;
    }

    console.log(`Leyendo archivo origen: ${SOURCE_FILE}`);
    const sourceWorkbook = xlsx.readFile(SOURCE_FILE);
    const sourceSheetName = sourceWorkbook.SheetNames[0]; // Assume first sheet
    const sourceSheet = sourceWorkbook.Sheets[sourceSheetName];

    // Convert to JSON to easily map data
    const sourceData = xlsx.utils.sheet_to_json(sourceSheet); // Default maps first row as headers

    if (sourceData.length === 0) {
        console.error('ERROR: El archivo origen parece estar vacío o no se pudo leer.');
        return;
    }

    // Detect Price Column in Source
    // We look for keys in the first row object
    const firstRow = sourceData[0];
    const keys = Object.keys(firstRow);

    // Try to find 'Precio', 'Price', or 'Precio Venta'
    let sourcePriceCol = keys.find(k => k.toLowerCase() === 'precio venta');
    if (!sourcePriceCol) sourcePriceCol = keys.find(k => k.toLowerCase().includes('precio'));
    if (!sourcePriceCol) sourcePriceCol = keys.find(k => k.toLowerCase().includes('price'));

    if (!sourcePriceCol) {
        console.error(`ERROR: No se pudo detectar una columna de precio en el origen. Columnas disponibles: ${keys.join(', ')}`);
        return;
    }

    console.log(`  -> Columna de precio detectada en origen: '${sourcePriceCol}'`);

    // Create Map for fast lookup
    const priceMap = new Map();
    sourceData.forEach(row => {
        const code = row[KEY_COLUMN];
        const price = row[sourcePriceCol];
        if (code && price !== undefined) {
            priceMap.set(String(code).trim(), price);
        }
    });

    console.log(`  -> Se cargaron ${priceMap.size} precios del archivo origen.`);

    // 2. Read and Update Target (ListaDeProductos.xlsx) using ExcelJS
    if (!fs.existsSync(TARGET_FILE)) {
        console.error(`ERROR: No se encontró el archivo destino: ${TARGET_FILE}`);
        return;
    }

    console.log(`\nLeyendo archivo destino (preservando formato): ${TARGET_FILE}`);
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.readFile(TARGET_FILE);
    } catch (err) {
        console.error(`ERROR leyendo archivo destino: ${err.message}`);
        return;
    }

    const worksheet = workbook.getWorksheet(TARGET_SHEET_NAME);
    if (!worksheet) {
        console.error(`ERROR: No se encontró la hoja '${TARGET_SHEET_NAME}' en el destino.`);
        return;
    }

    // Find column indices in Target
    // ExcelJS rows are 1-based.
    const headerRow = worksheet.getRow(1);
    let targetKeyColIdx = -1;
    let targetPriceColIdx = -1;

    headerRow.eachCell((cell, colNumber) => {
        const val = String(cell.value).trim();
        if (val === KEY_COLUMN) targetKeyColIdx = colNumber;
        if (val === TARGET_PRICE_COLUMN_HEADER) targetPriceColIdx = colNumber;
    });

    if (targetKeyColIdx === -1) {
        console.error(`ERROR: Columna clave '${KEY_COLUMN}' no encontrada en fila 1 del destino.`);
        return;
    }
    if (targetPriceColIdx === -1) {
        console.error(`ERROR: Columna precio '${TARGET_PRICE_COLUMN_HEADER}' no encontrada en fila 1 del destino.`);
        return;
    }

    console.log(`  -> Columna '${KEY_COLUMN}' es índice ${targetKeyColIdx}`);
    console.log(`  -> Columna '${TARGET_PRICE_COLUMN_HEADER}' es índice ${targetPriceColIdx}`);

    let updatesCount = 0;
    let notFoundCount = 0;

    // Iterate over rows starting from 2
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const codeCell = row.getCell(targetKeyColIdx);
        const codeVal = codeCell.value ? String(codeCell.value).trim() : '';

        // ExcelJS sometimes returns objects for formulas or rich text. 
        // Usually simple for these columns.

        if (priceMap.has(codeVal)) {
            const newPrice = priceMap.get(codeVal);
            const priceCell = row.getCell(targetPriceColIdx);

            // Update value
            const currentVal = priceCell.value;
            if (currentVal != newPrice) { # simple check, might need fuzzy float comparison
                priceCell.value = newPrice;
                updatesCount++;
            }
        } else {
            notFoundCount++;
        }
    });

    console.log(`\nResumen:`);
    console.log(`  -> Precios actualizados: ${updatesCount}`);
    console.log(`  -> Sin coincidencia / No requerían cambio: ${notFoundCount}`);

    const outputFile = path.join(__dirname, 'public', 'ListaDeProductos_Updated.xlsx');
    console.log(`\nGuardando resultado en: ${outputFile}`);
    await workbook.xlsx.writeFile(outputFile);
    console.log('¡Proceso completado!');
}

updatePrices().catch(err => console.error(err));
