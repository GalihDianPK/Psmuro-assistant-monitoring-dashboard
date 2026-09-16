// /* =========================================================
//    PSMURO MONITORING DASHBOARD
//    MOCK DATA
// ========================================================= */

// /*
//     File ini hanya digunakan untuk DEVELOPMENT / DEMO.

//     Sumber data saat ini:
//         mock-data.js
//             ↓
//         api.js
//             ↓
//         app.js

//     Nanti ketika sudah terhubung Google Sheets,
//     file ini tidak perlu digunakan lagi.
// */


// /* =========================================================
//    1. ASSISTANTS
// ========================================================= */

// const mockAssistants = [
//     {
//         id: "AST001",
//         name: "Ahmad Fauzan",
//         domicile: "LAB_D",
//         domicileName: "Depok",
//         status: "REGISTERED",
//         job: "1",
//         jobName: "PSMURO",
//         uids: ["UID001"],
//     },

//     {
//         id: "AST002",
//         name: "Guswita Arta P",
//         domicile: "LAB_K",
//         domicileName: "Karawaci",
//         status: "REGISTERED",
//         job: "2",
//         jobName: "DASAR-MENENGAH",
//         uids: ["UID002", "UID003"],
//     },

//     {
//         id: "AST003",
//         name: "Vergio Prama D",
//         domicile: "LAB_J",
//         domicileName: "Kalimalang",
//         status: "REGISTERED",
//         job: "3",
//         jobName: "LANJUT",
//         uids: ["UID004"],
//     },

//     {
//         id: "AST004",
//         name: "Aqilla Rahman",
//         domicile: "LAB_D",
//         domicileName: "Depok",
//         status: "REGISTERED",
//         job: "1",
//         jobName: "PSMURO",
//         uids: ["UID005", "UID006"],
//     },

//     {
//         id: "AST005",
//         name: "M Ilham Nofriansyah",
//         domicile: "LAB_J",
//         domicileName: "Kalimalang",
//         status: "REGISTERED",
//         job: "2",
//         jobName: "DASAR-MENENGAH",
//         uids: ["UID007", "UID008"],
//     },

//     {
//         id: "AST006",
//         name: "Shella Sakila D",
//         domicile: "LAB_K",
//         domicileName: "Karawaci",
//         status: "REGISTERED",
//         job: "3",
//         jobName: "LANJUT",
//         uids: ["UID009", "UID010"],
//     },

//     {
//         id: "AST007",
//         name: "Bintang Ramadhan",
//         domicile: "LAB_D",
//         domicileName: "Depok",
//         status: "REGISTERED",
//         job: "1",
//         jobName: "PSMURO",
//         uids: ["UID011"],
//     },

//     {
//         id: "AST008",
//         name: "Rizky Maulana",
//         domicile: "LAB_J",
//         domicileName: "Kalimalang",
//         status: "REGISTERED",
//         job: "2",
//         jobName: "DASAR-MENENGAH",
//         uids: ["UID012"],
//     },
// ];


// /* =========================================================
//    1b. DATA UID (SOURCE RECORDS)
// ========================================================= */

// const mockDataUID = [
//     { UID: "UID001", Name: "Ahmad Fauzan", Domisili: "LAB_D", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID002", Name: "Guswita Arta P", Domisili: "LAB_K", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID003", Name: "Guswita Arta P", Domisili: "LAB_K", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID004", Name: "Vergio Prama D", Domisili: "LAB_J", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID005", Name: "Aqilla Rahman", Domisili: "LAB_D", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID006", Name: "Aqilla Rahman", Domisili: "LAB_D", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID007", Name: "M Ilham Nofriansyah", Domisili: "LAB_J", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID008", Name: "M Ilham Nofriansyah", Domisili: "LAB_J", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID009", Name: "Shella Sakila D", Domisili: "LAB_K", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID010", Name: "Shella Sakila D", Domisili: "LAB_K", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID011", Name: "Bintang Ramadhan", Domisili: "LAB_D", Status: "REGISTERED", Access: 1, Job: "1" },
//     { UID: "UID012", Name: "Rizky Maulana", Domisili: "LAB_J", Status: "REGISTERED", Access: 1, Job: "1" },
// ];


