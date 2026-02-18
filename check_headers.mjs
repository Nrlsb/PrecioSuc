import { read, utils } from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = ['ListaDeProductos.xlsx', 'Lista001.xlsx', 'Lista002.xlsx', 'Lista002.xls'];

files.forEach(file => {
    const filePath = path.join(__dirname, 'public', file);
    try {
        const workbook = read(filePath, { type: 'file' });
        console.log(`\nFILE: ${file}`);
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const data = utils.sheet_to_json(worksheet, { header: 1 });
            if (data.length > 0) {
                console.log(`  Sheet: [${sheetName}] -> Headers: ${data[0].join(', ')}`);
            }
        });
    } catch (e) {
        // console.error(`Error reading ${file}: ${e.message}`);
    }
});


