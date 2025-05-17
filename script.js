// ====================
// Globale Variable zum Speichern der Excel Daten in JSON
// ====================
window.linienfolgerDaten = {};
window.teams = []

// ====================
// Excel-Datei laden und Daten aus mehreren Worksheets extrahieren
// ====================
fetch('KWI-RoboChallange_Rangliste_FS2025.xlsx')
.then(response => response.arrayBuffer())
.then(arrayBuffer => {
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Liste der Sheet-Namen
        const sheets = workbook.SheetNames;
        const alleDaten = {};

        // Alle relevanten Sheets verarbeiten
        sheets.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            alleDaten[sheetName] = jsonData;
        });

        createLinienfolgerRangliste(alleDaten['Linienfolger'] || []);
        renderTable(window.linienfolgerDaten);

        createTeamsList(alleDaten['Teams'] || [])
})
.catch(error => {
    console.error('Fehler beim Laden der Excel-Datei:', error);
});

// ====================
// Tab-Funktionalität
// ====================
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
  
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Alle Tabs und Inhalte deaktivieren
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
  
        // Aktiven Tab aktivieren
        tab.classList.add('active');
        const id = tab.getAttribute('data-tab');
        document.getElementById(id).classList.add('active');

        if (id === 'linienfolger') renderTable(window.linienfolgerDaten);
        if (id === 'total') createRanglisteTotal();
      });
    });
  });

// ====================
// Rangliste Linienfolger
// ====================
function createLinienfolgerRangliste(data) {  
    const gueltigeZeiten = data.filter(t => t.Zeit !== 'x' && !isNaN(parseFloat(t.Zeit)));
    const ungueltigeZeiten = data.filter(t => t.Zeit === 'x');
  
    gueltigeZeiten.sort((a, b) => parseFloat(a.Zeit) - parseFloat(b.Zeit));
  
    // Ränge zuweisen
    const rangliste = gueltigeZeiten.map((entry, i) => ({
        Rang: i + 1,
        Gruppennummer: entry.Gruppennummer,
        Punkte: entry.Zeit,
        Klasse: entry.Klasse,
    }));
  
    const letzterRang = gueltigeZeiten.length + 1;
  
    ungueltigeZeiten.forEach(entry => {
        rangliste.push({
            Rang: letzterRang,
            Gruppennummer: entry.Gruppennummer,
            Punkte: '-',
            Klasse: entry.Klasse,
        });
    });

    window.linienfolgerDaten = rangliste;
}

// ====================
// Tabelle erstellen
// ====================
function renderTable(data) {
    const tbody = document.querySelector('#rankingTableLinienfolger tbody');
    tbody.innerHTML = '';
  
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.Rang}</td><td>${row.Gruppennummer}</td><td>${row.Punkte}</td><td>${row.Klasse}</td>`;
      tbody.appendChild(tr);
    });
}

// ====================
// Liste aller Teams erstellen
// ====================
function createTeamsList(data) {
    data.forEach(row => window.teams.push({team: row.Team.split("|").map(s => parseFloat(s.trim())), klasse: row.Klasse}));
}

// ====================
// Gesamtwertung
// ====================
function createRanglisteTotal() {
    const tbody = document.querySelector('#rankingTableTotal tbody');
    tbody.innerHTML = '';

    const rangliste = [];

    window.teams.forEach(row => {
        const rang = 1;
        let punkte = 0;
        const team = row.team;
        const klasse = row.klasse;
        team.forEach((member) =>  {
            punkte += window.linienfolgerDaten.filter(t => t.Gruppennummer === member)[0].Rang;
            // Ergänzen mit move-it-over und roboball
        });
        punkte = punkte/team.length;
        punkte = punkte.toFixed(1);
        rangliste.push({team, punkte, rang, klasse});
    });

    rangliste.sort((a, b) => a.punkte - b.punkte);

    rangliste.forEach((row, index) => {
        row.rang = index + 1;

        if (index > 0 && row.punkte === rangliste[index - 1].punkte) {
            row.rang = rangliste[index - 1].rang;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.rang}</td><td>${row.team}</td><td>${row.punkte}</td><td>${row.klasse}</td>`;
        tbody.appendChild(tr);
    });
}