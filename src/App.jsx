import React, { useState, useMemo } from "react";

const T = {
  paper: "#FBF3F6",
  paperDeep: "#F5E1EA",
  ink: "#2E2333",
  inkSoft: "#7C6579",
  eosin: "#C4507A",
  eosinDeep: "#9C3860",
  hema: "#6B4E93",
  hemaDeep: "#4F3A70",
  amber: "#8C3F73",
  amberDeep: "#6B2F58",
  line: "#E8D3DE",
  ok: "#4C7A57",
  info: "#7A5A9E",
  warn: "#B8802E",
};

const SECTIONS = [
  { id: "spesimen", label: "Sediaan" },
  { id: "makro", label: "Makroskopik" },
  { id: "mikro", label: "Mikroskopik" },
  { id: "staging", label: "Staging" },
  { id: "ihk", label: "Imunohistokimia" },
  { id: "hasil", label: "Laporan" },
];

const PERSEN_OPTIONS = ["0%", "1%", "5%", "10%", "20%", "30%", "50%", "70%", "90%", "100%"];
const HORMONE_TIER_OPTIONS = ["<20%", "20-50%", "50-80%", ">80%"];
const TUMOR_BED_DEFAULT = "Tampak fibrosis stroma, makrofag berpigmen hemosiderin, dan sebukan limfosit kronik sebagai tanda regresi tumor pasca-terapi neoadjuvan, tanpa residual karsinoma invasif.";
const VERIFY_NOTE = "Verifikasi ulang sesuai temuan mikroskopis.";

const HISTOLOGI_OPTIONS = [
  "Invasive carcinoma of No Special Type",
  "Invasive lobular carcinoma",
  "Invasive micropapillary carcinoma",
  "Mucinous carcinoma",
  "Tubular carcinoma",
  "Papillary carcinoma",
  "Invasive cribriform carcinoma",
  "Invasive apocrine carcinoma",
  "Metaplastic carcinoma",
  "DCIS murni, tanpa komponen invasif",
  "Mixed invasive carcinoma (NST + tipe khusus)",
];
const ICDO_CODES = {
  "Invasive carcinoma of No Special Type": "8500/3",
  "Invasive lobular carcinoma": "8520/3",
  "Invasive micropapillary carcinoma": "8507/3",
  "Mucinous carcinoma": "8480/3",
  "Tubular carcinoma": "8211/3",
  "Papillary carcinoma": "8503/3",
  "Invasive cribriform carcinoma": "8201/3",
  "Invasive apocrine carcinoma": "8401/3",
  "Metaplastic carcinoma": "8575/3",
  "DCIS murni, tanpa komponen invasif": "8500/2",
};

const ARSITEKTUR_MAP = {
  "Invasive lobular carcinoma": 'tersusun diskohesif memberi gambaran "indian file" (single file), sel-sel kecil relatif monoton',
  "Mucinous carcinoma": "tersusun berkelompok kecil mengapung dalam danau musin ekstraselular",
  "Tubular carcinoma": "membentuk tubulus, berbentuk angular, dilapisi satu lapis sel epitel, lumen terbuka, tanpa lapisan mioepitel",
  "Papillary carcinoma": "berstruktur papiler dengan fibrovascular core dilapisi sel epitel neoplastik",
  "Invasive cribriform carcinoma": "tersusun membentuk struktur cribriform, sarang-sarang sel ganas berlubang-lubang oleh ruang bulat multipel, sel berukuran kecil-sedang dengan sitoplasma amfofilik, kromatin halus",
  "Invasive micropapillary carcinoma": "tersusun berkelompok kecil menyerupai morula (berry-like), tanpa fibrovascular core, dikelilingi ruang kosong (clear space) menyerupai retraksi, dengan polaritas terbalik (reverse polarity)",
  "Invasive apocrine carcinoma": "tersusun membentuk sarang/lembaran sel dengan sitoplasma eosinofilik granular melimpah menyerupai diferensiasi apokrin, inti besar pleomorfik dengan anak inti prominent",
};

const METAPLASTIK_OPTIONS = ["Low-grade adenosquamous carcinoma", "Fibromatosis-like metaplastic carcinoma", "Squamous cell carcinoma", "Spindle cell carcinoma", "Dengan diferensiasi mesenkimal heterolog"];

const METAPLASTIK_MAP = {
  "Low-grade adenosquamous carcinoma": "pola infiltratif dengan kelenjar kecil dan sarang skuamosa berdiferensiasi baik, menyerupai lesi sklerosis jinak, grade rendah",
  "Fibromatosis-like metaplastic carcinoma": "proliferasi sel spindel bland menyerupai fibromatosis, atipia minimal",
  "Squamous cell carcinoma": "sel-sel epitel skuamosa dengan jembatan interseluler dan/atau keratinisasi",
  "Spindle cell carcinoma": "proliferasi sel spindel dengan pola fascicular/storiform, menyerupai sarkoma",
  "Dengan diferensiasi mesenkimal heterolog": "komponen epitel bertransisi menjadi matriks mesenkimal heterolog (kondroid/osteoid/rhabdomyoid)",
};
const MIXED_KEDUA_OPTIONS = HISTOLOGI_OPTIONS.filter((o) => o !== "Invasive carcinoma of No Special Type" && o !== "Mixed invasive carcinoma (NST + tipe khusus)" && o !== "DCIS murni, tanpa komponen invasif");
const SEBUKAN_OPTIONS = ["Sel plasma", "Histiosit", "Neutrofil", "Eosinofil", "Sel datia berinti banyak"];
const STROMA_OPTIONS = ["Desmoplastik", "Hialinisasi", "Fibrosis", "Infiltrasi limfositik dominan", "Kalsifikasi"];
const MARGIN_KEYS = [
  { key: "superior", label: "Superior" },
  { key: "inferior", label: "Inferior" },
  { key: "medial", label: "Medial" },
  { key: "lateral", label: "Lateral" },
  { key: "dasar", label: "Dasar sayatan" },
];
const MASTEKTOMI_DEFAULT_JARINGAN = ["Massa", "Papila mammae", "Kulit", "Batas sayatan Superior", "Batas sayatan Inferior", "Batas sayatan Medial", "Batas sayatan Lateral", "Dasar sayatan", "Nodul"];

function marginDraft(label, ganas, komposisi) {
  if (!ganas) return "Belum diisi.";
  const isDasar = label.toLowerCase().includes("dasar");
  if (ganas === "Belum bebas") {
    if (isDasar) return `Sediaan dasar sayatan menunjukkan infiltrasi sel-sel ganas mengenai ${komposisi || "jaringan lemak dan otot"}, dengan morfologi serupa massa tumor primer.`;
    return `Sediaan batas sayatan ${label.toLowerCase()} menunjukkan infiltrasi sel-sel ganas hingga mengenai tepi sayatan, dengan morfologi serupa massa tumor primer.`;
  }
  if (isDasar) return `Sediaan dasar sayatan berupa ${komposisi || "jaringan lemak matur dan stroma jaringan ikat fibrous"}. Tak tampak tanda ganas.`;
  return `Sediaan batas sayatan ${label.toLowerCase()} menunjukkan potongan jaringan terdiri atas jaringan lemak matur dan stroma jaringan ikat fibrous. Tak tampak tanda ganas.`;
}
function strukturDraft(kata, ganas, kedalaman) {
  if (!ganas) return "Belum diisi.";
  if (ganas === "Ya") return `Sediaan ${kata} menunjukkan infiltrasi sel-sel ganas hingga ke lapisan ${kedalaman ? kedalaman.toLowerCase() : "epidermis"}, dengan morfologi serupa massa tumor primer.`;
  return `Sediaan ${kata} menunjukkan potongan jaringan dilapisi epidermis dan epitel gepeng berlapis berkeratin, stroma jaringan ikat fibrous. Tak tampak tanda ganas.`;
}
function initMargins() {
  const m = {};
  MARGIN_KEYS.forEach((mk) => (m[mk.key] = { jarak: "", ganas: "", deskripsi: "", komposisi: "" }));
  return m;
}

function makeInitialData() {
  return {
  jenisKelamin: "",
  jenisTindakan: "",
  spesimenTambahan: "",
  lateralitas: "",
  usiaPasien: "",
  diagnosisKlinis: "",

  ukuranSpesimenP: "",
  ukuranSpesimenL: "",
  ukuranSpesimenT: "",
  ukuranTumorMakroP: "",
  ukuranTumorMakroL: "",
  ukuranTumorMakroT: "",
  konsistensi: "",
  warnaMakro: "",
  batasTumorMakro: "",
  papilaAda: "",
  papilaKelainan: "",
  kulitAda: "",
  kulitUkuranP: "",
  kulitUkuranL: "",
  kulitKelainan: "",
  axillaryTailAda: "",
  kgbDiperiksa: "",
  kgbUkuranTerkecil: "",
  kgbUkuranTerbesar: "",
  margins: initMargins(),
  cetakStatus: "",
  jaringanList: [],
  makrosDeskripsi: "",

  papilaMikroGanas: "",
  papilaMikroKedalaman: "",
  papilaMikroDeskripsi: "",
  kulitMikroGanas: "",
  kulitMikroKedalaman: "",
  kulitMikroDeskripsi: "",

  kgbPositif: "",

  pcrToggle: "",
  tumorBedDeskripsi: "",

  jenisHistologi: "",
  diagnosisManual: "",
  ukuranTumor: "",
  massaEpidermis: "",
  tubulePersen: "",
  polaArsitektur: "",
  bentukSel: "",
  pleomorfikLevel: "",
  anakInti: "",
  mitosisPerMM2: "",
  tilsPersen: "",
  sebukanJenis: [],
  sebukanIntensitas: "",
  reaksiStroma: [],
  lvi: "",
  perineural: "",
  nippleInvolvement: "",
  skinInvolvement: "",
  dcisAda: "",
  dcisGrade: "",
  dcisNekrosis: "",
  lcisAda: "",
  lcisTipe: "",
  massaDeskripsi: "",

  mixedTipeKedua: "",
  mixedProporsiNST: "",
  mixedProporsiKedua: "",
  metaplastikKomponen: [],
  tubuleScore2: "",
  nuclearScore2: "",
  mitoticScore2: "",

  chestWallExtension: "",
  skinUlcerationSatelliteEdema: "",
  inflammatoryClinical: "",
  pM: "",
  rcbAda: "",
  rcbD1: "",
  rcbD2: "",
  rcbCellularity: "",
  rcbInsitu: "",
  rcbLNPositif: "",
  rcbDmet: "",

  ihkStatus: "",
  erPewarnaan: "",
  erIntensitas: "",
  erPersenTier: "",
  prPewarnaan: "",
  prIntensitas: "",
  prPersenTier: "",
  her2Pewarnaan: "",
  her2Kelengkapan: "",
  her2Intensitas: "",
  her2Persen: "",
  ki67Persen: "",

  makrosB: "",
  mikrosB: "",
  kesimpulanB: "",

  catatanTambahan: "",
  };
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: T.inkSoft, marginBottom: 5, fontFamily: "'IBM Plex Sans', sans-serif" }}>{label}</span>
      {children}
    </label>
  );
}
const inputBase = { width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: 6, border: `1px solid ${T.line}`, background: "#fff", color: T.ink, fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", outline: "none" };
function TextInput({ value, onChange, placeholder, mono }) {
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputBase, fontFamily: mono ? "'IBM Plex Mono', monospace" : inputBase.fontFamily }} />;
}
function NumUnit({ value, onChange, placeholder, unit }) {
  return (
    <div style={{ position: "relative" }}>
      <input type="text" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputBase, paddingRight: 30, fontFamily: "'IBM Plex Mono', monospace" }} />
      <span style={{ position: "absolute", right: 10, top: 9, fontSize: 12, color: T.inkSoft }}>{unit}</span>
    </div>
  );
}
function DimRow({ dims, values, onChange, unit }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {dims.map((d, i) => (
        <React.Fragment key={d}>
          {i > 0 && <span style={{ color: T.inkSoft, fontSize: 13 }}>X</span>}
          <NumUnit value={values[i]} onChange={(v) => onChange(i, v)} placeholder={d} unit={unit} />
        </React.Fragment>
      ))}
    </div>
  );
}
function TextArea({ value, onChange, placeholder, rows }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows || 3} style={{ ...inputBase, resize: "vertical", lineHeight: 1.5 }} />;
}
function VerifyNote() {
  return <div style={{ fontSize: 11.5, color: T.warn, marginTop: 4, marginBottom: 10 }}>⚠️ {VERIFY_NOTE}</div>;
}
function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputBase, appearance: "none", cursor: "pointer" }}>
      <option value="">{placeholder || "Pilih..."}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
