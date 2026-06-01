/**
 * ==========================================================================
 * LÓGICA DE PROGRAMACIÓN (DOM & MODELOS LOGICOS) - CRISISSIM
 * Desafío Final - Programación Web I
 * Desarrollado por: Joaquín Ramos Alanoca
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. SISTEMA DE NAVEGACIÓN ENTRE SIMULADORES (TABS)
       ========================================================================== */
    const navLinks = document.querySelectorAll('.nav-link');
    const panels = document.querySelectorAll('.simulator-panel');

    function switchTab(targetTabId) {
        // Remover clase activa de todos los enlaces y secciones
        navLinks.forEach(link => link.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('active'));

        // Activar el enlace correspondiente
        const activeLink = document.querySelector(`.nav-link[data-tab="${targetTabId}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Activar el panel correspondiente
        const activePanel = document.getElementById(`sec-${targetTabId}`);
        if (activePanel) {
            activePanel.classList.add('active');
            // Hacer scroll suave hacia arriba en móviles
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
        });
    });


    /* ==========================================================================
       2. FUNCIONES DE VALIDACIÓN GENERAL
       ========================================================================== */
    /**
     * Valida que los inputs numéricos no estén vacíos ni contengan números negativos.
     * Muestra mensajes de error contextuales en el DOM.
     */
    function validateFormInputs(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        
        let isValid = true;
        const inputs = form.querySelectorAll('input[type="number"]');

        inputs.forEach(input => {
            // Eliminar mensajes de error anteriores
            const parent = input.closest('.form-group') || input.parentElement;
            const existingError = parent.querySelector('.error-msg');
            if (existingError) existingError.remove();
            input.style.borderColor = '';

            const val = parseFloat(input.value);

            if (input.hasAttribute('required') && (input.value.trim() === '' || isNaN(val))) {
                showInputError(input, 'Este campo es obligatorio.');
                isValid = false;
            } else if (!isNaN(val) && val < 0 && input.getAttribute('min') !== null) {
                showInputError(input, 'El valor no puede ser negativo.');
                isValid = false;
            } else if (input.id === 'trans-dist-detour') {
                const normalDist = parseFloat(document.getElementById('trans-dist-normal').value);
                if (!isNaN(normalDist) && val < normalDist) {
                    showInputError(input, 'La distancia con desvío debe ser mayor o igual a la normal.');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    function showInputError(inputElement, message) {
        inputElement.style.borderColor = 'var(--color-danger)';
        const parent = inputElement.closest('.form-group') || inputElement.parentElement;
        
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-msg';
        errorSpan.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
        parent.appendChild(errorSpan);
    }

    /**
     * Generador de tarjetas de alerta dinámicas
     */
    function getStatusAlertHtml(status, title, message) {
        let icon = 'fa-circle-check';
        if (status === 'warning') icon = 'fa-triangle-exclamation';
        if (status === 'critical') icon = 'fa-circle-radiation';

        return `
            <div class="status-indicator-card status-${status}">
                <div class="status-icon-box">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <div class="status-info-box">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }


    /* ==========================================================================
       3. ESCENARIO A: SIMULADOR DE CARBURANTES
       ========================================================================== */
    const formFuel = document.getElementById('form-fuel');
    const resultsFuel = document.getElementById('results-fuel');
    const chartContainerFuel = document.getElementById('chart-container-fuel');
    const fuelChartBars = document.getElementById('fuel-chart-bars');

    formFuel.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateFormInputs('form-fuel')) {
            resultsFuel.innerHTML = getStatusAlertHtml('critical', 'Error de Validación', 'Por favor verifica que no haya campos vacíos o valores negativos.');
            chartContainerFuel.style.display = 'none';
            return;
        }

        const initial = parseFloat(document.getElementById('fuel-initial').value);
        const consumption = parseFloat(document.getElementById('fuel-consumption').value);
        const refill = parseFloat(document.getElementById('fuel-refill').value);
        const critical = parseFloat(document.getElementById('fuel-critical').value);

        calculateFuel(initial, consumption, refill, critical);
    });

    function calculateFuel(initial, consumption, refill, critical) {
        let days = 0;
        let reserve = initial;
        let reachedCriticalDay = -1;
        let isAgotado = false;
        
        // Registro de datos día a día para graficar (primeros 10 días o hasta agotarse)
        const dailyLog = [{ day: 0, reserve: initial }];
        const maxDaysSimulation = 100; // Límite para evitar bucle infinito

        const netDailyChange = refill - consumption;

        if (netDailyChange >= 0) {
            // El abastecimiento cubre o supera la demanda diaria. La reserva no bajará.
            resultsFuel.innerHTML = `
                ${getStatusAlertHtml('good', 'Reserva Estable o Sostenible', 'El reabastecimiento diario cubre el consumo. Las reservas no se agotarán con el ritmo actual.')}
                <div class="results-area">
                    <p class="narrative-p">La estación de servicio tiene un flujo positivo de combustible. Cada día ingresan <strong>${refill} litros</strong> y se consumen <strong>${consumption} litros</strong>, generando un superávit neto de <strong>+${netDailyChange} litros diarios</strong>.</p>
                    <table class="report-table">
                        <thead>
                            <tr><th>Indicador</th><th>Valor</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Balance Diario</td><td style="color: var(--color-success)">+${netDailyChange} litros/día</td></tr>
                            <tr><td>Días Sostenibles</td><td>Ilimitados (Reserva protegida)</td></tr>
                            <tr><td>Reserva Crítica</td><td>Nunca se alcanza</td></tr>
                        </tbody>
                    </table>
                </div>
            `;
            chartContainerFuel.style.display = 'none';
            return;
        }

        // Simulación día a día
        while (reserve > 0 && days < maxDaysSimulation) {
            days++;
            reserve = reserve + netDailyChange;
            
            if (reserve < 0) {
                reserve = 0;
                isAgotado = true;
            }

            if (reserve <= critical && reachedCriticalDay === -1) {
                reachedCriticalDay = days;
            }

            if (days <= 10) {
                dailyLog.push({ day: days, reserve: reserve });
            }
        }

        // Calcular la fracción exacta de días para agotar
        const exactAgotamientoDays = (initial / Math.abs(netDailyChange)).toFixed(1);
        const exactCriticalDays = reachedCriticalDay !== -1 ? reachedCriticalDay : "No se alcanza";

        // Clasificar gravedad
        let status = 'good';
        let statusTitle = 'Reserva Segura';
        let statusMsg = `El stock durará aproximadamente ${exactAgotamientoDays} días.`;

        if (parseFloat(exactAgotamientoDays) < 5) {
            status = 'critical';
            statusTitle = 'Alerta: Crisis Inminente';
            statusMsg = `Las reservas se agotarán críticamente en solo ${exactAgotamientoDays} días.`;
        } else if (parseFloat(exactAgotamientoDays) < 15) {
            status = 'warning';
            statusTitle = 'Atención: Reserva Limitada';
            statusMsg = `Las reservas están disminuyendo. Duración estimada de ${exactAgotamientoDays} días.`;
        }

        resultsFuel.innerHTML = `
            ${getStatusAlertHtml(status, statusTitle, statusMsg)}
            <div class="results-area">
                <p class="narrative-p">Con un consumo diario de <strong>${consumption} L</strong> y una llegada de <strong>${refill} L</strong>, la reserva disminuye <strong>${Math.abs(netDailyChange)} litros diarios</strong>.</p>
                <table class="report-table">
                    <thead>
                        <tr><th>Indicador de Simulación</th><th>Resultado Calculado</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Día de Alerta Crítica (baja de ${critical} L)</td><td><strong>Día ${exactCriticalDays}</strong></td></tr>
                        <tr><td>Días para Agotamiento Total</td><td><strong>${exactAgotamientoDays} días</strong></td></tr>
                        <tr><td>Consumo normal vs Consumo alto (+30%)</td><td>Si el consumo sube a ${Math.round(consumption * 1.3)} L/día, durará solo <strong>${(initial / Math.abs(refill - (consumption * 1.3))).toFixed(1)} días</strong>.</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        // Generar gráfico de barras
        fuelChartBars.innerHTML = '';
        const maxLimit = Math.max(...dailyLog.map(d => d.reserve));

        dailyLog.forEach(log => {
            const percentHeight = ((log.reserve / maxLimit) * 100).toFixed(0);
            
            let colorClass = 'normal';
            if (log.reserve <= 0) colorClass = 'critical';
            else if (log.reserve <= critical) colorClass = 'warning';

            const barCol = document.createElement('div');
            barCol.className = 'bar-column';
            barCol.innerHTML = `
                <span class="bar-val">${Math.round(log.reserve)} L</span>
                <div class="bar-body ${colorClass}" style="height: ${percentHeight}%"></div>
                <span class="bar-lbl">Día ${log.day}</span>
            `;
            fuelChartBars.appendChild(barCol);
        });

        chartContainerFuel.style.display = 'flex';
    }


    /* ==========================================================================
       4. ESCENARIO B: SIMULADOR DE ALIMENTOS
       ========================================================================== */
    const btnAddFoodItem = document.getElementById('btn-add-food-item');
    const foodItemsContainer = document.getElementById('food-items-list');
    const formFood = document.getElementById('form-food');
    const resultsFood = document.getElementById('results-food');
    const chartContainerFood = document.getElementById('chart-container-food');
    const foodProgressBars = document.getElementById('food-progress-bars');

    let foodItemIndex = 0;

    function addFoodRow(name = "", priceOld = "", priceNew = "", quantity = "") {
        foodItemIndex++;
        const row = document.createElement('div');
        row.className = 'product-row';
        row.id = `food-row-${foodItemIndex}`;
        row.innerHTML = `
            <input type="text" class="food-name" placeholder="Ej: Arroz" value="${name}" required>
            <input type="number" class="food-price-old" placeholder="P. Anterior (Bs)" value="${priceOld}" min="0.01" step="0.1" required>
            <input type="number" class="food-price-new" placeholder="P. Actual (Bs)" value="${priceNew}" min="0.01" step="0.1" required>
            <input type="number" class="food-qty" placeholder="Cant. Mensual" value="${quantity}" min="1" required>
            <button type="button" class="btn-remove-row" data-row="food-row-${foodItemIndex}" title="Eliminar fila">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        foodItemsContainer.appendChild(row);

        // Evento para borrar fila
        row.querySelector('.btn-remove-row').addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-row');
            document.getElementById(targetId).remove();
        });
    }

    // Inicializar con un campo vacío si no hay cargados
    addFoodRow();

    btnAddFoodItem.addEventListener('click', () => {
        addFoodRow();
    });

    formFood.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateFood();
    });

    function calculateFood() {
        const rows = foodItemsContainer.querySelectorAll('.product-row');
        if (rows.length === 0) {
            resultsFood.innerHTML = getStatusAlertHtml('critical', 'Sin Artículos', 'Debes agregar al menos un artículo a la lista de compras.');
            chartContainerFood.style.display = 'none';
            return;
        }

        // Validación de filas
        let isValid = true;
        rows.forEach(row => {
            const nameInput = row.querySelector('.food-name');
            const priceOldInput = row.querySelector('.food-price-old');
            const priceNewInput = row.querySelector('.food-price-new');
            const qtyInput = row.querySelector('.food-qty');

            [nameInput, priceOldInput, priceNewInput, qtyInput].forEach(inp => {
                inp.style.borderColor = '';
                if (inp.value.trim() === '') {
                    inp.style.borderColor = 'var(--color-danger)';
                    isValid = false;
                }
            });

            const pOld = parseFloat(priceOldInput.value);
            const pNew = parseFloat(priceNewInput.value);
            const qty = parseFloat(qtyInput.value);

            if (isNaN(pOld) || pOld < 0 || isNaN(pNew) || pNew < 0 || isNaN(qty) || qty <= 0) {
                isValid = false;
            }
        });

        if (!isValid) {
            resultsFood.innerHTML = getStatusAlertHtml('critical', 'Error en Datos', 'Por favor verifica que todos los campos del producto contengan datos válidos y positivos.');
            chartContainerFood.style.display = 'none';
            return;
        }

        let totalGastoAnterior = 0;
        let totalGastoActual = 0;
        const productsData = [];

        rows.forEach(row => {
            const name = row.querySelector('.food-name').value;
            const priceOld = parseFloat(row.querySelector('.food-price-old').value);
            const priceNew = parseFloat(row.querySelector('.food-price-new').value);
            const qty = parseFloat(row.querySelector('.food-qty').value);

            const aumento = priceNew - priceOld;
            const porcentajeAumento = ((priceNew - priceOld) / priceOld) * 100;
            const gastoMensualAnt = priceOld * qty;
            const gastoMensualAct = priceNew * qty;
            const difGasto = gastoMensualAct - gastoMensualAnt;

            totalGastoAnterior += gastoMensualAnt;
            totalGastoActual += gastoMensualAct;

            productsData.push({
                name,
                priceOld,
                priceNew,
                aumento,
                porcentajeAumento,
                gastoMensualAnt,
                gastoMensualAct,
                difGasto
            });
        });

        const inflacionGlobal = totalGastoAnterior > 0 ? ((totalGastoActual - totalGastoAnterior) / totalGastoAnterior) * 100 : 0;
        const sobrecostoTotal = totalGastoActual - totalGastoAnterior;

        let status = 'good';
        let statusTitle = 'Inflación Moderada';
        if (inflacionGlobal > 30) {
            status = 'critical';
            statusTitle = 'Inflación Crítica Afectando el Hogar';
        } else if (inflacionGlobal > 15) {
            status = 'warning';
            statusTitle = 'Inflación Media Detectada';
        }

        // Armar tabla de reporte
        let tableRowsHtml = '';
        productsData.forEach(p => {
            tableRowsHtml += `
                <tr>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.priceOld.toFixed(1)} Bs</td>
                    <td>${p.priceNew.toFixed(1)} Bs</td>
                    <td>+${p.porcentajeAumento.toFixed(0)}%</td>
                    <td>${p.gastoMensualAnt.toFixed(1)} Bs</td>
                    <td class="highlight-row">${p.gastoMensualAct.toFixed(1)} Bs</td>
                </tr>
            `;
        });

        resultsFood.innerHTML = `
            ${getStatusAlertHtml(status, statusTitle, `El gasto familiar mensual aumentó un <strong>${inflacionGlobal.toFixed(1)}%</strong>, lo que representa pagar <strong>${sobrecostoTotal.toFixed(1)} Bs</strong> adicionales al mes.`)}
            <div class="results-area">
                <div class="report-table-wrapper">
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>Artículo</th>
                                <th>P. Anterior</th>
                                <th>P. Actual</th>
                                <th>Incremento %</th>
                                <th>Gasto Ant.</th>
                                <th>Gasto Act.</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHtml}
                            <tr class="highlight-row" style="background: rgba(255,255,255,0.05);">
                                <td colspan="3"><strong>Total Acumulado</strong></td>
                                <td>+${inflacionGlobal.toFixed(1)}%</td>
                                <td>${totalGastoAnterior.toFixed(1)} Bs</td>
                                <td style="color: var(--color-warning);">${totalGastoActual.toFixed(1)} Bs</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="narrative-p" style="font-size:12px;"><i class="fa-solid fa-calculator"></i> <strong>Proyección Semanal:</strong> El gasto familiar pasó de ${(totalGastoAnterior/4).toFixed(1)} Bs/semana a <strong>${(totalGastoActual/4).toFixed(1)} Bs/semana</strong> (Sobrecosto semanal de +${(sobrecostoTotal/4).toFixed(1)} Bs).</p>
            </div>
        `;

        // Render gráfico de progreso
        const maxVal = Math.max(totalGastoAnterior, totalGastoActual);
        const oldPercent = ((totalGastoAnterior / maxVal) * 100).toFixed(0);
        const newPercent = ((totalGastoActual / maxVal) * 100).toFixed(0);

        foodProgressBars.innerHTML = `
            <div class="progress-group">
                <div class="progress-header">
                    <span>Gasto Mensual Anterior (Canasta Base)</span>
                    <span>${totalGastoAnterior.toFixed(1)} Bs</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill fill-primary" style="width: ${oldPercent}%">${oldPercent}%</div>
                </div>
            </div>
            <div class="progress-group">
                <div class="progress-header" style="color: var(--color-warning);">
                    <span>Gasto Mensual Actual (Con Encarecimiento)</span>
                    <span>${totalGastoActual.toFixed(1)} Bs</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill fill-danger" style="width: ${newPercent}%">${newPercent}%</div>
                </div>
            </div>
        `;

        chartContainerFood.style.display = 'flex';
    }


    /* ==========================================================================
       5. ESCENARIO C: COSTO DE TRANSPORTE
       ========================================================================== */
    const formTransport = document.getElementById('form-transport');
    const resultsTransport = document.getElementById('results-transport');
    const chartContainerTransport = document.getElementById('chart-container-transport');
    const transportChartBars = document.getElementById('transport-chart-bars');

    formTransport.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateFormInputs('form-transport')) {
            resultsTransport.innerHTML = getStatusAlertHtml('critical', 'Error de Validación', 'Por favor verifica que las distancias y costos contengan valores positivos coherentes.');
            chartContainerTransport.style.display = 'none';
            return;
        }

        const distNormal = parseFloat(document.getElementById('trans-dist-normal').value);
        const distDetour = parseFloat(document.getElementById('trans-dist-detour').value);
        const costKm = parseFloat(document.getElementById('trans-cost-km').value);
        const trips = parseFloat(document.getElementById('trans-trips').value);

        calculateTransport(distNormal, distDetour, costKm, trips);
    });

    function calculateTransport(distNormal, distDetour, costKm, trips) {
        const costNormalTrip = distNormal * costKm;
        const costDetourTrip = distDetour * costKm;
        const extraCostTrip = costDetourTrip - costNormalTrip;

        const weeklyNormal = costNormalTrip * trips;
        const weeklyDetour = costDetourTrip * trips;
        const weeklyExtra = extraCostTrip * trips;
        const monthlyExtra = weeklyExtra * 4;

        let status = 'good';
        let statusTitle = 'Impacto Vial Leve';
        if (weeklyExtra > 100) {
            status = 'critical';
            statusTitle = 'Impacto Vial Crítico';
        } else if (weeklyExtra > 40) {
            status = 'warning';
            statusTitle = 'Impacto Vial Moderado';
        }

        resultsTransport.innerHTML = `
            ${getStatusAlertHtml(status, statusTitle, `El sobrecosto por bloqueos te obliga a gastar <strong>+${weeklyExtra.toFixed(1)} Bs</strong> semanales.`)}
            <div class="results-area">
                <p class="narrative-p">Cada desvío incrementa la distancia del viaje en <strong>${(distDetour - distNormal).toFixed(1)} km</strong>, lo que sube el precio por viaje de ${costNormalTrip.toFixed(1)} Bs a <strong>${costDetourTrip.toFixed(1)} Bs</strong>.</p>
                <table class="report-table">
                    <thead>
                        <tr><th>Período</th><th>Ruta Habitual</th><th>Con Bloqueos / Desvío</th><th>Costo Adicional</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Por Viaje</td><td>${costNormalTrip.toFixed(1)} Bs</td><td>${costDetourTrip.toFixed(1)} Bs</td><td style="color:var(--color-warning);">+${extraCostTrip.toFixed(1)} Bs</td></tr>
                        <tr><td>Semanal (${trips} viajes)</td><td>${weeklyNormal.toFixed(1)} Bs</td><td>${weeklyDetour.toFixed(1)} Bs</td><td style="color:var(--color-warning);">+${weeklyExtra.toFixed(1)} Bs</td></tr>
                        <tr class="highlight-row"><td>Mensual Proyectado</td><td>${(weeklyNormal*4).toFixed(1)} Bs</td><td>${(weeklyDetour*4).toFixed(1)} Bs</td><td style="color:var(--color-danger);">+${monthlyExtra.toFixed(1)} Bs</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        // Generar gráfico de barras horizontales
        const maxVal = Math.max(weeklyNormal, weeklyDetour);
        const normalPercent = ((weeklyNormal / maxVal) * 100).toFixed(0);
        const detourPercent = ((weeklyDetour / maxVal) * 100).toFixed(0);

        transportChartBars.innerHTML = `
            <div class="horizontal-bar-row">
                <div class="hbar-label">Normal</div>
                <div class="hbar-track">
                    <div class="hbar-fill normal" style="width: ${normalPercent}%">${weeklyNormal.toFixed(1)} Bs</div>
                </div>
            </div>
            <div class="horizontal-bar-row">
                <div class="hbar-label">Con Desvíos</div>
                <div class="hbar-track">
                    <div class="hbar-fill danger" style="width: ${detourPercent}%">${weeklyDetour.toFixed(1)} Bs</div>
                </div>
            </div>
        `;

        chartContainerTransport.style.display = 'flex';
    }


    /* ==========================================================================
       6. ESCENARIO D: COMPRAS FAMILIARES
       ========================================================================== */
    const btnAddBudgetItem = document.getElementById('btn-add-budget-item');
    const budgetItemsContainer = document.getElementById('budget-items-list');
    const formBudget = document.getElementById('form-budget');
    const resultsBudget = document.getElementById('results-budget');
    const chartContainerBudget = document.getElementById('chart-container-budget');
    const budgetProgressBar = document.getElementById('budget-progress-bar');

    let budgetItemIndex = 0;

    function addBudgetRow(name = "", price = "", quantity = "") {
        budgetItemIndex++;
        const row = document.createElement('div');
        row.className = 'product-row';
        row.id = `budget-row-${budgetItemIndex}`;
        row.innerHTML = `
            <input type="text" class="budget-prod-name" placeholder="Ej: Bolsa de Pan" value="${name}" required>
            <input type="number" class="budget-prod-price" placeholder="P. Unitario (Bs)" value="${price}" min="0.01" step="0.1" required>
            <input type="number" class="budget-prod-qty" placeholder="Cantidad" value="${quantity}" min="1" required>
            <button type="button" class="btn-remove-row" data-row="budget-row-${budgetItemIndex}" title="Eliminar fila">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        budgetItemsContainer.appendChild(row);

        row.querySelector('.btn-remove-row').addEventListener('click', (e) => {
            const targetId = e.currentTarget.getAttribute('data-row');
            document.getElementById(targetId).remove();
        });
    }

    // Inicializar con un campo vacío si no hay cargados
    addBudgetRow();

    btnAddBudgetItem.addEventListener('click', () => {
        addBudgetRow();
    });

    formBudget.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateBudget();
    });

    function calculateBudget() {
        const budgetLimitInput = document.getElementById('budget-limit');
        
        // Limpiar errores previos
        const parentLimit = budgetLimitInput.closest('.form-group') || budgetLimitInput.parentElement;
        const err = parentLimit.querySelector('.error-msg');
        if (err) err.remove();
        budgetLimitInput.style.borderColor = '';

        const budgetLimit = parseFloat(budgetLimitInput.value);

        if (isNaN(budgetLimit) || budgetLimit < 0) {
            budgetLimitInput.style.borderColor = 'var(--color-danger)';
            showInputError(budgetLimitInput, 'Presupuesto no válido.');
            resultsBudget.innerHTML = getStatusAlertHtml('critical', 'Error en Datos', 'Por favor ingresa un presupuesto válido.');
            chartContainerBudget.style.display = 'none';
            return;
        }

        const rows = budgetItemsContainer.querySelectorAll('.product-row');
        if (rows.length === 0) {
            resultsBudget.innerHTML = getStatusAlertHtml('critical', 'Lista Vacía', 'Agrega artículos a la lista de compras.');
            chartContainerBudget.style.display = 'none';
            return;
        }

        let isValid = true;
        rows.forEach(row => {
            const nameInp = row.querySelector('.budget-prod-name');
            const priceInp = row.querySelector('.budget-prod-price');
            const qtyInp = row.querySelector('.budget-prod-qty');

            [nameInp, priceInp, qtyInp].forEach(inp => {
                inp.style.borderColor = '';
                if (inp.value.trim() === '') {
                    inp.style.borderColor = 'var(--color-danger)';
                    isValid = false;
                }
            });

            const p = parseFloat(priceInp.value);
            const q = parseFloat(qtyInp.value);

            if (isNaN(p) || p < 0 || isNaN(q) || q <= 0) {
                isValid = false;
            }
        });

        if (!isValid) {
            resultsBudget.innerHTML = getStatusAlertHtml('critical', 'Error en Artículos', 'Verifica que los artículos contengan descripciones, cantidades y precios válidos.');
            chartContainerBudget.style.display = 'none';
            return;
        }

        let totalCompra = 0;
        const items = [];

        rows.forEach(row => {
            const name = row.querySelector('.budget-prod-name').value;
            const price = parseFloat(row.querySelector('.budget-prod-price').value);
            const qty = parseFloat(row.querySelector('.budget-prod-qty').value);
            const subtotal = price * qty;
            
            totalCompra += subtotal;
            items.push({ name, price, qty, subtotal });
        });

        const diferencia = budgetLimit - totalCompra;
        const percentUsed = (totalCompra / budgetLimit) * 100;

        let status = 'good';
        let statusTitle = 'Presupuesto Equilibrado';
        let statusMsg = `Compra cubierta. Saldo restante: <strong>${diferencia.toFixed(1)} Bs</strong>.`;
        let alertClass = 'fill-success';

        if (diferencia < 0) {
            status = 'critical';
            statusTitle = 'Déficit Financiero - No Alcanza';
            statusMsg = `Te faltan <strong>${Math.abs(diferencia).toFixed(1)} Bs</strong> para completar la compra planeada.`;
            alertClass = 'fill-danger';
        } else if (percentUsed > 90) {
            status = 'warning';
            statusTitle = 'Límite de Presupuesto Cercano';
            statusMsg = `Has usado casi todo tu presupuesto. Te quedan solo <strong>${diferencia.toFixed(1)} Bs</strong>.`;
            alertClass = 'fill-warning';
        }

        // Clasificación del gasto
        let clasificacion = 'Bajo (Consumo controlado)';
        if (percentUsed > 100) {
            clasificacion = 'Excedido (Déficit)';
        } else if (percentUsed >= 80) {
            clasificacion = 'Alto (Ajustado)';
        } else if (percentUsed >= 50) {
            clasificacion = 'Medio (Moderado)';
        }

        let tableRows = '';
        items.forEach(it => {
            tableRows += `
                <tr>
                    <td>${it.name}</td>
                    <td>${it.qty}</td>
                    <td>${it.price.toFixed(1)} Bs</td>
                    <td class="highlight-row">${it.subtotal.toFixed(1)} Bs</td>
                </tr>
            `;
        });

        resultsBudget.innerHTML = `
            ${getStatusAlertHtml(status, statusTitle, statusMsg)}
            <div class="results-area">
                <div class="report-table-wrapper">
                    <table class="report-table">
                        <thead>
                            <tr><th>Artículo</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th></tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                            <tr class="highlight-row" style="background: rgba(255,255,255,0.05);">
                                <td colspan="3">Total Compra</td>
                                <td style="color: var(--color-warning);">${totalCompra.toFixed(1)} Bs</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <table class="report-table">
                    <tbody>
                        <tr><td>Presupuesto Familiar</td><td>${budgetLimit.toFixed(1)} Bs</td></tr>
                        <tr><td>Clasificación del Gasto</td><td><strong>${clasificacion}</strong></td></tr>
                        <tr><td>${diferencia >= 0 ? 'Saldo Restante' : 'Monto Faltante'}</td><td style="color: ${diferencia >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${Math.abs(diferencia).toFixed(1)} Bs</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        // Render progress bar
        const displayPercent = Math.min(percentUsed, 100).toFixed(0);
        budgetProgressBar.className = `progress-bar-fill ${alertClass}`;
        budgetProgressBar.style.width = `${displayPercent}%`;
        budgetProgressBar.textContent = `${percentUsed.toFixed(0)}%`;

        chartContainerBudget.style.display = 'flex';
    }


    /* ==========================================================================
       7. ESCENARIO E: RUMOR DE ESCASEZ y COMPRAS POR PÁNICO
       ========================================================================== */
    const formPanic = document.getElementById('form-panic');
    const resultsPanic = document.getElementById('results-panic');
    const chartContainerPanic = document.getElementById('chart-container-panic');
    const panicChartBars = document.getElementById('panic-chart-bars');

    formPanic.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateFormInputs('form-panic')) {
            resultsPanic.innerHTML = getStatusAlertHtml('critical', 'Error de Validación', 'Verifica que la demanda, incremento y stock sean válidos.');
            chartContainerPanic.style.display = 'none';
            return;
        }

        const normalDemand = parseFloat(document.getElementById('panic-normal-demand').value);
        const percentIncrease = parseFloat(document.getElementById('panic-percent-increase').value);
        const stock = parseFloat(document.getElementById('panic-stock').value);
        const buyers = parseFloat(document.getElementById('panic-buyers').value);

        calculatePanic(normalDemand, percentIncrease, stock, buyers);
    });

    function calculatePanic(normalDemand, percentIncrease, stock, buyers) {
        // Demanda normal ponderada por los compradores
        const totalNormalDemand = normalDemand * buyers;
        
        // Nueva demanda con el aumento por pánico
        const factorIncremento = 1 + (percentIncrease / 100);
        const totalPanicDemand = totalNormalDemand * factorIncremento;
        
        const extraDemand = totalPanicDemand - totalNormalDemand;
        const stockRestante = stock - totalPanicDemand;

        let status = 'good';
        let statusTitle = 'Stock Suficiente';
        let statusMsg = 'El inventario de la tienda cubre las compras adicionales por rumor.';

        if (stockRestante < 0) {
            status = 'critical';
            statusTitle = 'Quiebre de Stock (Desabastecimiento)';
            statusMsg = `El stock es insuficiente por <strong>${Math.abs(stockRestante).toFixed(0)} unidades</strong>. Se generará desabastecimiento comercial inmediato.`;
        } else if (stockRestante <= stock * 0.15) {
            status = 'warning';
            statusTitle = 'Stock Crítico en Góndolas';
            statusMsg = 'El inventario de la tienda está a punto de agotarse debido a las compras nerviosas.';
        }

        resultsPanic.innerHTML = `
            ${getStatusAlertHtml(status, statusTitle, statusMsg)}
            <div class="results-area">
                <p class="narrative-p">La demanda normal de <strong>${buyers} compradores</strong> es de <strong>${totalNormalDemand.toFixed(0)} unidades</strong>. Debido al rumor de desabastecimiento, la demanda se incrementa un <strong>${percentIncrease.toFixed(0)}%</strong>, resultando en un requerimiento total de <strong>${totalPanicDemand.toFixed(0)} unidades</strong>.</p>
                
                <table class="report-table">
                    <thead>
                        <tr><th>Concepto comercial</th><th>Cantidad</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Demanda Normal Total</td><td>${totalNormalDemand.toFixed(0)} unidades</td></tr>
                        <tr><td>Incremento de Demanda por Rumor</td><td style="color: var(--color-warning);">+${extraDemand.toFixed(0)} unidades</td></tr>
                        <tr class="highlight-row"><td>Nueva Demanda Proyectada</td><td>${totalPanicDemand.toFixed(0)} unidades</td></tr>
                        <tr><td>Stock Inicial de Tienda</td><td>${stock.toFixed(0)} unidades</td></tr>
                        <tr><td>Saldo en Estanterías</td><td style="color: ${stockRestante >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${stockRestante.toFixed(0)} unidades</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        // Generar gráfico de barras comparativas vertical
        panicChartBars.innerHTML = '';
        const maxVal = Math.max(stock, totalPanicDemand);

        const stockHeight = ((stock / maxVal) * 100).toFixed(0);
        const demandHeight = ((totalPanicDemand / maxVal) * 100).toFixed(0);

        // Barra Stock
        const barStock = document.createElement('div');
        barStock.className = 'bar-column';
        barStock.innerHTML = `
            <span class="bar-val">${stock.toFixed(0)}</span>
            <div class="bar-body normal" style="height: ${stockHeight}%; background-color: var(--color-primary-light);"></div>
            <span class="bar-lbl">Stock Disp.</span>
        `;
        panicChartBars.appendChild(barStock);

        // Barra Demanda
        const barDemand = document.createElement('div');
        barDemand.className = 'bar-column';
        
        let demandColor = 'normal';
        if (totalPanicDemand > stock) demandColor = 'critical';
        else if (totalPanicDemand > stock * 0.85) demandColor = 'warning';

        barDemand.innerHTML = `
            <span class="bar-val">${totalPanicDemand.toFixed(0)}</span>
            <div class="bar-body ${demandColor}" style="height: ${demandHeight}%;"></div>
            <span class="bar-lbl">Demanda</span>
        `;
        panicChartBars.appendChild(barDemand);

        chartContainerPanic.style.display = 'flex';
    }


    /* ==========================================================================
       8. ESCENARIO F: PÉRDIDA DEL PODER ADQUISITIVO
       ========================================================================== */
    const formPurchasing = document.getElementById('form-purchasing');
    const resultsPurchasing = document.getElementById('results-purchasing');
    const chartContainerPurchasing = document.getElementById('chart-container-purchasing');
    const purchasingProgressBars = document.getElementById('purchasing-progress-bars');

    formPurchasing.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateFormInputs('form-purchasing')) {
            resultsPurchasing.innerHTML = getStatusAlertHtml('critical', 'Error de Validación', 'Por favor verifica que no haya campos vacíos y todos los valores sean numéricos positivos.');
            chartContainerPurchasing.style.display = 'none';
            return;
        }

        const income = parseFloat(document.getElementById('purchase-income').value);
        const expenseOld = parseFloat(document.getElementById('purchase-gasto-anterior').value);
        const expenseNew = parseFloat(document.getElementById('purchase-gasto-actual').value);

        calculatePurchasing(income, expenseOld, expenseNew);
    });

    function calculatePurchasing(income, expenseOld, expenseNew) {
        const extraExpense = expenseNew - expenseOld;
        const lossPercent = (extraExpense / income) * 100;

        const balanceOld = income - expenseOld;
        const balanceNew = income - expenseNew;

        let status = 'good';
        let statusTitle = 'Afectación Familiar Leve';
        if (lossPercent > 25) {
            status = 'critical';
            statusTitle = 'Pérdida Crítica del Poder Adquisitivo';
        } else if (lossPercent > 10) {
            status = 'warning';
            statusTitle = 'Afectación Familiar Moderada';
        }

        resultsPurchasing.innerHTML = `
            ${getStatusAlertHtml(status, statusTitle, `La inflación ha provocado una pérdida de capacidad de compra equivalente al <strong>${lossPercent.toFixed(1)}%</strong> del sueldo mensual.`)}
            <div class="results-area">
                <p class="narrative-p">El encarecimiento de la misma canasta básica demanda <strong>${extraExpense.toFixed(1)} Bs</strong> extra al mes, reduciendo tu excedente de ahorro familiar de ${balanceOld.toFixed(1)} Bs a <strong>${balanceNew.toFixed(1)} Bs</strong>.</p>
                
                <table class="report-table">
                    <thead>
                        <tr><th>Indicador Familiar</th><th>Antes de la Crisis</th><th>Situación Actual</th><th>Variación</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Ingreso Mensual</td><td>${income.toFixed(1)} Bs</td><td>${income.toFixed(1)} Bs</td><td>Sin cambio (fijo)</td></tr>
                        <tr><td>Gasto en Canasta Básica</td><td>${expenseOld.toFixed(1)} Bs</td><td>${expenseNew.toFixed(1)} Bs</td><td style="color:var(--color-danger)">+${extraExpense.toFixed(1)} Bs</td></tr>
                        <tr class="highlight-row"><td>Saldo / Excedente Libre</td><td>${balanceOld.toFixed(1)} Bs</td><td style="color: ${balanceNew >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}">${balanceNew.toFixed(1)} Bs</td><td>${(balanceNew - balanceOld).toFixed(1)} Bs</td></tr>
                    </tbody>
                </table>
            </div>
        `;

        // Generar gráficos horizontales
        const maxVal = Math.max(income, expenseNew);
        const oldBar = ((expenseOld / maxVal) * 100).toFixed(0);
        const newBar = ((expenseNew / maxVal) * 100).toFixed(0);
        const incBar = ((income / maxVal) * 100).toFixed(0);

        purchasingProgressBars.innerHTML = `
            <div class="progress-group">
                <div class="progress-header">
                    <span>Sueldo Fijo Mensual</span>
                    <span>${income.toFixed(1)} Bs</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill fill-primary" style="width: ${incBar}%">${incBar}%</div>
                </div>
            </div>
            <div class="progress-group">
                <div class="progress-header">
                    <span>Proporción de Gasto Anterior (${((expenseOld/income)*100).toFixed(0)}% del sueldo)</span>
                    <span>${expenseOld.toFixed(1)} Bs</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill fill-success" style="width: ${oldBar}%">${((expenseOld/income)*100).toFixed(0)}%</div>
                </div>
            </div>
            <div class="progress-group">
                <div class="progress-header" style="color: var(--color-danger);">
                    <span>Proporción de Gasto Actual (${((expenseNew/income)*100).toFixed(0)}% del sueldo)</span>
                    <span>${expenseNew.toFixed(1)} Bs</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill fill-danger" style="width: ${newBar}%">${((expenseNew/income)*100).toFixed(0)}%</div>
                </div>
            </div>
        `;

        chartContainerPurchasing.style.display = 'flex';
    }


    /* ==========================================================================
       9. BOTONES DE LIMPIEZA DE FORMULARIOS
       ========================================================================== */
    const clearButtons = document.querySelectorAll('.btn-clear');
    
    clearButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const formId = btn.getAttribute('data-form');
            const form = document.getElementById(formId);
            if (!form) return;

            // Restablecer el formulario HTML
            form.reset();

            // Eliminar alertas de error que puedan estar activas
            const errors = form.querySelectorAll('.error-msg');
            errors.forEach(err => err.remove());
            form.querySelectorAll('input').forEach(inp => inp.style.borderColor = '');

            // Restablecer contenedores de filas dinámicas a 1 fila vacía
            if (formId === 'form-food') {
                foodItemsContainer.innerHTML = '';
                addFoodRow();
                resultsFood.innerHTML = `
                    <div class="results-placeholder">
                        <div class="empty-state">
                            <i class="fa-solid fa-receipt"></i>
                            <p>Genera el reporte para observar cuánto más gasta tu hogar por el incremento de precios básicos.</p>
                        </div>
                    </div>
                `;
                chartContainerFood.style.display = 'none';
            } else if (formId === 'form-budget') {
                budgetItemsContainer.innerHTML = '';
                addBudgetRow();
                resultsBudget.innerHTML = `
                    <div class="results-placeholder">
                        <div class="empty-state">
                            <i class="fa-solid fa-bag-shopping"></i>
                            <p>Suma los productos a tu lista para saber si tu presupuesto resistirá los precios vigentes.</p>
                        </div>
                    </div>
                `;
                chartContainerBudget.style.display = 'none';
            } else {
                // Restablecer los marcadores de resultados de los formularios normales
                const targetResultsMap = {
                    'form-fuel': { res: resultsFuel, chart: chartContainerFuel, ph: '<div class="empty-state"><i class="fa-solid fa-gas-pump-slash"></i><p>Ingresa los valores numéricos y presiona <strong>Calcular Proyección</strong> para ver el reporte interactivo.</p></div>' },
                    'form-transport': { res: resultsTransport, chart: chartContainerTransport, ph: '<div class="empty-state"><i class="fa-solid fa-car-tunnel"></i><p>Registra las distancias para conocer el sobrecosto acumulado de los desvíos.</p></div>' },
                    'form-panic': { res: resultsPanic, chart: chartContainerPanic, ph: '<div class="empty-state"><i class="fa-solid fa-shop-slash"></i><p>Simula el impacto de un rumor para constatar si se produce un desabastecimiento comercial inmediato.</p></div>' },
                    'form-purchasing': { res: resultsPurchasing, chart: chartContainerPurchasing, ph: '<div class="empty-state"><i class="fa-solid fa-calculator"></i><p>Ingresa tu presupuesto para conocer qué porcentaje de tu sueldo se ha erosionado debido a la inflación.</p></div>' }
                };

                const data = targetResultsMap[formId];
                if (data) {
                    data.res.innerHTML = `<div class="results-placeholder">${data.ph}</div>`;
                    if (data.chart) data.chart.style.display = 'none';
                }
            }
        });
    });


    /* ==========================================================================
       10. CARGADORES DE PREAJUSTES (PRESETS / CASOS DE ESTUDIO INTERACTIVOS)
       ========================================================================== */
    const presetButtons = document.querySelectorAll('[data-preset]');

    function loadPreset(presetId) {
        switch (presetId) {
            case 'fuel-case1':
                // Cambiar a pestaña Carburante si es necesario
                document.getElementById('fuel-initial').value = 10000;
                document.getElementById('fuel-consumption').value = 1200;
                document.getElementById('fuel-refill').value = 300;
                document.getElementById('fuel-critical').value = 2000;
                // Disparar submit
                formFuel.dispatchEvent(new Event('submit'));
                break;

            case 'food-case2':
                // Limpiar dinámicos y cargar los del enunciado
                foodItemsContainer.innerHTML = '';
                addFoodRow('Arroz', 8, 11, 10);
                addFoodRow('Papa', 7, 10, 8);
                addFoodRow('Aceite', 12, 18, 4);
                // Calcular
                calculateFood();
                break;

            case 'transport-case3':
                document.getElementById('trans-dist-normal').value = 10;
                document.getElementById('trans-dist-detour').value = 16;
                document.getElementById('trans-cost-km').value = 2;
                document.getElementById('trans-trips').value = 5;
                // Submit
                formTransport.dispatchEvent(new Event('submit'));
                break;

            case 'budget-case4':
                document.getElementById('budget-limit').value = 500;
                budgetItemsContainer.innerHTML = '';
                addBudgetRow('Compra Planificada de Alimentos', 580, 1);
                // Calcular
                calculateBudget();
                break;

            case 'panic-case5':
                document.getElementById('panic-normal-demand').value = 100;
                document.getElementById('panic-percent-increase').value = 40;
                document.getElementById('panic-stock').value = 120;
                document.getElementById('panic-buyers').value = 1;
                // Submit
                formPanic.dispatchEvent(new Event('submit'));
                break;

            case 'purchasing-case6':
                document.getElementById('purchase-income').value = 3000;
                document.getElementById('purchase-gasto-anterior').value = 2500;
                document.getElementById('purchase-gasto-actual').value = 3200;
                // Submit
                formPurchasing.dispatchEvent(new Event('submit'));
                break;
        }
    }

    presetButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const presetId = btn.getAttribute('data-preset');
            loadPreset(presetId);
        });
    });


    /* ==========================================================================
       11. NAVEGACIÓN Y CARGA DE CASOS DE ESTUDIO DESDE LA PESTAÑA CONSOLIDADA
       ========================================================================== */
    const caseTabBtns = document.querySelectorAll('.case-tab-btn');
    const caseContents = document.querySelectorAll('.case-content');

    caseTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            caseTabBtns.forEach(b => b.classList.remove('active'));
            caseContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const caseId = btn.getAttribute('data-case');
            document.getElementById(`case-content-${caseId}`).classList.add('active');
        });
    });

    const runCaseBtns = document.querySelectorAll('.btn-run-case');

    runCaseBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetTab = btn.getAttribute('data-target-tab');
            const preset = btn.getAttribute('data-preset');

            // 1. Cambiar a la pestaña del simulador correspondiente
            switchTab(targetTab);
            // 2. Cargar el preset correspondiente
            loadPreset(preset);
        });
    });

});
