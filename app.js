const unrar = require("node-unrar-js");
const fs = require("fs");

// Generador de claves
function* bruteForceKeyGenerator(characters, maxLength) {
  function* generate(currentKey, currentLength) {
    if (currentLength === 0) {
      yield currentKey;
      return;
    }

    for (let i = 0; i < characters.length; i++) {
      yield* generate(currentKey + characters[i], currentLength - 1);
    }
  }

  for (let length = 1; length <= maxLength; length++) {
    yield* generate('', length);
  }
}

// Función principal
async function main() {
  const characters = 'Sa1'; // Caracteres permitidos para generar claves
  const maxLength = 3;         // Longitud máxima de las claves
  const keyGenerator = bruteForceKeyGenerator(characters, maxLength);
  let claveGenerada = "def"
  let condicionSalida = true;
  do {
    for (const key of keyGenerator) {
      console.log(`Probando clave: ${key}`); // Mostrar la clave que se está probando
      claveGenerada = key
      console.log(typeof claveGenerada);

      condicionSalida = await abrirRar(claveGenerada)
      if (condicionSalida) {
        break
      }
    }
    console.log("vVALOR DE CNDICION DE WHILE TRU DEBERI SALIR", condicionSalida);

  } while (!condicionSalida);

}

main();



//const fs = require('fs');
const path = require('path');

// Función para crear y guardar un archivo de texto
function createTextFile(filename, content, dir) {
  // Crear la ruta completa del archivo
  const filePath = path.join(__dirname, dir, filename);

  // Escribir el contenido en el archivo
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error('Error al crear el archivo:', err);
      return;
    }
    console.log(`Archivo creado exitosamente en: ${filePath}`);
  });
}

// Ejemplo de uso
const filename = 'clave12.txt';         // Nombre del archivo
const dir = './';          // Directorio donde se guardará el archivo






// debe ser mi pricnical debe ser el geneardor de claves y debe devolver eeste avlor en la linea 15 como argumentoe del await
async function abrirRar(passwordd) {
  let EstadoContrasenia = false;
  let pudoAbrir = "def"
  try {
    // Leer el archivo RAR en un ArrayBuffer
    const buf = Uint8Array.from(fs.readFileSync("prueba.rar")).buffer;


    // Crear el extractor a partir de los datos del archivo, pasando la contraseña
    const extractor = await unrar.createExtractorFromData({
      data: buf,
      password: passwordd
    });

    console.log("tipo de dato de calve recivido de paswordd", typeof passwordd);
    console.log("valor de la pasword generado en generador de clave:", passwordd);

    EstadoContrasenia = true;
    pudoAbrir = `ACA esta el rar abierto y esta seria al contraseña ${passwordd}`;
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
    console.log("ver que sale abajo esta el extracted");

    // Mostrar el encabezado del archivo extraído
    const extractedArcHeader = extracted.arcHeader;

    // Cargar los archivos extraídos
    //const files = [...extracted.files];


    console.log(EstadoContrasenia);


  } catch (error) {
    console.error("Error, no se puedo abrir rar:", error);
    EstadoContrasenia = false

  }
  if (EstadoContrasenia) {
    // Llamar a la función para crear el archivo
    console.log(`VAMOS A CREAR EL TXT PARA GUARDA LA CLAVE: ${passwordd}`);

    let cotenidoGuardar = ` CLAVE ENCONTRADA :${passwordd}`;
    createTextFile(filename, cotenidoGuardar, dir);

  }
  console.log(EstadoContrasenia, ",VALOR DE FUNCION  ABRIR RAR");
  return EstadoContrasenia
}

main(); //esta deber sde rllamado por el genedarod no como princippal y este deber se llamado por generdaro 