function ChoiceRow({ value, onChange, options }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((o) => {
        const active = value === o;
        return (
          <button key={o} type="button" onClick={() => onChange(active ? "" : o)} style={{ padding: "7px 13px", borderRadius: 20, border: `1px solid ${active ? T.eosinDeep : T.line}`, background: active ? T.eosin : "#fff", color: active ? "#fff" : T.ink, fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", transition: "all 0.12s ease" }}>
            {o}
          </button>
        );
      })}
    </div>
  );
}
function MultiChip({ values, onChange, options }) {
  const toggle = (o) => (values.includes(o) ? onChange(values.filter((v) => v !== o)) : onChange([...values, o]));
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((o) => {
        const active = values.includes(o);
        return (
          <button key={o} type="button" onClick={() => toggle(o)} style={{ padding: "7px 13px", borderRadius: 20, border: `1px solid ${active ? T.hemaDeep : T.line}`, background: active ? T.hema : "#fff", color: active ? "#fff" : T.ink, fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Sans', sans-serif", transition: "all 0.12s ease" }}>
            {o}
          </button>
        );
      })}
    </div>
  );
}
function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, margin: 0, color: T.ink, fontWeight: 600 }}>{title}</h2>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: T.inkSoft }}>{sub}</p>}
    </div>
  );
}
function InfoBox({ children, warn }) {
  return <div style={{ marginTop: 6, marginBottom: 14, padding: "10px 14px", background: warn ? T.warn : T.info, color: "#fff", borderRadius: 8, fontSize: 13, lineHeight: 1.5 }}>{children}</div>;
}

