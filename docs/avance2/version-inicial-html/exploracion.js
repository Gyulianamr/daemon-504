
var zonas = [
  {
    id: "valle",
    nombre: "Valle del Encanto",
    descripcion: "Localidad inicial. Un lugar tranquilo para comenzar la aventura.",
    bloqueada: false,
    pesos: { nada: 50, criatura: 20, objeto: 25, evento: 5 },
    nivelMin: 1,
    nivelMax: 3,
    criaturas: [
      { nombre: "Flamix", peso: 50 },
      { nombre: "Aquabit", peso: 40 },
      { nombre: "Terrox", peso: 10 }
    ]
  },
  {
    id: "pradera",
    nombre: "La Pradera Misteriosa",
    descripcion: "Un campo abierto donde algo se mueve entre la hierba.",
    bloqueada: false,
    pesos: { nada: 30, criatura: 40, objeto: 20, evento: 10 },
    nivelMin: 2,
    nivelMax: 5,
    criaturas: [
      { nombre: "Terrox", peso: 40 },
      { nombre: "Voltix", peso: 35 },
      { nombre: "Flamix", peso: 20 },
      { nombre: "Rocaz", peso: 5 }
    ]
  },
  {
    id: "lago",
    nombre: "Lago Sombrío",
    descripcion: "Aguas oscuras y silenciosas rodean la orilla.",
    bloqueada: false,
    pesos: { nada: 35, criatura: 35, objeto: 20, evento: 10 },
    nivelMin: 3,
    nivelMax: 6,
    criaturas: [
      { nombre: "Aquabit", peso: 50 },
      { nombre: "Sombrix", peso: 40 },
      { nombre: "Voltix", peso: 10 }
    ]
  },
  {
    id: "umbral",
    nombre: "Ciudad Umbral",
    descripcion: "Una ciudad antigua que guarda la entrada a nuevas regiones.",
    bloqueada: false,
    pesos: { nada: 50, criatura: 10, objeto: 30, evento: 10 },
    nivelMin: 4,
    nivelMax: 7,
    criaturas: [
      { nombre: "Sombrix", peso: 60 },
      { nombre: "Rocaz", peso: 40 }
    ]
  },
  {
    id: "bosque",
    nombre: "Bosque del Guerrero",
    descripcion: "Árboles altos y caminos marcados por antiguas batallas.",
    bloqueada: true,
    pesos: { nada: 25, criatura: 45, objeto: 15, evento: 15 },
    nivelMin: 5,
    nivelMax: 8,
    criaturas: [
      { nombre: "Rocaz", peso: 45 },
      { nombre: "Terrox", peso: 35 },
      { nombre: "Flamix", peso: 20 }
    ]
  },
  {
    id: "montana",
    nombre: "Montaña de la Tormenta",
    descripcion: "Rayos y viento fuerte recorren las rocas.",
    bloqueada: true,
    pesos: { nada: 20, criatura: 50, objeto: 15, evento: 15 },
    nivelMin: 7,
    nivelMax: 10,
    criaturas: [
      { nombre: "Voltix", peso: 60 },
      { nombre: "Rocaz", peso: 40 }
    ]
  },
  {
    id: "oscura",
    nombre: "Ciudad Oscura",
    descripcion: "Una ciudad sin luz donde los sellos están muy débiles.",
    bloqueada: true,
    pesos: { nada: 20, criatura: 50, objeto: 10, evento: 20 },
    nivelMin: 9,
    nivelMax: 12,
    criaturas: [
      { nombre: "Sombrix", peso: 70 },
      { nombre: "Voltix", peso: 30 }
    ]
  },
  {
    id: "cueva",
    nombre: "Cueva de Terror",
    descripcion: "Un túnel profundo. Nadie sabe qué hay al fondo.",
    bloqueada: true,
    pesos: { nada: 15, criatura: 55, objeto: 10, evento: 20 },
    nivelMin: 11,
    nivelMax: 15,
    criaturas: [
      { nombre: "Sombrix", peso: 50 },
      { nombre: "Rocaz", peso: 50 }
    ]
  }
];

var objetos = ["TamaBall", "Curaball", "MegaBall"];

var eventos = [
  "Escuchas un ruido extraño que viene de un santuario cercano.",
  "Encuentras una piedra antigua con un símbolo grabado.",
  "Un viajero te cuenta que los sellos se están debilitando."
];

// Estado 

// Zona donde esta el jugador (la cambia el movimiento entre zonas)
var zonaActual = zonas[0];

// Ultimos resultados de exploracion
var historial = [];
var maximoHistorial = 10;

// Elementos del HTML

