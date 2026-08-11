// ==========================
// Elements
// ==========================

const logsStatus = document.getElementById("logs-status");
const logsTitle = document.getElementById("logs-title");
const logsSummary = document.getElementById("logs-summary");
const logsRows = document.getElementById("logs-rows");
const statusTabs = document.getElementById("status-tabs");
const logLimitInput = document.getElementById("log-limit");
const logsBtn = document.getElementById("run-logs");


// "all" is a UI-only option — it simply omits the status filter
const STATUS_FILTERS = [
    { key: "all",     label: "All",     color: "var(--ink-soft)" },
    { key: "success", label: "Success", color: "var(--c-wind)" },
    { key: "error",   label: "Errors",  color: "var(--accent)" }
];


let statusFilter = "all";


// ==========================
// Summary strip
// ==========================

function renderSummary(summary){

    const healthy = summary.errors === 0;


    const cells = [
        { label: "Runs", value: summary.runs },
        { label: "Success", value: summary.success },
        { label: "Errors", value: summary.errors },
        { label: "Success rate", value: `${summary.success_rate}%` },
        { label: "Rows saved", value: summary.rows_saved },
        { label: "Last success", value: formatTime(summary.last_success) }
    ];


    logsSummary.innerHTML = `

        <div class="summary" style="--dot-color:${healthy ? "var(--c-wind)" : "var(--accent)"}">

            ${cells.map(cell => `

                <div class="summary-item">

                    <span class="summary-label">
                        ${cell.label}
                    </span>

                    <span class="summary-value">
                        ${cell.value}
                    </span>

                </div>

            `).join("")}

        </div>

    `;

}


// ==========================
// Runs table
// ==========================

function renderRuns(runs){

    if(runs.length === 0){

        logsRows.innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    No collector runs recorded yet
                </td>
            </tr>
        `;

        return;

    }


    logsRows.innerHTML = runs.map(run => `

        <tr>

            <td class="stamp">
                ${formatTime(run.run_at)}
            </td>

            <td>
                <span class="badge badge--${run.status}">
                    ${run.status}
                </span>
            </td>

            <td class="num">
                ${run.rows_saved}
            </td>

            <td class="message">
                ${run.message || "--"}
            </td>

        </tr>

    `).join("");

}


// ==========================
// Load
// ==========================

async function loadLogs(){

    logsStatus.textContent = "Loading...";


    const limit = Number(logLimitInput.value) || 50;


    let url = `/logs?limit=${limit}`;

    if(statusFilter !== "all"){

        url += `&status=${statusFilter}`;

    }


    try {

        const response = await fetch(url);


        if(!response.ok){

            throw new Error(`HTTP ${response.status}`);

        }


        const data = await response.json();


        renderSummary(data.summary);

        renderRuns(data.runs);


        logsTitle.textContent = statusFilter === "all"
            ? "Collector runs"
            : `Collector runs — ${statusFilter}`;


        logsStatus.textContent =
            `${data.runs.length} of ${data.summary.runs} runs`;


    } catch(error) {

        console.error(error);

        logsSummary.innerHTML = "";

        logsRows.innerHTML = `
            <tr>
                <td colspan="4" class="error">
                    Error loading logs: ${error.message}
                </td>
            </tr>
        `;

        logsStatus.textContent = "Error";

    }

}


// ==========================
// Events
// ==========================

renderTabs(statusTabs, STATUS_FILTERS, statusFilter, filter => {

    statusFilter = filter;

    loadLogs();

});


logsBtn.addEventListener("click", loadLogs);

logLimitInput.addEventListener("change", loadLogs);


loadLogs();
