/**
 * PSMURO Dashboard - API Layer
 *
 * Tugas file ini:
 * - Menjadi penghubung antara app.js dan sumber data
 * - Membaca data dari Google Sheets Read-Only API
 *
 * PENTING:
 * - Tidak ada fungsi tambah data
 * - Tidak ada fungsi edit data
 * - Tidak ada fungsi hapus data
 * - Website hanya membaca data
 */

window.PSMURO_API = (() => {

    // =========================================================
    // CONFIG
    // =========================================================

    const CONFIG = {
        // true = Google Sheets API
        // false = mock-data.js
        USE_REAL_API: true,

        // URL Web App Apps Script READ-ONLY
        REAL_API_URL:
            "https://script.google.com/macros/s/AKfycbykqguThxeeHnanmT31RHIzDnDLfVVpvAev_POQpA5dj9LViBvE4TzqHfrzGLywVC6aOw/exec",

        // Cache sederhana
        CACHE_DURATION: 60 * 1000
    };


    // =========================================================
    // INTERNAL HELPER
    // =========================================================

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    function ensureMockDataAvailable() {
        if (!window.PSMURO_MOCK) {
            throw new Error(
                "Mock data belum tersedia. Pastikan data/mock-data.js dimuat sebelum api.js."
            );
        }
    }


    // =========================================================
    // MASTER DATA
    // =========================================================

    const ACTIVITY_CODES = {
        "0": "Tidak Hadir",
        "1": "Piket",
        "2": "Rapat",
        "3": "Riset Lab",
        "4": "Piket Lintas Domisili",
        "5": "Rapat Lintas Domisili",
        "6": "Riset Lab Lintas Domisili",
        "7": "PJ Shift Lintas Domisili",
        "8": "PJ Meja Lintas Domisili",
        "9": "-",
        "A": "PJ Shift",
        "B": "PJ Meja",
        "C": "-"
    };


    const LABS = {
        "LAB_D": "Depok",
        "LAB_J": "Kalimalang",
        "LAB_K": "Karawaci"
    };


    const JOBS = {
        "1": "PSMURO",
        "2": "DASAR-MENENGAH",
        "3": "LANJUT"
    };


    const SHIFTS = {
        "A": "07.30–10.00",
        "B": "10.00–12.30",
        "C": "13.00–15.30",
        "D": "15.30–18.00",
        "E": "18.30–21.00"
    };


    const HONOR_CONFIG = {
        ratePerShiftPoint: 2900,
        hoursPerLabShift: 2.5,
        monthlyKas: 30000
    };


    // =========================================================
    // NORMALIZE ATTENDANCE
    // =========================================================

    function normalizeAttendanceRow(row, labName) {

        if (!row) return null;

        // Lewati baris header
        if (
            row["Tanggal"] === "" &&
            row["UID"] === "" &&
            row["Nama"] === ""
        ) {
            return null;
        }

        const assistantName = String(row["Nama"] ?? "").trim();
        const rawJob = String(row["Job"] ?? "").trim();

        return {
            id: createAttendanceId(row),

            date: normalizeDate(row["Tanggal"]),

            uid: String(row["UID"] ?? "").trim(),

            assistantName: assistantName,

            assistantId: slugify(assistantName),

            teachingLocation: labName,

            domicile: String(row["Domisili"] ?? "").trim(),

            job: rawJob || "1",

            shift1: row["Shift 1"] ?? 0,
            mutu1: toNumber(row["Mutu 1"]),

            shift2: row["Shift 2"] ?? 0,
            mutu2: toNumber(row["Mutu 2"]),

            shift3: row["Shift 3"] ?? 0,
            mutu3: toNumber(row["Mutu 3"]),

            shift4: row["Shift 4"] ?? 0,
            mutu4: toNumber(row["Mutu 4"]),

            shift5: row["Shift 5"] ?? 0,
            mutu5: toNumber(row["Mutu 5"]),

            totalShift: toNumber(row["Total Shift"]),

            status: String(row["Status"] ?? "").trim(),

            access: row["Akses"] ?? ""
        };
    }


    function createAttendanceId(row) {
        return [
            row["Tanggal"] ?? "",
            row["UID"] ?? "",
            row["Nama"] ?? "",
            row["Total Shift"] ?? ""
        ].join("_");
    }


    // =========================================================
    // NORMALIZE DATE
    // =========================================================

    function normalizeDate(value) {

        if (!value) return null;

        const text = String(value).trim();
        if (!text) return null;

        // -----------------------------------------------------
        // 1. Format ISO dari Google Apps Script (misal: 2025-11-08T10:04:27.000Z)
        // Catatan: Google Sheets dengan locale US otomatis menukar
        // Tanggal dan Bulan untuk tanggal yang bernilai <= 12.
        // Contoh: '11/08/2025' (11 Ags) terbaca sbg 8 Nov ('2025-11-08').
        // Kita rekonsiliasi kembali ke waktu lokal WIB (UTC+7).
        // -----------------------------------------------------
        if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
            const d = new Date(text);

            if (!isNaN(d.getTime())) {
                const wibDay = (d.getUTCHours() + 7 >= 24)
                    ? d.getUTCDate() + 1
                    : d.getUTCDate();
                const wibMonth = d.getUTCMonth() + 1;
                const wibYear = d.getUTCFullYear();
                const wibHour = (d.getUTCHours() + 7) % 24;
                const minute = d.getUTCMinutes();
                const second = d.getUTCSeconds();

                // Tanggal asli adalah wibMonth, Bulan asli adalah wibDay
                const realDay = wibMonth;
                const realMonth = wibDay;
                const realYear = wibYear;

                const pad = n => String(n).padStart(2, "0");
                return `${realYear}-${pad(realMonth)}-${pad(realDay)}T${pad(wibHour)}:${pad(minute)}:${pad(second)}`;
            }
        }

        // -----------------------------------------------------
        // 2. Format Teks DD/MM/YYYY HH:mm:ss atau HH:mm.ss
        // -----------------------------------------------------
        const match = text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2})[:.](\d{2})[:.](\d{2}))?$/
        );

        if (match) {
            const day = Number(match[1]);
            const month = Number(match[2]);
            const year = Number(match[3]);

            const hour = Number(match[4] || 0);
            const minute = Number(match[5] || 0);
            const second = Number(match[6] || 0);

            const pad = n => String(n).padStart(2, "0");
            return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
        }

        return text;
    }


    // =========================================================
    // NUMBER HELPER
    // =========================================================

    function toNumber(value) {

        if (value === null || value === undefined || value === "") {
            return 0;
        }

        const number = Number(value);

        return isNaN(number) ? 0 : number;
    }


    // =========================================================
    // NORMALIZE ASSISTANTS
    // =========================================================

    function slugify(text) {
        return String(text || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    }


    function buildAssistants(uidData, attendance = []) {

        const assistantsMap = new Map();

        // -----------------------------------------------------
        // 1. Ambil SEMUA assistant dari Data UID (Grouping by Nama)
        // -----------------------------------------------------

        (uidData || []).forEach(row => {

            const uid = String(
                row["UID"] ??
                row["Uid"] ??
                row["uid"] ??
                ""
            ).trim();

            const name = String(
                row["Nama"] ??
                row["Name"] ??
                row["nama"] ??
                ""
            ).trim();

            if (!name && !uid) return;

            // Identitas asisten menggunakan Nama
            const assistantName = name || uid;
            const key = assistantName.toLowerCase();

            const rawDomicile = String(
                row["Domisili"] ??
                row["domisili"] ??
                ""
            ).trim();

            // Default Job untuk mock/demo: 1 = PSMURO
            const rawJob = String(
                row["Job"] ??
                row["job"] ??
                ""
            ).trim();
            const jobCode = rawJob || "1";

            const status = String(
                row["Status"] ??
                row["status"] ??
                "REGISTERED"
            ).trim() || "REGISTERED";

            const access = row["Akses"] ?? row["Access"] ?? row["access"] ?? "";

            if (!assistantsMap.has(key)) {
                assistantsMap.set(key, {
                    id: slugify(assistantName),

                    name: assistantName,

                    uids: uid ? [uid] : [],

                    uid: uid,

                    domicile: rawDomicile,

                    job: jobCode,

                    jobName: JOBS[jobCode] || "PSMURO",

                    status: status,

                    access: access,

                    totalAttendance: 0,

                    totalShift: 0,

                    totalMutu: 0
                });
            } else {
                const assistant = assistantsMap.get(key);

                // Gabungkan UID jika nama memiliki lebih dari satu UID
                if (uid && !assistant.uids.includes(uid)) {
                    assistant.uids.push(uid);
                }

                if (!assistant.domicile && rawDomicile) {
                    assistant.domicile = rawDomicile;
                }

                if (access && !assistant.access) {
                    assistant.access = access;
                }
            }
        });


        // -----------------------------------------------------
        // 2. Tambahkan / perbarui data dari attendance
        // -----------------------------------------------------

        (attendance || []).forEach(record => {

            const uid = String(record.uid || "").trim();
            const name = String(record.assistantName || "").trim();
            const assistantName = name || uid;
            const key = assistantName.toLowerCase();

            if (!key) return;

            if (!assistantsMap.has(key)) {
                assistantsMap.set(key, {
                    id: slugify(assistantName),

                    name: assistantName,

                    uids: uid ? [uid] : [],

                    uid: uid,

                    domicile: record.domicile || "",

                    job: record.job || "1",

                    jobName: JOBS[record.job || "1"] || "PSMURO",

                    status: record.status || "REGISTERED",

                    access: record.access || "",

                    totalAttendance: 0,

                    totalShift: 0,

                    totalMutu: 0
                });
            } else {
                const assistant = assistantsMap.get(key);

                if (uid && !assistant.uids.includes(uid)) {
                    assistant.uids.push(uid);
                }

                if (!assistant.domicile && record.domicile) {
                    assistant.domicile = record.domicile;
                }
            }

            const assistant = assistantsMap.get(key);

            assistant.totalAttendance += 1;

            assistant.totalShift += toNumber(
                record.totalShift
            );

            assistant.totalMutu +=
                toNumber(record.mutu1) +
                toNumber(record.mutu2) +
                toNumber(record.mutu3) +
                toNumber(record.mutu4) +
                toNumber(record.mutu5);
        });


        return Array.from(assistantsMap.values());
    }


    // =========================================================
    // FETCH ONE SHEET
    // =========================================================

    async function fetchSheet(sheetName) {

        const url =
            CONFIG.REAL_API_URL +
            "?sheet=" +
            encodeURIComponent(sheetName);

        const response = await fetch(url, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `Gagal mengambil sheet ${sheetName}. HTTP ${response.status}`
            );
        }

        const json = await response.json();

        if (!json.success) {
            throw new Error(
                json.error ||
                `API gagal membaca sheet ${sheetName}.`
            );
        }

        if (!Array.isArray(json.data)) {
            throw new Error(
                `Format data sheet ${sheetName} tidak valid.`
            );
        }

        return json.data;
    }


    // =========================================================
    // REAL API
    // =========================================================

    async function getRealData() {

        try {

            const [
                depok,
                kalimalang,
                karawaci,
                dataUID
            ] = await Promise.all([

                fetchSheet("Depok"),

                fetchSheet("Kalimalang"),

                fetchSheet("Karawaci"),

                fetchSheet("Data UID")
            ]);


            // -----------------------------------------------------
            // Attendance
            // -----------------------------------------------------

            const attendance = [];


            depok.forEach(row => {

                const record =
                    normalizeAttendanceRow(row, "Depok");

                if (record) {
                    attendance.push(record);
                }
            });


            kalimalang.forEach(row => {

                const record =
                    normalizeAttendanceRow(row, "Kalimalang");

                if (record) {
                    attendance.push(record);
                }
            });


            karawaci.forEach(row => {

                const record =
                    normalizeAttendanceRow(row, "Karawaci");

                if (record) {
                    attendance.push(record);
                }
            });


            // -----------------------------------------------------
            // Assistants (Derived from Data UID)
            // -----------------------------------------------------

            const assistants =
                buildAssistants(dataUID, attendance);


            // -----------------------------------------------------
            // Return
            // -----------------------------------------------------

            return {

                assistants,

                attendance,

                activityCodes: ACTIVITY_CODES,

                labs: LABS,

                jobs: JOBS,

                shifts: SHIFTS,

                honorConfig: HONOR_CONFIG,

                helpers: {

                    calculateEstimatedHonor: totalShift => {

                        return toNumber(totalShift) *
                            HONOR_CONFIG.ratePerShiftPoint;
                    },

                    calculateMutuTotal: record => {

                        return (
                            toNumber(record.mutu1) +
                            toNumber(record.mutu2) +
                            toNumber(record.mutu3) +
                            toNumber(record.mutu4) +
                            toNumber(record.mutu5)
                        );
                    }

                }

            };

        } catch (error) {

            console.warn(
                "Gagal terhubung ke Google Sheets API, beralih ke Mock Data:",
                error
            );

            const fallbackData = await getMockData();
            fallbackData._isFallback = true;
            return fallbackData;
        }
    }


    // =========================================================
    // MOCK API
    // =========================================================

    async function getMockData() {

        ensureMockDataAvailable();

        await delay(200);

        return normalizeMockData(
            window.PSMURO_MOCK
        );
    }


    function normalizeMockData(data) {

        const attendance =
            Array.isArray(data.attendance)
                ? data.attendance
                : [];

        // Derived from Data UID
        let uidSource = [];

        if (Array.isArray(data.dataUID)) {
            uidSource = data.dataUID;
        } else if (Array.isArray(data.assistants)) {
            uidSource = data.assistants.flatMap(a => {
                const uids = Array.isArray(a.uids)
                    ? a.uids
                    : (a.uid ? [a.uid] : []);

                return uids.length > 0
                    ? uids.map(u => ({
                        UID: u,
                        Name: a.name,
                        Domisili: a.domicile,
                        Status: a.status,
                        Job: "1"
                    }))
                    : [{
                        UID: "",
                        Name: a.name,
                        Domisili: a.domicile,
                        Status: a.status,
                        Job: "1"
                    }];
            });
        }

        const assistants = buildAssistants(uidSource, attendance);

        return {

            assistants,

            attendance,

            activityCodes:
                data.activityCodes || {},

            labs:
                data.labs || {},

            jobs:
                data.jobs || {},

            shifts:
                data.shifts || {},

            honorConfig:
                data.honorConfig || {},

            helpers:
                data.helpers || {}

        };
    }


    // =========================================================
    // PUBLIC: GET ALL DATA
    // =========================================================

    async function getAllData() {

        const startTime = Date.now();

        let data;

        if (CONFIG.USE_REAL_API) {

            data = await getRealData();

        } else {

            data = await getMockData();
        }


        const duration =
            Date.now() - startTime;


        const isReal = CONFIG.USE_REAL_API && !data._isFallback;

        return {

            ...data,

            meta: {

                source:
                    isReal
                        ? "Google Sheets API"
                        : "Mock Data",

                fetchedAt:
                    new Date().toISOString(),

                durationMs:
                    duration

            }

        };
    }


    // =========================================================
    // PUBLIC: GET ASSISTANTS
    // =========================================================

    async function getAssistants() {

        const data =
            await getAllData();

        return data.assistants;
    }


    // =========================================================
    // PUBLIC: GET ATTENDANCE
    // =========================================================

    async function getAttendance() {

        const data =
            await getAllData();

        return data.attendance;
    }


    // =========================================================
    // PUBLIC: GET MASTER DATA
    // =========================================================

    async function getMasterData() {

        const data =
            await getAllData();

        return {

            activityCodes:
                data.activityCodes,

            labs:
                data.labs,

            jobs:
                data.jobs,

            shifts:
                data.shifts,

            honorConfig:
                data.honorConfig,

            helpers:
                data.helpers

        };
    }


    // =========================================================
    // PUBLIC: TEST CONNECTION
    // =========================================================

    async function testConnection() {

        try {

            const data =
                await getAllData();

            return {

                success: true,

                source:
                    data.meta.source,

                fetchedAt:
                    data.meta.fetchedAt,

                durationMs:
                    data.meta.durationMs,

                assistantCount:
                    data.assistants.length,

                attendanceCount:
                    data.attendance.length

            };

        } catch (error) {

            return {

                success: false,

                source:
                    CONFIG.USE_REAL_API
                        ? "Google Sheets API"
                        : "Mock Data",

                error:
                    error.message

            };
        }
    }


    // =========================================================
    // PUBLIC API
    // =========================================================

    return {

        getAllData,

        getAssistants,

        getAttendance,

        getMasterData,

        testConnection,

        config: CONFIG

    };

})();