// /* =========================================================
//    2. ATTENDANCE RECORDS
// ========================================================= */

// /*
//     activityCode:

//     0 = Tidak Hadir
//     1 = Piket
//     2 = Rapat
//     3 = Riset Lab
//     4 = Piket Lintas Domisili
//     5 = Rapat Lintas Domisili
//     6 = Riset Lab Lintas Domisili
//     7 = PJ Shift Lintas Domisili
//     8 = PJ Meja Lintas Domisili
//     9 = -
//     A = PJ Shift
//     B = PJ Meja
//     C = -

//     Shift:
//     A = 07.30 - 10.00
//     B = 10.00 - 12.30
//     C = 13.00 - 15.30
//     D = 15.30 - 18.00
//     E = 18.30 - 21.00
// */


// const mockAttendance = [

//     /* =========================
//        1. Ahmad Fauzan
//     ========================== */

//     {
//         id: "ATT001",
//         date: "2026-09-01",
//         uid: "UID001",
//         assistantId: "AST001",
//         assistantName: "Ahmad Fauzan",

//         teachingLocation: "LAB_D",
//         domicile: "LAB_D",

//         job: "1",

//         shift1: "1",
//         mutu1: 2,

//         shift2: "1",
//         mutu2: 1,

//         shift3: "2",
//         mutu3: 1.5,

//         shift4: "3",
//         mutu4: 2.5,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 7,

//         status: "REGISTERED",
//         access: 1,
//     },

//     {
//         id: "ATT002",
//         date: "2026-09-03",
//         uid: "UID001",
//         assistantId: "AST001",
//         assistantName: "Ahmad Fauzan",

//         teachingLocation: "LAB_D",
//         domicile: "LAB_D",

//         job: "1",

//         shift1: "A",
//         mutu1: 5,

//         shift2: "1",
//         mutu2: 1,

//         shift3: "1",
//         mutu3: 1,

//         shift4: "0",
//         mutu4: 0,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 7,

//         status: "REGISTERED",
//         access: 1,
//     },


//     /* =========================
//        2. Guswita Arta P
//     ========================== */

//     {
//         id: "ATT003",
//         date: "2026-09-01",
//         uid: "UID002",
//         assistantId: "AST002",
//         assistantName: "Guswita Arta P",

//         teachingLocation: "LAB_K",
//         domicile: "LAB_K",

//         job: "2",

//         shift1: "0",
//         mutu1: 0,

//         shift2: "6",
//         mutu2: 5,

//         shift3: "6",
//         mutu3: 5,

//         shift4: "6",
//         mutu4: 5,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 15,

//         status: "REGISTERED",
//         access: 1,
//     },

//     {
//         id: "ATT004",
//         date: "2026-09-04",
//         uid: "UID003",
//         assistantId: "AST002",
//         assistantName: "Guswita Arta P",

//         teachingLocation: "LAB_K",
//         domicile: "LAB_K",

//         job: "2",

//         shift1: "2",
//         mutu1: 3,

//         shift2: "1",
//         mutu2: 1.5,

//         shift3: "3",
//         mutu3: 2.5,

//         shift4: "0",
//         mutu4: 0,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 7,

//         status: "REGISTERED",
//         access: 1,
//     },


//     /* =========================
//        3. Vergio Prama D
//     ========================== */

//     {
//         id: "ATT005",
//         date: "2026-09-02",
//         uid: "UID004",
//         assistantId: "AST003",
//         assistantName: "Vergio Prama D",

//         teachingLocation: "LAB_J",
//         domicile: "LAB_J",

