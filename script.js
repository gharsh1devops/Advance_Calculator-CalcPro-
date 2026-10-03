const currentInputElem = document.getElementById('currentInput');
const previousInputElem = document.getElementById('previousInput');
const stdTabBtn = document.getElementById('stdTabBtn');
const sciTabBtn = document.getElementById('sciTabBtn');
const scientificPanel = document.getElementById('scientificPanel');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');
const themeToggle = document.getElementById('themeToggle');
const floatToggle = document.getElementById('floatToggle');
const appContainer = document.getElementById('appContainer');
const panelTitle = document.getElementById('panelTitle');

// Panels
const calcDisplayArea = document.getElementById('calcDisplayArea');
const dynamicConverterPanel = document.getElementById('dynamicConverterPanel');
const graphingPanel = document.getElementById('graphingPanel');
const programmerPanel = document.getElementById('programmerPanel');

const convTitle = document.getElementById('convTitle');
const convInputVal = document.getElementById('convInputVal');
const convFromUnit = document.getElementById('convFromUnit');
const convToUnit = document.getElementById('convToUnit');
const runGenericConvert = document.getElementById('runGenericConvert');
const convResultBox = document.getElementById('convResultBox');

// Graphing Elements
const graphFuncInput = document.getElementById('graphFuncInput');
const plotGraphBtn = document.getElementById('plotGraphBtn');
const graphCanvas = document.getElementById('graphCanvas');

// Programmer Elements
const progDec = document.getElementById('progDec');
const progHex = document.getElementById('progHex');
const progOct = document.getElementById('progOct');
const progBin = document.getElementById('progBin');

// Sidebar Elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const sidebarMenu = document.getElementById('sidebarMenu');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const closeSidebar = document.getElementById('closeSidebar');

// Currency Elements
const convertBtn = document.getElementById('convertBtn');
const currAmount = document.getElementById('currAmount');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const currResult = document.getElementById('currResult');

let currentExpression = '';
let isEvaluated = false;
let currentActiveMode = 'standard';

// --- Sidebar Menu Toggles ---
hamburgerBtn.addEventListener('click', () => {
    sidebarMenu.classList.add('active');
    sidebarOverlay.classList.add('active');
});

closeSidebar.addEventListener('click', closeMenu);
sidebarOverlay.addEventListener('click', closeMenu);

function closeMenu() {
    sidebarMenu.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}

// Unit Conversion Data
const unitData = {
    volume: {
        units: ['Liters', 'Milliliters', 'Cubic Meters', 'Gallons (US)', 'Cups'],
        rates: { Liters: 1, Milliliters: 0.001, 'Cubic Meters': 1000, 'Gallons (US)': 3.78541, Cups: 0.24 },
        convert: function(val, from, to) { return (val * this.rates[from]) / this.rates[to]; }
    },
    length: {
        units: ['Meters', 'Kilometers', 'Centimeters', 'Millimeters', 'Miles', 'Feet', 'Inches'],
        rates: { Meters: 1, Kilometers: 1000, Centimeters: 0.01, Millimeters: 0.001, Miles: 1609.34, Feet: 0.3048, Inches: 0.0254 },
        convert: function(val, from, to) { return (val * this.rates[from]) / this.rates[to]; }
    },
    weight: {
        units: ['Kilograms', 'Grams', 'Milligrams', 'Pounds', 'Ounces'],
        rates: { Kilograms: 1, Grams: 0.001, Milligrams: 0.000001, Pounds: 0.453592, Ounces: 0.0283495 },
        convert: function(val, from, to) { return (val * this.rates[from]) / this.rates[to]; }
    },
    temperature: {
        units: ['Celsius', 'Fahrenheit', 'Kelvin'],
        convert: function(val, from, to) {
            let celsius = val;
            if (from === 'Fahrenheit') celsius = (val - 32) * 5/9;
            else if (from === 'Kelvin') celsius = val - 273.15;
            if (to === 'Celsius') return celsius;
            if (to === 'Fahrenheit') return celsius * 9/5 + 32;
            if (to === 'Kelvin') return celsius + 273.15;
            return val;
        }
    },
    energy: {
        units: ['Joules', 'Kilojoules', 'Calories', 'Kilocalories'],
        rates: { Joules: 1, Kilojoules: 1000, Calories: 4.184, Kilocalories: 4184 },
        convert: function(val, from, to) { return (val * this.rates[from]) / this.rates[to]; }
    },
    area: {
        units: ['Square Meters', 'Square Kilometers', 'Square Miles', 'Acres', 'Hectares'],
        rates: { 'Square Meters': 1, 'Square Kilometers': 1000000, 'Square Miles': 2589988, Acres: 4046.86, Hectares: 10000 },
        convert: function(val, from, to) { return (val * this.rates[from]) / this.rates[to]; }
    },
    speed: {
        units: ['Meters/sec', 'Kilometers/hour', 'Miles/hour', 'Knots'],
        rates: { 'Meters/sec': 1, 'Kilometers/hour': 0.277778, 'Miles/hour': 0.44704, Knots: 0.514444 },
        convert: function(val, from, to) { return (val * this.rates[from]) / this.rates[to]; }
    }
};

