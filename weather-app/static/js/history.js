// ==========================
// Elements
// ==========================

const historyStatus = document.getElementById("history-status");
const historyTitle = document.getElementById("history-title");
const historyMeta = document.getElementById("history-meta");
const historyStats = document.getElementById("history-stats");
const historyRows = document.getElementById("history-rows");
const historyTabs = document.getElementById("metric-tabs");
const limitInput = document.getElementById("limit");
const historyBtn = document.getElementById("run-history");
const historyCanvas = document.getElementById("historyChart");
const chartFallback = document.getElementById("chart-fallback");


let historyMetric = "temperature";

let historyChart = null;


// ==========================
// Stats strip
// ==========================

function renderStats(values, metric, unit){

    if(values.length === 0){

        historyStats.innerHTML = "";

        return;

    }


    const round = value => Math.round(value * 100) / 100;

    const min = Math.min(...values);

    const max = Math.max(...values);

    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;


    const cells = [
        { label: "Latest", value: values[values.length - 1] },
        { label: "Average", value: round(avg) },
        { label: "Minimum", value: min },
        { label: "Maximum", value: max },
        { label: "Amplitude", value: round(max - min) }
    ];


    historyStats.innerHTML = `

        <div class="summary" style="--dot-color:${metric.color}">

            ${cells.map(cell => `

                <div class="summary-item">

                    <span class="summary-label">
                        ${cell.label}
                    </span>

                    <span class="summary-value">
                        ${cell.value}
                        <span class="unit-inline">${unit}</span>
                    </span>

                </div>

            `).join("")}

        </div>

    `;

}


// ==========================
// Readings table
// ==========================

function renderRows(records, unit){

    if(records.length === 0){

        historyRows.innerHTML = `
            <tr>
                <td colspan="3" class="empty">
                    No measurements recorded yet
                </td>
            </tr>
        `;

        return;

    }


    // records arrive newest first
    historyRows.innerHTML = records.map((record, index) => {

        const previous = records[index + 1];


        const delta = previous
            ? Math.round((record.value - previous.value) * 100) / 100
            : null;


        const trend = delta === null || delta === 0
            ? "flat"
            : (delta > 0 ? "up" : "down");


        const deltaText = delta === null
            ? "--"
            : `${delta > 0 ? "+" : ""}${delta}`;


        return `
            <tr>

                <td class="stamp">
                    ${formatTime(record.recorded_at)}
                </td>

                <td class="num">
                    ${record.value}
                    <span class="unit-inline">${unit}</span>
                </td>

                <td class="num delta ${trend}">
                    ${deltaText}
                </td>

            </tr>
        `;

    }).join("");

}


// ==========================
// Chart
// ==========================

function drawHistoryChart(records, metric, unit){

    if(!historyCanvas){

        return;

    }


    // Chart.js ships from a CDN — keep the page useful if it is unreachable
    if(typeof Chart === "undefined"){

        chartFallback.textContent =
            "Chart library unavailable — stats and readings below are still live.";

        return;

    }


    chartFallback.textContent = "";


    // chronological order along the x axis
    const ordered = [...records].reverse();


    const labels = ordered.map(
        record => new Date(record.recorded_at).toLocaleTimeString()
    );


    const values = ordered.map(record => record.value);


    if(historyChart){

        historyChart.destroy();

    }


    const accent = getComputedStyle(document.documentElement)
        .getPropertyValue(metric.cssVar)
        .trim() || "#E8712B";


    historyChart = new Chart(historyCanvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [
                {
                    label: `${metric.label} (${unit})`,
                    data: values,
                    borderColor: accent,
                    backgroundColor: `${accent}22`,
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 2
                }
            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {
                legend: { display: false }
            },

            scales: {
                y: { beginAtZero: false }
            }

        }

    });

}


// ==========================
// Load
// ==========================

async function loadHistory(){

    historyStatus.textContent = "Loading...";


    const metric = getMetric(historyMetric);

    const limit = Number(limitInput.value) || 30;


    try {

        const response = await fetch(
            `/measurements?metric=${metric.key}&limit=${limit}`
        );


        if(!response.ok){

            throw new Error(`HTTP ${response.status}`);

        }


        const records = await response.json();

        const unit = metric.unit;


        historyTitle.textContent = `${metric.label} history`;


        historyMeta.textContent = records.length
            ? `${records.length} measurements · newest ${formatTime(records[0].recorded_at)}`
            : "No data";


        renderStats(
            [...records].reverse().map(record => record.value),
            metric,
            unit
        );

        renderRows(records, unit);

        drawHistoryChart(records, metric, unit);


        historyStatus.textContent = `${records.length} points`;


    } catch(error) {

        console.error(error);

        historyStats.innerHTML = "";

        historyRows.innerHTML = `
            <tr>
                <td colspan="3" class="error">
                    Error loading history: ${error.message}
                </td>
            </tr>
        `;

        historyStatus.textContent = "Error";

    }

}


// ==========================
// Events
// ==========================

renderMetricTabs(historyTabs, historyMetric, metric => {

    historyMetric = metric;

    loadHistory();

});


historyBtn.addEventListener("click", loadHistory);

limitInput.addEventListener("change", loadHistory);


loadHistory();
