// ====================
// Globale Variable zum Speichern der Excel Daten in JSON
// ====================
window.linienfolgerDaten = {};
window.roboballDaten = {};
window.moveItOverDaten = {};
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
        // createRoboballRangliste(alleDaten['RoboBall-Rangliste'] || []);
        // createMoveItOverRangliste(alleDaten['Move-it-over-Rangliste'] || []);
        createTeamsList(alleDaten['Teams'] || []);

    }).catch(error => {
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
        if (id === 'roboball') createTableRoboball();
        if (id === 'move-it-over') createTableMoveItOver();
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

    // Falls zwei Teams bei allen Wertungslüfen genau gleich viel Punkte haben, haben sie den selben Rang
    rangliste.forEach((row, index) => {
        if (index > 0 && row.Punkte1 === rangliste[index - 1].Punkte1 && row.Punkte2 === rangliste[index - 1].Punkte2 && row.Punkte3 === rangliste[index - 1].Punkte3) {
            row.Rang = rangliste[index - 1].Rang;
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
// Rangliste Move it over
// ====================
function createMoveItOverRangliste(data) {  
  
    // Ränge zuweisen
    const rangliste = data.map((entry, i) => ({
        Rang: i + 1,
        Gruppennummer: entry.Gruppennummer,
        Punkte: entry.Punkte,
        Siege: entry.Siege,
        Klasse: entry.Klasse,
    }));

    // Falls zwei Teams genau gleich viel Punkte und Siege haben, haben sie den selben Rang
    rangliste.forEach((row, index) => {
        if (index > 0 && row.Punkte === rangliste[index - 1].Punkte && row.Siege === rangliste[index - 1].Siege) {
            row.Rang = rangliste[index - 1].Rang;
        }
    });
  
    rangliste.sort((a, b) => a.Rang - b.Rang);
    window.moveItOverDaten = rangliste;
}

// ====================
// Tabelle Move it over
// ====================
function createTableMoveItOver() {
    const tbody = document.querySelector('#rankingTableMoveItOver tbody');
    tbody.innerHTML = '';
  
    window.moveItOverDaten.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.Rang}</td><td>${row.Klasse}</td><td>${row.Gruppennummer}</td><td>${row.Punkte}</td><td>${row.Siege}</td>`;
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

    // Linienfolger
    window.teams.forEach(row => {
        const rang = 1;
        let punkte = 0;
        const team = row.team;
        const klasse = row.klasse;
        team.forEach((member) =>  {
            punkte += window.linienfolgerDaten.filter(t => t.Gruppennummer === member)[0].Rang;
        });
        punkte = punkte/team.length;
        punkte = punkte.toFixed(1); // TODO: entfernen
        rangliste.push({team, punkte, rang, klasse});
    });

    // Roboball & MIO
    // rangliste.forEach(row => {
    //     let punkte = row.punkte;

    //     row.team.forEach((member) => {
    //         // Roboball
    //         let data = window.roboballDaten.filter(t => t.Gruppennummer === member);
    //         if (data.length > 0) {
    //             punkte += data[0].Rang
    //         }

    //         // MIO
    //         data = window.moveItOverDaten.filter(t => t.Gruppennummer === member);
    //         if (data.length > 0) {
    //             punkte += data[0].Rang
    //         }

    //         row.punkte = punkte.toFixed(1);
    //     })
    // });

    console.log(rangliste)

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