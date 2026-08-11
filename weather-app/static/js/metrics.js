// ==========================
// Shared metric definitions
// Mirrors MetricName in backend/app/schemas.py
// ==========================

const METRICS = [

    {
        key: "temperature",
        label: "Temperature",
        unit: "°C",
        cssVar: "--accent",
        color: "var(--accent)"
    },

    {
        key: "humidity",
        label: "Humidity",
        unit: "%",
        cssVar: "--c-humidity",
        color: "var(--c-humidity)"
    },

    {
        key: "windspeed",
        label: "Wind",
        unit: "km/h",
        cssVar: "--c-wind",
        color: "var(--c-wind)"
    },

    {
        key: "pressure",
        label: "Pressure",
        unit: "hPa",
        cssVar: "--c-pressure",
        color: "var(--c-pressure)"
    }

];


function getMetric(key){

    return METRICS.find(
        metric => metric.key === key
    ) || METRICS[0];

}


// ==========================
// Tab pills — generic
// items: [{ key, label, color }]
// ==========================

function renderTabs(container, items, initialKey, onSelect){

    let selected = initialKey;


    container.innerHTML = items.map(item => `

        <button
            type="button"
            class="metric-tab"
            data-metric="${item.key}"
            style="--tab-color:${item.color}"
            aria-pressed="${item.key === selected}"
        >
            ${item.label}
        </button>

    `).join("");


    container.querySelectorAll(".metric-tab").forEach(button => {

        button.addEventListener("click", () => {

            selected = button.dataset.metric;


            container.querySelectorAll(".metric-tab").forEach(other => {

                other.setAttribute(
                    "aria-pressed",
                    other.dataset.metric === selected
                );

            });


            onSelect(selected);

        });

    });


    return () => selected;

}


// Metric selector — the common case
function renderMetricTabs(container, initialKey, onSelect){

    return renderTabs(
        container,
        METRICS,
        initialKey,
        onSelect
    );

}


// ==========================
// POST helper
// ==========================

async function postJSON(url, body){

    const response = await fetch(url, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(body)

    });


    const data = await response.json();


    if(!response.ok){

        const detail = Array.isArray(data.detail)
            ? data.detail.map(item => item.msg).join(", ")
            : (data.detail || `HTTP ${response.status}`);

        throw new Error(detail);

    }


    return data;

}


function formatTime(value){

    if(!value){

        return "--";

    }


    return new Date(value).toLocaleString();

}
