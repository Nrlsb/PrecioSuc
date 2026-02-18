import { read, utils } from 'xlsx';
import { writeFile, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

// Configura las rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_FILE_PATH = path.join(__dirname, 'public', 'ListaDeProductos.xlsx');
const JSON_OUTPUT_PATH = path.join(__dirname, 'public', 'products.json');
const SETTINGS_PATH = path.join(__dirname, 'settings.json');


const SHEET_NAMES_TO_READ = ['001', 'DA1', 'ListaCorte'];
const MASTER_SHEET = 'SB1';

// Mapeo de IVA basado en TES
const IVA_MAP = {
  '501': 1.105,
  '503': 1.21
};

// Función para limpiar nombres de columnas de forma agresiva
const cleanStr = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function findHeaderIndex(headers, colNames) {
  if (!colNames) return -1;
  const targets = (Array.isArray(colNames) ? colNames : [colNames]).map(n => cleanStr(n));
  for (let i = 0; i < headers.length; i++) {
    const h = cleanStr(headers[i]);
    if (targets.includes(h)) return i;
  }
  return -1;
}


export async function convertExcelToJson() {
  try {
    const productMap = new Map();
    const productMonedaMap = new Map(); // Para guardar la moneda de 001/DA1 y usarla en ListaCorte

    console.log(`Leyendo archivo Excel desde: ${EXCEL_FILE_PATH}`);
    const workbook = read(EXCEL_FILE_PATH, { type: 'file' });

    // Cargar Settings (Tasas de cambio)
    let settings = { usd_billete: 1, usd_divisa: 1 };
    try {
      const settingsData = await readFile(SETTINGS_PATH, 'utf-8');
      settings = JSON.parse(settingsData);
      console.log('Settings cargados:', settings);
    } catch (e) {
      console.warn('No se pudo cargar settings.json, usando valores por defecto (1).');
    }


    // 1. Cargar Maestro de Descripciones e IVA (SB1)
    const masterDataMap = new Map();
    const sb1Sheet = workbook.Sheets[MASTER_SHEET];
    if (sb1Sheet) {
      console.log(`Cargando datos maestros desde ${MASTER_SHEET}...`);
      const sb1Data = utils.sheet_to_json(sb1Sheet, { header: 1 });
      const sb1Headers = sb1Data[0] || [];
      const codeIdx = findHeaderIndex(sb1Headers, 'Codigo');
      const descIdx = findHeaderIndex(sb1Headers, 'Descripcion');
      const tsIdx = findHeaderIndex(sb1Headers, ['TS Estandar', 'TES', 'IVA']);

      if (codeIdx !== -1) {
        sb1Data.slice(1).forEach(row => {
          const code = String(row[codeIdx] || '').trim();
          const desc = descIdx !== -1 ? String(row[descIdx] || '').trim() : '';
          const tes = tsIdx !== -1 ? String(row[tsIdx] || '').trim() : '';
          if (code) {
            masterDataMap.set(code, { desc, tes });
          }
        });
        console.log(`  -> ${masterDataMap.size} productos en maestro SB1.`);
      }
    }

    // 2. Procesar hojas de precios
    for (const sheetName of SHEET_NAMES_TO_READ) {
      console.log(`\n--- Procesando pestaña: '${sheetName}' ---`);
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        console.log(`  [Aviso] Pestaña '${sheetName}' no encontrada.`);
        continue;
      }

      const dataAsArray = utils.sheet_to_json(worksheet, { header: 1 });
      if (dataAsArray.length < 2) continue;

      const headers = dataAsArray[0];
      // console.log(`  -> Cabeceras encontradas: ${headers.join(', ')}`);

      // Índices de columnas clave
      const codeIdx = findHeaderIndex(headers, ['Cod.Producto', 'Codigo', 'Cod']);
      const descIdx = findHeaderIndex(headers, 'Descripcion');
      const stockIdx = findHeaderIndex(headers, 'Grupo');
      const netoIdx = findHeaderIndex(headers, ['Precio Venta', 'Neto', 'Unitario']);
      const finalIdx = findHeaderIndex(headers, 'Final');
      const tesIdx = findHeaderIndex(headers, ['TES', 'Impuesto', 'IVA', 'TS Estandar']);
      const monedaIdx = findHeaderIndex(headers, ['Moneda', 'MND', 'MND.', 'Mon']);


      console.log(`  -> Índices detectados: Code:${codeIdx}, Neto:${netoIdx}, Final:${finalIdx}, TES:${tesIdx}, Moneda:${monedaIdx}`);


      const dataRows = dataAsArray.slice(1);
      dataRows.forEach((row, index) => {
        const code = String(row[codeIdx] || '').trim();
        if (!code || code === 'undefined' || code === 'Codigo') return;

        // Limpieza de precios
        const parsePrice = (val) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const clean = val.replace(/\$/g, '').replace(/ /g, '').replace(/\./g, '').replace(',', '.').trim();
            const f = parseFloat(clean);
            return isNaN(f) ? 0 : f;
          }
          return 0;
        };

        const rawNeto = parsePrice(row[netoIdx]);
        const rawFinal = parsePrice(row[finalIdx]);

        // Obtener TES (IVA) con fallback al maestro
        let tesValue = String(row[tesIdx] || '').trim();
        if (!tesValue && masterDataMap.has(code)) {
          tesValue = masterDataMap.get(code).tes;
        }

        const ivaFactor = IVA_MAP[tesValue] || 1.21;

        let priceNeto = 0;

        // LÓGICA DE CÁLCULO: Priorizar Precio Venta si existe.
        if (rawNeto > 0) {
          priceNeto = rawNeto;
        } else if (rawFinal > 0) {
          // Si solo hay 'Final', calculamos el Neto hacia atrás.
          // Neto = Final / (1.04 * Factor_IVA)
          priceNeto = rawFinal / (1.04 * ivaFactor);
        }

        if (priceNeto === 0) return;

        // --- CONVERSIÓN DE MONEDA ---
        // Moneda 1: ARS (1:1)
        // Moneda 2: USD Billete
        // Moneda 3: USD Divisa
        let monedaStr = String(row[monedaIdx] || '').trim().toUpperCase();

        // Registrar moneda en el mapa para usar de fallback en otras hojas
        if (monedaStr) {
          productMonedaMap.set(code, monedaStr);
        } else if (productMonedaMap.has(code)) {
          // Fallback si no hay moneda en esta hoja (ej: ListaCorte)
          monedaStr = productMonedaMap.get(code);
        }

        let exchangeRate = 1;
        if (['2', 'USD', 'DOLAR', 'DÓLAR', 'BILLETE'].includes(monedaStr)) {
          exchangeRate = settings.usd_billete;
        } else if (['3', 'DIVISA'].includes(monedaStr)) {
          exchangeRate = settings.usd_divisa;
        }

        priceNeto = priceNeto * exchangeRate;
        // ----------------------------

        const priceConIva = priceNeto * ivaFactor;

        // Si ya existe en el mapa de productos, lo actualizamos (sobrescribimos)
        // Esto permite que 'ListaCorte' (que es la última en procesarse) tenga la última palabra en precios
        const product = {
          id: code,
          code: code,
          description: masterDataMap.get(code)?.desc || String(row[descIdx] || '').trim(),
          stock: String(row[stockIdx] || '').trim(),
          price_neto: parseFloat(priceNeto.toFixed(4)),
          price: parseFloat(priceConIva.toFixed(2)), // Base con IVA
          tes: tesValue || (ivaFactor === 1.105 ? '501' : '503')
        };

        if (product.description && product.description !== 'undefined') {
          productMap.set(code, product);
        }
      });
    }

    const finalProductList = Array.from(productMap.values());
    await writeFile(JSON_OUTPUT_PATH, JSON.stringify(finalProductList, null, 2));
    console.log(`¡Éxito! JSON actualizado con ${finalProductList.length} productos.`);
    return { success: true, count: finalProductList.length };

  } catch (error) {
    console.error('Error durante la conversión:', error);
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  convertExcelToJson();
}
