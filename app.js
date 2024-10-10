const fs = require('fs');
const unrar = require("node-unrar-js");

// Caracteres a probar
const characters = 'Sso1';
const maxLength = 3; // Define la longitud máxima que quieres probar
const maxMemoryBeforePause = 128 * 1024 * 1024; // Reducimos el límite a 128 MB
let totalBytesProcessed = 0;

// Generar combinaciones con iteraciones en lugar de recursión
function* generateCombinations() {
    for (let length = 1; length <= maxLength; length++) {
        let indices = Array(length).fill(0);
        while (true) {
            yield indices.map(i => characters[i]).join('');
            let i = length - 1;
            while (i >= 0 && indices[i] === characters.length - 1) i--;
            if (i < 0) break;
            indices[i]++;
            for (let j = i + 1; j < length; j++) indices[j] = 0;
        }
    }
}

// Liberar memoria y pausar
async function liberarMemoria() {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log('Liberando memoria...');
            if (global.gc) {
                global.gc(); // Forzar recolección de basura si se ejecuta con --expose-gc
            }
            resolve();
        }, 500); // Pausa breve de 500 ms para liberar
    });
}

// Guardar la contraseña en un archivo
function guardarContraseña(password) {
    const filePath = 'prueba.rar'; // Ruta del archivo de texto
    fs.writeFileSync(filePath, `Contraseña encontrada: ${password}`);
    console.log(`La contraseña fue guardada en: ${filePath}`);
}

// Intentar extraer archivos con una contraseña
async function tryExtractRar(rarFilePath, password) {
    try {
        const buf = Uint8Array.from(fs.readFileSync(rarFilePath)).buffer; // Leer el archivo RAR

        // Crear extractor de los datos del archivo RAR
        const extractor = await unrar.createExtractorFromData({
            data: buf,
            password: password
        });

        const list = extractor.getFileList(); // Obtener lista de archivos en el RAR

        // Verificar si se encontraron archivos
        if (list.length === 0) {
            console.log(`No se encontraron archivos en el RAR con la contraseña "${password}"`);
            return null;
        }

        // Extraer los archivos uno por uno
        const extractedFiles = [];
        for (let file of list) {
            const extracted = await extractor.extract({ files: [file.name] });
            if (extracted.files.length > 0) {
                extractedFiles.push(extracted.files[0]);
            }
        }

        if (extractedFiles.length > 0) {
            console.log(`Contraseña encontrada: ${password}`);
            return extractedFiles; // Retornar los archivos extraídos
        } else {
            console.log(`No se pudo extraer ningún archivo con la contraseña "${password}"`);
            return null;
        }
    } catch (err) {
        console.log(`Error al intentar con la contraseña "${password}": ${err.message}`);
        return null;
    }
}

// Probar combinaciones de fuerza bruta
async function bruteForce(rarFilePath, outputDir) {
    let found = false;
    const generator = generateCombinations();

    for (let password of generator) {
        try {
            console.log(`Probando: ${password}`);

            // Intentar extraer con la contraseña generada
            const extractedFiles = await tryExtractRar(rarFilePath, password);

            if (extractedFiles && extractedFiles.length > 0) {
                // Si se encuentran archivos, guardar la contraseña
                guardarContraseña(password);

                // Guardar los archivos extraídos
                extractedFiles.forEach(file => {
                    fs.writeFileSync(`${outputDir}/${file.fileName}`, file.extraction);
                    console.log(`Archivo extraído y guardado: ${file.fileName}`);
                });

                found = true;
                break;
            }
        } catch (err) {
            console.log(`Error durante la extracción con la contraseña "${password}": ${err.message}`);
        }

        // Calcular el tamaño total procesado y liberar memoria si es necesario
        totalBytesProcessed += Buffer.byteLength(password, 'utf8');
        if (totalBytesProcessed >= maxMemoryBeforePause) {
            await liberarMemoria();
            totalBytesProcessed = 0;
        }
    }

    if (!found) {
        console.log('No se encontró la contraseña en el diccionario.');
    }
}

// Directorio de salida para los archivos extraídos
const outputDir = './extraidos';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Ruta al archivo RAR protegido
const rarFilePath = 'prueba2.rar';

// Iniciar la prueba de contraseñas con fuerza bruta
bruteForce(rarFilePath, outputDir);
