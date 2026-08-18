// ==========================
// Elements
// ==========================

const forecastContainer = document.getElementById("forecast-data");
const forecastStatus = document.getElementById("forecast-status");
const forecastTabs = document.getElementById("metric-tabs");
const pointsInput = document.getElementById("n-points");
const forecastBtn = document.getElementById("run-forecast");


let selectedMetric = "temperature";


// ==========================
// Render
// ==========================

function renderForecast(data){

    const metric = getMetric(data.metric);

    const unit = data.unit || metric.unit;


    if(data.forecast === null || data.forecast === undefined){

        forecastContainer.innerHTML = `

            <div class="card card--hero" style="--dot-color:${metric.color}">

                <p class="card-label">
                    ${metric.label}
                </p>

                <p class="empty">
                    ${data.message || "No forecast available"}
                </p>

            </div>

        `;

        return;

    }


    forecastContainer.innerHTML = `

        <div class="card card--hero" style="--dot-color:${metric.color}">

            <p class="card-label">
                ${metric.label} forecast
            </p>

            <p class="card-value">
                ${data.forecast}
                <span class="unit">${unit}</span>
            </p>

            <p class="card-time">
                Moving average of ${data.based_on} measurements
                &middot;
                last reading ${formatTime(data.last_update)}
            </p>

        </div>


        <div class="card">

            <p class="card-label">
                Values used
            </p>

            <ul class="value-list">

                ${data.last_values.map(value => `
                    <li>
                        <span>${value}</span>
                        <span class="unit-inline">${unit}</span>
                    </li>
                `).join("")}

            </ul>

        </div>

    `;

}


// ==========================
// Load
// ==========================

async function loadForecast(){

    forecastStatus.textContent = "Loading...";


    try {

        const data = await postJSON("/forecast", {

            metric: selectedMetric,

            n_points: Number(pointsInput.value) || 5

        });


        renderForecast(data);

        forecastStatus.textContent = getMetric(data.metric).label;


    } catch(error) {

        console.error(error);

        forecastContainer.innerHTML = `
            <div class="card error">
                Error loading forecast: ${error.message}
            </div>
        `;

        forecastStatus.textContent = "Error";

    }

}


// ==========================
// Events
// ==========================

renderMetricTabs(forecastTabs, selectedMetric, metric => {

    selectedMetric = metric;

    loadForecast();

});


forecastBtn.addEventListener("click", loadForecast);

pointsInput.addEventListener("change", loadForecast);


loadForecast();
