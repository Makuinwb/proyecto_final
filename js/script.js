// Esperar a que cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------
    // 1. NAVEGACIÓN ENTRE SIMULADORES
    // -------------------------------
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.simulator-section');
    
    function switchSimulator(simulatorId) {
        sections.forEach(section => section.classList.remove('active'));
        const activeSection = document.getElementById(`${simulatorId}Simulator`);
        if (activeSection) activeSection.classList.add('active');
        
        navBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.simulator === simulatorId) btn.classList.add('active');
        });
    }
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const simId = btn.dataset.simulator;
            switchSimulator(simId);
        });
    });
    
    // Iniciar en contexto
    switchSimulator('context');
    
    // -------------------------------------------------
    // 2. ESCENARIO A: CARBURANTE (con validación de negativos)
    // -------------------------------------------------
    const fuelForm = document.getElementById('fuelForm');
    const fuelResults = document.getElementById('fuelResults');
    const fuelChartDiv = document.getElementById('fuelChart');
    const barChartContainer = document.getElementById('fuelBarChart');
    
    function calculateFuel(initial, consumption, refill, critical) {
        let days = 0;
        let currentReserve = initial;
        let dayByDay = [];
        let reachedCritical = null;
        
        while (currentReserve > 0 && days < 365) {
            days++;
            currentReserve = currentReserve + refill - consumption;
            dayByDay.push({day: days, reserve: currentReserve});
            if (reachedCritical === null && currentReserve <= critical) {
                reachedCritical = days;
            }
            if (currentReserve <= 0) break;
        }
        const isExhausted = currentReserve <= 0;
        return { days, finalReserve: currentReserve, isExhausted, reachedCritical, dayByDay };
    }
    
    function renderFuelChart(dayByDay) {
        if (!barChartContainer) return;
        barChartContainer.innerHTML = '';
        const maxReserve = Math.max(...dayByDay.map(d => d.reserve), 1);
        const displayDays = dayByDay.slice(0, 14);
        displayDays.forEach(dayData => {
            const heightPercent = (dayData.reserve / maxReserve) * 100;
            const bar = document.createElement('div');
            bar.className = 'bar-item';
            bar.style.height = `${Math.max(heightPercent, 5)}px`;
            bar.textContent = dayData.reserve > 0 ? `${Math.round(dayData.reserve)}` : '0';
            bar.title = `Día ${dayData.day}: ${Math.round(dayData.reserve)} L`;
            barChartContainer.appendChild(bar);
        });
    }
    
    if(fuelForm) {
        fuelForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const initial = parseFloat(document.getElementById('fuelInitial').value);
            const consumption = parseFloat(document.getElementById('fuelConsumption').value);
            const refill = parseFloat(document.getElementById('fuelRefill').value);
            const critical = parseFloat(document.getElementById('fuelCritical').value);
            
            // Validación de campos vacíos
            if (isNaN(initial) || isNaN(consumption) || isNaN(refill) || isNaN(critical)) {
                fuelResults.innerHTML = '<p class="critical">⚠️ Error: Todos los campos son obligatorios.</p>';
                fuelChartDiv.style.display = 'none';
                return;
            }
            // VALIDACIÓN DE NÚMEROS NEGATIVOS
            if (initial < 0 || consumption < 0 || refill < 0 || critical < 0) {
                fuelResults.innerHTML = '<p class="critical">⚠️ Error: Los valores no pueden ser negativos.</p>';
                fuelChartDiv.style.display = 'none';
                return;
            }
            if (consumption <= 0) {
                fuelResults.innerHTML = '<p class="critical">⚠️ El consumo diario debe ser mayor a 0.</p>';
                return;
            }
            const sim = calculateFuel(initial, consumption, refill, critical);
            let alertClass = sim.isExhausted ? 'critical' : (sim.reachedCritical ? 'warning' : 'good');
            let message = `<p class="${alertClass}"><strong>📊 Análisis de reserva:</strong></p>`;
            message += `<table class="data-table">`;
            message += `<tr><td>Días que dura la reserva:</td><td><strong>${sim.days} días</strong></td></tr>`;
            message += `<tr><td>Reserva final aproximada:</td><td>${sim.finalReserve > 0 ? sim.finalReserve.toFixed(2) : 0} litros</td></tr>`;
            if(sim.reachedCritical) message += `<tr><td>🔔 Día que alcanza nivel crítico (${critical}L):</td><td>Día ${sim.reachedCritical}</td></tr>`;
            if(sim.isExhausted) message += `<tr><td>💀 ¡ALERTA!</td><td class="critical">La reserva se agotó. Riesgo de desabastecimiento</td></tr>`;
            message += ` notwithstanding`;
            fuelResults.innerHTML = message;
            
            if(sim.dayByDay && sim.dayByDay.length > 0) {
                fuelChartDiv.style.display = 'block';
                renderFuelChart(sim.dayByDay);
            } else {
                fuelChartDiv.style.display = 'none';
            }
        });
        
        document.getElementById('clearFuel').addEventListener('click', () => {
            document.getElementById('fuelForm').reset();
            fuelResults.innerHTML = '<p class="placeholder">🚀 Datos limpiados. Ingresa nuevos valores.</p>';
            fuelChartDiv.style.display = 'none';
        });
    }
    
    // ----------------------------------------
    // 3. ESCENARIO B: ALIMENTOS (con DELEGACIÓN DE EVENTOS y validación)
    // ----------------------------------------
    const foodContainer = document.getElementById('foodProductsContainer');
    let foodProducts = [];
    
    function renderFoodForm() {
        if(!foodContainer) return;
        foodContainer.innerHTML = '';
        foodProducts.forEach((prod, idx) => {
            const div = document.createElement('div');
            div.className = 'product-row';
            div.innerHTML = `
                <input type="text" placeholder="📦 Nombre del producto (ej: Arroz)" value="${prod.name}" data-idx="${idx}" data-field="name" class="food-name" style="flex:1.5">
                <input type="number" placeholder="💰 Precio ANTES (Bs)" value="${prod.prevPrice}" data-idx="${idx}" data-field="prevPrice" class="food-prev" style="flex:1">
                <input type="number" placeholder="💸 Precio AHORA (Bs)" value="${prod.currPrice}" data-idx="${idx}" data-field="currPrice" class="food-curr" style="flex:1">
                <input type="number" placeholder="📊 Cantidad por mes" value="${prod.quantity}" data-idx="${idx}" data-field="quantity" class="food-qty" style="flex:1">
                <button class="btn-small remove-product" data-idx="${idx}"><i class="fas fa-trash"></i> Borrar</button>
            `;
            foodContainer.appendChild(div);
        });
    }
    
    // DELEGACIÓN DE EVENTOS para los inputs de alimentos (más eficiente)
    if(foodContainer) {
        foodContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('food-name') || 
                e.target.classList.contains('food-prev') || 
                e.target.classList.contains('food-curr') || 
                e.target.classList.contains('food-qty')) {
                const idx = e.target.dataset.idx;
                const field = e.target.dataset.field;
                let value = e.target.value;
                if(field !== 'name') {
                    value = parseFloat(value) || 0;
                    // Validación: no permitir negativos en precios o cantidades
                    if (value < 0) {
                        alert('⚠️ Los precios y cantidades no pueden ser negativos. Se usará 0.');
                        value = 0;
                        e.target.value = 0;
                    }
                }
                foodProducts[idx][field] = value;
            }
        });
        
        // DELEGACIÓN para botones de eliminar
        foodContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-product') || e.target.closest('.remove-product')) {
                const btn = e.target.closest('.remove-product');
                const idx = parseInt(btn.dataset.idx);
                foodProducts.splice(idx, 1);
                renderFoodForm();
            }
        });
    }
    
    function addDefaultFoodProducts() {
        foodProducts = [
            { name: 'Arroz', prevPrice: 8, currPrice: 11, quantity: 10 },
            { name: 'Papa', prevPrice: 7, currPrice: 10, quantity: 8 },
            { name: 'Aceite', prevPrice: 12, currPrice: 18, quantity: 4 }
        ];
        renderFoodForm();
    }
    addDefaultFoodProducts();
    
    document.getElementById('addProductBtn').addEventListener('click', () => {
        foodProducts.push({ name: 'Nuevo producto', prevPrice: 0, currPrice: 0, quantity: 0 });
        renderFoodForm();
    });
    
    function calculateFoodTotal() {
        let totalPrev = 0, totalCurr = 0;
        let hasValidProducts = false;
        let details = '<table class="data-table"><tr><th>Producto</th><th>Gasto Antes (Bs)</th><th>Gasto Ahora (Bs)</th><th>Diferencia</th></tr>';
        foodProducts.forEach(p => {
            if(p.name && p.name.trim() !== '' && !isNaN(p.prevPrice) && !isNaN(p.currPrice) && !isNaN(p.quantity)) {
                // Validar que no sean negativos
                const prevPrice = Math.max(0, p.prevPrice);
                const currPrice = Math.max(0, p.currPrice);
                const quantity = Math.max(0, p.quantity);
                
                let gastoAntes = prevPrice * quantity;
                let gastoAhora = currPrice * quantity;
                totalPrev += gastoAntes;
                totalCurr += gastoAhora;
                hasValidProducts = true;
                details += `<tr><td>${p.name}</td><td>${gastoAntes.toFixed(2)} Bs</td><td>${gastoAhora.toFixed(2)} Bs</td><td class="${gastoAhora>gastoAntes?'critical':'good'}">${(gastoAhora-gastoAntes).toFixed(2)} Bs</td></tr>`;
            }
        });
        if(!hasValidProducts) {
            document.getElementById('foodResults').innerHTML = '<p class="critical">⚠️ Agrega al menos un producto válido con nombre y precios.</p>';
            return;
        }
        details += `</table><p><strong>Gasto Total Anterior:</strong> ${totalPrev.toFixed(2)} Bs</p>
                    <p><strong>Gasto Total Actual:</strong> ${totalCurr.toFixed(2)} Bs</p>
                    <p class="${totalCurr>totalPrev?'warning':'good'}"><strong>Diferencia mensual:</strong> ${(totalCurr-totalPrev).toFixed(2)} Bs (${totalPrev>0?((totalCurr-totalPrev)/totalPrev*100).toFixed(1):0}% de aumento)</p>`;
        document.getElementById('foodResults').innerHTML = details;
    }
    
    document.getElementById('calculateFoodBtn').addEventListener('click', calculateFoodTotal);
    
    // CORRECCIÓN 2: Botón Limpiar que también muestra resultados por defecto
    document.getElementById('clearFoodBtn').addEventListener('click', () => {
        addDefaultFoodProducts();
        // Ahora ejecuta automáticamente el cálculo con los productos por defecto
        calculateFoodTotal();
    });
    
    // --------------------------------------------------------
    // 4. ESCENARIO C: TRANSPORTE (con validación de negativos)
    // --------------------------------------------------------
    const transportForm = document.getElementById('transportForm');
    if(transportForm) {
        transportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const distNormal = parseFloat(document.getElementById('distNormal').value);
            const distDesvio = parseFloat(document.getElementById('distDesvio').value);
            const costKm = parseFloat(document.getElementById('costKm').value);
            const tripsWeek = parseFloat(document.getElementById('tripsWeek').value);
            
            if(isNaN(distNormal) || isNaN(distDesvio) || isNaN(costKm) || isNaN(tripsWeek)) { 
                document.getElementById('transportResults').innerHTML = '<p class="critical">⚠️ Completa todos los campos.</p>';
                return;
            }
            // VALIDACIÓN DE NÚMEROS NEGATIVOS
            if(distNormal < 0 || distDesvio < 0 || costKm < 0 || tripsWeek < 0) {
                document.getElementById('transportResults').innerHTML = '<p class="critical">⚠️ Error: Los valores no pueden ser negativos.</p>';
                return;
            }
            if(tripsWeek <= 0) {
                document.getElementById('transportResults').innerHTML = '<p class="critical">⚠️ El número de viajes por semana debe ser mayor a 0.</p>';
                return;
            }
            
            const costNormal = distNormal * costKm * tripsWeek;
            const costDesvio = distDesvio * costKm * tripsWeek;
            const additionalWeekly = costDesvio - costNormal;
            const additionalMonthly = additionalWeekly * 4;
            document.getElementById('transportResults').innerHTML = `
                <p>💰 <strong>Costo semanal normal:</strong> ${costNormal.toFixed(2)} Bs</p>
                <p>⚠️ <strong>Costo semanal con desvío:</strong> ${costDesvio.toFixed(2)} Bs</p>
                <p class="${additionalWeekly>0?'critical':'good'}">📈 <strong>Gasto adicional por semana:</strong> ${additionalWeekly.toFixed(2)} Bs</p>
                <p class="${additionalMonthly>0?'warning':'good'}">📅 <strong>Gasto adicional por mes:</strong> ${additionalMonthly.toFixed(2)} Bs</p>
            `;
        });
        document.getElementById('clearTransportBtn').addEventListener('click', () => { 
            document.getElementById('transportForm').reset(); 
            document.getElementById('transportResults').innerHTML = '<p class="placeholder">Datos reiniciados</p>'; 
        });
    }
    
    // --------------------------------------------------------
    // 5. ESCENARIO D: COMPRAS PRESUPUESTO (con DELEGACIÓN y validación)
    // --------------------------------------------------------
    let shoppingList = [{ name: 'Pan', price: 5, qty: 2 }, { name: 'Leche', price: 8, qty: 3 }];
    const shoppingContainer = document.getElementById('shoppingProductsContainer');
    
    function renderShoppingList() {
        if(!shoppingContainer) return;
        shoppingContainer.innerHTML = '';
        shoppingList.forEach((item, idx) => {
            const div = document.createElement('div');
            div.className = 'product-row';
            div.innerHTML = `
                <input type="text" placeholder="🛒 Nombre del producto (ej: Pan)" value="${item.name}" data-sidx="${idx}" data-sfield="name" class="shop-name" style="flex:1.5">
                <input type="number" placeholder="💰 Precio unitario (Bs)" value="${item.price}" data-sidx="${idx}" data-sfield="price" class="shop-price" style="flex:1">
                <input type="number" placeholder="📦 Cantidad a comprar" value="${item.qty}" data-sidx="${idx}" data-sfield="qty" class="shop-qty" style="flex:1">
                <button class="btn-small remove-shop" data-sidx="${idx}"><i class="fas fa-trash"></i> Borrar</button>
            `;
            shoppingContainer.appendChild(div);
        });
    }
    
    // DELEGACIÓN DE EVENTOS para compras
    if(shoppingContainer) {
        shoppingContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('shop-name') || 
                e.target.classList.contains('shop-price') || 
                e.target.classList.contains('shop-qty')) {
                const idx = e.target.dataset.sidx;
                const field = e.target.dataset.sfield;
                let val = e.target.value;
                if(field !== 'name') {
                    val = parseFloat(val) || 0;
                    if(val < 0) {
                        alert('⚠️ Los precios y cantidades no pueden ser negativos. Se usará 0.');
                        val = 0;
                        e.target.value = 0;
                    }
                }
                shoppingList[idx][field] = val;
            }
        });
        
        shoppingContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-shop') || e.target.closest('.remove-shop')) {
                const btn = e.target.closest('.remove-shop');
                const idx = btn.dataset.sidx;
                shoppingList.splice(idx,1);
                renderShoppingList();
            }
        });
    }
    renderShoppingList();
    
    document.getElementById('addShoppingProductBtn').addEventListener('click', () => { 
        shoppingList.push({name:'Nuevo producto', price:0, qty:0}); 
        renderShoppingList(); 
    });
    
    document.getElementById('calculateBudgetBtn').addEventListener('click', () => {
        const budget = parseFloat(document.getElementById('budgetAmount').value);
        if(isNaN(budget)) {
            document.getElementById('budgetResults').innerHTML = '<p class="critical">⚠️ Ingresa un presupuesto válido.</p>';
            return;
        }
        // VALIDACIÓN: presupuesto negativo
        if(budget < 0) {
            document.getElementById('budgetResults').innerHTML = '<p class="critical">⚠️ El presupuesto no puede ser negativo.</p>';
            return;
        }
        
        let total = 0;
        let hasValidItems = false;
        shoppingList.forEach(item => {
            const price = Math.max(0, item.price || 0);
            const qty = Math.max(0, item.qty || 0);
            if(price > 0 && qty > 0) hasValidItems = true;
            total += price * qty;
        });
        
        let saldo = budget - total;
        let estado = saldo >= 0 ? `<span class="good">✅ El presupuesto ALCANZA. Te sobran: ${saldo.toFixed(2)} Bs</span>` : `<span class="critical">❌ NO ALCANZA. Te faltan: ${Math.abs(saldo).toFixed(2)} Bs</span>`;
        document.getElementById('budgetResults').innerHTML = `<p><strong>Total de la compra:</strong> ${total.toFixed(2)} Bs</p><p><strong>Presupuesto:</strong> ${budget.toFixed(2)} Bs</p><p>${estado}</p>`;
    });
    
    document.getElementById('clearBudgetBtn').addEventListener('click', () => { 
        shoppingList = [{ name: 'Pan', price: 5, qty: 2 },{ name: 'Leche', price: 8, qty: 3 }]; 
        renderShoppingList(); 
        document.getElementById('budgetAmount').value=''; 
        document.getElementById('budgetResults').innerHTML='<p class="placeholder">Lista reiniciada. Ingresa presupuesto y productos.</p>'; 
    });
    
    // --------------------------------------------------------
    // 6. ESCENARIO E: RUMOR ESCASEZ (con validaciones completas)
    // --------------------------------------------------------
    const panicForm = document.getElementById('panicForm');
    if(panicForm) {
        panicForm.addEventListener('submit', (e) => {
            e.preventDefault();
            let normal = parseFloat(document.getElementById('normalDemand').value);
            let increase = parseFloat(document.getElementById('panicIncrease').value);
            let stock = parseFloat(document.getElementById('stockAvailable').value);
            let people = parseFloat(document.getElementById('peopleCount').value);
            
            if(isNaN(normal) || isNaN(increase) || isNaN(stock) || isNaN(people)) {
                document.getElementById('panicResults').innerHTML = '<p class="critical">⚠️ Completa todos los campos.</p>';
                return;
            }
            // CORRECCIÓN 3: Validación de número de personas
            if(people < 1) {
                document.getElementById('panicResults').innerHTML = '<p class="critical">⚠️ El número de personas/familias debe ser al menos 1.</p>';
                return;
            }
            // Validación de números negativos
            if(normal < 0 || increase < 0 || stock < 0) {
                document.getElementById('panicResults').innerHTML = '<p class="critical">⚠️ Los valores no pueden ser negativos.</p>';
                return;
            }
            
            let newDemand = normal + (normal * increase / 100);
            let totalDemand = newDemand * people;
            let stockRest = stock - totalDemand;
            let alertMsg = stockRest >=0 ? `<span class="good">✅ El stock alcanza. Sobran ${stockRest.toFixed(2)} unidades.</span>` : `<span class="critical">⚠️ ¡ALERTA! La demanda supera el stock en ${Math.abs(stockRest).toFixed(2)} unidades. ¡Posible desabastecimiento!</span>`;
            document.getElementById('panicResults').innerHTML = `
                <p>📈 Demanda normal por persona/familia: ${normal} unidades</p>
                <p>🔥 Aumento por rumor (${increase}%): Nueva demanda unitaria: ${newDemand.toFixed(2)} unidades</p>
                <p>👥 Para ${people} persona(s): Demanda TOTAL = ${totalDemand.toFixed(2)} unidades</p>
                <p>📦 Stock disponible: ${stock} unidades</p>
                ${alertMsg}
            `;
        });
        document.getElementById('clearPanicBtn').addEventListener('click', () => { 
            document.getElementById('panicForm').reset(); 
            document.getElementById('panicResults').innerHTML = '<p class="placeholder">Datos reiniciados</p>'; 
        });
    }
    
    // --------------------------------------------------------
    // 7. ESCENARIO F: PÉRDIDA DEL PODER ADQUISITIVO (con validación de negativos)
    // --------------------------------------------------------
    const purchasingForm = document.getElementById('purchasingForm');
    if(purchasingForm) {
        purchasingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const income = parseFloat(document.getElementById('monthlyIncome').value);
            const oldExpense = parseFloat(document.getElementById('oldExpense').value);
            const newExpense = parseFloat(document.getElementById('newExpense').value);
            
            if(isNaN(income) || isNaN(oldExpense) || isNaN(newExpense)) {
                document.getElementById('purchasingResults').innerHTML = '<p class="critical">⚠️ Completa todos los campos.</p>';
                return;
            }
            // VALIDACIÓN DE NÚMEROS NEGATIVOS
            if(income < 0 || oldExpense < 0 || newExpense < 0) {
                document.getElementById('purchasingResults').innerHTML = '<p class="critical">⚠️ Error: Los valores no pueden ser negativos.</p>';
                return;
            }
            if(income === 0) {
                document.getElementById('purchasingResults').innerHTML = '<p class="critical">⚠️ El ingreso no puede ser cero.</p>';
                return;
            }
            
            const oldRemaining = income - oldExpense;
            const newRemaining = income - newExpense;
            const lossAmount = newExpense - oldExpense;
            const lossPercent = (lossAmount / income) * 100;
            
            let level = '';
            let levelClass = '';
            if(lossPercent < 10) { level = 'Leve'; levelClass = 'good'; }
            else if(lossPercent < 30) { level = 'Moderado'; levelClass = 'warning'; }
            else { level = 'Severo'; levelClass = 'critical'; }
            
            document.getElementById('purchasingResults').innerHTML = `
                <p><strong>Ingreso fijo mensual:</strong> ${income.toFixed(2)} Bs</p>
                <p><strong>Gasto antes de la crisis:</strong> ${oldExpense.toFixed(2)} Bs</p>
                <p><strong>Gasto actual (con precios altos):</strong> ${newExpense.toFixed(2)} Bs</p>
                <p class="${lossAmount>0?'critical':'good'}">📉 <strong>Pérdida del poder adquisitivo:</strong> ${lossPercent.toFixed(1)}% (Nivel: <span class="${levelClass}">${level}</span>)</p>
                <p>💰 Antes te sobraban: ${oldRemaining.toFixed(2)} Bs.</p>
                <p>💸 Ahora te sobran: ${newRemaining.toFixed(2)} Bs.</p>
                <p class="critical">Con el MISMO sueldo, has perdido la capacidad de comprar ${Math.abs(lossAmount).toFixed(2)} Bs adicionales.</p>
            `;
        });
        
        document.getElementById('clearPurchasingBtn').addEventListener('click', () => {
            document.getElementById('purchasingForm').reset();
            document.getElementById('purchasingResults').innerHTML = '<p class="placeholder">Datos reiniciados.</p>';
        });
    }
    
    // -------------------------------
    // 8. BOTONES DE CASOS DE ESTUDIO (TODOS)
    // -------------------------------
    document.querySelectorAll('.test-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const test = btn.dataset.test;
            if(test === 'fuelCase1') {
                switchSimulator('fuel');
                document.getElementById('fuelInitial').value = 10000;
                document.getElementById('fuelConsumption').value = 1200;
                document.getElementById('fuelRefill').value = 300;
                document.getElementById('fuelCritical').value = 2000;
                fuelForm.dispatchEvent(new Event('submit'));
            } else if(test === 'foodCase1') {
                switchSimulator('food');
                addDefaultFoodProducts();
                calculateFoodTotal();
            } else if(test === 'transportCase1') {
                switchSimulator('transport');
                document.getElementById('distNormal').value = 10;
                document.getElementById('distDesvio').value = 16;
                document.getElementById('costKm').value = 2;
                document.getElementById('tripsWeek').value = 5;
                transportForm.dispatchEvent(new Event('submit'));
            } else if(test === 'budgetCase1') {
                switchSimulator('budget');
                document.getElementById('budgetAmount').value = 500;
                shoppingList = [{name:'Compra de prueba', price:580, qty:1}];
                renderShoppingList();
                document.getElementById('calculateBudgetBtn').click();
            } else if(test === 'panicCase1') {
                switchSimulator('panic');
                document.getElementById('normalDemand').value = 100;
                document.getElementById('panicIncrease').value = 40;
                document.getElementById('stockAvailable').value = 120;
                document.getElementById('peopleCount').value = 1;
                panicForm.dispatchEvent(new Event('submit'));
            } else if(test === 'purchasingCase1') {
                switchSimulator('purchasing');
                document.getElementById('monthlyIncome').value = 3000;
                document.getElementById('oldExpense').value = 2500;
                document.getElementById('newExpense').value = 3200;
                purchasingForm.dispatchEvent(new Event('submit'));
            }
        });
    });
});