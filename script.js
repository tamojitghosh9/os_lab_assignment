// Data State
let processes = [];
let pidCounter = 1;

let mode = document.getElementById('mode-selector').value; // 'single' or 'comparison'
let selectedAlgorithm = document.getElementById('algo-selector').value;
let timeQuantum = parseInt(document.getElementById('time-quantum').value) || 2;

// DOM Elements
const processTableBody = document.querySelector('#process-table tbody');
const addProcessBtn = document.getElementById('add-process-btn');
const resetBtn = document.getElementById('reset-btn');
const generateRandomBtn = document.getElementById('generate-random-btn');
const randomNInput = document.getElementById('random-n-input');

const modeSelector = document.getElementById('mode-selector');
const algoSelector = document.getElementById('algo-selector');
const timeQuantumInput = document.getElementById('time-quantum');
const compareTqInput = document.getElementById('compare-tq-input');
const algoGroup = document.getElementById('algo-group');
const tqGroup = document.getElementById('tq-group');

const singleOutputSection = document.getElementById('single-output-section');
const comparisonOutputSection = document.getElementById('comparison-output-section');

// Event Listeners
addProcessBtn.addEventListener('click', () => {
    addProcess();
    renderTable();
    runSimulation();
});

generateRandomBtn.addEventListener('click', () => {
    generateRandomProcesses();
});

resetBtn.addEventListener('click', () => {
    processes = [];
    pidCounter = 1;
    
    // Reset control inputs
    modeSelector.value = 'single';
    algoSelector.value = 'FCFS';
    timeQuantumInput.value = '2';
    compareTqInput.value = '2';
    
    mode = 'single';
    selectedAlgorithm = 'FCFS';
    timeQuantum = 2;
    
    updateVisibility();
    renderTable();
    runSimulation();
});

modeSelector.addEventListener('change', (e) => {
    mode = e.target.value;
    updateVisibility();
    runSimulation();
});

algoSelector.addEventListener('change', (e) => {
    selectedAlgorithm = e.target.value;
    updateVisibility();
    runSimulation();
});

timeQuantumInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value);
    if(val > 0) {
        timeQuantum = val;
        compareTqInput.value = val;
        runSimulation();
    }
});

compareTqInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value);
    if(val > 0) {
        timeQuantum = val;
        timeQuantumInput.value = val; // sync back
        runSimulation();
    }
});

function addDefaultProcesses() {
    processes = [
        { id: 'P1', pid: 1, arrival: 0, burst: 5, color: getProcessColor(1) },
        { id: 'P2', pid: 2, arrival: 2, burst: 3, color: getProcessColor(2) },
        { id: 'P3', pid: 3, arrival: 4, burst: 1, color: getProcessColor(3) },
        { id: 'P4', pid: 4, arrival: 5, burst: 4, color: getProcessColor(4) }
    ];
    pidCounter = 5;
    renderTable();
    runSimulation();
}

function getProcessColor(pid) {
    const hue = (pid * 137.5) % 360;
    return `hsl(${hue}, 80%, 65%)`;
}

function addProcess() {
    const p = {
        id: `P${pidCounter}`,
        pid: pidCounter,
        arrival: 0,
        burst: 1,
        color: getProcessColor(pidCounter)
    };
    processes.push(p);
    pidCounter++;
}

function generateRandomProcesses() {
    let n = parseInt(randomNInput.value);
    if(isNaN(n) || n < 1) n = 1;
    if(n > 20) n = 20;
    
    processes = [];
    pidCounter = 1;
    
    for(let i=0; i<n; i++) {
        const arrival = Math.floor(Math.random() * 20); // Random arrival from 0-19
        const burst = Math.floor(Math.random() * 10) + 1; // Random burst from 1-10
        processes.push({
            id: `P${pidCounter}`,
            pid: pidCounter,
            arrival: arrival,
            burst: burst,
            color: getProcessColor(pidCounter)
        });
        pidCounter++;
    }
    
    renderTable();
    runSimulation();
}

window.removeProcess = function(id) {
    processes = processes.filter(p => p.id !== id);
    renderTable();
    runSimulation();
};