//         job: "3",

//         shift1: "1",
//         mutu1: 4,

//         shift2: "6",
//         mutu2: 5,

//         shift3: "6",
//         mutu3: 5,

//         shift4: "6",
//         mutu4: 5,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 19,

//         status: "REGISTERED",
//         access: 1,
//     },

//     {
//         id: "ATT006",
//         date: "2026-09-05",
//         uid: "UID004",
//         assistantId: "AST003",
//         assistantName: "Vergio Prama D",

//         teachingLocation: "LAB_J",
//         domicile: "LAB_J",

//         job: "3",

//         shift1: "3",
//         mutu1: 5,

//         shift2: "A",
//         mutu2: 3,

//         shift3: "1",
//         mutu3: 1,

//         shift4: "B",
//         mutu4: 2,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 11,

//         status: "REGISTERED",
//         access: 1,
//     },


//     /* =========================
//        4. Aqilla Rahman
//     ========================== */

//     {
//         id: "ATT007",
//         date: "2026-09-01",
//         uid: "UID005",
//         assistantId: "AST004",
//         assistantName: "Aqilla Rahman",

//         teachingLocation: "LAB_D",
//         domicile: "LAB_D",

//         job: "1",

//         shift1: "3",
//         mutu1: 5,

//         shift2: "1",
//         mutu2: 1,

//         shift3: "B",
//         mutu3: 2,

//         shift4: "0",
//         mutu4: 0,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 8,

//         status: "REGISTERED",
//         access: 1,
//     },

//     {
//         id: "ATT008",
//         date: "2026-09-06",
//         uid: "UID006",
//         assistantId: "AST004",
//         assistantName: "Aqilla Rahman",

//         teachingLocation: "LAB_D",
//         domicile: "LAB_D",

//         job: "1",

//         shift1: "A",
//         mutu1: 5,

//         shift2: "2",
//         mutu2: 1.5,

//         shift3: "1",
//         mutu3: 1,

//         shift4: "1",
//         mutu4: 1,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 8.5,

//         status: "REGISTERED",
//         access: 1,
//     },


//     /* =========================
//        5. M Ilham Nofriansyah
//     ========================== */

//     {
//         id: "ATT009",
//         date: "2026-09-02",
//         uid: "UID007",
//         assistantId: "AST005",
//         assistantName: "M Ilham Nofriansyah",

//         teachingLocation: "LAB_J",
//         domicile: "LAB_J",

//         job: "2",

//         shift1: "2",
//         mutu1: 3,

//         shift2: "1",
//         mutu2: 1.5,

//         shift3: "3",
//         mutu3: 2.5,

//         shift4: "0",
//         mutu4: 0,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 7,

//         status: "REGISTERED",
//         access: 1,
//     },

//     {
//         id: "ATT010",
//         date: "2026-09-07",
//         uid: "UID008",
//         assistantId: "AST005",
//         assistantName: "M Ilham Nofriansyah",

//         teachingLocation: "LAB_J",
//         domicile: "LAB_J",

//         job: "2",

//         shift1: "1",
//         mutu1: 4,

//         shift2: "5",
//         mutu2: 3,

//         shift3: "1",
//         mutu3: 1.5,

//         shift4: "A",
//         mutu4: 3,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 11.5,

//         status: "REGISTERED",
//         access: 1,
//     },


//     /* =========================
//        6. Shella Sakila D
//     ========================== */

//     {
//         id: "ATT011",
//         date: "2026-09-03",
//         uid: "UID009",
//         assistantId: "AST006",
//         assistantName: "Shella Sakila D",

//         teachingLocation: "LAB_K",
//         domicile: "LAB_K",

//         job: "3",

//         shift1: "3",
//         mutu1: 5,

//         shift2: "1",
//         mutu2: 2,

//         shift3: "0",
//         mutu3: 0,

//         shift4: "B",
//         mutu4: 2,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 9,

