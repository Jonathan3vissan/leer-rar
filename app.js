const fs = require("fs");
const unrar = require("node-unrar-js");

async function main() {
  try {
    // Leer el archivo RAR en un ArrayBuffer
    const buf = Uint8Array.from(fs.readFileSync("test.rar")).buffer;  // Cambié a 'test.rar'

    // Crear el extractor a partir de los datos del archivo
    const extractor = await unrar.createExtractorFromData({ data: buf });
console.log(extractor);

    // Verificar si el archivo tiene un encabezado válido
    if (!extractor.arcHeader) {
      console.log("No se pudo leer el archivo RAR correctamente o está corrupto.");
      return;
    }

    // Obtener la lista de archivos dentro del archivo RAR
    const list = extractor.getFileList();

    // Convertir el generador a un array
    const fileHeaders = Array.from(list);

    if (fileHeaders.length === 0) {
      console.log("No se encontraron archivos en el RAR.");
      return;
    }

    // Mostrar los archivos encontrados (con ruta si están dentro de carpetas)
    console.log("Archivos en el RAR:");
    fileHeaders.forEach((file, index) => {
      console.log(`${index + 1}: ${file.name}`);
    });

    // Extraer todos los archivos disponibles en el RAR
    const fileNamesToExtract = fileHeaders.map(file => file.name); // Todos los archivos
    console.log("Extrayendo los siguientes archivos:", fileNamesToExtract);

    // Extraer los archivos seleccionados
    const extracted = await extractor.extract({ files: fileNamesToExtract });

    // Mostrar encabezado de la extracción
    console.log('Encabezado del archivo extraído:', extracted.arcHeader);

    // Cargar los archivos extraídos
    const files = [...extracted.files];

    if (files.length === 0) {
      console.log("No se extrajo ningún archivo.");
      return;
    }

    // Extraer y mostrar el contenido de cada archivo
    files.forEach((file, index) => {
      const extractedContent = file.extraction;

      if (!extractedContent) {
        console.log(`No se pudo extraer el contenido de ${file.name}.`);
        return;
      }

      // Convertir el Uint8Array a un string (asumimos que los archivos son de texto)
      const content = new TextDecoder().decode(extractedContent);
      console.log(`Contenido extraído de ${file.name}:`);
      console.log(content);

      // Guardar el archivo extraído en el sistema (en su ruta original dentro de la carpeta)
      const outputDir = "./extraidos";
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      const outputFilePath = `${outputDir}/${file.name}`;
      const fileDir = file.name.substring(0, file.name.lastIndexOf('/')); // Extraemos la carpeta (si existe)

      // Crear la carpeta donde se guardará el archivo, si existe alguna carpeta
      if (fileDir && !fs.existsSync(`${outputDir}/${fileDir}`)) {
        fs.mkdirSync(`${outputDir}/${fileDir}`, { recursive: true });
      }

      // Guardamos el archivo extraído
      fs.writeFileSync(outputFilePath, extractedContent);
      console.log(`Archivo extraído y guardado en: ${outputFilePath}`);
    });

  } catch (error) {
    console.error("Error durante la extracción:", error);
  }
}

main();
