/**
 * ============================================================
 * PSMURO MONITORING DASHBOARD
 * app.js
 * ============================================================
 *
 * Fungsi:
 * - Navigasi sidebar
 * - Mengambil data dari API layer
 * - Global filter
 * - Dashboard
 * - Data Asisten
 * - Data Kehadiran
 * - Data Aktivitas
 * - Estimasi Honor
 * - Panduan
 * - Loading & error state
 * - Mobile sidebar
 *
 * DATA FLOW:
 *
 * mock-data.js
 *      ↓
 *    api.js
 *      ↓
 *    app.js
 *      ↓
 *  index.html
 *
 * WEBSITE READ-ONLY
 * Tidak ada fungsi:
 * - tambah data
 * - edit data
 * - hapus data
 * - update Google Sheets
 *
 * ============================================================
 */

(() => {
    "use strict";

    // ========================================================
    // STATE
    // ========================================================

    const state = {
        data: null,

        currentPage: "dashboard",

        filters: {
            period: "all",
            date: "",
            lab: "all",
            job: "all",
            assistant: "all"
        },

        pagination: {
            attendance: { page: 1, pageSize: 50 },
            assistants: { page: 1, pageSize: 25 }
        },

        loading: true,

        error: null
    };

    // ========================================================
    // DOM ELEMENT
    // ========================================================

    const el = {
        sidebar: document.getElementById("sidebar"),
        pageTitle: document.getElementById("pageTitle"),
        pageContainer: document.getElementById("pageContainer"),

        syncStatus: document.getElementById("syncStatus"),
        syncDot: document.getElementById("syncDot"),
        lastSync: document.getElementById("lastSync"),

        mockBanner: document.getElementById("mockBanner"),

        globalFilters: document.getElementById("globalFilters"),

        periodFilter: document.getElementById("periodFilter"),
        dateFilter: document.getElementById("dateFilter"),
        labFilter: document.getElementById("labFilter"),
        jobFilter: document.getElementById("jobFilter"),
        assistantFilter: document.getElementById("assistantFilter"),

        resetFilters: document.getElementById("resetFilters"),

        menuButton: document.getElementById("menuButton"),
        sidebarOverlay: document.getElementById("sidebarOverlay")
    };

    // ========================================================
    // PAGE TITLE
    // ========================================================

    const pageTitles = {
        dashboard: "Dashboard",
        assistants: "Asisten",
        attendance: "Kehadiran",
        activity: "Aktivitas",
        honor: "Estimasi Honor",
        guide: "Panduan"
    };

    // ========================================================
    // INITIALIZATION
    // ========================================================

    document.addEventListener("DOMContentLoaded", init);

    async function init() {
        setupNavigation();
        setupFilters();
        setupMobileMenu();
        showLoading();

        try {
            await loadData();
            populateFilters();
            renderCurrentPage();
        } catch (error) {
            console.error(
                "PSMURO Dashboard Error:",
                error
            );
            showError(
                error.message ||
                "Terjadi kesalahan saat memuat data."
            );
        }
    }

    // ========================================================
    // LOAD DATA
    // ========================================================

    async function loadData() {
        state.loading = true;
        updateSyncStatus("loading");

        try {
            state.data = await PSMURO_API.getAllData();
            state.loading = false;
            state.error = null;
            updateSyncStatus("success");

            // -----------------------------------------------
            // MOCK DATA BANNER
            // -----------------------------------------------
            if (
                state.data.meta &&
                state.data.meta.source === "Mock Data"
            ) {
                el.mockBanner?.classList.remove("hidden");
            } else {
                el.mockBanner?.classList.add("hidden");
            }

            // -----------------------------------------------
            // LAST SYNC
            // -----------------------------------------------
            if (el.lastSync) {
                el.lastSync.textContent =
                    formatDateTime(
                        state.data.meta?.fetchedAt
                    );
            }
        } catch (error) {
            state.loading = false;
            state.error = error;
            updateSyncStatus("error");
            throw error;
        }
    }

    // ========================================================
    // NAVIGATION
    // ========================================================

    function setupNavigation() {
        const navItems = document.querySelectorAll(".nav-item");

        navItems.forEach(item => {
            item.addEventListener(
                "click",
                event => {
                    event.preventDefault();
                    const page = item.dataset.page;
                    if (!page) return;
                    navigateTo(page);
                }
            );
        });
    }

    function navigateTo(page) {
        if (!pageTitles[page]) return;

        state.currentPage = page;

        // -----------------------------------------------
        // ACTIVE SIDEBAR
        // -----------------------------------------------
        document
            .querySelectorAll(".nav-item")
            .forEach(item => {
                item.classList.toggle(
                    "active",
                    item.dataset.page === page
                );
            });

        // -----------------------------------------------
        // PAGE TITLE
        // -----------------------------------------------
        if (el.pageTitle) {
            el.pageTitle.textContent = pageTitles[page];
        }

        // -----------------------------------------------
        // RENDER
        // -----------------------------------------------
        renderCurrentPage();

        // -----------------------------------------------
        // CLOSE MOBILE MENU
        // -----------------------------------------------
        closeMobileMenu();
    }

    function renderCurrentPage() {
        if (!state.data) {
            showLoading();
            return;
        }

        switch (state.currentPage) {
            case "dashboard":
                renderDashboard();
                break;
            case "assistants":
                renderAssistants();
                break;
            case "attendance":
                renderAttendance();
                break;
            case "activity":
                renderActivity();
                break;
            case "honor":
                renderHonor();
                break;
            case "guide":
                renderGuide();
                break;
            default:
                renderDashboard();
                break;
        }
    }

    // ========================================================
    // FILTER SETUP
    // ========================================================

    function resetPagination() {
        if (state.pagination) {
            state.pagination.attendance.page = 1;
            state.pagination.assistants.page = 1;
        }
    }

    function setupFilters() {
        // PERIOD
        el.periodFilter?.addEventListener(
            "change",
            event => {
                state.filters.period = event.target.value;
                // Kosongkan filter harian saat periode bulan diubah
                state.filters.date = "";
                if (el.dateFilter) {
                    el.dateFilter.value = "";
                    if (state.filters.period !== "all") {
                        const [y, m] = state.filters.period.split("-");
                        const lastDay = new Date(Number(y), Number(m), 0).getDate();
                        el.dateFilter.min = `${state.filters.period}-01`;
                        el.dateFilter.max = `${state.filters.period}-${String(lastDay).padStart(2, "0")}`;
                    } else {
                        updateDateFilterBounds();
                    }
                }
                resetPagination();
                renderCurrentPage();
            }
        );

        // DATE (HARIAN)
        el.dateFilter?.addEventListener(
            "change",
            event => {
                state.filters.date = event.target.value;
                // Jika tanggal harian dipilih, otomatis sinkronkan dropdown periode ke bulan tersebut
                if (state.filters.date) {
                    const monthPeriod = state.filters.date.substring(0, 7);
                    if (el.periodFilter) {
                        el.periodFilter.value = monthPeriod;
                        state.filters.period = monthPeriod;
                    }
                }
                resetPagination();
                renderCurrentPage();
            }
        );

        // LAB
        el.labFilter?.addEventListener(
            "change",
            event => {
                state.filters.lab = event.target.value;
                resetPagination();
                updateAssistantDropdown();
                renderCurrentPage();
            }
        );

        // JOB
        el.jobFilter?.addEventListener(
            "change",
            event => {
                state.filters.job = event.target.value;
                resetPagination();
                updateAssistantDropdown();
                renderCurrentPage();
            }
        );

        // ASSISTANT
        el.assistantFilter?.addEventListener(
            "change",
            event => {
                state.filters.assistant = event.target.value;
                resetPagination();
                renderCurrentPage();
            }
        );

        // RESET
        el.resetFilters?.addEventListener(
            "click",
            resetFilters
        );
    }

    // ========================================================
    // UPDATE ASSISTANT DROPDOWN (CASCADING)
    // ========================================================

    function updateAssistantDropdown() {
        if (!el.assistantFilter || !state.data) return;

        const currentSelected = el.assistantFilter.value;
        let availableAssistants = [...(state.data.assistants || [])];

        // Filter by Lab
        if (state.filters.lab !== "all") {
            availableAssistants = availableAssistants.filter(
                a => a.domicile === state.filters.lab
            );
        }

        // Filter by Job
        if (state.filters.job !== "all") {
            availableAssistants = availableAssistants.filter(
                a => a.job === state.filters.job
            );
        }

        // Sort by Name
        availableAssistants.sort((a, b) =>
            String(a.name || "").localeCompare(
                String(b.name || ""), "id", { sensitivity: "base" }
            )
        );

        // Render options
        el.assistantFilter.innerHTML = `
            <option value="all">Semua Asisten</option>
            ${availableAssistants.map(assistant => `
                <option value="${escapeHTML(assistant.id)}">
                    ${escapeHTML(assistant.name)}
                </option>
            `).join("")}
        `;

        // Restore selected value if still valid
        const stillExists = availableAssistants.some(a => String(a.id) === String(currentSelected));

        if (stillExists && currentSelected !== "all") {
            el.assistantFilter.value = currentSelected;
        } else {
            el.assistantFilter.value = "all";
            state.filters.assistant = "all";
        }
    }

    // ========================================================
    // POPULATE FILTER
    // ========================================================

    function populateFilters() {
        if (!state.data) return;

        // ====================================================
        // LAB FILTER
        // ====================================================
        if (el.labFilter) {
            el.labFilter.innerHTML = `
                <option value="all">Semua Lab</option>
                ${Object.entries(state.data.labs || {})
                    .map(([key, lab]) => {
                        const name = typeof lab === "object" ? lab.name : lab;
                        return `<option value="${escapeHTML(key)}">${escapeHTML(name)}</option>`;
                    })
                    .join("")}
            `;
        }

        // ====================================================
        // JOB FILTER
        // ====================================================
        if (el.jobFilter) {
            el.jobFilter.innerHTML = `
                <option value="all">Semua Job</option>
                ${Object.entries(state.data.jobs || {})
                    .map(([key, job]) => {
                        const name = typeof job === "object" ? job.name : job;
                        return `<option value="${escapeHTML(key)}">${escapeHTML(name)}</option>`;
                    })
                    .join("")}
            `;
        }

        // ====================================================
        // ASSISTANT FILTER
        // ====================================================
        updateAssistantDropdown();

        // ====================================================
        // PERIOD FILTER
        // ====================================================
        populatePeriodFilter();
    }

    function populatePeriodFilter() {
        if (!el.periodFilter) return;

        const periods = new Set();

        (state.data.attendance || [])
            .forEach(record => {
                if (!record.date) return;
                const period = String(record.date).substring(0, 7);
                if (period) {
                    periods.add(period);
                }
            });

        const sortedPeriods = [...periods].sort().reverse();

        el.periodFilter.innerHTML = `
            <option value="all">Semua Periode</option>
            ${sortedPeriods
                .map(period => {
                    return `
                        <option value="${escapeHTML(period)}">
                            ${formatPeriod(period)}
                        </option>
                    `;
                })
                .join("")}
        `;
    }

    // ========================================================
    // RESET FILTER
    // ========================================================

    function resetFilters() {
        state.filters = {
            period: "all",
            lab: "all",
            job: "all",
            assistant: "all"
        };

        if (el.periodFilter) el.periodFilter.value = "all";
        if (el.labFilter) el.labFilter.value = "all";
        if (el.jobFilter) el.jobFilter.value = "all";
        if (el.assistantFilter) el.assistantFilter.value = "all";

        resetPagination();
        updateAssistantDropdown();
        renderCurrentPage();
    }

    // ========================================================
    // FILTERED ATTENDANCE
    // ========================================================

    function getFilteredAttendance() {
        if (!state.data) return [];

        let records = [...(state.data.attendance || [])];
        const filters = state.filters;

        // LAB
        if (filters.lab !== "all") {
            records = records.filter(record => {
                return (
                    record.teachingLocation === filters.lab ||
                    record.domicile === filters.lab ||
                    (filters.lab === "LAB_D" && (record.teachingLocation === "Depok" || record.domicile === "Depok" || record.domicile === "LAB_D")) ||
                    (filters.lab === "LAB_J" && (record.teachingLocation === "Kalimalang" || record.domicile === "Kalimalang" || record.domicile === "LAB_J")) ||
                    (filters.lab === "LAB_K" && (record.teachingLocation === "Karawaci" || record.domicile === "Karawaci" || record.domicile === "LAB_K"))
                );
            });
        }

        // JOB
        if (filters.job !== "all") {
            records = records.filter(record => {
                return String(record.job) === String(filters.job) ||
                       (filters.job === "1" && (record.job === "1" || record.job === "PSMURO"));
            });
        }

        // ASSISTANT
        if (filters.assistant !== "all") {
            records = records.filter(record => {
                return String(record.assistantId) === String(filters.assistant) ||
                       String(record.assistantName || "").toLowerCase() === String(filters.assistant).toLowerCase() ||
                       (record.assistantName && slugify(record.assistantName) === String(filters.assistant));
            });
        }

        // PERIOD
        if (filters.period !== "all") {
            records = records.filter(record => {
                return String(record.date || "").startsWith(filters.period);
            });
        }

        return records;
    }

    // ========================================================
    // FILTERED ASSISTANTS
    // ========================================================

    function getFilteredAssistants() {
        if (!state.data) return [];

        let assistants = [...(state.data.assistants || [])];
        const filters = state.filters;

        // LAB
        if (filters.lab !== "all") {
            assistants = assistants.filter(assistant => {
                return assistant.domicile === filters.lab ||
                       (filters.lab === "LAB_D" && (assistant.domicile === "Depok" || assistant.domicile === "LAB_D")) ||
                       (filters.lab === "LAB_J" && (assistant.domicile === "Kalimalang" || assistant.domicile === "LAB_J")) ||
                       (filters.lab === "LAB_K" && (assistant.domicile === "Karawaci" || assistant.domicile === "LAB_K"));
            });
        }

        // JOB
        if (filters.job !== "all") {
            assistants = assistants.filter(assistant => {
                return String(assistant.job) === String(filters.job) ||
                       (filters.job === "1" && (assistant.job === "1" || assistant.jobName === "PSMURO"));
            });
        }

        // ASSISTANT
        if (filters.assistant !== "all") {
            assistants = assistants.filter(assistant => {
                return String(assistant.id) === String(filters.assistant) ||
                       String(assistant.name || "").toLowerCase() === String(filters.assistant).toLowerCase() ||
                       (assistant.name && slugify(assistant.name) === String(filters.assistant));
            });
        }

        return assistants;
    }

    // ========================================================
    // DASHBOARD
    // ========================================================

    function renderDashboard() {
        const records = getFilteredAttendance();
        const assistants = getFilteredAssistants();

        // KPI
        const totalAssistants = assistants.length;
        const totalAttendance = records.length;
        const totalShift = records.reduce((sum, record) => {
            return sum + Number(record.totalShift || 0);
        }, 0);

        const estimatedHonor = calculateHonor(totalShift);
        const attendanceRate = calculateAttendanceRate(records);

        // RENDER
        el.pageContainer.innerHTML = `
            <div class="page-header">
                <div>
                    <h2>Overview Monitoring</h2>
                    <p>Ringkasan performa asisten berdasarkan data kehadiran.</p>
                </div>
            </div>

            <!-- KPI -->
            <div class="kpi-grid">
                ${createKpiCard("Total Asisten", formatNumber(totalAssistants), "Asisten terdata")}
                ${createKpiCard("Data Kehadiran", formatNumber(totalAttendance), "Record kehadiran")}
                ${createKpiCard("Total Shift", formatNumber(totalShift), "Total Shift")}
                ${createKpiCard("Estimasi Honor", formatRupiah(estimatedHonor), "Berdasarkan Total Shift")}
            </div>

            <!-- SUMMARY -->
            <div class="chart-grid">
                <!-- KEHADIRAN -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3>Kehadiran</h3>
                            <p>Ringkasan status kehadiran</p>
                        </div>
                    </div>
                    ${createAttendanceSummary(records)}
                </div>

                <!-- DISTRIBUSI LAB -->
                <div class="card">
                    <div class="card-header">
                        <div>
                            <h3>Distribusi Lab</h3>
                            <p>Jumlah record berdasarkan lokasi</p>
                        </div>
                    </div>
                    ${createLabSummary(records)}
                </div>
            </div>

            <!-- AKTIVITAS -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3>Ringkasan Aktivitas</h3>
                        <p>Aktivitas yang tercatat pada periode/filter aktif</p>
                    </div>
                    <span class="badge badge-info">${formatPercent(attendanceRate)} kehadiran</span>
                </div>
                ${createActivitySummary(records)}
            </div>
        `;
    }

    // ========================================================
    // PAGE - ASISTEN
    // ========================================================

    function renderAssistants() {
        const assistants = getFilteredAssistants();
        const totalRecords = assistants.length;
        const pageSize = state.pagination.assistants.pageSize;
        const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(totalRecords / pageSize));

        if (state.pagination.assistants.page > totalPages) {
            state.pagination.assistants.page = totalPages;
        }
        if (state.pagination.assistants.page < 1) {
            state.pagination.assistants.page = 1;
        }
        const currentPage = state.pagination.assistants.page;

        const startIndex = pageSize === "all" ? 0 : (currentPage - 1) * pageSize;
        const endIndex = pageSize === "all" ? totalRecords : Math.min(startIndex + pageSize, totalRecords);
        const pagedRecords = assistants.slice(startIndex, endIndex);

        el.pageContainer.innerHTML = `
            <div class="page-header">
                <div>
                    <h2>Data Asisten</h2>
                    <p>Daftar asisten yang terdaftar pada sistem (${formatNumber(totalRecords)} asisten).</p>
                </div>
            </div>

            <div class="card">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nama</th>
                                <th>Domisili</th>
                                <th>Job</th>
                                <th>UID</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pagedRecords.length
                                ? pagedRecords.map((assistant, index) => createAssistantRow(assistant, startIndex + index)).join("")
                                : createEmptyRow(6)
                            }
                        </tbody>
                    </table>
                </div>

                <!-- PAGINATION BAR -->
                <div class="pagination-bar">
                    <div class="pagination-info">
                        Menampilkan <strong>${totalRecords ? startIndex + 1 : 0}–${endIndex}</strong> dari <strong>${formatNumber(totalRecords)}</strong> asisten
                    </div>
                    <div class="pagination-controls">
                        <label class="page-size-label">
                            <span>Baris:</span>
                            <select id="assistantPageSize" class="page-size-select">
                                <option value="25" ${pageSize === 25 ? "selected" : ""}>25</option>
                                <option value="50" ${pageSize === 50 ? "selected" : ""}>50</option>
                                <option value="all" ${pageSize === "all" ? "selected" : ""}>Semua</option>
                            </select>
                        </label>
                        <div class="page-nav">
                            <button class="btn-page" id="assistantPrev" ${currentPage <= 1 ? "disabled" : ""}>
                                &larr; Sebelumnya
                            </button>
                            <span class="page-indicator">
                                Halaman <strong>${currentPage}</strong> / <strong>${totalPages}</strong>
                            </span>
                            <button class="btn-page" id="assistantNext" ${currentPage >= totalPages ? "disabled" : ""}>
                                Selanjutnya &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("assistantPrev")?.addEventListener("click", () => {
            if (state.pagination.assistants.page > 1) {
                state.pagination.assistants.page--;
                renderAssistants();
            }
        });

        document.getElementById("assistantNext")?.addEventListener("click", () => {
            if (state.pagination.assistants.page < totalPages) {
                state.pagination.assistants.page++;
                renderAssistants();
            }
        });

        document.getElementById("assistantPageSize")?.addEventListener("change", event => {
            const val = event.target.value;
            state.pagination.assistants.pageSize = val === "all" ? "all" : Number(val);
            state.pagination.assistants.page = 1;
            renderAssistants();
        });
    }

    function createAssistantRow(assistant, index) {
        const labName = getLabName(assistant.domicile);
        const jobName = getJobName(assistant.job) || "PSMURO";

        const uidsList = Array.isArray(assistant.uids)
            ? assistant.uids
            : (assistant.uid ? [assistant.uid] : []);

        const uidHtml = uidsList.length > 0
            ? `<div class="uid-badges">${uidsList.map(uid => `<code>${escapeHTML(uid)}</code>`).join(" ")}</div>`
            : "<code>-</code>";

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${escapeHTML(assistant.name)}</strong></td>
                <td>${escapeHTML(labName)}</td>
                <td>${escapeHTML(jobName)}</td>
                <td>${uidHtml}</td>
                <td>
                    <span class="badge badge-success">
                        ${escapeHTML(assistant.status || "REGISTERED")}
                    </span>
                </td>
            </tr>
        `;
    }

    // ========================================================
    // PAGE - KEHADIRAN
    // ========================================================

    function renderAttendance() {
        const records = getFilteredAttendance();
        const sortedRecords = [...records].sort((a, b) =>
            String(b.date || "").localeCompare(String(a.date || ""))
        );

        const totalRecords = sortedRecords.length;
        const pageSize = state.pagination.attendance.pageSize;
        const totalPages = pageSize === "all" ? 1 : Math.max(1, Math.ceil(totalRecords / pageSize));

        if (state.pagination.attendance.page > totalPages) {
            state.pagination.attendance.page = totalPages;
        }
        if (state.pagination.attendance.page < 1) {
            state.pagination.attendance.page = 1;
        }
        const currentPage = state.pagination.attendance.page;

        const startIndex = pageSize === "all" ? 0 : (currentPage - 1) * pageSize;
        const endIndex = pageSize === "all" ? totalRecords : Math.min(startIndex + pageSize, totalRecords);
        const pagedRecords = sortedRecords.slice(startIndex, endIndex);

        el.pageContainer.innerHTML = `
            <div class="page-header">
                <div>
                    <h2>Data Kehadiran</h2>
                    <p>Data kehadiran dari sumber data utama (${formatNumber(totalRecords)} total data).</p>
                </div>
            </div>

            <div class="card">
                <div class="table-wrapper">
                    <table class="data-table sticky-cols">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Nama</th>
                                <th>Lokasi</th>
                                <th>Job</th>
                                <th>Shift 1</th>
                                <th>Shift 2</th>
                                <th>Shift 3</th>
                                <th>Shift 4</th>
                                <th>Shift 5</th>
                                <th>Total Shift</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pagedRecords.length
                                ? pagedRecords.map(createAttendanceRow).join("")
                                : createEmptyRow(10)
                            }
                        </tbody>
                    </table>
                </div>

                <!-- PAGINATION BAR -->
                <div class="pagination-bar">
                    <div class="pagination-info">
                        Menampilkan <strong>${totalRecords ? startIndex + 1 : 0}–${endIndex}</strong> dari <strong>${formatNumber(totalRecords)}</strong> data
                    </div>
                    <div class="pagination-controls">
                        <label class="page-size-label">
                            <span>Baris:</span>
                            <select id="attendancePageSize" class="page-size-select">
                                <option value="25" ${pageSize === 25 ? "selected" : ""}>25</option>
                                <option value="50" ${pageSize === 50 ? "selected" : ""}>50</option>
                                <option value="100" ${pageSize === 100 ? "selected" : ""}>100</option>
                                <option value="all" ${pageSize === "all" ? "selected" : ""}>Semua</option>
                            </select>
                        </label>
                        <div class="page-nav">
                            <button class="btn-page" id="attendancePrev" ${currentPage <= 1 ? "disabled" : ""}>
                                &larr; Sebelumnya
                            </button>
                            <span class="page-indicator">
                                Halaman <strong>${currentPage}</strong> / <strong>${totalPages}</strong>
                            </span>
                            <button class="btn-page" id="attendanceNext" ${currentPage >= totalPages ? "disabled" : ""}>
                                Selanjutnya &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("attendancePrev")?.addEventListener("click", () => {
            if (state.pagination.attendance.page > 1) {
                state.pagination.attendance.page--;
                renderAttendance();
            }
        });

        document.getElementById("attendanceNext")?.addEventListener("click", () => {
            if (state.pagination.attendance.page < totalPages) {
                state.pagination.attendance.page++;
                renderAttendance();
            }
        });

        document.getElementById("attendancePageSize")?.addEventListener("change", event => {
            const val = event.target.value;
            state.pagination.attendance.pageSize = val === "all" ? "all" : Number(val);
            state.pagination.attendance.page = 1;
            renderAttendance();
        });
    }

    function createAttendanceRow(record) {
        return `
            <tr>
                <td>${formatDate(record.date)}</td>
                <td><strong>${escapeHTML(record.assistantName || "-")}</strong></td>
                <td>${escapeHTML(getLabName(record.teachingLocation))}</td>
                <td>${escapeHTML(getJobName(record.job))}</td>
                ${createShiftCell(record.shift1, record.mutu1)}
                ${createShiftCell(record.shift2, record.mutu2)}
                ${createShiftCell(record.shift3, record.mutu3)}
                ${createShiftCell(record.shift4, record.mutu4)}
                ${createShiftCell(record.shift5, record.mutu5)}
                <td><strong>${formatNumber(record.totalShift)}</strong></td>
            </tr>
        `;
    }

    function createShiftCell(activity, mutu) {
        const activityName = getActivityName(activity);
        return `
            <td>
                <div class="shift-cell">
                    <span>${escapeHTML(activityName)}</span>
                    <small>Mutu: ${formatNumber(mutu)}</small>
                </div>
            </td>
        `;
    }

    // ========================================================
    // PAGE - AKTIVITAS
    // ========================================================

    function renderActivity() {
        const records = getFilteredAttendance();
        const activityMap = {};

        records.forEach(record => {
            const shifts = [
                record.shift1, record.shift2, record.shift3, record.shift4, record.shift5
            ];

            shifts.forEach(code => {
                if (code === undefined || code === null || code === "") return;
                if (!activityMap[code]) activityMap[code] = 0;
                activityMap[code]++;
            });
        });

        const rows = Object.entries(activityMap).sort((a, b) => b[1] - a[1]);
        const totalActivity = rows.reduce((sum, item) => sum + item[1], 0);

        el.pageContainer.innerHTML = `
            <div class="page-header">
                <div>
                    <h2>Aktivitas</h2>
                    <p>Distribusi aktivitas berdasarkan kode yang tercatat.</p>
                </div>
            </div>

            <div class="card">
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Kode</th>
                                <th>Aktivitas</th>
                                <th>Jumlah</th>
                                <th>Persentase</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.length
                                ? rows.map(([code, count]) => {
                                    const percentage = totalActivity ? (count / totalActivity) * 100 : 0;
                                    return `
                                        <tr>
                                            <td><span class="badge badge-info">${escapeHTML(code)}</span></td>
                                            <td><strong>${escapeHTML(getActivityName(code))}</strong></td>
                                            <td>${formatNumber(count)}</td>
                                            <td>${formatPercent(percentage)}</td>
                                        </tr>
                                    `;
                                }).join("")
                                : createEmptyRow(4)
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // ========================================================
    // PAGE - HONOR
    // ========================================================

    function renderHonor() {
        const records = getFilteredAttendance();
        const assistantMap = {};

        records.forEach(record => {
            const id = record.assistantId || record.assistantName || "unknown";

            if (!assistantMap[id]) {
                assistantMap[id] = {
                    name: record.assistantName || "Tidak diketahui",
                    totalShift: 0
                };
            }

            assistantMap[id].totalShift += Number(record.totalShift || 0);
        });

        const assistants = Object.values(assistantMap).sort((a, b) => b.totalShift - a.totalShift);
        const totalShift = assistants.reduce((sum, assistant) => sum + assistant.totalShift, 0);
        const totalHonor = calculateHonor(totalShift);

        el.pageContainer.innerHTML = `
            <div class="page-header">
                <div>
                    <h2>Estimasi Honor</h2>
                    <p>Estimasi berdasarkan Total Shift dari sumber data.</p>
                </div>
            </div>

            <!-- HONOR KPI -->
            <div class="kpi-grid">
                ${createKpiCard("Total Shift", formatNumber(totalShift), "Total seluruh shift")}
                ${createKpiCard("Estimasi Honor", formatRupiah(totalHonor), "Rp2.900 per Total Shift")}
            </div>

            <!-- HONOR TABLE -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3>Estimasi Per Asisten</h3>
                        <p>Perhitungan berdasarkan Total Shift.</p>
                    </div>
                </div>

                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nama</th>
                                <th>Total Shift</th>
                                <th>Estimasi Honor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${assistants.length
                                ? assistants.map((assistant, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td><strong>${escapeHTML(assistant.name)}</strong></td>
                                        <td>${formatNumber(assistant.totalShift)}</td>
                                        <td><strong>${formatRupiah(calculateHonor(assistant.totalShift))}</strong></td>
                                    </tr>
                                `).join("")
                                : createEmptyRow(4)
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- HONOR NOTE -->
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3>Catatan Perhitungan</h3>
                    </div>
                </div>
                <div class="guide-content">
                    <p>Estimasi menggunakan formula:</p>
                    <p><strong>Total Shift × Rp2.900</strong></p>
                    <p>Nilai ini merupakan <strong>estimasi dashboard</strong> berdasarkan Total Shift yang tersedia pada sumber data.</p>
                    <p>Nilai estimasi tidak digunakan untuk mengubah data sumber atau menggantikan pencatatan honor resmi.</p>
                </div>
            </div>
        `;
    }

    // ========================================================
    // PAGE - PANDUAN
    // ========================================================

    function renderGuide() {
        el.pageContainer.innerHTML = `
            <div class="page-header">
                <div>
                    <h2>Panduan</h2>
                    <p>Informasi penggunaan dashboard monitoring PSMURO.</p>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <h3>Tentang Dashboard</h3>
                        <p>Fungsi dan prinsip dasar dashboard</p>
                    </div>
                </div>
                <div class="guide-content">
                    <p>Dashboard ini digunakan untuk monitoring data asisten, kehadiran, aktivitas, dan estimasi honor.</p>
                    <p>Seluruh data yang ditampilkan berasal dari <strong>sumber data utama</strong> dan dashboard bersifat <strong>read-only</strong>.</p>
                    <p>Dashboard tidak memiliki fungsi untuk menambah, mengubah, atau menghapus data pada sumber utama.</p>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <h3>Filter Data</h3>
                        <p>Menyaring data yang ditampilkan</p>
                    </div>
                </div>
                <div class="guide-content">
                    <p>Gunakan filter pada bagian atas halaman untuk menyaring data berdasarkan:</p>
                    <ul>
                        <li><strong>Periode</strong> — memilih periode data.</li>
                        <li><strong>Laboratorium</strong> — menyaring berdasarkan lokasi lab.</li>
                        <li><strong>Job</strong> — menyaring berdasarkan jenis job.</li>
                        <li><strong>Asisten</strong> — menampilkan data dari asisten tertentu.</li>
                    </ul>
                    <p>Gunakan tombol <strong>Reset</strong> untuk mengembalikan seluruh filter ke kondisi awal.</p>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <h3>Kode Aktivitas</h3>
                        <p>Keterangan kode aktivitas pada data kehadiran.</p>
                    </div>
                </div>
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 120px;">Kode</th>
                                <th>Aktivitas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(state.data.activityCodes || {})
                                .map(([code, activity]) => {
                                    const name = typeof activity === "object" ? activity.name : activity;
                                    return `
                                        <tr>
                                            <td><code>${escapeHTML(code)}</code></td>
                                            <td>${escapeHTML(name)}</td>
                                        </tr>
                                    `;
                                })
                                .join("")
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <h3>Estimasi Honor</h3>
                        <p>Dasar perhitungan yang digunakan dashboard.</p>
                    </div>
                </div>
                <div class="guide-content">
                    <p>Estimasi honor dihitung berdasarkan <strong>Total Shift</strong> yang terdapat pada sumber data.</p>
                    <p><strong>Total Shift × Rp2.900</strong></p>
                    <p>Nilai yang ditampilkan merupakan <strong>estimasi</strong> dan bukan pengganti pencatatan honor resmi.</p>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <div>
                        <h3>Sifat Data</h3>
                        <p>Prinsip keamanan dan integritas data</p>
                    </div>
                </div>
                <div class="guide-content">
                    <p>Dashboard hanya digunakan untuk membaca dan menganalisis data.</p>
                    <ul>
                        <li>Tidak ada fitur tambah data.</li>
                        <li>Tidak ada fitur edit data.</li>
                        <li>Tidak ada fitur hapus data.</li>
                        <li>Data sumber tetap menjadi <strong>Single Source of Truth</strong>.</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // ========================================================
    // DASHBOARD SUMMARY
    // ========================================================

    function createKpiCard(title, value, description) {
        return `
            <div class="kpi-card">
                <div class="kpi-label">${escapeHTML(title)}</div>
                <div class="kpi-value">${escapeHTML(String(value))}</div>
                <div class="kpi-description">${escapeHTML(description)}</div>
            </div>
        `;
    }

    // ========================================================
    // ATTENDANCE SUMMARY
    // ========================================================

    function createAttendanceSummary(records) {
        const statusMap = {};

        records.forEach(record => {
            const status = record.status || "Tidak diketahui";
            statusMap[status] = (statusMap[status] || 0) + 1;
        });

        const entries = Object.entries(statusMap);

        if (!entries.length) {
            return createEmptyState("Belum ada data kehadiran.");
        }

        return `
            <div class="summary-list">
                ${entries.map(([status, count]) => `
                    <div class="summary-item">
                        <span>${escapeHTML(status)}</span>
                        <strong>${formatNumber(count)}</strong>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // ========================================================
    // LAB SUMMARY
    // ========================================================

    function createLabSummary(records) {
        const labMap = {};

        records.forEach(record => {
            const lab = record.teachingLocation || "unknown";
            labMap[lab] = (labMap[lab] || 0) + 1;
        });

        const entries = Object.entries(labMap);

        if (!entries.length) {
            return createEmptyState("Belum ada data lab.");
        }

        return `
            <div class="summary-list">
                ${entries.map(([lab, count]) => `
                    <div class="summary-item">
                        <span>${escapeHTML(getLabName(lab))}</span>
                        <strong>${formatNumber(count)}</strong>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // ========================================================
    // ACTIVITY SUMMARY
    // ========================================================

    function createActivitySummary(records) {
        const activityMap = {};

        records.forEach(record => {
            const shifts = [record.shift1, record.shift2, record.shift3, record.shift4, record.shift5];

            shifts.forEach(code => {
                if (code === undefined || code === null || code === "") return;
                activityMap[code] = (activityMap[code] || 0) + 1;
            });
        });

        const entries = Object.entries(activityMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        if (!entries.length) {
            return createEmptyState("Belum ada aktivitas.");
        }

        return `
            <div class="summary-list">
                ${entries.map(([code, count]) => `
                    <div class="summary-item">
                        <span>${escapeHTML(getActivityName(code))}</span>
                        <strong>${formatNumber(count)}</strong>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // ========================================================
    // CALCULATION
    // ========================================================

    function calculateHonor(totalShift) {
        const rate = Number(state.data?.honorConfig?.ratePerShiftPoint) || 2900;
        return Number(totalShift || 0) * rate;
    }

    function calculateAttendanceRate(records) {
        if (!records.length) return 0;

        const present = records.filter(record => {
            const shifts = [record.shift1, record.shift2, record.shift3, record.shift4, record.shift5];
            return shifts.some(code => code !== undefined && code !== null && code !== "" && code !== "0");
        }).length;

        return (present / records.length) * 100;
    }

    // ========================================================
    // LOOKUP - LAB
    // ========================================================

    function getLabName(code) {
        if (!code) return "-";
        const helper = state.data?.helpers?.getLabName;
        if (typeof helper === "function") {
            const res = helper(code);
            if (res && res !== "-") return res;
        }

        const lab = state.data?.labs?.[code];
        if (typeof lab === "object") return lab.shortName || lab.name || code;
        if (typeof lab === "string") return lab;

        if (code === "LAB_D") return "Depok";
        if (code === "LAB_J") return "Kalimalang";
        if (code === "LAB_K") return "Karawaci";

        return code;
    }

    // ========================================================
    // LOOKUP - JOB
    // ========================================================

    function getJobName(code) {
        if (!code) return "PSMURO";
        const helper = state.data?.helpers?.getJobName;
        if (typeof helper === "function") {
            const res = helper(code);
            if (res && res !== "-") return res;
        }

        const job = state.data?.jobs?.[code];
        if (typeof job === "object") return job.name || code;
        if (typeof job === "string") return job;

        if (code === "1" || code === "PSMURO") return "PSMURO";
        return code || "PSMURO";
    }

    // ========================================================
    // LOOKUP - ACTIVITY
    // ========================================================

    function getActivityName(code) {
        if (!code) return "-";
        const helper = state.data?.helpers?.getActivityName;
        if (typeof helper === "function") return helper(code);

        const activity = state.data?.activityCodes?.[code];
        if (typeof activity === "object") return activity.name || code;
        return activity || code;
    }

    // ========================================================
    // LOADING
    // ========================================================

    function showLoading() {
        if (!el.pageContainer) return;
        el.pageContainer.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Memuat data...</p>
            </div>
        `;
    }

    // ========================================================
    // ERROR
    // ========================================================

    function showError(message) {
        if (!el.pageContainer) return;
        el.pageContainer.innerHTML = `
            <div class="error-state">
                <h3>Gagal memuat data</h3>
                <p>${escapeHTML(message || "Terjadi kesalahan.")}</p>
                <button class="btn btn-primary" id="retryButton">Coba Lagi</button>
            </div>
        `;

        document.getElementById("retryButton")?.addEventListener("click", async () => {
            showLoading();
            try {
                await loadData();
                populateFilters();
                renderCurrentPage();
            } catch (error) {
                showError(error.message);
            }
        });
    }

    // ========================================================
    // EMPTY STATE
    // ========================================================

    function createEmptyState(message) {
        return `
            <div class="empty-state">
                <p>${escapeHTML(message)}</p>
            </div>
        `;
    }

    function createEmptyRow(columnCount) {
        return `
            <tr>
                <td colspan="${columnCount}">
                    <div class="empty-state">
                        <p>Tidak ada data.</p>
                    </div>
                </td>
            </tr>
        `;
    }

    // ========================================================
    // SYNC STATUS
    // ========================================================

    function updateSyncStatus(status) {
        if (!el.syncStatus) return;

        switch (status) {
            case "loading":
                el.syncStatus.textContent = "Memuat...";
                el.syncDot?.classList.remove("success", "error");
                break;
            case "success":
                el.syncStatus.textContent = "Tersinkron";
                el.syncDot?.classList.add("success");
                el.syncDot?.classList.remove("error");
                break;
            case "error":
                el.syncStatus.textContent = "Gagal";
                el.syncDot?.classList.add("error");
                el.syncDot?.classList.remove("success");
                break;
        }
    }

    // ========================================================
    // MOBILE SIDEBAR
    // ========================================================

    function setupMobileMenu() {
        el.menuButton?.addEventListener("click", openMobileMenu);
        el.sidebarOverlay?.addEventListener("click", closeMobileMenu);
    }

    function openMobileMenu() {
        el.sidebar?.classList.add("open");
        el.sidebarOverlay?.classList.add("show");
    }

    function closeMobileMenu() {
        el.sidebar?.classList.remove("open");
        el.sidebarOverlay?.classList.remove("show");
    }

    // ========================================================
    // FORMAT - RUPIAH
    // ========================================================

    function formatRupiah(value) {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }).format(Number(value || 0));
    }

    // ========================================================
    // FORMAT - NUMBER
    // ========================================================

    function formatNumber(value) {
        return new Intl.NumberFormat("id-ID").format(Number(value || 0));
    }

    // ========================================================
    // FORMAT - PERCENT
    // ========================================================

    function formatPercent(value) {
        return (Number(value || 0).toFixed(1)) + "%";
    }

    // ========================================================
    // FORMAT - DATE
    // ========================================================

    function formatDate(dateString) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return escapeHTML(String(dateString));
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit", month: "short", year: "numeric"
        }).format(date);
    }

    // ========================================================
    // FORMAT - DATETIME
    // ========================================================

    function formatDateTime(dateString) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return "-";
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        }).format(date);
    }

    // ========================================================
    // FORMAT - PERIOD
    // ========================================================

    function formatPeriod(period) {
        if (!period) return "-";
        const [year, month] = String(period).split("-");
        const date = new Date(Number(year), Number(month) - 1, 1);
        if (Number.isNaN(date.getTime())) return period;
        return new Intl.DateTimeFormat("id-ID", {
            month: "long", year: "numeric"
        }).format(date);
    }

    // ========================================================
    // HTML ESCAPE
    // ========================================================

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // ========================================================
    // SLUGIFY
    // ========================================================

    function slugify(text) {
        return String(text || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    }

})();