window.handleInput = function(id, field, value) {
    let val = parseInt(value);
    if(isNaN(val) || val < 0) val = 0;
    
    const p = processes.find(x => x.id === id);
    if(p) {
        p[field] = val;
        runSimulation();
    }
};

function updateVisibility() {
    if (mode === 'single') {
        algoGroup.style.display = 'flex';
        tqGroup.style.display = selectedAlgorithm === 'RR' ? 'flex' : 'none';
        singleOutputSection.style.display = 'flex';
        comparisonOutputSection.style.display = 'none';
        
        const algoNames = {
            'FCFS': 'First Come First Serve',
            'SJF': 'Shortest Job First',
            'SRTF': 'Preemptive SJF (SRTF)',
            'RR': 'Round Robin'
        };
        document.getElementById('single-algo-title').textContent = `Execution Timeline (Gantt Chart) - ${algoNames[selectedAlgorithm]}`;
    } else {
        algoGroup.style.display = 'none';
        tqGroup.style.display = 'none';
        singleOutputSection.style.display = 'none';
        comparisonOutputSection.style.display = 'flex';
    }
}

function renderTable() {
    processTableBody.innerHTML = '';
    
    if (processes.length === 0) {
        processTableBody.innerHTML = `<tr><td colspan="5" class="empty-state">No processes added. Click "+ Add Process" to start.</td></tr>`;
        return;
    }

    processes.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${p.id}</strong></td>
            <td><div class="color-dot" style="background-color: ${p.color};"></div></td>
            <td><input type="number" min="0" class="table-input" value="${p.arrival}" oninput="handleInput('${p.id}', 'arrival', this.value)"></td>
            <td><input type="number" min="0" class="table-input" value="${p.burst}" oninput="handleInput('${p.id}', 'burst', this.value)"></td>
            <td>
                <button class="icon-btn" onclick="removeProcess('${p.id}')" title="Remove Process">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </td>
        `;
        processTableBody.appendChild(tr);
    });
}

// SIMULATION LOGIC CORE

function runSimulation() {
    if (processes.length === 0) {
        clearVisuals();
        return;
    }

    if (mode === 'single') {
        let result;
        switch(selectedAlgorithm) {
            case 'FCFS': result = simulateFCFS([...processes]); break;
            case 'SJF': result = simulateSJF([...processes]); break;
            case 'SRTF': result = simulateSRTF([...processes]); break;
            case 'RR': result = simulateRR([...processes], timeQuantum); break;
        }
        renderGanttChart(result.timeline, 'single-gantt', 'single-gantt-ticks');
        renderMetrics(result.metrics);
    } else {
        // Comparison Mode
        let resFCFS = simulateFCFS([...processes]);
        let resSJF = simulateSJF([...processes]);
        let resSRTF = simulateSRTF([...processes]);
        let resRR = simulateRR([...processes], timeQuantum);
        
        renderGanttChart(resFCFS.timeline, 'cmp-gantt-fcfs', 'cmp-ticks-fcfs');
        renderGanttChart(resSJF.timeline, 'cmp-gantt-sjf', 'cmp-ticks-sjf');
        renderGanttChart(resSRTF.timeline, 'cmp-gantt-srtf', 'cmp-ticks-srtf');
        renderGanttChart(resRR.timeline, 'cmp-gantt-rr', 'cmp-ticks-rr');
        
        renderComparisonMetrics({
            'FCFS': resFCFS,
            'SJF': resSJF,
            'SRTF': resSRTF,
            'RR': resRR
        });
    }
}

function clearVisuals() {
    if(mode === 'single') {
        document.getElementById('single-gantt').innerHTML = '<div class="empty-state" style="width:100%">No timeline available</div>';
        document.getElementById('single-gantt-ticks').innerHTML = '';
        document.querySelector('#metrics-table tbody').innerHTML = `<tr><td colspan="6" class="empty-state">No data</td></tr>`;
        document.querySelector('#metrics-table tfoot').innerHTML = '';
    } else {
        ['fcfs', 'sjf', 'srtf', 'rr'].forEach(algo => {
            document.getElementById(`cmp-gantt-${algo}`).innerHTML = '<div class="empty-state" style="width:100%">No timeline</div>';
            document.getElementById(`cmp-ticks-${algo}`).innerHTML = '';
        });
        document.querySelector('#comparison-metrics-table tbody').innerHTML = `<tr><td colspan="3" class="empty-state">No data</td></tr>`;
        const bestMsg = document.getElementById('best-algo-message');
        if (bestMsg) bestMsg.innerHTML = '';
    }
}

// ALGORITHMS
function deepCopy(arr) {
    return arr.map(p => ({...p}));
}

function simulateFCFS(procs) {
    let timeline = [];
    let currentTime = 0;
    let metrics = deepCopy(procs);

    // Initial 0 burst process completion
    metrics.forEach(m => {
        if(m.burst === 0) {
            m.completion = m.arrival;
            m.turnaround = 0;
            m.waiting = 0;
        }
    });

    let validProcs = metrics.filter(p => p.burst > 0).sort((a,b) => {
        if (a.arrival !== b.arrival) return a.arrival - b.arrival;
        return a.pid - b.pid;
    });

    for (let p of validProcs) {
        if (currentTime < p.arrival) {
            timeline.push({id: "Idle", start: currentTime, end: p.arrival});
            currentTime = p.arrival;
        }
        timeline.push({id: p.id, start: currentTime, end: currentTime + p.burst});
        currentTime += p.burst;
        
        let m = metrics.find(x => x.id === p.id);
        m.completion = currentTime;
        m.turnaround = m.completion - m.arrival;
        m.waiting = m.turnaround - m.burst;
    }
    
    return { timeline, metrics };
}

function simulateSJF(procs) {
    let timeline = [];
    let currentTime = 0;
    let completed = 0;
    
    let metrics = deepCopy(procs);
    metrics.forEach(m => {
        m.remaining = m.burst;
        if(m.burst === 0) {
            m.completion = m.arrival;
            m.turnaround = 0;
            m.waiting = 0;
            m.isCompleted = true;
            completed++;
        } else {
            m.isCompleted = false;
        }
    });
    
    while (completed < metrics.length) {
        let available = metrics.filter(p => p.arrival <= currentTime && !p.isCompleted);
        if (available.length === 0) {
            let nextArrival = Math.min(...metrics.filter(p => !p.isCompleted).map(p => p.arrival));
            timeline.push({id: "Idle", start: currentTime, end: nextArrival});
            currentTime = nextArrival;
            continue;
        }
        
        available.sort((a, b) => {
            if (a.burst !== b.burst) return a.burst - b.burst;
            if (a.arrival !== b.arrival) return a.arrival - b.arrival;
            return a.pid - b.pid;
        });
        
        let selected = available[0];
        timeline.push({id: selected.id, start: currentTime, end: currentTime + selected.burst});
        currentTime += selected.burst;
        
        selected.completion = currentTime;
        selected.turnaround = selected.completion - selected.arrival;
        selected.waiting = selected.turnaround - selected.burst;
        selected.isCompleted = true;
        completed++;
    }
    
    return { timeline, metrics };
}

function simulateSRTF(procs) {
    let timeline = [];
    let currentTime = 0;
    let completed = 0;
    
    let metrics = deepCopy(procs);
    metrics.forEach(m => {
        m.remaining = m.burst;
        if(m.burst === 0) {
            m.completion = m.arrival;
            m.turnaround = 0;
            m.waiting = 0;
            m.isCompleted = true;
            completed++;
        } else {
            m.isCompleted = false;
        }
    });
    
    let currentBlock = null;
    
    while (completed < metrics.length) {
        let available = metrics.filter(p => p.arrival <= currentTime && !p.isCompleted);
        
        if (available.length === 0) {
            let nextArrival = Math.min(...metrics.filter(p => !p.isCompleted).map(p => p.arrival));
            if (currentBlock && currentBlock.id === "Idle") {
                currentBlock.end = nextArrival;
            } else {
                currentBlock = {id: "Idle", start: currentTime, end: nextArrival};
                timeline.push(currentBlock);
            }
            currentTime = nextArrival;
            continue;
        }
        
        available.sort((a, b) => {
            if (a.remaining !== b.remaining) return a.remaining - b.remaining;
            if (a.arrival !== b.arrival) return a.arrival - b.arrival;
            return a.pid - b.pid;
        });
        
        let selected = available[0];
        
        if (currentBlock && currentBlock.id === selected.id && currentBlock.end === currentTime) {
            currentBlock.end++;
        } else {
            currentBlock = {id: selected.id, start: currentTime, end: currentTime + 1};
            timeline.push(currentBlock);
        }
        
        selected.remaining--;
        currentTime++;
        
        if (selected.remaining === 0) {
            selected.isCompleted = true;
            selected.completion = currentTime;
            selected.turnaround = selected.completion - selected.arrival;
            selected.waiting = selected.turnaround - selected.burst;
            completed++;
        }
    }
    
    return { timeline, metrics };
}

function simulateRR(procs, quantum) {
    let timeline = [];
    let currentTime = 0;
    let completed = 0;
    
    let metrics = deepCopy(procs);
    metrics.forEach(m => {
        m.remaining = m.burst;
        if(m.burst === 0) {
            m.completion = m.arrival;
            m.turnaround = 0;
            m.waiting = 0;
            m.isCompleted = true;
            completed++;
        } else {
            m.isCompleted = false;
            m.inQueue = false;
        }
    });

    let queue = [];
    let arrived = metrics.filter(p => p.arrival <= currentTime && !p.isCompleted);
    arrived.sort((a,b) => a.arrival === b.arrival ? a.pid - b.pid : a.arrival - b.arrival);
    arrived.forEach(p => { p.inQueue = true; queue.push(p); });

    let currentBlock = null;

    while (completed < metrics.length) {
        if (queue.length === 0) {
            let nextArrivals = metrics.filter(p => !p.isCompleted && !p.inQueue);
            if(nextArrivals.length > 0) {
                let nextTime = Math.min(...nextArrivals.map(p => p.arrival));
                
                if (currentBlock && currentBlock.id === "Idle") {
                    currentBlock.end = nextTime;
                } else {
                    currentBlock = {id: "Idle", start: currentTime, end: nextTime};
                    timeline.push(currentBlock);
                }
                
                currentTime = nextTime;
                
                let newlyArrived = nextArrivals.filter(p => p.arrival <= currentTime);
                newlyArrived.sort((a,b) => a.arrival === b.arrival ? a.pid - b.pid : a.arrival - b.arrival);
                newlyArrived.forEach(p => { p.inQueue = true; queue.push(p); });
            }
            continue;
        }

        let process = queue.shift();
        let executeTime = Math.min(process.remaining, quantum);
        
        if (currentBlock && currentBlock.id === process.id && currentBlock.end === currentTime) {
             currentBlock.end += executeTime;
        } else {
             currentBlock = {id: process.id, start: currentTime, end: currentTime + executeTime};
             timeline.push(currentBlock);
        }
        
        currentTime += executeTime;
        process.remaining -= executeTime;
        
        let newlyArrived = metrics.filter(p => p.arrival <= currentTime && !p.isCompleted && !p.inQueue && p.id !== process.id);
        newlyArrived.sort((a,b) => a.arrival === b.arrival ? a.pid - b.pid : a.arrival - b.arrival);
        newlyArrived.forEach(p => { p.inQueue = true; queue.push(p); });

        if (process.remaining > 0) {
            queue.push(process);
        } else {
            process.isCompleted = true;
            process.completion = currentTime;
            process.turnaround = process.completion - process.arrival;
            process.waiting = process.turnaround - process.burst;
            completed++;
        }
    }
    
    return { timeline, metrics };
}

// RENDERING
function renderGanttChart(timeline, chartContainerId, ticksContainerId) {
    const chart = document.getElementById(chartContainerId);
    const ticks = document.getElementById(ticksContainerId);
    chart.innerHTML = '';
    ticks.innerHTML = '';
    
    const validBlocks = timeline.filter(b => b.start < b.end); // ignore 0 length blocks if any

    if(!validBlocks || validBlocks.length === 0) {
        chart.innerHTML = '<div class="empty-state" style="width:100%">All tasks have 0 burst time</div>';
        return;
    }

    const totalTime = validBlocks[validBlocks.length - 1].end;
    
    addTick(ticks, 0, 0);

    validBlocks.forEach(block => {
        const widthPercent = ((block.end - block.start) / totalTime) * 100;
        
        const div = document.createElement('div');
        div.className = `gantt-block ${block.id === 'Idle' ? 'idle' : ''}`;
        div.style.width = `${widthPercent}%`;
        div.setAttribute('data-tooltip', `${block.id}: ${block.start} to ${block.end}`);
        
        if (block.id !== 'Idle') {
            const p = processes.find(x => x.id === block.id);
            if(p) div.style.backgroundColor = p.color;
        }
        
        div.innerHTML = `<span>${block.id}</span>`;
        chart.appendChild(div);
        
        const tickPosPercent = (block.end / totalTime) * 100;
        addTick(ticks, block.end, tickPosPercent);
    });
}

function addTick(container, timeValue, percentPos) {
    const tick = document.createElement('div');
    tick.className = 'tick-mark';
    tick.style.left = `${percentPos}%`;
    tick.textContent = timeValue;
    container.appendChild(tick);
}

function renderMetrics(metrics) {
    const tbody = document.querySelector('#metrics-table tbody');
    const tfoot = document.querySelector('#metrics-table tfoot');
    tbody.innerHTML = '';
    tfoot.innerHTML = '';

    let totalTat = 0;
    let totalWt = 0;

    metrics.forEach(m => {
        totalTat += m.turnaround;
        totalWt += m.waiting;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><div style="display:inline-flex; align-items:center; gap:8px;"><div class="color-dot" style="background-color:${m.color}"></div>${m.id}</div></td>
            <td>${m.arrival}</td>
            <td>${m.burst}</td>
            <td>${m.completion}</td>
            <td>${m.turnaround}</td>
            <td>${m.waiting}</td>
        `;
        tbody.appendChild(tr);
    });

    const avgTat = (totalTat / metrics.length).toFixed(2);
    const avgWt = (totalWt / metrics.length).toFixed(2);

    tfoot.innerHTML = `
        <tr>
            <td colspan="4" style="text-align: right;"><strong>Averages:</strong></td>
            <td><strong>${avgTat}</strong></td>
            <td><strong>${avgWt}</strong></td>
        </tr>
    `;
}