var nombreZona = document.getElementById("nombreZona");
var descripcionZona = document.getElementById("descripcionZona");
var selectorZona = document.getElementById("selectorZona");
var btnExplorar = document.getElementById("btnExplorar");
var tarjetaResultado = document.getElementById("tarjetaResultado");
var textoResultado = document.getElementById("textoResultado");
var listaHistorial = document.getElementById("historial");

// Funciones

// Elige un elemento de una lista segun su "peso"
function elegirPonderado(lista) {
  var total = 0;
  for (var i = 0; i < lista.length; i++) {
    total = total + lista[i].peso;
  }

  var numero = Math.random() * total;
  for (var j = 0; j < lista.length; j++) {
    numero = numero - lista[j].peso;
    if (numero < 0) {
      return lista[j];
    }
  }
  return lista[lista.length - 1];
}

// Elige un elemento cualquiera de una lista
function elegirAlAzar(lista) {
  var indice = Math.floor(Math.random() * lista.length);
  return lista[indice];
}

// Numero entero entre min y max
function numeroEntre(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Decide que pasa al explorar la zona actual
function explorar() {
  var pesos = zonaActual.pesos;
  var tipos = [
    { tipo: "nada", peso: pesos.nada },
    { tipo: "criatura", peso: pesos.criatura },
    { tipo: "objeto", peso: pesos.objeto },
    { tipo: "evento", peso: pesos.evento }
  ];
  var tipo = elegirPonderado(tipos).tipo;

  if (tipo === "criatura") {
    var criatura = elegirPonderado(zonaActual.criaturas);
    var nivel = numeroEntre(zonaActual.nivelMin, zonaActual.nivelMax);
    return { tipo: "criatura", texto: "Apareció " + criatura.nombre + " (nivel " + nivel + ")." };
  }

  if (tipo === "objeto") {
    return { tipo: "objeto", texto: "Encontraste un objeto: " + elegirAlAzar(objetos) + "." };
  }

  if (tipo === "evento") {
    return { tipo: "evento", texto: elegirAlAzar(eventos) };
  }

  return { tipo: "nada", texto: "No encontraste nada." };
}

// Muestra la zona actual en la pantalla
function mostrarZona() {
  nombreZona.textContent = zonaActual.nombre;
  descripcionZona.textContent = zonaActual.descripcion;
  selectorZona.value = zonaActual.id;
}

// Muestra el resultado en la tarjeta
function mostrarResultado(resultado) {
  textoResultado.textContent = resultado.texto;
  tarjetaResultado.className = "tarjeta " + resultado.tipo;
}

// Dibuja el historial en la pantalla
function mostrarHistorial() {
  listaHistorial.innerHTML = "";

  if (historial.length === 0) {
    var vacio = document.createElement("li");
    vacio.textContent = "Todavía no has explorado.";
    vacio.className = "vacio";
    listaHistorial.appendChild(vacio);
    return;
  }

  for (var i = 0; i < historial.length; i++) {
    var item = document.createElement("li");
    item.textContent = historial[i];
    listaHistorial.appendChild(item);
  }
}

// Agrega una accion al historial (la mas reciente va primero)
function agregarAlHistorial(texto) {
  historial.unshift(texto);
  if (historial.length > maximoHistorial) {
    historial.pop();
  }
  mostrarHistorial();
}

// Cambia la zona actual (Jenifer puede llamar esta funcion)
function cambiarZona(id) {
  for (var i = 0; i < zonas.length; i++) {
    if (zonas[i].id === id && !zonas[i].bloqueada) {
      zonaActual = zonas[i];
      mostrarZona();
      return;
    }
  }
}

// Llena el selector de prueba con las zonas
function cargarSelector() {
  for (var i = 0; i < zonas.length; i++) {
    var opcion = document.createElement("option");
    opcion.value = zonas[i].id;
    opcion.textContent = zonas[i].nombre;

    if (zonas[i].bloqueada) {
      opcion.textContent = zonas[i].nombre + " (bloqueada)";
      opcion.disabled = true;
    }
    selectorZona.appendChild(opcion);
  }
}

//Eventos 

function alPulsarExplorar() {
  var resultado = explorar();
  mostrarResultado(resultado);
  agregarAlHistorial(zonaActual.nombre + ": " + resultado.texto);
}

function alCambiarZona() {
  cambiarZona(selectorZona.value);
  agregarAlHistorial("Te desplazaste a " + zonaActual.nombre + ".");
}

btnExplorar.addEventListener("click", alPulsarExplorar);
selectorZona.addEventListener("change", alCambiarZona);

//Inicio

cargarSelector();
mostrarZona();
mostrarHistorial();