// Helper to hide all main workspaces
function hideAllWorkspaces() {
    calcDisplayArea.classList.add('hidden');
    dynamicConverterPanel.classList.add('hidden');
    graphingPanel.classList.add('hidden');
    programmerPanel.classList.add('hidden');
}

// Sidebar Menu Click Handlers
document.querySelectorAll('.sidebar-menu .menu-item[data-mode]').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-menu .menu-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        closeMenu();
        
        const mode = item.getAttribute('data-mode');
        currentActiveMode = mode;
        panelTitle.textContent = item.textContent.trim() + ' Calculator';
        hideAllWorkspaces();

        if (mode === 'standard' || mode === 'scientific') {
            calcDisplayArea.classList.remove('hidden');
            if (mode === 'scientific') sciTabBtn.click();
            else stdTabBtn.click();
        } else if (mode === 'graphing') {
            graphingPanel.classList.remove('hidden');
            drawGraph();
        } else if (mode === 'programmer') {
            programmerPanel.classList.remove('hidden');
            updateProgrammerValues(parseInt(progDec.value) || 0);
        } else if (unitData[mode]) {
            dynamicConverterPanel.classList.remove('hidden');
            convTitle.textContent = item.textContent.trim() + ' Converter';
            convFromUnit.innerHTML = '';
            convToUnit.innerHTML = '';
            unitData[mode].units.forEach(u => {
                convFromUnit.add(new Option(u, u));
                convToUnit.add(new Option(u, u));
            });
            if(convToUnit.options.length > 1) convToUnit.selectedIndex = 1;
            convResultBox.textContent = 'Result: --';
        } else if (mode === 'currency') {
            calcDisplayArea.classList.remove('hidden');
            document.querySelector('.currency-box').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Run Generic Converter Calculation
runGenericConvert.addEventListener('click', () => {
    let val = parseFloat(convInputVal.value) || 0;
    let from = convFromUnit.value;
    let to = convToUnit.value;
    if (unitData[currentActiveMode]) {
        let res = unitData[currentActiveMode].convert(val, from, to);
        if (!Number.isInteger(res)) res = parseFloat(res.toFixed(4));
        convResultBox.textContent = `${val} ${from} = ${res} ${to}`;
    }
});

// --- Graphing Calculator Logic ---
function drawGraph() {
    let ctx = graphCanvas.getContext('2d');
    let width = graphCanvas.width;
    let height = graphCanvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2); // X Axis
    ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height); // Y Axis
    ctx.stroke();

    // Plot Function
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let funcStr = graphFuncInput.value.trim();

    let first = true;
    for (let px = 0; px < width; px++) {
        let x = (px - width / 2) / 20; // Scale factor
        let y;
        try {
            y = eval(funcStr);
        } catch (e) {
            y = 0;
        }
        let py = height / 2 - y * 20;
        if (first) {
            ctx.moveTo(px, py);
            first = false;
        } else {
            ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
}

plotGraphBtn.addEventListener('click', drawGraph);

// --- Programmer Calculator Logic ---
function updateProgrammerValues(dec) {
    progDec.value = dec;
    progHex.value = dec.toString(16).toUpperCase();
    progOct.value = dec.toString(8);
    progBin.value = dec.toString(2);
}

progDec.addEventListener('input', () => { updateProgrammerValues(parseInt(progDec.value) || 0); });
progHex.addEventListener('input', () => { let d = parseInt(progHex.value, 16); if(!isNaN(d)) updateProgrammerValues(d); });
progOct.addEventListener('input', () => { let d = parseInt(progOct.value, 8); if(!isNaN(d)) updateProgrammerValues(d); });
progBin.addEventListener('input', () => { let d = parseInt(progBin.value, 2); if(!isNaN(d)) updateProgrammerValues(d); });

// --- Floating Mode Toggle ---
floatToggle.addEventListener('click', () => {
    appContainer.classList.toggle('floating-mode');
    floatToggle.innerHTML = appContainer.classList.contains('floating-mode') ? '<i class="fa-solid fa-expand"></i>' : '<i class="fa-solid fa-clone"></i>';
});

// Theme Switcher
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggle.innerHTML = isLight ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

// Tab Switcher (Standard / Scientific)
stdTabBtn.addEventListener('click', () => {
    stdTabBtn.classList.add('active');
    sciTabBtn.classList.remove('active');
    scientificPanel.classList.add('hidden');
});

sciTabBtn.addEventListener('click', () => {
    sciTabBtn.classList.add('active');
    stdTabBtn.classList.remove('active');
    scientificPanel.classList.remove('hidden');
});

// Keypad Inputs
document.querySelectorAll('.main-keypad .btn, .scientific-panel .btn').forEach(button => {
    button.addEventListener('click', () => {
        const val = button.getAttribute('data-value');
        const action = button.getAttribute('data-action');
        if (val) handleInput(val);
        else if (action) handleScientificAction(action);
    });
});

function handleInput(val) {
    if (isEvaluated) {
        if (!['+', '-', '*', '/', '%'].includes(val)) {
            currentExpression = '';
        }
        isEvaluated = false;
        previousInputElem.textContent = '';
    }

    if (val === 'AC') {
        currentExpression = '';
        currentInputElem.textContent = '0';
        previousInputElem.textContent = '';
        currentInputElem.style.fontSize = '30px';
        isEvaluated = false;
        return;
    }

    if (val === 'DEL') {
        currentExpression = currentExpression.toString().slice(0, -1);
        currentInputElem.textContent = currentExpression || '0';
        return;
    }

    if (val === '=') {
        calculateResult();
        return;
    }

    currentExpression += val;
    currentInputElem.textContent = currentExpression;
    currentInputElem.style.fontSize = '30px';
}

// Scientific & Advanced Actions
function handleScientificAction(action) {
    if (currentExpression === '' && action !== 'pi' && action !== 'e') return;
    let val = parseFloat(currentExpression) || 0;
    let result = 0;
    const isDeg = document.querySelector('input[name="angleUnit"]:checked').value === 'deg';
    const angleMultiplier = isDeg ? (Math.PI / 180) : 1;

    switch (action) {
        case 'sin': result = Math.sin(val * angleMultiplier); break;
        case 'cos': result = Math.cos(val * angleMultiplier); break;
        case 'tan': result = Math.tan(val * angleMultiplier); break;
        case 'asin': result = Math.asin(val) / angleMultiplier; break;
        case 'acos': result = Math.acos(val) / angleMultiplier; break;
        case 'atan': result = Math.atan(val) / angleMultiplier; break;
        case 'pi': result = Math.PI; break;
        case 'e': result = Math.E; break;
        case 'pow': currentExpression += '**'; currentInputElem.textContent = currentExpression; return;
        case 'x3': result = Math.pow(val, 3); break;
        case 'x2': result = Math.pow(val, 2); break;
        case 'ex': result = Math.exp(val); break;
        case '10x': result = Math.pow(10, val); break;
        case 'yroot': currentExpression += '** (1/'; currentInputElem.textContent = currentExpression; return;
        case 'cbrt': result = Math.cbrt(val); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'ln': result = Math.log(val); break;
        case 'log': result = Math.log10(val); break;
        case 'inv': result = 1 / val; break;
        case 'fact': result = factorial(val); break;
    }

    previousInputElem.textContent = `${action}(${currentExpression}) =`;
    currentExpression = result.toString();
    currentInputElem.textContent = currentExpression;
    applyEvalStyles();
    saveToHistory(`${action}(${val})`, result);
}

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let acc = 1;
    for (let i = 2; i <= n; i++) acc *= i;
    return acc;
}

