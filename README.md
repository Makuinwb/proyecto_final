CrisisSim - Simulador de Crisis Economica

Proyecto final de Programacion Web I
Joaquin Ramos Alanoca

ESTRUCTURA DEL PROYECTO
│
├── index.html
│
├── css/
│ └── estilos.css
│
├── js/
│ └── script.js
│
└── README.md
index.html - La estructura de la pagina
css/estilos.css - Los estilos y colores
js/script.js - Todos los calculos y la logica
README.md - Explicacion del proyecto

EXPLICACION DEL HTML

El html tiene header con el titulo y mi nombre.
Despues viene nav con los botones para cambiar entre los 8 simuladores.
Cada boton tiene un data-simulator que el js usa para saber cual mostrar.

Cada simulador esta dentro de una section con id como fuelSimulator, foodSimulator.
Una sola section se muestra a la vez, las otras estan ocultas.

Dentro de cada simulador hay dos partes:
- form-card: tiene los inputs y los botones
- result-card: ahi se muestran los resultados que calcula el js

Los inputs tienen type number, min, placeholder y required.
Los casos de prueba son botones con data-test que cargan datos de ejemplo.

Al final hay una seccion de creditos con article y footer.

EXPLICACION DEL CSS

El css usa variables en :root para los colores, asi es facil cambiar todo.
El fondo tiene un gradiente de azul oscuro a gris.

Las tarjetas usan backdrop-filter: blur para el efecto de vidrio.
Los botones cambian de color y se agrandan un poco cuando pasas el mouse.

Con grid y flexbox hago que todo se ordene bien.
Con media queries hago que se vea bien en celular, tablet y computadora.

La clase .good es para resultados positivos (verde)
.warning es para alertas (amarillo)
.critical es para problemas graves (rojo)

La tabla .data-table tiene th con fondo verde oscuro y td con borde abajo.
El grafico de barras usa flex y altura dinamica calculada desde js.

EXPLICACION DEL JAVASCRIPT

Todo el codigo va dentro de document.addEventListener('DOMContentLoaded') para
asegurar que el html ya cargo antes de ejecutarse.

switchSimulator() es la funcion que cambia entre secciones.
Recibe el id del simulador, oculta todas las secciones, muestra la que toca,
y hace scroll suave hasta esa seccion.

Para cada simulador uso addEventListener en el submit del formulario.
Cuando apretas calcular, agarro los valores con .value y parseFloat.
Valido que no esten vacios, que no sean negativos, y que tengan sentido.
Si hay error, muestro mensaje rojo y resalto el input en rojo con animacion.

Las funciones de calculo estan separadas para que el codigo sea mas limpio.

Simulador de Carburante

calculateFuel() simula dia por dia. Si reabastecimiento es mayor o igual al consumo,
la reserva es sostenible y no se acaba nunca. Si no, va restando hasta que se acabe
o llegue a 365 dias. Devuelve dias, reserva final, dia critico, y un array con
todos los dias para el grafico.

renderFuelChart() recibe ese array, calcula el maximo de reserva, y crea una barra
por cada dia con altura proporcional al maximo.

Simulador de Alimentos

Los productos se guardan en un array foodProducts.
renderFoodForm() pinta los inputs dinamicamente.
Uso delegacion de eventos con 'input' en el contenedor para capturar cambios
sin tener que agregar eventos a cada input nuevo.
Cuando cambia un valor, actualizo el array foodProducts.

calculateFoodTotal() recorre el array, multiplica precio por cantidad para cada
producto, suma los totales de antes y ahora, y muestra la diferencia.

Simulador de Transporte

Es simple: costo normal menos costo con desvio. Valido que la distancia con desvio
sea mayor a la normal porque si no no tendria sentido.

Simulador de Compras

shoppingList guarda productos con precio y cantidad.
Calculo total de compra, lo resto al presupuesto.
Clasifico el gasto en bajo, medio o alto segun el porcentaje del presupuesto que
se esta gastando.

Simulador de Rumor

newDemand = normal + (normal * aumento / 100)
totalDemand = newDemand * personas
Comparo con stock para ver si alcanza o no.

Simulador de Poder Adquisitivo

Comparo gasto actual con gasto anterior.
Si el gasto actual es mayor, muestro perdida. Si es menor, muestro mejora.
Clasifico el nivel de perdida en leve, moderado o severo.

BOTONES DE CASOS DE PRUEBA

Todos los botones con clase test-btn tienen un evento click.
Segun el data-test, cambian al simulador correspondiente, llenan los inputs con
los valores de ejemplo, y disparan el evento submit para que se haga el calculo
automatico.

VALIDACIONES QUE HICE

- Campos vacios: muestro mensaje de error y resalto el input
- Numeros negativos: no se permiten
- Consumo diario: tiene que ser mayor a 0
- Personas: minimo 1
- Distancia con desvio: mayor a distancia normal
- Ingreso: no puede ser 0


La Paz, Bolivia - 2026