CrisisSim: Simulador Educativo de Crisis y Economía Familiar
Desafío Final de Programación Web I
Desarrollado por: Joaquín Ramos Alanoca
La Paz, Bolivia - Gestión 2026

Descripción del Proyecto
CrisisSim es una aplicación web interactiva y didáctica. Sirve para modelar, calcular y visualizar el impacto real de problemas socioeconómicos en la vida diaria de los hogares bolivianos.

Los problemas que simulamos son:

Bloqueos y desvíos de transporte

Escasez de combustible en estaciones de servicio

Incremento de precios de la canasta básica familiar

Rumores y compras de pánico

Pérdida del poder adquisitivo

El propósito del software es educativo y analítico. No toma posición política. Usa modelos matemáticos simples para ayudar a estudiantes y familias a entender cómo las crisis afectan su presupuesto y cómo una buena planificación puede reducir los riesgos.

ESTRUCUTURA DEL PROYECTO:
│
├── index.html
├── css/
│   └── estilos.css
├── js/
│   └── script.js
├── img/
│   └── logo.png
└── README.md

Características Principales
1. Seis Módulos de Simulación

Carburantes: Calcula cuántos días dura el combustible en una estación de servicio.

Precios de Alimentos: Arma una canasta familiar dinámica y calcula el porcentaje de inflación.

Costos de Transporte: Muestra cuánto dinero extra se gasta por tomar rutas alternas debido a bloqueos.

Presupuesto Familiar: Analiza si alcanza el dinero para las compras. Usa colores verde, amarillo y rojo según la gravedad.

Rumor de Escasez: Simula cómo las compras nerviosas afectan el stock de las tiendas.

Poder Adquisitivo: Mide cuánto poder de compra se pierde cuando los precios suben y el sueldo no cambia.

2. Casos de Estudio Integrados

Hay botones interactivos que cargan automáticamente los casos de prueba sugeridos. Así se puede verificar rápido que los cálculos funcionan bien.

3. Sección Educativa

Hay un panel de aprendizaje que explica para qué sirve cada modelo matemático y cómo se aplica en la vida real.

4. Validaciones en Tiempo Real

El sistema valida los formularios para evitar campos vacíos o números negativos. Muestra alertas claras dentro de la misma página.

5. Diseño Responsivo Premium

La interfaz usa el estilo Glassmorphism. Colores azul oscuro, bordes translúcidos, y acentos en verde, amarillo y rojo según la gravedad del resultado. Funciona perfecto en celulares, tablets y computadoras.

Tecnologías Usadas
HTML5 semántico: Uso de header, nav, main, section, article y footer.

CSS3: Flexbox, CSS Grid, variables para colores, gráficos de progreso sin librerías externas.

JavaScript (ES6): Manipulación del DOM, captura de eventos, validaciones y cálculos lógicos.

Fórmulas y Modelos Matemáticos
Carburantes

Reserva final = Reserva inicial + (Reabastecimiento diario - Consumo diario) x Días

Canasta Básica

Porcentaje de inflación = (Gasto actual - Gasto anterior) / Gasto anterior x 100

Desvíos de Transporte

Costo extra = (Distancia con desvío - Distancia normal) x Costo por km x Viajes semanales

Presupuesto Familiar

Saldo o déficit = Presupuesto disponible - Total de la compra

Rumores de Escasez

Nueva demanda = Demanda normal x (1 + Porcentaje de aumento / 100)

Poder Adquisitivo

Porcentaje de pérdida = (Gasto actual - Gasto anterior) / Ingreso mensual x 100

Casos de Prueba Incluidos
La aplicación permite cargar los siguientes casos de prueba oficiales con solo apretar un botón:

1. Combustible

Reserva inicial: 10,000 litros

Consumo diario: 1,200 litros

Reabastecimiento diario: 300 litros

Nivel crítico: 2,000 litros

Resultado: Se agota en 11.1 días. Alcanza el nivel crítico en el día 9.

2. Inflación en la Canasta

Arroz: de 8 a 11 bolivianos, cantidad 10

Papa: de 7 a 10 bolivianos, cantidad 8

Aceite: de 12 a 18 bolivianos, cantidad 4

Resultado: Gasto anterior 184 bolivianos. Gasto actual 262 bolivianos. Aumento del 42.39%.

3. Transporte con Desvío

Distancia normal: 10 km

Distancia con desvío: 16 km

Costo por km: 2 bolivianos

Viajes por semana: 5

Resultado: Sobrecosto semanal de 60 bolivianos.

4. Presupuesto Familiar

Presupuesto disponible: 500 bolivianos

Total de compra: 580 bolivianos

Resultado: Déficit de 80 bolivianos. Clasificación: Gasto Alto.

5. Escasez por Rumor

Demanda normal: 100 unidades

Aumento por pánico: 40%

Stock disponible: 120 unidades

Resultado: Nueva demanda de 140 unidades. Supera el stock disponible en 20 unidades. Hay riesgo de desabastecimiento.


