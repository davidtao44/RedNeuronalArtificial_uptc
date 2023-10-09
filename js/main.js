//variables
let vectorDatos_pesosin = [];
let vectorpesosin0 = [];
let vectorpesosin1 = [];
let vector_pesoscapa = [];
let vector_pesoscapa0 = [];
let vector_pesoscapa1 = [];




//constante para seleccionar la etiqueta span en HTML e imprimir el resultado
const resultadoElement = document.getElementById("resultado"); //esta ligado a la etiqueta span del HTML

//funcion para normalizar vectores 
function normalizarVector(vector) {
 
    // Crea un nuevo vector para almacenar los valores normalizados
    const vectorNormalizado = [];

    // Recorre el vector original y aplica la normalización
    for (let i = 0; i < vector.length; i++) {
        if (vector[i] < 40) {
            vectorNormalizado.push(0);
        } else {
            vectorNormalizado.push(1);
        }
    }

    return vectorNormalizado;
}

// Función para codificar un ArrayBuffer en Base64
function encodeArrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

//---Se importan los pesos de entrada
    fetch('matriz_pesosentrada_T.json')
    .then(response => response.json())
    .then(data => {
        // Almacena el objeto JSON en el vector
        vectorDatos_pesosin.push(data);
        vectorpesosin0 = vectorDatos_pesosin[0];
        vectorpesosin1 = vectorpesosin0.matriz_pesosentrada_T;
    })
    .catch(error => {
        console.error('Error al cargar el archivo JSON:', error);
    });

    //---se importan los pesos de la capa oculta
    fetch('matriz_pesoscapa_T.json')
    .then(response => response.json())
    .then(data => {
        // Almacena el objeto JSON en el vector
        vector_pesoscapa.push(data);
        vector_pesoscapa0 = vector_pesoscapa[0];
        vector_pesoscapa1 = vector_pesoscapa0.matriz_pesoscapa_T;

        // Haz algo con el vector, por ejemplo, muestra su contenido en la consola
        //console.log(vector_pesoscapa);
    })
    .catch(error => {
        console.error('Error al cargar el archivo JSON:', error);
    });

    
//Para visualizar la imagen en la pagina
document.getElementById('fileInput').addEventListener('change', function () {
    const fileInput = this;
    const imagenMostrada = document.getElementById('imagenMostrada');
    const imagenContainer = document.getElementById('imagenContainer');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const bmpData = e.target.result;
            imagenMostrada.src = bmpData;
            imagenContainer.style.display = 'block';
        };

        reader.readAsDataURL(file);
    }
    
    imagenMostrada.classList.add("centrada");
});

//para obtener el vector correspondiente a la imagen
// Escucha el evento de envío del formulario
document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Evita que el formulario se envíe
    
    const fileInput = document.getElementById('fileInput');

    if (fileInput.files.length === 0) {
        alert('Por favor, seleccione un archivo BMP.');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function () {
        const arrayBuffer = reader.result;
        const bmpData = new Uint8Array(arrayBuffer);

        // Aquí puedes usar el vector 'bmpData' como desees
       //console.log("Vector de la imagen", bmpData); para obtener la imagen "común"

        // Llama a la función para convertir la imagen a escala de grises y procesarla
        convertirAImagenEscalaDeGrises(bmpData);
        
    };

    reader.readAsArrayBuffer(file);
});

// Función para convertir la imagen a escala de grises y procesarla
function convertirAImagenEscalaDeGrises(bmpData) {
    let outputHiddenLayer = [];
    let salida_RNA_numero = 0; //variable para la salida de la red en numero entero
    let out_RNA = []; //salida de la red neuronal sin normalizar
    let RNA_Normalizado = [];
    const result = [];
    const result_final = [];
    // Supongamos que ya has cargado el canvas en HTML con el ID 'miCanvas'
    const canvas = document.getElementById('miCanvas');
    const ctx = canvas.getContext('2d');

    // Asegúrate de que el canvas tenga un tamaño de 28x28 píxeles
    canvas.width = 28;
    canvas.height = 28;

    // Crea una imagen a partir de los datos BMP
    const img = new Image();
    img.src = 'data:image/bmp;base64,' + encodeArrayBufferToBase64(bmpData);

    img.onload = function () {
        ctx.drawImage(img, 0, 0, 28, 28);

        // Convierte la imagen a escala de grises
        const imageData = ctx.getImageData(0, 0, 28, 28);
        const pixelData = imageData.data;

        // Crea un vector de 784 elementos a partir de los datos de píxeles (escala de grises)
        const vectorImagen = [];
        for (let i = 0; i < pixelData.length; i += 4) {
            const red = pixelData[i];
            const green = pixelData[i + 1];
            const blue = pixelData[i + 2];

            // Convierte los componentes de color a escala de grises
            const grayscale = (red + green + blue) / 3; // Puede ajustar la conversión de escala de grises según tus necesidades

            vectorImagen.push(grayscale);
        }

        console.log('Vector de la imagen (escala de grises):', vectorImagen);
        vectorImagenNormalizado = normalizarVector(vectorImagen);  //se utiliza la funcion normalizar Vector para dejar en terminos de 1 y 0 el vector
        //--------COMIENZO DE LA EJECUCION DE LA RNA-------
        vectorImagenNormalizado.push(1); //input bias
       
        // se hallan las salidas de la capa oculta ----- outputHiddenLayer = tansig(matMult(vectorImagenNormalizado,vectorDatos_pesosin))
        //multiplicacion con la traspuesta
       
        for (let j = 0; j < vectorpesosin1[0].length; j++) {
            let sum = 0;
            for (let i = 0; i <vectorpesosin1.length; i++) {
            sum += vectorImagenNormalizado[i] * vectorpesosin1[i][j];
            }
            result.push(sum);
        }
        //logsig
        for (let i = 0; i < result.length; i++){
            outputHiddenLayer[i] =  1 / (1 + Math.exp(-result[i]));
        }

        outputHiddenLayer.push(1); //se le agrega el bias a la salida de esa capa

        //-----Se halla la salida de la RNA 
        for (let j = 0; j < vector_pesoscapa1[0].length; j++) {
            let sum1 = 0;
            for (let i = 0; i < vector_pesoscapa1.length; i++) {
            sum1 += outputHiddenLayer[i] * vector_pesoscapa1[i][j];
            }
            result_final.push(sum1);
        }

        //logsig
        for (let i = 0; i < result_final.length; i++){
            out_RNA[i] = 1 / (1 + Math.exp(-(result_final[i])));
        }

        //Normalizacion de la salida de la RNA

        let max = Math.max(...out_RNA);

        RNA_Normalizado = out_RNA.map(function (element) {
            return element === max ? 1 : 0;
          });

        //se decodifica el resultado de la RNA 
        
        for (let i = 0; i < RNA_Normalizado.length; i++) {
            salida_RNA_numero += RNA_Normalizado[i] * i;      //salida_RNA_numero es ya el numero representado en entero
          }

        if(salida_RNA_numero>=0 && salida_RNA_numero<=9){
          resultadoElement.textContent = `El resultado es: ${salida_RNA_numero}`;  //Con esta seccion se visualiza el resultado en pantalla
        }
        else{
          resultadoElement.textContent = `No he podido identificarlo, intenta con otra imagen`; 
        }
    };
}