//         status: "REGISTERED",
//         access: 1,
//     },

//     {
//         id: "ATT012",
//         date: "2026-09-08",
//         uid: "UID010",
//         assistantId: "AST006",
//         assistantName: "Shella Sakila D",

//         teachingLocation: "LAB_K",
//         domicile: "LAB_K",

//         job: "3",

//         shift1: "A",
//         mutu1: 5,

//         shift2: "1",
//         mutu2: 2,

//         shift3: "2",
//         mutu3: 1.5,

//         shift4: "3",
//         mutu4: 2.5,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 11,

//         status: "REGISTERED",
//         access: 1,
//     },


//     /* =========================
//        7. Bintang Ramadhan
//     ========================== */

//     {
//         id: "ATT013",
//         date: "2026-09-04",
//         uid: "UID011",
//         assistantId: "AST007",
//         assistantName: "Bintang Ramadhan",

//         teachingLocation: "LAB_D",
//         domicile: "LAB_D",

//         job: "1",

//         shift1: "1",
//         mutu1: 2,

//         shift2: "1",
//         mutu2: 1,

//         shift3: "1",
//         mutu3: 1,

//         shift4: "A",
//         mutu4: 3,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 7,

//         status: "REGISTERED",
//         access: 1,
//     },


//     /* =========================
//        8. Rizky Maulana
//     ========================== */

//     {
//         id: "ATT014",
//         date: "2026-09-05",
//         uid: "UID012",
//         assistantId: "AST008",
//         assistantName: "Rizky Maulana",

//         teachingLocation: "LAB_J",
//         domicile: "LAB_J",

//         job: "2",

//         shift1: "2",
//         mutu1: 3,

//         shift2: "1",
//         mutu2: 1.5,

//         shift3: "1",
//         mutu3: 1.5,

//         shift4: "B",
//         mutu4: 2,

//         shift5: "0",
//         mutu5: 0,

//         totalShift: 8,

//         status: "REGISTERED",
//         access: 1,
//     },
// ];


// /* =========================================================
//    3. ACTIVITY INFORMATION
// ========================================================= */

// const mockActivityCodes = {
//     "0": {
//         code: "0",
//         name: "Tidak Hadir",
//         category: "Tidak Hadir",
//     },

//     "1": {
//         code: "1",
//         name: "Piket",
//         category: "Piket",
//     },

//     "2": {
//         code: "2",
//         name: "Rapat",
//         category: "Rapat",
//     },

//     "3": {
//         code: "3",
//         name: "Riset Lab",
//         category: "Riset",
//     },

//     "4": {
//         code: "4",
//         name: "Piket Lintas Domisili",
//         category: "Piket",
//     },

//     "5": {
//         code: "5",
//         name: "Rapat Lintas Domisili",
//         category: "Rapat",
//     },

//     "6": {
//         code: "6",
//         name: "Riset Lab Lintas Domisili",
//         category: "Riset",
//     },

//     "7": {
//         code: "7",
//         name: "PJ Shift Lintas Domisili",
//         category: "PJ",
//     },

//     "8": {
//         code: "8",
//         name: "PJ Meja Lintas Domisili",
//         category: "PJ",
//     },

//     "9": {
//         code: "9",
//         name: "-",
//         category: "Lainnya",
//     },

//     "A": {
//         code: "A",
//         name: "PJ Shift",
//         category: "PJ",
//     },

//     "B": {
//         code: "B",
//         name: "PJ Meja",
//         category: "PJ",
//     },

//     "C": {
//         code: "C",
//         name: "-",
//         category: "Lainnya",
//     },
// };


// /* =========================================================
//    4. LABORATORY INFORMATION
// ========================================================= */

// const mockLabs = {
//     LAB_D: {
//         code: "LAB_D",
//         name: "Lab Depok",
//         shortName: "Depok",
//     },