function calculateResult() {
    if (!currentExpression) return;
    try {
        let sanitizedExpr = currentExpression.replace(/×/g, '*').replace(/÷/g, '/');
        let evalResult = eval(sanitizedExpr);

        if (!Number.isInteger(evalResult)) {
            evalResult = parseFloat(evalResult.toFixed(6));
        }

        previousInputElem.textContent = currentExpression + ' =';
        saveToHistory(currentExpression, evalResult);
        
        currentExpression = evalResult.toString();
        currentInputElem.textContent = currentExpression;
        applyEvalStyles();
    } catch (error) {
        currentInputElem.textContent = 'Error';
        currentExpression = '';
    }
}

function applyEvalStyles() {
    isEvaluated = true;
    currentInputElem.style.fontSize = '34px';
}

// LocalStorage History
function saveToHistory(expr, res) {
    let history = JSON.parse(localStorage.getItem('calcDashboardHistory')) || [];
    history.unshift({ expr, res });
    if (history.length > 15) history.pop();
    localStorage.setItem('calcDashboardHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    let history = JSON.parse(localStorage.getItem('calcDashboardHistory')) || [];
    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<li style="color: var(--text-secondary); text-align: center;">No history yet</li>';
        return;
    }
    history.forEach(item => {
        let li = document.createElement('li');
        li.innerHTML = `<span>${item.expr}</span> = <strong>${item.res}</strong>`;
        li.addEventListener('click', () => {
            currentExpression = item.res.toString();
            currentInputElem.textContent = currentExpression;
        });
        historyList.appendChild(li);
    });
}

clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('calcDashboardHistory');
    renderHistory();
});

// --- Live Online Currency Converter API ---
convertBtn.addEventListener('click', async () => {
    let amt = parseFloat(currAmount.value) || 0;
    let from = fromCurrency.value;
    let to = toCurrency.value;

    currResult.textContent = 'Fetching live rates...';

    try {
        let response = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        let data = await response.json();
        
        if (data && data.rates && data.rates[to]) {
            let rate = data.rates[to];
            let converted = (amt * rate).toFixed(2);
            currResult.textContent = `${amt} ${from} = ${converted} ${to}`;
        } else {
            currResult.textContent = 'Error fetching rate';
        }
    } catch (err) {
        currResult.textContent = 'Network error / Offline';
    }
});

renderHistory();

// Keyboard Support
window.addEventListener('keydown', (e) => {
    if (dynamicConverterPanel.classList.contains('hidden') && graphingPanel.classList.contains('hidden') && programmerPanel.classList.contains('hidden')) {
        if ((e.key >= '0' && e.key <= '9') || ['+', '-', '*', '/', '.', '(', ')'].includes(e.key)) {
            handleInput(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            calculateResult();
        } else if (e.key === 'Backspace') {
            handleInput('DEL');
        } else if (e.key === 'Escape') {
            handleInput('AC');
        }
    }
});