function pctNum(s) {
  const n = parseFloat(String(s).replace("%", ""));
  return isNaN(n) ? 0 : n;
}
function parseSizeMM(str) {
  if (!str) return null;
  const m = String(str).match(/([\d.,]+)/);
  if (!m) return null;
  const num = parseFloat(m[1].replace(",", "."));
  if (isNaN(num)) return null;
  return /mm/i.test(str) ? num : num * 10;
}
function computeTubuleScore(persenStr) {
  if (!persenStr) return null;
  const p = pctNum(persenStr);
  if (p > 75) return "1";
  if (p >= 10) return "2";
  return "3";
}
function levelToScore(level) {
  return { Ringan: "1", Sedang: "2", Berat: "3" }[level] || null;
}
function computeMitoticScore(perMM2) {
  if (perMM2 === "" || perMM2 === undefined || perMM2 === null) return null;
  const n = parseFloat(perMM2);
  if (isNaN(n)) return null;
  if (n < 3) return "1";
  if (n <= 8) return "2";
  return "3";
}
function computeGradeFromScores(t, n, m) {
  if (!t || !n || !m) return null;
  const total = parseInt(t) + parseInt(n) + parseInt(m);
  let grade = "";
  if (total >= 3 && total <= 5) grade = "1";
  else if (total <= 7) grade = "2";
  else if (total <= 9) grade = "3";
  return { total, grade };
}
function pleomorfikSentence(level, anakInti) {
  if (!level) return "";
  const base = {
    Ringan: "pleomorfik ringan, inti bulat oval berukuran kecil, setara dengan sel epitel normal, kontur reguler, kromatin halus",
    Sedang: "pleomorfik sedang, inti membesar 1,5-2 kali ukuran sel normal, vesikuler, dengan variasi ukuran dan bentuk sedang, hiperkromatik, kromatin kasar",
    Berat: "pleomorfik berat, inti vesikuler dengan variasi ukuran dan bentuk nyata, beberapa inti tampak sangat besar dan ireguler, hiperkromatik, kromatin kasar",
  }[level];
  if (anakInti === "Ada") return `${base}, anak inti tampak`;
  if (anakInti === "Tidak ada") return `${base}, anak inti tidak tampak`;
  return base;
}
function computeHer2(d) {
  const persen = pctNum(d.her2Persen);
  if (d.her2Pewarnaan !== "Terpulas") return { skor: "0", kategori: "HER2-null (tidak terpulas)", statusResmi: "Negatif" };
  if (!d.her2Kelengkapan) return null;
  if (d.her2Kelengkapan === "Inkomplit") {
    if (persen <= 10) return { skor: "0 (0+/dengan pewarnaan membran)", kategori: "HER2-ultralow", statusResmi: "Negatif" };
    return { skor: "1+", kategori: "HER2-low", statusResmi: "Negatif" };
  }
  if (d.her2Intensitas === "Kuat" && persen > 10) return { skor: "3+", kategori: "HER2-positive", statusResmi: "Positif" };
  if (d.her2Intensitas) return { skor: "2+", kategori: "Ekuivokal", statusResmi: "Ekuivokal" };
  return null;
}
function computeHormone(pewarnaan) {
  return pewarnaan !== "Terpulas" ? { status: "Negatif" } : { status: "Positif" };
}
function computeSubtype(erStatus, prStatus, her2, ki67Persen) {
  if (!erStatus || !prStatus || !her2) return null;
  if (her2.statusResmi === "Ekuivokal") return { text: null, ekuivokal: true };
  const ki67 = pctNum(ki67Persen);
  const her2Pos = her2.statusResmi === "Positif";
  const hrPos = erStatus === "Positif" || prStatus === "Positif";
  let t;
  if (!hrPos && !her2Pos) t = "Triple negative";
  else if (!hrPos && her2Pos) t = "HER2-enriched (non-luminal)";
  else if (hrPos && her2Pos) t = "Luminal B, HER2-positif";
  else if (ki67 >= 20 || prStatus === "Negatif") t = "Luminal B, HER2-negatif";
  else t = "Luminal A";
  return { text: t, ekuivokal: false };
}
function computeLviPerineuralText(lvi, perineural) {
  if (!lvi || !perineural) return "";
  if (lvi === "Negatif" && perineural === "Negatif") return "Tak tampak invasi limfovaskular maupun perineural.";
  if (lvi === "Positif" && perineural === "Positif") return "Ditemukan invasi limfovaskular dan perineural.";
  if (lvi === "Positif" && perineural === "Negatif") return "Ditemukan invasi limfovaskular. Tidak ditemukan invasi perineural.";
  if (lvi === "Negatif" && perineural === "Positif") return "Ditemukan invasi perineural. Tidak ditemukan invasi limfovaskular.";
  return "";
}
function dcisSentence(d) {
  if (d.dcisAda === "Positif") {
    const map = {
      Rendah: "tersusun pola kribriform, inti monoton bulat dengan kontur licin, ukuran kecil setara sel duktal normal, kromatin halus, mitosis jarang ditemukan",
      Intermediate: "tersusun pola kribriform hingga solid, kromatin kasar bervariasi, anak inti tampak, mitosis jarang ditemukan",
      Tinggi: "tersusun pola solid, inti pleomorfik nyata, kromatin vesikuler kasar terdistribusi ireguler, anak inti prominent, mitosis mudah ditemukan",
    };
    let s = `Pada bagian lain tampak komponen Ductal Carcinoma In Situ (DCIS), berupa proliferasi sel-sel ganas yang masih terbatas di dalam duktus dengan lapisan mioepitel di sekelilingnya masih utuh, belum menembus membran basalis, ${map[d.dcisGrade] || "grade belum ditentukan"}`;
    if (d.dcisNekrosis === "Ada") s += ", disertai nekrosis komedo";
    return s + ".";
  }
  if (d.dcisAda === "Negatif") return "Tidak ditemukan komponen Ductal Carcinoma In Situ (DCIS) pada sediaan ini.";
  return "";
}
function lcisSentence(d) {
  if (d.lcisAda === "Positif") {
    const map = {
      "Classic (CLCIS)": "proliferasi sel-sel epitelial monoton (small cells) mengisi dan melebarkan unit lobular, inti bulat-oval, kromatin halus, dapat ditemukan vakuola intrasitoplasma, tanpa nekrosis komedo",
      "Florid (FLCIS)": "distensi masif asini/duktus oleh sel-sel neoplastik lobular tanpa jaringan ikat interveniens yang berarti, dapat disertai nekrosis sentral",
      "Pleomorphic (PLCIS)": "sel-sel dyskohesif besar dengan pleomorfisme nuklear nyata menyerupai gambaran DCIS derajat tinggi, dapat disertai fitur apokrin dan nekrosis komedo",
    };
    return `Tampak fokus Lobular Carcinoma In Situ (LCIS) berupa ${map[d.lcisTipe] || "gambaran yang belum ditentukan tipenya"}.`;
  }
  if (d.lcisAda === "Negatif") return "Tidak ditemukan komponen Lobular Carcinoma In Situ (LCIS) pada sediaan ini.";
  return "";
}
function computeMassaDraft(d) {
  if (d.pcrToggle === "Ya") return d.tumorBedDeskripsi || "";
  const lat = d.lateralitas ? ` ${d.lateralitas.toLowerCase()}` : "";
  let s = `Potongan jaringan dari massa payudara${lat} terdiri atas `;
  s += d.massaEpidermis === "Ya" ? "epidermis dilapisi epitel gepeng berlapis berkeratin, stroma jaringan ikat fibrokolagen, hiperemik dan sel-sel lemak matur, diantaranya tampak " : "stroma jaringan ikat fibrous dan sel-sel lemak matur, diantaranya tampak ";
  s += "kelompok-kelompok sel-sel ganas ";
  const isMixed = d.jenisHistologi === "Mixed invasive carcinoma (NST + tipe khusus)";
  const isMetaplastic = d.jenisHistologi === "Metaplastic carcinoma";
  const tubularPhrase = d.tubulePersen ? `tersusun membentuk struktur kelenjar kurang lebih ${d.tubulePersen}%` : "";
  if (isMixed) {
    const proporsiNST = d.mixedProporsiNST || "?";
    const proporsiKedua = d.mixedProporsiKedua || "?";
    const nstPart = tubularPhrase ? `${tubularPhrase} (komponen Invasive carcinoma of No Special Type, kurang lebih ${proporsiNST}%)` : `tersusun membentuk struktur kelenjar (komponen Invasive carcinoma of No Special Type, kurang lebih ${proporsiNST}%)`;
    const keduaDesc = ARSITEKTUR_MAP[d.mixedTipeKedua];
    const keduaPart = keduaDesc ? `tersusun ${keduaDesc} (komponen ${d.mixedTipeKedua || "?"}, kurang lebih ${proporsiKedua}%)` : `tersusun pola khas komponen kedua (kurang lebih ${proporsiKedua}%)`;
    s += `${nstPart}, pada bagian lain tampak ${keduaPart}`;
  } else if (isMetaplastic) {
    if (d.metaplastikKomponen && d.metaplastikKomponen.length) {
      s += "menunjukkan " + d.metaplastikKomponen.map((k) => METAPLASTIK_MAP[k]).filter(Boolean).join("; ");
    } else {
      s += "menunjukkan diferensiasi metaplastik (komponen belum ditentukan)";
    }
  } else if (ARSITEKTUR_MAP[d.jenisHistologi]) {
    s += "tersusun " + ARSITEKTUR_MAP[d.jenisHistologi];
    if (d.polaArsitektur) s += `, ${d.polaArsitektur.toLowerCase()}`;
  } else {
    const parts = [];
    if (tubularPhrase) parts.push(tubularPhrase.replace(/^tersusun /, ""));
    if (d.polaArsitektur) parts.push(d.polaArsitektur.toLowerCase());
    s += "tersusun " + (parts.join(", ") || "?");
  }
  s += ". Sel-sel ganas dengan sitoplasma eosinofilik";
  s += d.bentukSel ? `, bentuk sel ${d.bentukSel.toLowerCase()}` : "";
  const pleo = pleomorfikSentence(d.pleomorfikLevel, d.anakInti);
  if (pleo) s += `, ${pleo}`;
  if (d.mitosisPerMM2) s += `, mitosis ${d.mitosisPerMM2}/mm²`;
  s += ".";
  const radangParts = [];
  if (d.tilsPersen) radangParts.push(`limfosit pada stroma intratumoral ${d.tilsPersen}%`);
  if (d.sebukanJenis && d.sebukanJenis.length) {
    const intensitas = d.sebukanIntensitas ? d.sebukanIntensitas.toLowerCase() : "";
    radangParts.push(`sebukan ${intensitas} ${d.sebukanJenis.join(", ").toLowerCase()}`.replace("  ", " "));
  }
  let stromaRadang = d.reaksiStroma && d.reaksiStroma.length
    ? `Sel-sel ganas menginfiltrasi stroma jaringan ikat fibrous disertai reaksi ${d.reaksiStroma.join(", ").toLowerCase()}`
    : "Sel-sel ganas menginfiltrasi stroma jaringan ikat fibrous";
  if (radangParts.length) stromaRadang += `, disertai sel-sel radang ${radangParts.join(", dan ")}`;
  stromaRadang += ".";
  s += ` ${stromaRadang}`;
  if (d.dcisAda === "Negatif" && d.lcisAda === "Negatif") {
    s += " Tidak ditemukan komponen Ductal Carcinoma In Situ (DCIS) dan Lobular Carcinoma In Situ (LCIS) pada sediaan ini.";
  } else {
    const dcisS = dcisSentence(d);
    if (dcisS) s += ` ${dcisS}`;
    const lcisS = lcisSentence(d);
    if (lcisS) s += ` ${lcisS}`;
  }
  const lviText = computeLviPerineuralText(d.lvi, d.perineural);
  if (lviText) s += ` ${lviText}`;
  return s.trim();
}
function computeKgbMikroText(diperiksa, positif) {
  const total = parseInt(diperiksa);
  const pos = parseInt(positif);
  if (isNaN(total) || total === 0) return "";
  if (isNaN(pos) || pos === 0) return `Ditemukan ${total} kelenjar getah bening dilapisi kapsul jaringan ikat fibrous utuh, mengandung folikel-folikel limfoid dengan sentrum germinativum, disertai sinus histiosit. Tak tampak tanda ganas.`;
  if (pos === total) return `Ditemukan ${total} dari ${total} kelenjar getah bening mengandung infiltrasi sel-sel ganas dengan morfologi serupa massa tumor primer.`;
  return `Ditemukan ${pos} dari ${total} kelenjar getah bening mengandung infiltrasi sel-sel ganas dengan morfologi serupa massa tumor primer; ${total - pos} kelenjar getah bening lainnya menunjukkan gambaran reaktif berupa folikel limfoid dengan sentrum germinativum.`;
}
function computeMarginGroups(margins) {
  const bebas = [];
  const belumBebas = [];
  MARGIN_KEYS.forEach((mk) => {
    const g = margins[mk.key]?.ganas;
    if (g === "Belum bebas") belumBebas.push(mk.label);
    else if (g === "Bebas") bebas.push(mk.label);
  });
  return { bebas, belumBebas };
}
function computeJaringanNumbering(list) {
  let start = 1;
  return list.map((item) => {
    const n = parseInt(item.kaset) || 1;
    const label = n <= 1 ? `${start}.` : `${start}-${start + n - 1}.`;
    start += n;
    return { ...item, label };
  });
}
function isNeoadjuvant(data) {
  return data.rcbAda === "Ada data RCB" || data.pcrToggle === "Ya";
}
function computePT(data, tubuleScore) {
  const prefix = isNeoadjuvant(data) ? "yp" : "p";
  if (data.pcrToggle === "Ya") return { prefix, t: data.dcisAda === "Positif" ? "Tis" : "T0", missing: false };
  if (data.jenisHistologi === "DCIS murni, tanpa komponen invasif") return { prefix, t: "Tis", missing: false };
  const cwe = data.chestWallExtension === "Ya";
  const skin = data.skinUlcerationSatelliteEdema === "Ya" || data.papilaMikroGanas === "Ya" || data.kulitMikroGanas === "Ya";
  const inflame = data.inflammatoryClinical === "Ya";
  if (inflame) return { prefix, t: "T4d", missing: false };
  if (cwe && skin) return { prefix, t: "T4c", missing: false };
  if (cwe) return { prefix, t: "T4a", missing: false };
  if (skin) return { prefix, t: "T4b", missing: false };
  const mm = parseSizeMM(data.ukuranTumor);
  if (mm === null) return { prefix, t: null, missing: true };
  if (mm <= 1) return { prefix, t: "T1mi", missing: false };
  if (mm <= 5) return { prefix, t: "T1a", missing: false };
  if (mm <= 10) return { prefix, t: "T1b", missing: false };
  if (mm <= 20) return { prefix, t: "T1c", missing: false };
  if (mm <= 50) return { prefix, t: "T2", missing: false };
  return { prefix, t: "T3", missing: false };
}
function computePN(data) {
  const prefix = isNeoadjuvant(data) ? "yp" : "p";
  const n = parseInt(data.kgbPositif);
  if (isNaN(n)) return { prefix, n: null, missing: true };
  if (n === 0) return { prefix, n: "N0", missing: false };
  if (n <= 3) return { prefix, n: "N1a", missing: false };
  if (n <= 9) return { prefix, n: "N2a", missing: false };
  return { prefix, n: "N3a", missing: false };
}
function combineStaging(pTObj, pNObj, pM) {
  if (!pTObj || !pNObj || !pTObj.t || !pNObj.n) return null;
  return `${pTObj.prefix}${pTObj.t}${pNObj.n}${pM || "Mx"}`;
}
function computeRCB(d) {
  if (d.rcbAda !== "Ada data RCB") return null;
  const d1 = parseFloat(d.rcbD1);
  const d2 = parseFloat(d.rcbD2);
  const cellularity = parseFloat(d.rcbCellularity);
  const insitu = parseFloat(d.rcbInsitu);
  const LN = parseFloat(d.rcbLNPositif) || 0;
  const dmet = parseFloat(d.rcbDmet) || 0;
  const finv = !isNaN(cellularity) ? (cellularity / 100) * (1 - (isNaN(insitu) ? 0 : insitu / 100)) : 0;
  const primArg = finv > 0 && d1 > 0 && d2 > 0 ? finv * d1 * d2 : 0;
  const primTerm = primArg > 0 ? 1.4 * Math.pow(primArg, 0.17) : 0;
  const metArg = LN > 0 && dmet > 0 ? 4 * (1 - Math.pow(0.75, LN)) * dmet : 0;
  const metTerm = metArg > 0 ? Math.pow(metArg, 0.17) : 0;
  const rcb = primTerm + metTerm;
  let kelas, label;
  if (rcb <= 0) { kelas = "0"; label = "pathologic complete response (pCR)"; }
  else if (rcb <= 1.36) { kelas = "I"; label = "minimal residual disease"; }
  else if (rcb <= 3.28) { kelas = "II"; label = "moderate residual disease"; }
  else { kelas = "III"; label = "extensive residual disease"; }
  return { index: rcb.toFixed(3).replace(".", ","), kelas, label };
}

