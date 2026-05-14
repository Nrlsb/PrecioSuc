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

    // Función para limpiar strings
    const clean = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    console.log(`Leyendo archivo origen: ${SOURCE_FILE}`);
    const sourceWorkbook = read(fs.readFileSync(SOURCE_FILE));
    const sourceSheetName = sourceWorkbook.SheetNames[0];
    const sourceSheet = sourceWorkbook.Sheets[sourceSheetName];
    const sourceDataArray = utils.sheet_to_json(sourceSheet, { header: 1 });

    if (sourceDataArray.length === 0) {
        console.error('ERROR: El archivo origen está vacío.');
        return;
    }

    // Buscar cabeceras en el origen
    let sourceHeaders = sourceDataArray[0];
    let sourceKeyIdx = -1;
    let sourcePriceIdx = -1;
    let sourceMonedaIdx = -1;

    for (let i = 0; i < Math.min(sourceDataArray.length, 10); i++) {
        const row = sourceDataArray[i];
        sourceKeyIdx = row.findIndex(c => clean(c) === 'codproducto');
        sourcePriceIdx = row.findIndex(c => clean(c).includes('precioventa') || clean(c) === 'precio');
        sourceMonedaIdx = row.findIndex(c => clean(c) === 'moneda' || clean(c) === 'mnd');
        if (sourceKeyIdx !== -1) {
            sourceHeaders = row;
            break;
        }
    }

    const priceMap = new Map();
    const monedaMap = new Map();
    sourceDataArray.slice(1).forEach(row => {
        const code = String(row[sourceKeyIdx] || '').trim();
        const price = row[sourcePriceIdx];
        const moneda = row[sourceMonedaIdx];
        if (code && code !== 'undefined' && price !== undefined) {
            priceMap.set(code, price);
        }
        if (code && moneda !== undefined) {
            monedaMap.set(code, moneda);
        }
    });

    console.log(`  -> Se cargaron ${priceMap.size} precios desde el origen.`);
    if (priceMap.size > 0) {
        const sampleKeys = Array.from(priceMap.keys()).slice(0, 5);
        console.log(`  -> Muestra de códigos en origen: ${sampleKeys.join(', ')}`);
    }

    if (!fs.existsSync(TARGET_FILE)) {
        console.error(`ERROR: No existe el archivo destino: ${TARGET_FILE}`);
        return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TARGET_FILE);

    let totalUpdates = 0;

    workbook.eachSheet(worksheet => {
        const sheetName = worksheet.name;
        const headerRow = worksheet.getRow(1);
        if (!headerRow || !headerRow.values) return;

        let targetKeyColIdx = -1;
        let targetPriceColIdx = -1;
        let targetMonedaColIdx = -1;

        headerRow.eachCell((cell, colNumber) => {
            const val = clean(cell.value);
            if (['codproducto', 'codigo', 'cod'].includes(val)) targetKeyColIdx = colNumber;
            if (['precioventa', 'neto', 'unitario', 'precio'].includes(val)) targetPriceColIdx = colNumber;
            if (['moneda', 'mnd'].includes(val)) targetMonedaColIdx = colNumber;
        });

        if (targetKeyColIdx === -1) {
            // console.log(`  -> Saltando hoja '${sheetName}': No se encontró columna de código.`);
            return;
        }

        console.log(`\nProcesando hoja: '${sheetName}' (Columna Código: ${targetKeyColIdx}, Precio: ${targetPriceColIdx})`);

        let sheetUpdates = 0;
        let sheetMatches = 0;
        let firstCodes = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const cellValue = row.getCell(targetKeyColIdx).value;
            const code = String(cellValue || '').trim();
            if (!code) return;
            
            sheetMatches++;
            if (firstCodes.length < 3) firstCodes.push(code);

            let changed = false;
            if (priceMap.has(code) && targetPriceColIdx !== -1) {
                const newPrice = priceMap.get(code);
                const currentCell = row.getCell(targetPriceColIdx);
                if (currentCell.value != newPrice) {
                    currentCell.value = newPrice;
                    changed = true;
                }
            }

            if (monedaMap.has(code) && targetMonedaColIdx !== -1) {
                const newMoneda = monedaMap.get(code);
                if (row.getCell(targetMonedaColIdx).value != newMoneda) {
                    row.getCell(targetMonedaColIdx).value = newMoneda;
                    changed = true;
                }
            }

            if (changed) {
                sheetUpdates++;
                totalUpdates++;
            }
        });

        if (sheetUpdates > 0 || sheetMatches > 0) {
            console.log(`  -> Filas con datos en '${sheetName}': ${sheetMatches}`);
            console.log(`  -> Muestra de códigos en esta hoja: ${firstCodes.join(', ')}`);
            console.log(`  -> Actualizaciones realizadas: ${sheetUpdates}`);
        }
    });



    // Guardar los cambios sobreescribiendo el archivo original
    await workbook.xlsx.writeFile(TARGET_FILE);
    console.log(`\n¡Éxito! Precios actualizados en el archivo original: ${TARGET_FILE}`);
    console.log(`Total de actualizaciones: ${totalUpdates}`);
}

updatePrices().catch(err => console.error(err));