function renderComparisonMetrics(results) {
    const tbody = document.querySelector('#comparison-metrics-table tbody');
    tbody.innerHTML = '';

    let bestAlgos = [];
    let minWt = Infinity;

    for (const [algo, data] of Object.entries(results)) {
        let totalTat = 0;
        let totalWt = 0;
        
        data.metrics.forEach(m => {
            totalTat += m.turnaround;
            totalWt += m.waiting;
        });

        const avgTat = (totalTat / data.metrics.length).toFixed(2);
        const avgWt = (totalWt / data.metrics.length).toFixed(2);
        
        const currentWt = parseFloat(avgWt);
        const title = algo === 'RR' ? `RR (TQ=${timeQuantum})` : algo;

        if (currentWt < minWt) {
            minWt = currentWt;
            bestAlgos = [title];
        } else if (currentWt === minWt) {
            bestAlgos.push(title);
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong style="color:var(--text-primary)">${title}</strong></td>
            <td>${avgTat}</td>
            <td>${avgWt}</td>
        `;
        tbody.appendChild(tr);
    }
    
    const bestAlgoMsg = document.getElementById('best-algo-message');
    if (bestAlgoMsg) {
        if (minWt === Infinity || isNaN(minWt)) {
            bestAlgoMsg.innerHTML = '';
        } else {
            bestAlgoMsg.innerHTML = `Best Algorithm (Minimum Average Waiting Time): <strong>${bestAlgos.join(', ')}</strong> (${minWt})`;
        }
    }
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    addDefaultProcesses();
    updateVisibility();
});
