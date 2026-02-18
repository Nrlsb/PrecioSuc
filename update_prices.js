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
const TARGET_MONEDA_COLUMN_HEADER = 'Moneda';


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

    // Identificar columna de moneda en origen
    let sourceMonedaCol = keys.find(k => k.toLowerCase().replace(/\s+/g, '') === 'moneda');

    const priceMap = new Map();
    const monedaMap = new Map();
    sourceData.forEach(row => {
        const code = String(row[KEY_COLUMN] || '').trim();
        const price = row[sourcePriceCol];
        const moneda = row[sourceMonedaCol];
        if (code && price !== undefined) {
            priceMap.set(code, price);
        }
        if (code && moneda !== undefined) {
            monedaMap.set(code, moneda);
        }
    });

    console.log(`  -> Se cargaron ${priceMap.size} precios y ${monedaMap.size} monedas.`);


    if (!fs.existsSync(TARGET_FILE)) {
        console.error(`ERROR: No existe el archivo destino: ${TARGET_FILE}`);
        return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TARGET_FILE);

    let totalUpdates = 0;

    workbook.eachSheet(worksheet => {
        const sheetName = worksheet.name;
        // Solo procesar hojas de interés (o todas las que tengan la columna clave)
        // En este caso, procesaremos todas las que tengan KEY_COLUMN

        let keyColIdx = -1;
        let priceColIdx = -1;
        let monedaColIdx = -1;
        const headerRow = worksheet.getRow(1);

        if (!headerRow || !headerRow.values) return;

        headerRow.eachCell((cell, colNumber) => {
            const val = String(cell.value || '').trim();
            if (val === KEY_COLUMN) keyColIdx = colNumber;
            if (val === TARGET_PRICE_COLUMN_HEADER) priceColIdx = colNumber;
            if (val === TARGET_MONEDA_COLUMN_HEADER) monedaColIdx = colNumber;
        });

        if (keyColIdx === -1) {
            // console.log(`  -> Saltando hoja '${sheetName}': No se encontró '${KEY_COLUMN}'.`);
            return;
        }

        console.log(`\nProcesando hoja: '${sheetName}'`);

        if (priceColIdx === -1) {
            console.warn(`  [!] Advertencia: No se encontró la columna '${TARGET_PRICE_COLUMN_HEADER}' en '${sheetName}'.`);
        }

        // Si no existe Moneda en destino, intentamos agregarla al final si hay al menos una columna de ID
        if (monedaColIdx === -1 && keyColIdx !== -1) {
            monedaColIdx = headerRow.actualCellCount + 1;
            headerRow.getCell(monedaColIdx).value = TARGET_MONEDA_COLUMN_HEADER;
            console.log(`  -> Se agregó la columna '${TARGET_MONEDA_COLUMN_HEADER}' a la hoja '${sheetName}'.`);
        }

        let sheetUpdates = 0;
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const code = String(row.getCell(keyColIdx).value || '').trim();
            let changed = false;

            if (priceMap.has(code) && priceColIdx !== -1) {
                const newPrice = priceMap.get(code);
                if (row.getCell(priceColIdx).value != newPrice) {
                    row.getCell(priceColIdx).value = newPrice;
                    changed = true;
                }
            }

            if (monedaMap.has(code) && monedaColIdx !== -1) {
                const newMoneda = monedaMap.get(code);
                if (row.getCell(monedaColIdx).value != newMoneda) {
                    row.getCell(monedaColIdx).value = newMoneda;
                    changed = true;
                }
            }

            if (changed) {
                sheetUpdates++;
                totalUpdates++;
            }
        });

        if (sheetUpdates > 0) {
            console.log(`  -> Actualizaciones en '${sheetName}': ${sheetUpdates}`);
        }
    });



    const outputFile = path.join(__dirname, 'public', 'ListaDeProductos_Updated.xlsx');
    await workbook.xlsx.writeFile(outputFile);
    console.log(`\n¡Éxito! Precios actualizados: ${totalUpdates}`);
    console.log(`Archivo generado: ${outputFile}`);
}

updatePrices().catch(err => console.error(err));
