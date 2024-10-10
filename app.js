const fs = require("fs");
const unrar = require("node-unrar-js");

async function main() {
  try {
    // Leer el archivo RAR en un ArrayBuffer
    const buf = Uint8Array.from(fs.readFileSync("test.rar")).buffer;
    
    // Crear el extractor a partir de los datos del archivo
    const extractor = await unrar.createExtractorFromData({ data: buf });

    // Obtener la lista de archivos dentro del archivo RAR
    const list = extractor.getFileList();

    // Mostrar el encabezado del archivo RAR
    const listArcHeader = list.arcHeader; // Información sobre el archivo RAR

    // Obtener las cabeceras de los archivos dentro del RAR
    const fileHeaders = [...list.fileHeaders]; // Cabeceras de los archivos contenidos

    // Mostrar los encabezados de los archivos
    console.log('Encabezados de los archivos:', fileHeaders);

    // Extraer un archivo específico (por ejemplo, '1.txt')
    const extracted = await extractor.extract({ files: ["1.txt"] });

    // Mostrar el encabezado del archivo extraído
    const extractedArcHeader = extracted.arcHeader;

    // Cargar los archivos extraídos
    const files = [...extracted.files];

    // Mostrar el contenido extraído del archivo
    console.log('Contenido extraído:', files[0].extraction);

    // Guardar el archivo extraído en el sistema
    const outputDir = "./extraidos";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    // Guardar el archivo extraído en el sistema
    const outputFilePath = `${outputDir}/1.txt`;
    fs.writeFileSync(outputFilePath, files[0].extraction);
    console.log(`Archivo extraído y guardado en: ${outputFilePath}`);

  } catch (error) {
    console.error("Error durante la extracción:", error);
  }
}

main();