//     LAB_J: {
//         code: "LAB_J",
//         name: "Lab Kalimalang",
//         shortName: "Kalimalang",
//     },

//     LAB_K: {
//         code: "LAB_K",
//         name: "Lab Karawaci",
//         shortName: "Karawaci",
//     },
// };


// /* =========================================================
//    5. JOB INFORMATION
// ========================================================= */

// const mockJobs = {
//     "1": {
//         code: "1",
//         name: "PSMURO",
//     },

//     "2": {
//         code: "2",
//         name: "DASAR-MENENGAH",
//     },

//     "3": {
//         code: "3",
//         name: "LANJUT",
//     },
// };


// /* =========================================================
//    6. SHIFT INFORMATION
// ========================================================= */

// const mockShifts = {
//     A: {
//         code: "A",
//         name: "Shift A",
//         time: "07.30 - 10.00",
//     },

//     B: {
//         code: "B",
//         name: "Shift B",
//         time: "10.00 - 12.30",
//     },

//     C: {
//         code: "C",
//         name: "Shift C",
//         time: "13.00 - 15.30",
//     },

//     D: {
//         code: "D",
//         name: "Shift D",
//         time: "15.30 - 18.00",
//     },

//     E: {
//         code: "E",
//         name: "Shift E",
//         time: "18.30 - 21.00",
//     },
// };


// /* =========================================================
//    7. HONOR CONFIGURATION
// ========================================================= */

// const mockHonorConfig = {

//     /*
//         Finance:
//         Total Shift × Rp2.900
//     */

//     ratePerShiftPoint: 2900,

//     /*
//         1 lab shift = 2.5 hours
//     */

//     hoursPerLabShift: 2.5,

//     /*
//         Monthly kas.
//         Ini hanya untuk referensi / simulasi.
//         Bukan bagian dari Total Shift.
//     */

//     monthlyKas: 30000,
// };


// /* =========================================================
//    8. HELPER FUNCTIONS
// ========================================================= */


// /*
//     Mendapatkan nama lab
// */

// function getLabName(code) {
//     return mockLabs[code]?.name || code || "-";
// }


// /*
//     Mendapatkan nama job
// */

// function getJobName(code) {
//     return mockJobs[code]?.name || code || "-";
// }


// /*
//     Mendapatkan nama aktivitas
// */

// function getActivityName(code) {
//     return mockActivityCodes[code]?.name || code || "-";
// }


// /*
//     Menghitung total shift dari nilai Mutu.

//     Catatan:
//     Untuk demo, fungsi ini hanya sebagai helper.

//     Nilai source `totalShift` tetap dipertahankan.
// */

// function calculateMutuTotal(record) {

//     return (
//         Number(record.mutu1 || 0) +
//         Number(record.mutu2 || 0) +
//         Number(record.mutu3 || 0) +
//         Number(record.mutu4 || 0) +
//         Number(record.mutu5 || 0)
//     );
// }


// /*
//     Menghitung estimasi honor
// */

// function calculateEstimatedHonor(totalShift) {

//     return Number(totalShift || 0) *
//         mockHonorConfig.ratePerShiftPoint;
// }


// /* =========================================================
//    9. EXPORT / GLOBAL DATA
// ========================================================= */

// /*
//     Karena project kita menggunakan JavaScript biasa
//     tanpa framework/module bundler, data dibuat global.

//     api.js nantinya akan membaca data dari sini.
// */

// window.PSMURO_MOCK = {

//     dataUID: mockDataUID,

//     assistants: mockAssistants,

//     attendance: mockAttendance,

//     activityCodes: mockActivityCodes,

//     labs: mockLabs,

//     jobs: mockJobs,

//     shifts: mockShifts,

//     honorConfig: mockHonorConfig,

//     helpers: {
//         getLabName,
//         getJobName,
//         getActivityName,
//         calculateMutuTotal,
//         calculateEstimatedHonor,
//     },

// };