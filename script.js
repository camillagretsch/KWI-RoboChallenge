// ====================
// Globale Variable zum Speichern der Excel Daten in JSON
// ====================
window.linienfolgerDaten = {};
window.roboballDaten = {};
window.teams = [];

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

        createLinienfolgerRangliste(alleDaten['Linienfolger-Rangliste'] || []);
        createTableLinienfolger();
        createRoboballRangliste(alleDaten['RoboBall-Rangliste'] || []);
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

        if (id === 'linienfolger') createTableLinienfolger();
        // if (id === 'roboball') createTableRoboball();
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
// Tabelle Linienfolger
// ====================
function createTableLinienfolger() {
    const tbody = document.querySelector('#rankingTableLinienfolger tbody');
    tbody.innerHTML = '';
  
    window.linienfolgerDaten.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.Rang}</td><td>${row.Klasse}</td><td>${row.Gruppennummer}</td><td>${row.Punkte}</td>`;
      tbody.appendChild(tr);
    });
}

// ====================
// Rangliste RoboBall
// ====================
function createRoboballRangliste(data) {  
  
    // Ränge zuweisen
    const rangliste = data.map((entry, i) => ({
        Rang: i + 1,
        Gruppennummer: entry.Gruppennummer,
        Punkte1: entry.Bester,
        Punkte2: entry.Zweiter,
        Punkte3: entry.Dritter,
        Klasse: entry.Klasse,
    }));

    rangliste.forEach((row, index) => {
        if (index === 0) return;
        if (row.Punkte1 === rangliste[index - 1].Punkte1) {
            if (row.Punkte2 > rangliste[index - 1].Punkte2) {
                row.Rang = rangliste[index - 1].Rang;
                rangliste[index - 1].Rang = index + 1;
                return;
            } else if (row.Punkte2 === rangliste[index - 1].Punkte2) {
                if (row.Punkte3 > rangliste[index - 1].Punkte3) {
                    row.Rang = rangliste[index - 1].Rang;
                    rangliste[index - 1].Rang = index + 1;
                    return;
                } else if (row.Punkte3 === rangliste[index - 1].Punkte3) {
                    row.Rang = rangliste[index - 1].Rang;
                    return;
                }
            }
        }
    });
  
    rangliste.sort((a, b) => a.Rang - b.Rang);
    window.roboballDaten = rangliste;
}

// ====================
// Tabelle RoboBall
// ====================
function createTableRoboball() {
    const tbody = document.querySelector('#rankingTableRoboball tbody');
    tbody.innerHTML = '';
  
    window.roboballDaten.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.Rang}</td><td>${row.Klasse}</td><td>${row.Gruppennummer}</td><td>${row.Punkte1}</td><td>${row.Punkte2}</td><td>${row.Punkte3}</td>`;
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