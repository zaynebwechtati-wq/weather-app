// ==========================
// Elements
// ==========================

const tempValue = document.getElementById("temp-value");
const tempTime = document.getElementById("temp-time");

const humidityValue = document.getElementById("humidity-value");
const humidityTime = document.getElementById("humidity-time");

const windValue = document.getElementById("wind-value");
const windTime = document.getElementById("wind-time");

const pressureValue = document.getElementById("pressure-value");
const pressureTime = document.getElementById("pressure-time");

const refreshBtn = document.getElementById("refreshBtn");

const chartCanvas = document.getElementById("tempChart");
const chartTitle = document.getElementById("chart-title");
const chartMeta = document.getElementById("chart-meta");
const chartFallback = document.getElementById("chart-fallback");
const chartTabs = document.getElementById("metric-tabs");
const syncStatus = document.getElementById("sync-status");

let chart = null;

// which metric the history chart plots
let chartMetric = "temperature";


// ==========================
// Get latest measurement
// ==========================

async function getLatest(metric) {

    try {

        const response = await fetch(
            `/measurements/latest?metric=${metric}`
        );


        if (!response.ok) {

            console.error(
                "Error getting",
                metric
            );

            return null;
        }


        return await response.json();


    } catch(error) {

        console.error(error);

        return null;

    }

}



// ==========================
// Get history
// ==========================

async function getHistory(
    metric = "temperature",
    limit = 20
) {

    try {

        const response = await fetch(
            `/measurements?metric=${metric}&limit=${limit}`
        );


        if (!response.ok) {

            return [];

        }


        return await response.json();


    } catch(error) {

        console.error(error);

        return [];

    }

}



// ==========================
// Update dashboard
// ==========================

async function updateDashboard(){


    const temperature =
        await getLatest("temperature");


    const humidity =
        await getLatest("humidity");


    const wind =
        await getLatest("windspeed");


    const pressure =
        await getLatest("pressure");



    if(temperature){

        tempValue.textContent =
            `${temperature.value} °C`;

        tempTime.textContent =
            new Date(
                temperature.recorded_at
            ).toLocaleString();

    }



    if(humidity){

        humidityValue.textContent =
            `${humidity.value} %`;

        humidityTime.textContent =
            new Date(
                humidity.recorded_at
            ).toLocaleString();

    }



    if(wind){

        windValue.textContent =
            `${wind.value} km/h`;

        windTime.textContent =
            new Date(
                wind.recorded_at
            ).toLocaleString();

    }



    if(pressure){

        pressureValue.textContent =
            `${pressure.value} hPa`;

        pressureTime.textContent =
            new Date(
                pressure.recorded_at
            ).toLocaleString();

    }



    await updateChart();


    if(syncStatus){

        syncStatus.textContent =
            `Synchronisé à ${new Date().toLocaleTimeString()}`;

    }

}



// ==========================
// History chart
// ==========================

async function updateChart(){

    const metric = getMetric(chartMetric);


    const history =
        await getHistory(
            metric.key,
            20
        );


    if(chartTitle){

        chartTitle.textContent = `${metric.label} History`;

    }


    if(chartMeta){

        chartMeta.textContent = history.length
            ? `Last ${history.length} measurements`
            : "No data";

    }


    drawChart(history, metric);

}



// ==========================
// Draw chart
// ==========================

function drawChart(history, metric){


    if(!chartCanvas){

        return;

    }


    // Chart.js ships from a CDN — keep the readouts usable if it is unreachable
    if(typeof Chart === "undefined"){

        if(chartFallback){

            chartFallback.textContent =
                "Chart library unavailable — current readouts above are still live.";

        }

        return;

    }


    if(chartFallback){

        chartFallback.textContent = "";

    }


    // API returns newest first — plot chronologically
    const ordered = [...history].reverse();


    const labels =
        ordered.map(item =>
            new Date(
                item.recorded_at
            ).toLocaleTimeString()
        );


    const values =
        ordered.map(
            item => item.value
        );



    if(chart){

        chart.destroy();

    }


    const accent = getComputedStyle(document.documentElement)
        .getPropertyValue(metric.cssVar)
        .trim() || "#E8712B";



    chart = new Chart(
        chartCanvas,
        {

            type:"line",

            data:{

                labels:labels,

                datasets:[

                    {

                        label:
                        `${metric.label} (${metric.unit})`,

                        data:values,

                        borderColor: accent,

                        backgroundColor: `${accent}22`,

                        fill:true,

                        tension:0.3,

                        borderWidth:2,

                        pointRadius:2

                    }

                ]

            },


            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{
                    legend:{ display:false }
                },

                scales:{
                    y:{ beginAtZero:false }
                }

            }

        }

    );

}



// ==========================
// Events
// ==========================

if(refreshBtn){

    refreshBtn.addEventListener(
        "click",
        updateDashboard
    );

}


// Chart metric selector
if(chartTabs){

    renderMetricTabs(
        chartTabs,
        chartMetric,
        metric => {

            chartMetric = metric;

            updateChart();

        }
    );

}


// First load

updateDashboard();


// Auto refresh every minute

setInterval(
    updateDashboard,
    60000
);