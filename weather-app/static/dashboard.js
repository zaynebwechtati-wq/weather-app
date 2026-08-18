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
const metricTabs = document.getElementById("metric-tabs");

const syncStatus = document.getElementById("sync-status");

let chart = null;
let selectedMetric = "temperature";


// ==========================
// Get Dashboard Data
// ==========================

async function getDashboardData() {

    try {

        const response = await fetch("/dashboard");

        if (!response.ok) {
            throw new Error(`Dashboard API error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {

        console.error(error);

        return null;
    }
}


// ==========================
// Get History
// ==========================

async function getHistory(metric, limit = 20) {

    try {

        const response = await fetch(
            `/measurements?metric=${metric}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`History API error: ${response.status}`);
        }

        return await response.json();

    } catch (error) {

        console.error(error);

        return [];
    }
}


// ==========================
// Update Current Values
// ==========================

function updateReadouts(data) {

    if (data.temperature) {

        tempValue.textContent =
            `${data.temperature.value} °C`;

        tempTime.textContent =
            new Date(
                data.temperature.recorded_at
            ).toLocaleString();
    }


    if (data.humidity) {

        humidityValue.textContent =
            `${data.humidity.value} %`;

        humidityTime.textContent =
            new Date(
                data.humidity.recorded_at
            ).toLocaleString();
    }


    if (data.windspeed) {

        windValue.textContent =
            `${data.windspeed.value} km/h`;

        windTime.textContent =
            new Date(
                data.windspeed.recorded_at
            ).toLocaleString();
    }


    if (data.pressure) {

        pressureValue.textContent =
            `${data.pressure.value} hPa`;

        pressureTime.textContent =
            new Date(
                data.pressure.recorded_at
            ).toLocaleString();
    }
}


// ==========================
// Metric Information
// ==========================

function getChartMetric(metric) {

    const metrics = {

        temperature: {
            label: "Temperature",
            unit: "°C"
        },

        humidity: {
            label: "Humidity",
            unit: "%"
        },

        windspeed: {
            label: "Wind Speed",
            unit: "km/h"
        },

        pressure: {
            label: "Pressure",
            unit: "hPa"
        }

    };

    return metrics[metric] || metrics.temperature;
}


// ==========================
// Draw Chart
// ==========================

function drawChart(history, metric) {

    if (!chartCanvas) {
        return;
    }

    const metricInfo =
        getChartMetric(metric);


    if (!history || history.length === 0) {

        if (chart) {
            chart.destroy();
            chart = null;
        }

        if (chartFallback) {
            chartFallback.textContent =
                "No data available.";
        }

        return;
    }


    if (chartFallback) {
        chartFallback.textContent = "";
    }


    const labels = history.map(
        item =>
            new Date(
                item.recorded_at
            ).toLocaleTimeString()
    );


    const values = history.map(
        item => item.value
    );


    if (chart) {
        chart.destroy();
    }


    chart = new Chart(
        chartCanvas,
        {

            type: "line",

            data: {

                labels: labels,

                datasets: [

                    {

                        label:
                            `${metricInfo.label} ${metricInfo.unit}`,

                        data: values,

                        fill: false,

                        tension: 0.3,

                        borderWidth: 2

                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                scales: {

                    y: {

                        title: {

                            display: true,

                            text: metricInfo.unit

                        }

                    }

                }

            }

        }
    );


    if (chartTitle) {

        chartTitle.textContent =
            `${metricInfo.label} History`;
    }


    if (chartMeta) {

        chartMeta.textContent =
            `Last ${history.length} measurements`;
    }
}


// ==========================
// Update Chart
// ==========================

async function updateChart(metric) {

    const history =
        await getHistory(
            metric,
            20
        );

    drawChart(
        history,
        metric
    );
}


// ==========================
// Update Dashboard
// ==========================

async function updateDashboard() {

    const data =
        await getDashboardData();


    if (!data) {

        if (syncStatus) {
            syncStatus.textContent =
                "Erreur de synchronisation";
        }

        return;
    }


    updateReadouts(data);


    await updateChart(
        selectedMetric
    );


    if (syncStatus) {

        syncStatus.textContent =
            `Synchronisé à ${new Date().toLocaleTimeString()}`;
    }
}


// ==========================
// Metric Tabs
// ==========================

if (metricTabs) {

    renderMetricTabs(
        metricTabs,
        selectedMetric,
        async function(metric) {

            selectedMetric = metric;

            await updateChart(metric);
        }
    );
}


// ==========================
// Refresh Button
// ==========================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        updateDashboard
    );
}


// ==========================
// First Load
// ==========================

updateDashboard();


// ==========================
// Auto Refresh
// ==========================

setInterval(
    updateDashboard,
    60000
);