function computeMakrosDraft(d, isBiopsi) {
  const dims = [d.ukuranSpesimenP, d.ukuranSpesimenL, d.ukuranSpesimenT].filter(Boolean).join("x");
  const lat = d.lateralitas ? ` mammae ${d.lateralitas.toLowerCase()}` : "";
  let s = `Diterima jaringan ${d.jenisTindakan ? d.jenisTindakan.toLowerCase() : "spesimen"}${lat} ukuran ${dims || "?"} cm`;
  const extras = [];
  if (!isBiopsi) {
    if (d.papilaAda === "Ada") extras.push("papila mammae");
    if (d.kulitAda === "Ada") extras.push("kulit");
    if (d.axillaryTailAda === "Ada") extras.push("axillary tail");
  }
  if (extras.length === 1) s += `, disertai ${extras[0]}`;
  else if (extras.length > 1) s += `, disertai ${extras.slice(0, -1).join(", ")}, dan ${extras[extras.length - 1]}`;
  s += ".";
  if (!isBiopsi && d.papilaAda === "Ada" && d.papilaKelainan && d.papilaKelainan !== "Tidak ada kelainan") s += ` Papila mammae tampak ${d.papilaKelainan.toLowerCase()}.`;
  if (!isBiopsi && d.kulitAda === "Ada" && d.kulitKelainan && d.kulitKelainan !== "Tidak ada kelainan") s += ` Kulit tampak ${d.kulitKelainan.toLowerCase()}.`;
  const tumorDims = [d.ukuranTumorMakroP, d.ukuranTumorMakroL, d.ukuranTumorMakroT].filter(Boolean).join("x");
  if (tumorDims || d.warnaMakro || d.konsistensi || d.batasTumorMakro) {
    const objekMassa = d.pcrToggle === "Ya" ? "penampang putih curiga massa" : "massa tumor";
    s += ` Pada pemotongan tampak ${objekMassa} ukuran ${tumorDims || "?"} cm, warna ${d.warnaMakro || "?"}, konsistensi ${d.konsistensi || "?"}, batas ${d.batasTumorMakro ? d.batasTumorMakro.toLowerCase() : "?"}.`;
  }
  if (!isBiopsi) {
    const marginParts = [];
    MARGIN_KEYS.forEach((mk) => {
      if (mk.key === "dasar") return;
      if (d.margins[mk.key].jarak) marginParts.push(`${mk.label.toLowerCase()} ${d.margins[mk.key].jarak} cm`);
    });
    if (marginParts.length) s += ` Jarak massa tumor ke batas sayatan ${marginParts.join(", ")}.`;
    if (d.margins.dasar.jarak || d.margins.dasar.komposisi) {
      s += ` Dasar sayatan${d.margins.dasar.jarak ? ` berjarak ${d.margins.dasar.jarak} cm dari massa tumor,` : ""} berupa ${d.margins.dasar.komposisi || "?"}.`;
    }
    if (d.axillaryTailAda === "Ada" && d.kgbDiperiksa) {
      s += ` Ditemukan ${d.kgbDiperiksa} kelenjar getah bening`;
      if (d.kgbUkuranTerkecil || d.kgbUkuranTerbesar) s += `, ukuran terkecil ${d.kgbUkuranTerkecil || "?"} cm dan terbesar ${d.kgbUkuranTerbesar || "?"} cm`;
      s += ".";
    }
  }
  const numbered = computeJaringanNumbering(d.jaringanList);
  if (numbered.length) {
    if (numbered.length === 1 && d.cetakStatus === "Semua") {
      s += ` Cetak semua, ${numbered[0].kaset || 1} kaset.`;
    } else {
      s += ` Cetak sebagian:\n` + numbered.map((j) => `${j.label} ${j.nama || "(tanpa nama)"}, ${j.kaset || 1} kaset`).join("\n");
    }
  }
  return s.trim();
}

