// ==========================
// Elements
// ==========================

const anomaliesContainer = document.getElementById("anomalies-data");
const anomaliesSummary = document.getElementById("anomalies-summary");
const anomaliesStatus = document.getElementById("anomalies-status");
const anomaliesTabs = document.getElementById("metric-tabs");
const thresholdInput = document.getElementById("threshold");
const anomaliesBtn = document.getElementById("run-anomalies");


let selectedMetric = "temperature";


// ==========================
// Render
// ==========================

function renderSummary(data){

    const metric = getMetric(data.metric);

    const unit = data.unit || metric.unit;


    anomaliesSummary.innerHTML = `

        <div class="summary" style="--dot-color:${metric.color}">

            <div class="summary-item">
                <span class="summary-label">Metric</span>
                <span class="summary-value">${metric.label}</span>
            </div>

            <div class="summary-item">
                <span class="summary-label">Mean</span>
                <span class="summary-value">
                    ${data.mean === null ? "--" : data.mean}
                    <span class="unit-inline">${unit}</span>
                </span>
            </div>

            <div class="summary-item">
                <span class="summary-label">Std dev</span>
                <span class="summary-value">
                    ${data.std === null ? "--" : data.std}
                </span>
            </div>

            <div class="summary-item">
                <span class="summary-label">Points</span>
                <span class="summary-value">${data.total_points}</span>
            </div>

            <div class="summary-item">
                <span class="summary-label">Threshold</span>
                <span class="summary-value">z &gt; ${data.threshold}</span>
            </div>

        </div>

    `;

}


function renderAnomalies(data){

    const metric = getMetric(data.metric);

    const unit = data.unit || metric.unit;


    if(data.message){

        anomaliesContainer.innerHTML = `
            <div class="card empty">
                ${data.message}
            </div>
        `;

        return;

    }


    if(data.anomalies.length === 0){

        anomaliesContainer.innerHTML = `
            <div class="card empty">
                No anomalies detected for ${metric.label.toLowerCase()}
            </div>
        `;

        return;

    }


    anomaliesContainer.innerHTML = data.anomalies.map(anomaly => `

        <div class="card" style="--dot-color:${metric.color}">

            <p class="card-label">
                ${metric.label}
            </p>

            <p class="card-value">
                ${anomaly.value}
                <span class="unit">${unit}</span>
            </p>

            <p class="card-time">
                z-score ${anomaly.z_score}
                &middot;
                ${formatTime(anomaly.recorded_at)}
            </p>

        </div>

    `).join("");

}


// ==========================
// Load
// ==========================

async function loadAnomalies(){

    anomaliesStatus.textContent = "Checking...";


    try {

        const data = await postJSON("/anomalies", {

            metric: selectedMetric,

            threshold: Number(thresholdInput.value) || 2.0

        });


        renderSummary(data);

        renderAnomalies(data);


        anomaliesStatus.textContent =
            `${data.anomalies.length} anomalies`;


    } catch(error) {

        console.error(error);

        anomaliesSummary.innerHTML = "";

        anomaliesContainer.innerHTML = `
            <div class="card error">
                Error loading anomalies: ${error.message}
            </div>
        `;

        anomaliesStatus.textContent = "Error";

    }

}


// ==========================
// Events
// ==========================

renderMetricTabs(anomaliesTabs, selectedMetric, metric => {

    selectedMetric = metric;

    loadAnomalies();

});


anomaliesBtn.addEventListener("click", loadAnomalies);

thresholdInput.addEventListener("change", loadAnomalies);


loadAnomalies();
