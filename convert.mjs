import { read, utils } from 'xlsx';
import { writeFile, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

// Configura las rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXCEL_FILE_PATH = path.join(__dirname, 'public', 'ListaDeProductos.xlsx');
const JSON_OUTPUT_PATH = path.join(__dirname, 'public', 'products.json');

const SHEET_NAMES_TO_READ = ['001', 'ListaCorte'];
const MASTER_SHEET = 'SB1';

// Mapeo de IVA basado en TES
const IVA_MAP = {
  '501': 1.105,
  '503': 1.21
};

// Función para limpiar nombres de columnas de forma agresiva
const cleanStr = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function findHeaderIndex(headers, colName) {
  if (!colName) return -1;
  const target = cleanStr(colName);
  for (let i = 0; i < headers.length; i++) {
    if (cleanStr(headers[i]) === target) return i;
  }
  return -1;
}

export async function convertExcelToJson() {
  try {
    const productMap = new Map();
    console.log(`Leyendo archivo Excel desde: ${EXCEL_FILE_PATH}`);
    const workbook = read(EXCEL_FILE_PATH, { type: 'file' });

    // 1. Cargar Maestro de Descripciones (SB1)
    const descriptionsMap = new Map();
    const sb1Sheet = workbook.Sheets[MASTER_SHEET];
    if (sb1Sheet) {
      console.log(`Cargando descripciones maestras desde ${MASTER_SHEET}...`);
      const sb1Data = utils.sheet_to_json(sb1Sheet, { header: 1 });
      const sb1Headers = sb1Data[0] || [];
      const codeIdx = findHeaderIndex(sb1Headers, 'Codigo');
      const descIdx = findHeaderIndex(sb1Headers, 'Descripcion');

      if (codeIdx !== -1 && descIdx !== -1) {
        sb1Data.slice(1).forEach(row => {
          const code = String(row[codeIdx] || '').trim();
          const desc = String(row[descIdx] || '').trim();
          if (code && desc) descriptionsMap.set(code, desc);
        });
        console.log(`  -> ${descriptionsMap.size} descripciones maestras cargadas.`);
      }
    }

    // 2. Procesar hojas de precios
    for (const sheetName of SHEET_NAMES_TO_READ) {
      console.log(`\n--- Procesando pestaña: '${sheetName}' ---`);
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;

      const dataAsArray = utils.sheet_to_json(worksheet, { header: 1 });
      if (dataAsArray.length < 2) continue;

      const headers = dataAsArray[0];

      // Índices de columnas clave
      const codeIdx = findHeaderIndex(headers, 'Cod.Producto');
      const descIdx = findHeaderIndex(headers, 'Descripcion');
      const stockIdx = findHeaderIndex(headers, 'Grupo');
      const netoIdx = findHeaderIndex(headers, 'Precio Venta');
      const finalIdx = findHeaderIndex(headers, 'Final');
      const tesIdx = findHeaderIndex(headers, 'TES');

      console.log(`  -> Índices detectados: Code:${codeIdx}, Neto:${netoIdx}, Final:${finalIdx}, TES:${tesIdx}`);

      const dataRows = dataAsArray.slice(1);
      dataRows.forEach((row, index) => {
        const code = String(row[codeIdx] || '').trim();
        if (!code || code === 'undefined') return;

        // Limpieza de precios
        const parsePrice = (val) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            return parseFloat(val.replace(/\$/g, '').replace(/\./g, '').replace(',', '.').trim());
          }
          return 0;
        };

        const rawNeto = parsePrice(row[netoIdx]);
        const rawFinal = parsePrice(row[finalIdx]);
        const tesValue = String(row[tesIdx] || '').trim();
        const ivaFactor = IVA_MAP[tesValue] || 1.21;

        let priceNeto = 0;

        // LÓGICA DE CÁLCULO: Priorizar Precio Venta si existe.
        if (rawNeto > 0) {
          priceNeto = rawNeto;
        } else if (rawFinal > 0) {
          // Si solo hay 'Final', calculamos el Neto hacia atrás.
          // Según el usuario, la fórmula es (Neto * 1.04) * Factor_IVA = Final
          // Por lo tanto: Neto = Final / (1.04 * Factor_IVA)
          priceNeto = rawFinal / (1.04 * ivaFactor);
        }

        if (priceNeto === 0) return;

        // El precio base con IVA (sin el recargo del usuario)
        const priceConIva = priceNeto * ivaFactor;

        const product = {
          id: code,
          code: code,
          description: descriptionsMap.get(code) || String(row[descIdx] || '').trim(),
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