export default function App() {
  const [data, setData] = useState(makeInitialData());
  const [loaded, setLoaded] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [active, setActive] = useState("spesimen");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isBiopsi = data.jenisTindakan === "Biopsi";
  const activeIdx = SECTIONS.findIndex((s) => s.id === active);

  React.useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("draft-case", false);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          setData((d) => ({ ...d, ...parsed }));
        }
      } catch (e) {
        // belum ada draf tersimpan, mulai kosong
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      window.storage.set("draft-case", JSON.stringify(data), false).catch(() => {});
    }, 700);
    return () => clearTimeout(timer);
  }, [data, loaded]);

  const startNewCase = async () => {
    if (!confirmNew) {
      setConfirmNew(true);
      setTimeout(() => setConfirmNew(false), 4000);
      return;
    }
    setData(makeInitialData());
    setReport("");
    setActive("spesimen");
    setConfirmNew(false);
    try {
      await window.storage.delete("draft-case", false);
    } catch (e) {}
  };

  const regenMakros = () => setData((d) => ({ ...d, makrosDeskripsi: computeMakrosDraft(d, isBiopsi) }));


  const set = (key) => (val) => setData((d) => ({ ...d, [key]: val }));
  const setMargin = (key, field) => (val) => setData((d) => ({ ...d, margins: { ...d.margins, [key]: { ...d.margins[key], [field]: val } } }));
  const setMarginGanas = (key) => (val) =>
    setData((d) => {
      const mk = MARGIN_KEYS.find((x) => x.key === key);
      return { ...d, margins: { ...d.margins, [key]: { ...d.margins[key], ganas: val, deskripsi: marginDraft(mk.label, val, d.margins[key].komposisi) } } };
    });
  const regenMargin = (key) => {
    const mk = MARGIN_KEYS.find((x) => x.key === key);
    setData((d) => ({ ...d, margins: { ...d.margins, [key]: { ...d.margins[key], deskripsi: marginDraft(mk.label, d.margins[key].ganas, d.margins[key].komposisi) } } }));
  };

  const filledCount = Object.values(data).filter((v) => (Array.isArray(v) ? v.length > 0 : typeof v === "object" && v !== null ? false : v !== "")).length;

  const togglePcr = () => {
    setData((d) => {
      const next = d.pcrToggle === "Ya" ? "" : "Ya";
      const tumorBed = next === "Ya" && !d.tumorBedDeskripsi ? TUMOR_BED_DEFAULT : d.tumorBedDeskripsi;
      return { ...d, pcrToggle: next, tumorBedDeskripsi: tumorBed };
    });
  };
  const regenMassa = () => setData((d) => ({ ...d, massaDeskripsi: computeMassaDraft(d) }));

  const setPapilaMikroGanas = (val) => setData((d) => ({ ...d, papilaMikroGanas: val, papilaMikroDeskripsi: strukturDraft("papila mammae", val, d.papilaMikroKedalaman) }));
  const setPapilaMikroKedalaman = (val) => setData((d) => ({ ...d, papilaMikroKedalaman: val, papilaMikroDeskripsi: strukturDraft("papila mammae", "Ya", val) }));
  const setKulitMikroGanas = (val) => setData((d) => ({ ...d, kulitMikroGanas: val, kulitMikroDeskripsi: strukturDraft("kulit", val, d.kulitMikroKedalaman) }));
  const setKulitMikroKedalaman = (val) => setData((d) => ({ ...d, kulitMikroKedalaman: val, kulitMikroDeskripsi: strukturDraft("kulit", "Ya", val) }));

  const onJenisTindakanChange = (val) => {
    setData((d) => {
      let jaringanList = d.jaringanList;
      if (val === "Mastektomi" && d.jaringanList.length === 0) {
        jaringanList = MASTEKTOMI_DEFAULT_JARINGAN.map((nama, i) => ({ id: Date.now() + i, nama, kaset: "1" }));
      }
      return { ...d, jenisTindakan: val, jaringanList };
    });
  };
  const addJaringan = () => setData((d) => ({ ...d, jaringanList: [...d.jaringanList, { id: Date.now(), nama: "", kaset: "" }] }));
  const updateJaringan = (id, field, val) => setData((d) => ({ ...d, jaringanList: d.jaringanList.map((j) => (j.id === id ? { ...j, [field]: val } : j)) }));
  const removeJaringan = (id) => setData((d) => ({ ...d, jaringanList: d.jaringanList.filter((j) => j.id !== id) }));
  const moveJaringan = (id, dir) =>
    setData((d) => {
      const list = [...d.jaringanList];
      const idx = list.findIndex((j) => j.id === id);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= list.length) return d;
      [list[idx], list[swapIdx]] = [list[swapIdx], list[idx]];
      return { ...d, jaringanList: list };
    });
  const jaringanNumbered = useMemo(() => computeJaringanNumbering(data.jaringanList), [data.jaringanList]);

  const tubuleScore = useMemo(() => computeTubuleScore(data.tubulePersen), [data.tubulePersen]);
  const nuclearScore = useMemo(() => levelToScore(data.pleomorfikLevel), [data.pleomorfikLevel]);
  const mitoticScore = useMemo(() => computeMitoticScore(data.mitosisPerMM2), [data.mitosisPerMM2]);
  const gradeInfo = useMemo(() => computeGradeFromScores(tubuleScore, nuclearScore, mitoticScore), [tubuleScore, nuclearScore, mitoticScore]);
  const gradeInfo2 = useMemo(() => computeGradeFromScores(data.tubuleScore2, data.nuclearScore2, data.mitoticScore2), [data.tubuleScore2, data.nuclearScore2, data.mitoticScore2]);

  const erResult = useMemo(() => computeHormone(data.erPewarnaan), [data.erPewarnaan]);
  const prResult = useMemo(() => computeHormone(data.prPewarnaan), [data.prPewarnaan]);
  const her2Result = useMemo(() => computeHer2(data), [data.her2Pewarnaan, data.her2Kelengkapan, data.her2Intensitas, data.her2Persen]);
  const subtypeAuto = useMemo(() => computeSubtype(erResult?.status, prResult?.status, her2Result, data.ki67Persen), [erResult, prResult, her2Result, data.ki67Persen]);

  const pTObj = useMemo(() => computePT(data), [data.jenisHistologi, data.chestWallExtension, data.skinUlcerationSatelliteEdema, data.inflammatoryClinical, data.ukuranTumor, data.pcrToggle, data.dcisAda, data.rcbAda, data.papilaMikroGanas, data.kulitMikroGanas]);
  const pNObj = useMemo(() => computePN(data), [data.kgbPositif, data.pcrToggle, data.rcbAda]);
  const stagingCombined = useMemo(() => combineStaging(pTObj, pNObj, data.pM), [pTObj, pNObj, data.pM]);
  const rcbResult = useMemo(() => computeRCB(data), [data.rcbAda, data.rcbD1, data.rcbD2, data.rcbCellularity, data.rcbInsitu, data.rcbLNPositif, data.rcbDmet]);
  const kgbMikroText = useMemo(() => computeKgbMikroText(data.kgbDiperiksa, data.kgbPositif), [data.kgbDiperiksa, data.kgbPositif]);
  const marginGroups = useMemo(() => computeMarginGroups(data.margins), [data.margins]);

  function buildReport() {
    const lat = data.lateralitas || "";
    const jk = data.jenisKelamin ? data.jenisKelamin.toLowerCase() : "?";
    const adaB = !!data.spesimenTambahan;

    let sediaanLine = `Sediaan ${data.jenisTindakan || "?"} mammae ${lat}`;
    if (adaB) sediaanLine += ` dan ${data.spesimenTambahan}`;
    sediaanLine += ` dari ${jk} usia ${data.usiaPasien || "?"} tahun dengan diagnosis klinik ${data.diagnosisKlinis || "tidak tercantum"}.`;

    let makros = "";
    if (adaB) {
      makros = `A. Mammae ${lat}\n${data.makrosDeskripsi || "(belum diisi)"}\n\nB. ${data.spesimenTambahan}\n${data.makrosB || "(belum diisi)"}`;
    } else {
      makros = data.makrosDeskripsi || "(belum diisi)";
    }

    const isMassaName = (n) => n.includes("massa") || n.includes("tumor");
    const massaLabel = data.pcrToggle === "Ya" ? "Penampang putih curiga massa" : null;
    const matchBlock = (nama) => {
      const n = (nama || "").toLowerCase();
      if (isMassaName(n)) return data.pcrToggle === "Ya" ? data.tumorBedDeskripsi || "Belum diisi." : data.massaDeskripsi || "Belum diisi.";
      if (n.includes("papila")) return data.papilaMikroDeskripsi || "Belum diisi.";
      if (n.includes("kulit")) return data.kulitMikroDeskripsi || "Belum diisi.";
      for (const mk of MARGIN_KEYS) {
        if (n.includes(mk.label.toLowerCase()) || (mk.key === "dasar" && n.includes("dasar"))) {
          return data.margins[mk.key]?.deskripsi || "Belum diisi.";
        }
      }
      if (n.includes("nodul") || n.includes("kgb") || n.includes("kelenjar")) return kgbMikroText || "Belum diisi.";
      return "Tak tampak tanda ganas.";
    };
    let mikrosA = jaringanNumbered.length
      ? jaringanNumbered.map((j) => {
          const n = (j.nama || "").toLowerCase();
          const displayNama = isMassaName(n) && massaLabel ? massaLabel : j.nama || "(tanpa nama)";
          return `${j.label} ${displayNama}\n${matchBlock(j.nama)}`;
        }).join("\n\n")
      : (data.pcrToggle === "Ya" ? data.tumorBedDeskripsi : data.massaDeskripsi) || "Belum diisi.";
    let mikros = adaB ? `A. Mammae ${lat}\n${mikrosA}\n\nB. ${data.spesimenTambahan}\n${data.mikrosB || "(belum diisi)"}` : mikrosA;

    const icdoUtama = data.jenisHistologi === "Mixed invasive carcinoma (NST + tipe khusus)" ? ICDO_CODES["Invasive carcinoma of No Special Type"] : ICDO_CODES[data.jenisHistologi];
    const icdoKedua = data.mixedTipeKedua ? ICDO_CODES[data.mixedTipeKedua] : null;

    let diagLine = "";
    if (data.diagnosisManual) {
      diagLine = data.diagnosisManual;
    } else if (data.jenisHistologi === "Mixed invasive carcinoma (NST + tipe khusus)") {
      diagLine = `Mixed invasive carcinoma of No Special Type, grade ${gradeInfo?.grade || "?"} (ICD-O: ${icdoUtama || "?"}) dan ${data.mixedTipeKedua || "?"}, grade ${gradeInfo2?.grade || "?"} (ICD-O: ${icdoKedua || "?"})`;
    } else {
      diagLine = data.jenisHistologi || "(diagnosis belum dipilih)";
      if (icdoUtama) diagLine += ` (ICD-O: ${icdoUtama})`;
      if (!data.pcrToggle && gradeInfo?.grade) diagLine += `, grade ${gradeInfo.grade}`;
      if (marginGroups.belumBebas.length) diagLine += ` dengan batas sayatan ${marginGroups.belumBebas.join(" dan ")} belum bebas tumor`;
    }

    const rcbLabelID = { "pathologic complete response (pCR)": "pathologic complete response (pCR)", "minimal residual disease": "residu penyakit minimal", "moderate residual disease": "residu penyakit sedang", "extensive residual disease": "residu penyakit luas" };

    const bullets = [];
    if (data.dcisAda) bullets.push(`Karsinoma duktal in situ (DCIS): ${data.dcisAda === "Positif" ? "(+) positif" : "(-) negatif"}`);
    if (data.lcisAda) bullets.push(`Karsinoma lobular in situ (LCIS): ${data.lcisAda === "Positif" ? "(+) positif" : "(-) negatif"}`);
    if (!data.pcrToggle && data.ukuranTumor) bullets.push(`Ukuran tumor: ${data.ukuranTumor} (dimensi terbesar)`);
    if (data.kgbDiperiksa) bullets.push(`Jumlah kelenjar getah bening diperiksa: ${data.kgbDiperiksa}`);
    if (data.kgbPositif) bullets.push(`Jumlah kelenjar getah bening terlibat: ${data.kgbPositif}`);
    if (data.lvi) bullets.push(`Invasi limfovaskular: ${data.lvi === "Positif" ? "(+) positif" : "(-) negatif"}`);
    if (data.perineural) bullets.push(`Invasi perineural: ${data.perineural === "Positif" ? "(+) positif" : "(-) negatif"}`);
    if (!isBiopsi) {
      bullets.push(`Keterlibatan papila mammae: ${data.papilaAda !== "Ada" ? "Tidak ditemukan pada sediaan yang diterima" : data.papilaMikroGanas === "Ya" ? "(+) positif" : "(-) negatif"}`);
      bullets.push(`Keterlibatan kulit: ${data.kulitAda !== "Ada" ? "Tidak ditemukan pada sediaan yang diterima" : data.kulitMikroGanas === "Ya" ? "(+) positif" : "(-) negatif"}`);
    }
    if (!data.pcrToggle && data.tilsPersen) bullets.push(`Limfosit infiltrasi tumor (TIL): ${data.tilsPersen}%`);
    if (!isBiopsi && marginGroups.bebas.length) bullets.push(`Batas sayatan ${marginGroups.bebas.join(", ")}: Bebas sel ganas`);
    if (!isBiopsi && marginGroups.belumBebas.length) bullets.push(`Batas sayatan ${marginGroups.belumBebas.join(", ")}: Belum bebas sel ganas`);

    let ihkBlock = "";
    if (data.ihkStatus === "Menyusul") {
      ihkBlock = "\n\nPemeriksaan imunohistokimia (ER, PR, HER2, Ki-67) saat ini sedang dilakukan, hasil menyusul.";
    } else if (data.ihkStatus === "Tidak dapat dilakukan") {
      ihkBlock = "\n\nPemeriksaan imunohistokimia tidak dapat dilakukan karena tidak ditemukan sel-sel ganas pada sediaan ini.";
    } else if (data.ihkStatus === "Bersamaan") {
      const ihkLines = [
        "Pemeriksaan Imunohistokimia:",
        `- Reseptor Estrogen (ER): ${erResult?.status === "Positif" ? "(+) positif" : "(-) negatif"} ${data.erIntensitas || ""}, ${data.erPersenTier || "?"} pada sel-sel tumor`,
        `- Reseptor Progesteron (PR): ${prResult?.status === "Positif" ? "(+) positif" : "(-) negatif"} ${data.prIntensitas || ""}, ${data.prPersenTier || "?"} pada sel-sel tumor`,
        `- Human Epidermal Growth Factor 2 (HER2): ${her2Result?.statusResmi || "?"} (skor ${her2Result?.skor || "?"}, ${her2Result?.kategori || "?"})`,
        `- Ki-67: ${data.ki67Persen || "?"} pada sel-sel tumor`,
      ];
      let subtipeLine;
      if (subtypeAuto?.ekuivokal) {
        subtipeLine = "Subtipe molekuler: Belum dapat ditentukan — status HER2 ekuivokal. Saran: Pemeriksaan FISH/CISH.";
      } else if (subtypeAuto?.text) {
        subtipeLine = `Subtipe molekuler: ${subtypeAuto.text}`;
      }
      ihkBlock = "\n\n" + ihkLines.join("\n") + (subtipeLine ? `\n\n${subtipeLine}` : "");
    }

    let kesimpulanA = `${data.jenisTindakan || "?"} mammae ${lat}:\n${diagLine}\nStaging patologis (AJCC edisi ke-8): ${stagingCombined || "belum dapat ditentukan"}`;
    if (rcbResult) kesimpulanA += `\nBeban kanker residual (RCB): ${rcbResult.index} (kelas ${rcbResult.kelas} — ${rcbLabelID[rcbResult.label] || rcbResult.label})`;
    kesimpulanA += `\n\n${bullets.map((b) => `- ${b}`).join("\n")}`;
    kesimpulanA += ihkBlock;

    let kesimpulan = adaB ? `A. Mammae ${lat}\n${kesimpulanA}\n\nB. ${data.spesimenTambahan}\n${data.kesimpulanB || "(belum diisi)"}` : kesimpulanA;

    return [sediaanLine, "", "Makroskopis:", makros, "", "Mikroskopis:", mikros, "", "Kesimpulan:", kesimpulan].join("\n");
  }

  function generateReport() {
    setError("");
    setLoading(true);
    setTimeout(() => {
      try {
        const text = buildReport();
        setReport(text);
        setActive("hasil");
      } catch (e) {
        setError("Gagal menyusun laporan. Cek kembali data yang sudah diisi.");
      } finally {
        setLoading(false);
      }
    }, 150);
  }

  const goNext = () => {
    if (activeIdx < SECTIONS.length - 1) setActive(SECTIONS[activeIdx + 1].id);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.paperDeep, fontFamily: "'IBM Plex Sans', sans-serif", padding: "28px 16px" }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ibm-plex/6.4.0/css/ibm-plex-sans.min.css" />
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            onClick={startNewCase}
            style={{
              padding: "8px 16px",
              borderRadius: 7,
              border: `1px solid ${confirmNew ? T.eosinDeep : T.line}`,
              background: confirmNew ? T.eosin : "#fff",
              color: confirmNew ? "#fff" : T.inkSoft,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {confirmNew ? "Yakin? Klik lagi untuk hapus semua" : "🗂 Kasus Baru"}
          </button>
        </div>
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: T.eosinDeep, fontWeight: 600, marginBottom: 6 }}>BreastPath ID · Versi Gratis (Tanpa AI)</div>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 28, margin: 0, color: T.ink, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 30 }}>🔬</span> Penyusun Laporan Patologi Anatomi Keganasan Epitelial Payudara
          </h1>
          <p style={{ color: T.inkSoft, fontSize: 13.5, marginTop: 6 }}>oleh dr. Rizki Widya Nur, Sp.PA</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
          <div>
            <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 10, padding: 8, position: "sticky", top: 16 }}>
              {SECTIONS.map((s) => (
                <button key={s.id} onClick={() => setActive(s.id)} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 7, border: "none", background: active === s.id ? T.hema : "transparent", color: active === s.id ? "#fff" : T.ink, fontSize: 13.5, fontWeight: active === s.id ? 600 : 400, cursor: "pointer", marginBottom: 3, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                  {s.label}
                </button>
              ))}
              <div style={{ marginTop: 10, padding: "10px 12px", fontSize: 11.5, color: T.inkSoft, borderTop: `1px solid ${T.line}` }}>{filledCount} kolom terisi</div>
            </div>
          </div>

          <div style={{ background: T.paper, border: `1px solid ${T.line}`, borderRadius: 10, padding: 26, minHeight: 480 }}>
            {active === "spesimen" && (
              <>
                <SectionHeader title="Sediaan" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Jenis kelamin">
                    <ChoiceRow value={data.jenisKelamin} onChange={set("jenisKelamin")} options={["Laki-laki", "Perempuan"]} />
                  </Field>
                  <Field label="Usia pasien (tahun)">
                    <TextInput mono value={data.usiaPasien} onChange={set("usiaPasien")} placeholder="mis. 46" />
                  </Field>
                  <Field label="Jenis tindakan">
                    <Select value={data.jenisTindakan} onChange={onJenisTindakanChange} options={["Biopsi", "Lumpektomi", "Mastektomi", "Eksisi luas (wide excision)"]} />
                  </Field>
                  <Field label="Lateralitas">
                    <ChoiceRow value={data.lateralitas} onChange={set("lateralitas")} options={["Dekstra", "Sinistra", "Bilateral"]} />
                  </Field>
                  <Field label="Spesimen tambahan (opsional, mis. KGB axilla terpisah)">
                    <TextInput value={data.spesimenTambahan} onChange={set("spesimenTambahan")} placeholder="mis. Kelenjar getah bening axilla dekstra" />
                  </Field>
                </div>
                <Field label="Diagnosis klinik">
                  <TextArea value={data.diagnosisKlinis} onChange={set("diagnosisKlinis")} rows={2} placeholder="mis. carcinoma mammae dekstra, residif, post kemoterapi" />
                </Field>
                {data.spesimenTambahan && (
                  <InfoBox>
                    Spesimen B ({data.spesimenTambahan}) — isi Makroskopik B di tab Makroskopik, dan Mikroskopik B + Kesimpulan B di tab Mikroskopik.
                  </InfoBox>
                )}
              </>
            )}

            {active === "makro" && (
              <>
                <SectionHeader title="Gambaran Makroskopik" sub={data.spesimenTambahan ? "Ini untuk Spesimen A saja." : undefined} />
                <Field label="Ukuran spesimen total (P X L X T)">
                  <DimRow dims={["P", "L", "T"]} values={[data.ukuranSpesimenP, data.ukuranSpesimenL, data.ukuranSpesimenT]} unit="cm" onChange={(i, v) => set(["ukuranSpesimenP", "ukuranSpesimenL", "ukuranSpesimenT"][i])(v)} />
                </Field>
                <Field label="Ukuran tumor makroskopik (P X L X T)">
                  <DimRow dims={["P", "L", "T"]} values={[data.ukuranTumorMakroP, data.ukuranTumorMakroL, data.ukuranTumorMakroT]} unit="cm" onChange={(i, v) => set(["ukuranTumorMakroP", "ukuranTumorMakroL", "ukuranTumorMakroT"][i])(v)} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <Field label="Konsistensi (massa tumor)">
                    <TextInput value={data.konsistensi} onChange={set("konsistensi")} placeholder="mis. kenyal" />
                  </Field>
                  <Field label="Warna (massa tumor)">
                    <TextInput value={data.warnaMakro} onChange={set("warnaMakro")} placeholder="mis. putih kekuningan" />
                  </Field>
                  <Field label="Batas tumor">
                    <ChoiceRow value={data.batasTumorMakro} onChange={set("batasTumorMakro")} options={["Tegas", "Tidak tegas"]} />
                  </Field>
                </div>

                {!isBiopsi && (
                  <>
                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                      <Field label="Papila mammae">
                        <ChoiceRow value={data.papilaAda} onChange={set("papilaAda")} options={["Ada", "Tidak ada"]} />
                      </Field>
                      {data.papilaAda === "Ada" && (
                        <Field label="Kelainan papila mammae (makroskopik)">
                          <Select value={data.papilaKelainan} onChange={set("papilaKelainan")} options={["Tidak ada kelainan", "Retraksi", "Ulserasi", "Everted", "Inverted"]} />
                        </Field>
                      )}
                    </div>
                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                      <Field label="Kulit">
                        <ChoiceRow value={data.kulitAda} onChange={set("kulitAda")} options={["Ada", "Tidak ada"]} />
                      </Field>
                      {data.kulitAda === "Ada" && (
                        <>
                          <Field label="Ukuran kulit (P X L)">
                            <DimRow dims={["P", "L"]} values={[data.kulitUkuranP, data.kulitUkuranL]} unit="cm" onChange={(i, v) => set(["kulitUkuranP", "kulitUkuranL"][i])(v)} />
                          </Field>
                          <Field label="Kelainan kulit">
                            <Select value={data.kulitKelainan} onChange={set("kulitKelainan")} options={["Tidak ada kelainan", "Retraksi", "Dimpling/peau d'orange", "Ulserasi", "Edema"]} />
                          </Field>
                        </>
                      )}
                    </div>
                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                      <Field label="Axillary tail">
                        <ChoiceRow value={data.axillaryTailAda} onChange={set("axillaryTailAda")} options={["Ada", "Tidak ada"]} />
                      </Field>
                      {data.axillaryTailAda === "Ada" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                          <Field label="Jumlah KGB ditemukan">
                            <TextInput mono value={data.kgbDiperiksa} onChange={set("kgbDiperiksa")} placeholder="mis. 8" />
                          </Field>
                          <Field label="Ukuran KGB terkecil">
                            <NumUnit value={data.kgbUkuranTerkecil} onChange={set("kgbUkuranTerkecil")} placeholder="0,5" unit="cm" />
                          </Field>
                          <Field label="Ukuran KGB terbesar">
                            <NumUnit value={data.kgbUkuranTerbesar} onChange={set("kgbUkuranTerbesar")} placeholder="2,3" unit="cm" />
                          </Field>
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                      <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Jarak Batas Sayatan</h3>
                      {MARGIN_KEYS.map((mk) => (
                        <div key={mk.key} style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 12, alignItems: "end", marginBottom: 10 }}>
                          <span style={{ fontSize: 13, color: T.ink, paddingBottom: 9 }}>{mk.label}</span>
                          {mk.key !== "dasar" ? (
                            <NumUnit value={data.margins[mk.key].jarak} onChange={setMargin(mk.key, "jarak")} placeholder="Jarak" unit="cm" />
                          ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10 }}>
                              <NumUnit value={data.margins.dasar.jarak} onChange={setMargin("dasar", "jarak")} placeholder="Jarak" unit="cm" />
                              <TextInput value={data.margins.dasar.komposisi} onChange={setMargin("dasar", "komposisi")} placeholder="Dasar sayatan berupa... mis. lemak, fascia, dan otot" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                  <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Cetak Kaset</h3>
                  <Field label="Status cetak">
                    <ChoiceRow value={data.cetakStatus} onChange={set("cetakStatus")} options={["Sebagian", "Semua"]} />
                  </Field>
                  {data.jaringanList.map((j, idx) => (
                    <div key={j.id} style={{ display: "grid", gridTemplateColumns: "1fr 90px 60px 32px", gap: 8, marginBottom: 8, alignItems: "center" }}>
                      <TextInput value={j.nama} onChange={(v) => updateJaringan(j.id, "nama", v)} placeholder="Nama jaringan, mis. Massa" />
                      <TextInput mono value={j.kaset} onChange={(v) => updateJaringan(j.id, "kaset", v)} placeholder="Kaset" />
                      <div style={{ display: "flex", gap: 2 }}>
                        <button onClick={() => moveJaringan(j.id, -1)} disabled={idx === 0} style={{ border: "none", background: "transparent", color: T.hemaDeep, cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1, fontSize: 14 }}>
                          ↑
                        </button>
                        <button onClick={() => moveJaringan(j.id, 1)} disabled={idx === data.jaringanList.length - 1} style={{ border: "none", background: "transparent", color: T.hemaDeep, cursor: idx === data.jaringanList.length - 1 ? "default" : "pointer", opacity: idx === data.jaringanList.length - 1 ? 0.3 : 1, fontSize: 14 }}>
                          ↓
                        </button>
                      </div>
                      <button onClick={() => removeJaringan(j.id)} style={{ border: "none", background: "transparent", color: T.eosinDeep, cursor: "pointer", fontSize: 18 }}>
                        ×
                      </button>
                    </div>
                  ))}
                  <button onClick={addJaringan} style={{ padding: "8px 14px", borderRadius: 7, border: `1px dashed ${T.hema}`, background: "transparent", color: T.hemaDeep, fontSize: 13, cursor: "pointer" }}>
                    + Tambah jaringan
                  </button>
                </div>

                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 15, color: T.eosinDeep, margin: 0 }}>Deskripsi Makroskopik (bisa diedit)</h3>
                    <button onClick={regenMakros} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.hema}`, background: "transparent", color: T.hemaDeep, fontSize: 12, cursor: "pointer" }}>
                      ↻ Buat/perbarui draf
                    </button>
                  </div>
                  <TextArea value={data.makrosDeskripsi} onChange={set("makrosDeskripsi")} rows={7} placeholder="Klik 'Buat/perbarui draf' untuk menyusun draf otomatis dari data di atas, lalu edit bebas." />
                  <VerifyNote />
                </div>

                {data.spesimenTambahan && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                    <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Makroskopik B: {data.spesimenTambahan}</h3>
                    <TextArea value={data.makrosB} onChange={set("makrosB")} rows={3} placeholder="Isi manual bebas untuk spesimen B..." />
                  </div>
                )}
              </>
            )}

            {active === "mikro" && (
              <>
                <SectionHeader title="Mikroskopik, Diagnosis & Grading" />
                <div onClick={togglePcr} style={{ padding: "12px 16px", borderRadius: 8, background: data.pcrToggle === "Ya" ? T.hema : "#fff", border: `1px solid ${data.pcrToggle === "Ya" ? T.hemaDeep : T.line}`, marginBottom: 18, cursor: "pointer" }}>
                  <span style={{ color: data.pcrToggle === "Ya" ? "#fff" : T.ink, fontSize: 13.5, fontWeight: 600 }}>{data.pcrToggle === "Ya" ? "✓ " : ""}Tidak ditemukan residual karsinoma invasif (respons komplit patologis / pCR pasca-neoadjuvan)</span>
                </div>

                <Field label="Diagnosis">
                  <Select value={data.jenisHistologi} onChange={set("jenisHistologi")} options={HISTOLOGI_OPTIONS} />
                </Field>
                {data.jenisHistologi === "Metaplastic carcinoma" && (
                  <Field label="Komponen metaplastik (WHO 2019, bisa pilih lebih dari satu)">
                    <MultiChip values={data.metaplastikKomponen} onChange={set("metaplastikKomponen")} options={METAPLASTIK_OPTIONS} />
                  </Field>
                )}
                <Field label="Diagnosis manual (opsional override, mengganti hasil dropdown di Kesimpulan)">
                  <TextInput value={data.diagnosisManual} onChange={set("diagnosisManual")} placeholder="Kosongkan untuk pakai hasil dropdown di atas" />
                </Field>

                {data.pcrToggle === "Ya" ? (
                  <>
                    <Field label="Deskripsi tumor bed (bisa kamu ubah bebas)">
                      <TextArea value={data.tumorBedDeskripsi} onChange={set("tumorBedDeskripsi")} rows={4} />
                    </Field>
                    <VerifyNote />
                  </>
                ) : (
                  <>
                    <Field label="Ukuran tumor invasif terbesar">
                      <TextInput mono value={data.ukuranTumor} onChange={set("ukuranTumor")} placeholder="mis. 4 cm" />
                    </Field>
                    <Field label="Ada epidermis pada potongan massa?">
                      <ChoiceRow value={data.massaEpidermis} onChange={set("massaEpidermis")} options={["Ya", "Tidak"]} />
                    </Field>

                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                      <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Grading Nottingham (otomatis)</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Field label="Persentase struktur tubular/kelenjar">
                          <TextInput mono value={data.tubulePersen} onChange={set("tubulePersen")} placeholder="mis. 45%" />
                        </Field>
                        <Field label="Pola arsitektur lain (selain tubular)">
                          <TextInput value={data.polaArsitektur} onChange={set("polaArsitektur")} placeholder="mis. solid, trabekular" />
                        </Field>
                        <Field label="Pleomorfik">
                          <ChoiceRow value={data.pleomorfikLevel} onChange={set("pleomorfikLevel")} options={["Ringan", "Sedang", "Berat"]} />
                        </Field>
                        <Field label="Anak inti (nukleoli)">
                          <ChoiceRow value={data.anakInti} onChange={set("anakInti")} options={["Ada", "Tidak ada"]} />
                        </Field>
                        <Field label="Mitosis (per mm²)">
                          <NumUnit value={data.mitosisPerMM2} onChange={set("mitosisPerMM2")} placeholder="mis. 6" unit="/mm²" />
                        </Field>
                      </div>
                      {gradeInfo && (
                        <InfoBox>
                          Tubule {tubuleScore} + Nuclear {nuclearScore} + Mitotic {mitoticScore} = {gradeInfo.total} → <strong>Grade {gradeInfo.grade}</strong>
                        </InfoBox>
                      )}
                    </div>

                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                      <Field label="Bentuk sel">
                        <TextInput value={data.bentukSel} onChange={set("bentukSel")} placeholder="mis. bulat oval, kuboid" />
                      </Field>
                      <Field label="Limfosit pada stroma intratumoral">
                        <NumUnit value={data.tilsPersen} onChange={set("tilsPersen")} placeholder="mis. 10" unit="%" />
                      </Field>
                      <Field label="Sebukan sel radang lain (jenis)">
                        <MultiChip values={data.sebukanJenis} onChange={set("sebukanJenis")} options={SEBUKAN_OPTIONS} />
                      </Field>
                      {data.sebukanJenis.length > 0 && (
                        <Field label="Intensitas sebukan">
                          <ChoiceRow value={data.sebukanIntensitas} onChange={set("sebukanIntensitas")} options={["Ringan", "Moderate", "Keras"]} />
                        </Field>
                      )}
                      <Field label="Reaksi stroma (bisa pilih lebih dari satu)">
                        <MultiChip values={data.reaksiStroma} onChange={set("reaksiStroma")} options={STROMA_OPTIONS} />
                      </Field>
                    </div>

                    {data.jenisHistologi === "Mixed invasive carcinoma (NST + tipe khusus)" && (
                      <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                        <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Komponen Kedua (Mixed)</h3>
                        <div style={{ padding: 14, borderRadius: 8, background: "#fff", border: `1px solid ${T.line}` }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                            <Field label="Tipe khusus kedua">
                              <Select value={data.mixedTipeKedua} onChange={set("mixedTipeKedua")} options={MIXED_KEDUA_OPTIONS} />
                            </Field>
                            <Field label="Proporsi komponen NST (%)">
                              <TextInput mono value={data.mixedProporsiNST} onChange={set("mixedProporsiNST")} placeholder="mis. 60" />
                            </Field>
                            <Field label="Proporsi komponen kedua (%)">
                              <TextInput mono value={data.mixedProporsiKedua} onChange={set("mixedProporsiKedua")} placeholder="mis. 40" />
                            </Field>
                          </div>
                          <h4 style={{ fontSize: 13.5, color: T.eosinDeep, margin: "12px 0 8px" }}>Grading Nottingham komponen kedua</h4>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                            <Field label="Tubule (1-3)">
                              <ChoiceRow value={data.tubuleScore2} onChange={set("tubuleScore2")} options={["1", "2", "3"]} />
                            </Field>
                            <Field label="Nuclear (1-3)">
                              <ChoiceRow value={data.nuclearScore2} onChange={set("nuclearScore2")} options={["1", "2", "3"]} />
                            </Field>
                            <Field label="Mitotic (1-3)">
                              <ChoiceRow value={data.mitoticScore2} onChange={set("mitoticScore2")} options={["1", "2", "3"]} />
                            </Field>
                          </div>
                          {gradeInfo2 && (
                            <InfoBox>
                              Grade komponen kedua: <strong>{gradeInfo2.grade}</strong> (grading komponen NST di atas tetap terpisah, grade {gradeInfo?.grade || "?"})
                            </InfoBox>
                          )}
                        </div>
                      </div>
                    )}

                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <Field label="Invasi limfovaskular">
                        <ChoiceRow value={data.lvi} onChange={set("lvi")} options={["Positif", "Negatif"]} />
                      </Field>
                      <Field label="Invasi perineural">
                        <ChoiceRow value={data.perineural} onChange={set("perineural")} options={["Positif", "Negatif"]} />
                      </Field>
                    </div>

                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                      <Field label="DCIS">
                        <ChoiceRow value={data.dcisAda} onChange={set("dcisAda")} options={["Positif", "Negatif"]} />
                      </Field>
                      {data.dcisAda === "Positif" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <Field label="Grade DCIS">
                            <Select value={data.dcisGrade} onChange={set("dcisGrade")} options={["Rendah", "Intermediate", "Tinggi"]} />
                          </Field>
                          <Field label="Nekrosis komedo">
                            <ChoiceRow value={data.dcisNekrosis} onChange={set("dcisNekrosis")} options={["Ada", "Tidak"]} />
                          </Field>
                        </div>
                      )}
                      <Field label="LCIS">
                        <ChoiceRow value={data.lcisAda} onChange={set("lcisAda")} options={["Positif", "Negatif"]} />
                      </Field>
                      {data.lcisAda === "Positif" && (
                        <Field label="Tipe LCIS (WHO)">
                          <Select value={data.lcisTipe} onChange={set("lcisTipe")} options={["Classic (CLCIS)", "Florid (FLCIS)", "Pleomorphic (PLCIS)"]} />
                        </Field>
                      )}
                    </div>

                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h3 style={{ fontSize: 15, color: T.eosinDeep, margin: 0 }}>Deskripsi Massa (bisa diedit)</h3>
                        <button onClick={regenMassa} style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.hema}`, background: "transparent", color: T.hemaDeep, fontSize: 12, cursor: "pointer" }}>
                          ↻ Buat/perbarui draf
                        </button>
                      </div>
                      <TextArea value={data.massaDeskripsi} onChange={set("massaDeskripsi")} rows={7} placeholder="Klik 'Buat/perbarui draf' untuk menyusun draf otomatis, lalu edit bebas." />
                      <VerifyNote />
                    </div>
                  </>
                )}

                {!isBiopsi && (
                  <>
                    {data.papilaAda === "Ada" && (
                      <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                        <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Papila Mammae (Mikroskopik)</h3>
                        <Field label="Infiltrasi sel ganas?">
                          <ChoiceRow value={data.papilaMikroGanas} onChange={setPapilaMikroGanas} options={["Ya", "Tidak"]} />
                        </Field>
                        {data.papilaMikroGanas === "Ya" && (
                          <Field label="Kedalaman infiltrasi">
                            <Select value={data.papilaMikroKedalaman} onChange={setPapilaMikroKedalaman} options={["Dermis", "Epidermis", "Dermis dan epidermis"]} />
                          </Field>
                        )}
                        <Field label="Deskripsi (bisa diedit)">
                          <TextArea value={data.papilaMikroDeskripsi} onChange={set("papilaMikroDeskripsi")} rows={2} placeholder="Belum diisi." />
                        </Field>
                        <VerifyNote />
                      </div>
                    )}

                    {data.kulitAda === "Ada" && (
                      <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                        <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Kulit (Mikroskopik)</h3>
                        <Field label="Infiltrasi sel ganas?">
                          <ChoiceRow value={data.kulitMikroGanas} onChange={setKulitMikroGanas} options={["Ya", "Tidak"]} />
                        </Field>
                        {data.kulitMikroGanas === "Ya" && (
                          <Field label="Kedalaman infiltrasi">
                            <Select value={data.kulitMikroKedalaman} onChange={setKulitMikroKedalaman} options={["Dermis", "Epidermis", "Dermis dan epidermis"]} />
                          </Field>
                        )}
                        <Field label="Deskripsi (bisa diedit)">
                          <TextArea value={data.kulitMikroDeskripsi} onChange={set("kulitMikroDeskripsi")} rows={2} placeholder="Belum diisi." />
                        </Field>
                        <VerifyNote />
                      </div>
                    )}

                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                      <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Batas Sayatan (Mikroskopik)</h3>
                      {MARGIN_KEYS.map((mk) => (
                        <div key={mk.key} style={{ marginBottom: 14, padding: 12, background: "#fff", borderRadius: 8, border: `1px solid ${T.line}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <strong style={{ fontSize: 13.5 }}>{mk.label}</strong>
                            <ChoiceRow value={data.margins[mk.key].ganas} onChange={setMarginGanas(mk.key)} options={["Belum bebas", "Bebas"]} />
                          </div>
                          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
                            <button onClick={() => regenMargin(mk.key)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${T.hema}`, background: "transparent", color: T.hemaDeep, fontSize: 11.5, cursor: "pointer" }}>
                              ↻ Buat draf
                            </button>
                          </div>
                          <TextArea value={data.margins[mk.key].deskripsi} onChange={setMargin(mk.key, "deskripsi")} rows={2} placeholder="Belum diisi." />
                          <VerifyNote />
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 6, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                      <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Kelenjar Getah Bening (Mikroskopik)</h3>
                      <Field label="Jumlah KGB dengan metastasis">
                        <TextInput mono value={data.kgbPositif} onChange={set("kgbPositif")} placeholder="mis. 6" />
                      </Field>
                      {kgbMikroText && <InfoBox>{kgbMikroText}</InfoBox>}
                    </div>
                  </>
                )}

                {data.spesimenTambahan && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.line}` }}>
                    <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Mikroskopik B: {data.spesimenTambahan}</h3>
                    <TextArea value={data.mikrosB} onChange={set("mikrosB")} rows={3} placeholder="Isi manual bebas untuk spesimen B..." />
                    <h3 style={{ fontSize: 15, color: T.eosinDeep, marginTop: 16, marginBottom: 10 }}>Kesimpulan B: {data.spesimenTambahan}</h3>
                    <TextArea value={data.kesimpulanB} onChange={set("kesimpulanB")} rows={3} placeholder="Isi manual bebas untuk spesimen B..." />
                  </div>
                )}
              </>
            )}

            {active === "staging" && (
              <>
                <SectionHeader title="Staging" sub="pT/pN/pM dihitung otomatis mengikuti AJCC 8th edition." />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Ekstensi ke dinding dada (chest wall)?">
                    <ChoiceRow value={data.chestWallExtension} onChange={set("chestWallExtension")} options={["Ya", "Tidak"]} />
                  </Field>
                  <Field label="Ulserasi kulit / nodul satelit / edema kulit?">
                    <ChoiceRow value={data.skinUlcerationSatelliteEdema} onChange={set("skinUlcerationSatelliteEdema")} options={["Ya", "Tidak"]} />
                  </Field>
                  <Field label="Klinis karsinoma inflamatorik?">
                    <ChoiceRow value={data.inflammatoryClinical} onChange={set("inflammatoryClinical")} options={["Ya", "Tidak", "Tidak diketahui"]} />
                  </Field>
                  <Field label="Metastasis jauh (pM)">
                    <Select value={data.pM} onChange={set("pM")} options={["M0", "M1", "Mx"]} />
                  </Field>
                </div>
                {pTObj?.missing && <InfoBox warn>⚠️ Staging pT belum dapat ditentukan — ukuran tumor invasif belum diisi (tab Mikroskopik).</InfoBox>}
                {pNObj?.missing && <InfoBox warn>⚠️ Staging pN belum dapat ditentukan — jumlah KGB dengan metastasis belum diisi (tab Mikroskopik).</InfoBox>}
                {stagingCombined && (
                  <InfoBox>
                    Staging otomatis: <strong>{stagingCombined}</strong>
                  </InfoBox>
                )}

                <div style={{ marginTop: 8, paddingTop: 18, borderTop: `1px solid ${T.line}` }}>
                  <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 10 }}>Kalkulator Residual Cancer Burden (RCB)</h3>
                  <Field label="Isi hanya jika pasca-neoadjuvan">
                    <ChoiceRow value={data.rcbAda} onChange={set("rcbAda")} options={["Ada data RCB", "Tidak berlaku"]} />
                  </Field>
                  {data.rcbAda === "Ada data RCB" && (
                    <>
                      <Field label="Dimensi tumor bed d1 X d2">
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <NumUnit value={data.rcbD1} onChange={set("rcbD1")} placeholder="d1" unit="mm" />
                          <span style={{ color: T.inkSoft, fontSize: 13 }}>X</span>
                          <NumUnit value={data.rcbD2} onChange={set("rcbD2")} placeholder="d2" unit="mm" />
                        </div>
                      </Field>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <Field label="Selularitas kanker keseluruhan (%)">
                          <TextInput mono value={data.rcbCellularity} onChange={set("rcbCellularity")} placeholder="mis. 40" />
                        </Field>
                        <Field label="Persentase komponen in situ (%)">
                          <TextInput mono value={data.rcbInsitu} onChange={set("rcbInsitu")} placeholder="mis. 10" />
                        </Field>
                        <Field label="Jumlah KGB positif (untuk RCB)">
                          <TextInput mono value={data.rcbLNPositif} onChange={set("rcbLNPositif")} placeholder="mis. 2" />
                        </Field>
                        <Field label="Diameter metastasis KGB terbesar">
                          <NumUnit value={data.rcbDmet} onChange={set("rcbDmet")} placeholder="mis. 8" unit="mm" />
                        </Field>
                      </div>
                      {rcbResult && (
                        <InfoBox>
                          RCB Index: <strong>{rcbResult.index}</strong> → Class <strong>{rcbResult.kelas}</strong> ({rcbResult.label})
                        </InfoBox>
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {active === "ihk" && (
              <>
                <SectionHeader title="Imunohistokimia" />
                <Field label="Status pemeriksaan IHK">
                  <ChoiceRow value={data.ihkStatus} onChange={set("ihkStatus")} options={["Bersamaan", "Menyusul", "Tidak dapat dilakukan"]} />
                </Field>

                {data.ihkStatus === "Bersamaan" && (
                  <>
                    <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 4 }}>ER</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <Field label="Pewarnaan">
                        <ChoiceRow value={data.erPewarnaan} onChange={set("erPewarnaan")} options={["Terpulas", "Tidak terpulas"]} />
                      </Field>
                      <Field label="Intensitas">
                        <ChoiceRow value={data.erIntensitas} onChange={set("erIntensitas")} options={["Lemah", "Sedang", "Kuat"]} />
                      </Field>
                      <Field label="Tingkatan persentase">
                        <Select value={data.erPersenTier} onChange={set("erPersenTier")} options={HORMONE_TIER_OPTIONS} />
                      </Field>
                    </div>
                    {erResult && (
                      <InfoBox>
                        Status ER: <strong>{erResult.status}</strong>
                      </InfoBox>
                    )}
                    <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 4, marginTop: 18 }}>PR</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      <Field label="Pewarnaan">
                        <ChoiceRow value={data.prPewarnaan} onChange={set("prPewarnaan")} options={["Terpulas", "Tidak terpulas"]} />
                      </Field>
                      <Field label="Intensitas">
                        <ChoiceRow value={data.prIntensitas} onChange={set("prIntensitas")} options={["Lemah", "Sedang", "Kuat"]} />
                      </Field>
                      <Field label="Tingkatan persentase">
                        <Select value={data.prPersenTier} onChange={set("prPersenTier")} options={HORMONE_TIER_OPTIONS} />
                      </Field>
                    </div>
                    {prResult && (
                      <InfoBox>
                        Status PR: <strong>{prResult.status}</strong>
                      </InfoBox>
                    )}
                    <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 4, marginTop: 18 }}>HER2</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <Field label="Pewarnaan">
                        <ChoiceRow value={data.her2Pewarnaan} onChange={set("her2Pewarnaan")} options={["Terpulas", "Tidak terpulas"]} />
                      </Field>
                      {data.her2Pewarnaan === "Terpulas" && (
                        <>
                          <Field label="Kelengkapan membran">
                            <ChoiceRow value={data.her2Kelengkapan} onChange={set("her2Kelengkapan")} options={["Inkomplit", "Komplit"]} />
                          </Field>
                          {data.her2Kelengkapan === "Komplit" && (
                            <Field label="Intensitas">
                              <ChoiceRow value={data.her2Intensitas} onChange={set("her2Intensitas")} options={["Lemah-Sedang", "Kuat"]} />
                            </Field>
                          )}
                          <Field label="Persentase sel tumor terpulas">
                            <Select value={data.her2Persen} onChange={set("her2Persen")} options={PERSEN_OPTIONS} />
                          </Field>
                        </>
                      )}
                    </div>
                    {her2Result && (
                      <InfoBox>
                        Skor IHK: <strong>{her2Result.skor}</strong> → {her2Result.kategori} → Status: <strong>{her2Result.statusResmi}</strong>
                        {her2Result.statusResmi === "Ekuivokal" && <div style={{ marginTop: 4 }}>Saran FISH/CISH dicantumkan otomatis di baris Subtipe Molekuler.</div>}
                      </InfoBox>
                    )}
                    <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 4, marginTop: 18 }}>Ki-67</h3>
                    <div style={{ maxWidth: 260 }}>
                      <Field label="Persentase sel tumor">
                        <Select value={data.ki67Persen} onChange={set("ki67Persen")} options={PERSEN_OPTIONS} />
                      </Field>
                    </div>
                    <h3 style={{ fontSize: 15, color: T.eosinDeep, marginBottom: 4, marginTop: 18 }}>Subtipe Molekuler</h3>
                    {subtypeAuto && (
                      <InfoBox>
                        {subtypeAuto.ekuivokal ? (
                          <>Belum dapat ditentukan — status HER2 ekuivokal. Saran: Pemeriksaan FISH/CISH.</>
                        ) : (
                          <>
                            Ditentukan otomatis: <strong>{subtypeAuto.text}</strong>
                            <div style={{ fontSize: 11.5, opacity: 0.85, marginTop: 4 }}>Ambang Ki-67 memakai acuan 20%.</div>
                          </>
                        )}
                      </InfoBox>
                    )}
                  </>
                )}
                {data.ihkStatus === "Menyusul" && <InfoBox>Laporan akan mencantumkan: "Pemeriksaan imunohistokimia (ER, PR, HER2, Ki-67) saat ini sedang dilakukan, hasil menyusul."</InfoBox>}
                {data.ihkStatus === "Tidak dapat dilakukan" && <InfoBox>Laporan akan mencantumkan: "Pemeriksaan imunohistokimia tidak dapat dilakukan karena tidak ditemukan sel-sel ganas pada sediaan ini."</InfoBox>}
                <Field label="Catatan tambahan (opsional)">
                  <TextArea value={data.catatanTambahan} onChange={set("catatanTambahan")} rows={3} placeholder="Temuan lain yang perlu disebutkan..." />
                </Field>
              </>
            )}

            {active === "hasil" && (
              <>
                <SectionHeader title="Laporan" sub="Hasil susunan otomatis — periksa kembali sebelum disalin ke sistem lab." />
                {!report && !loading && (
                  <button
                    onClick={generateReport}
                    disabled={loading}
                    style={{ padding: "11px 22px", borderRadius: 8, border: "none", background: T.amberDeep, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 16 }}
                  >
                    Susun Laporan
                  </button>
                )}
                {loading && <p style={{ color: T.inkSoft, fontSize: 14 }}>Menyusun laporan...</p>}
                {error && <p style={{ color: T.eosinDeep, fontSize: 14 }}>{error}</p>}
                {report && (
                  <>
                    <textarea value={report} onChange={(e) => setReport(e.target.value)} rows={26} style={{ width: "100%", boxSizing: "border-box", padding: 18, borderRadius: 8, border: `1px solid ${T.line}`, background: "#fff", color: T.ink, fontSize: 14, lineHeight: 1.6, fontFamily: "'IBM Plex Mono', monospace" }} />
                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      <button onClick={() => navigator.clipboard.writeText(report)} style={{ padding: "9px 16px", borderRadius: 7, border: `1px solid ${T.ok}`, background: "#fff", color: T.ok, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                        Salin ke clipboard
                      </button>
                      <button onClick={generateReport} disabled={loading} style={{ padding: "9px 16px", borderRadius: 7, border: `1px solid ${T.hema}`, background: "#fff", color: T.hemaDeep, fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
                        Susun ulang
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {active !== "hasil" && (
              <div style={{ marginTop: 28, paddingTop: 18, borderTop: `1px solid ${T.line}`, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={goNext} style={{ padding: "11px 22px", borderRadius: 8, border: "none", background: T.amberDeep, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Lanjut →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
