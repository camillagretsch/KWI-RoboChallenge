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
fetch('KWI-RoboChallenge_Rangliste.xlsx')
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

        createLinienfolgerRangliste(alleDaten['Linienfolger-Resultate'] || []);
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
            // if (id === 'roboball') createTableRoboball();
            // if (id === 'move-it-over') createTableMoveItOver();
            if (id === 'total') createRanglisteTotal();
        });
    });

    document.querySelectorAll('.submenu button').forEach(button => {
    button.addEventListener('click', function () {
        const target = document.getElementById(this.dataset.target);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

    const iframeMIO = document.getElementById('mio-spielplan');

    iframeMIO.onload = function () {
        iframeMIO.style.height = iframeMIO.contentWindow.document.body.scrollHeight + 'px';
    };

    const iframeRB = document.getElementById('rb-spielplan');

    iframeRB.onload = function () {
        iframeRB.style.height = iframeRB.contentWindow.document.body.scrollHeight + 'px';
    };
});

// ====================
// Rangliste Linienfolger
// ====================
function createLinienfolgerRangliste(data) {
    // gültige Zeiten filtern + numerisch sortieren
    const gueltigeZeiten = data
        .filter(t => t.Zeit !== 'x' && !isNaN(Number(t.Zeit)))
        .sort((a, b) => Number(a.Zeit) - Number(b.Zeit));
    const ungueltigeZeiten = data.filter(t => t.Zeit === 'x');

    // Mit Sensor
    const datenMitSensor = gueltigeZeiten.filter(
        entry => entry.Sensor === 'x'
    );

    // Ohne Sensor
    const datenOhneSensor = gueltigeZeiten.filter(
        entry => entry.Sensor !== 'x'
    );

    // Ränge zuweisen
    const rangliste = datenMitSensor.map((entry, i) => ({
        Rang: i + 1,
        Gruppennummer: entry.Gruppennummer,
        Punkte: entry.Zeit,
        Klasse: entry.Klasse,
        Sensor: true
    }));

    datenOhneSensor.forEach((entry, i) => {
        rangliste.push({
            Rang: i + 1,
            Gruppennummer: entry.Gruppennummer,
            Punkte: entry.Zeit,
            Klasse: entry.Klasse,
            Sensor: false
        });
    });

    const letzterRang = datenMitSensor.length + 1;

    ungueltigeZeiten.forEach(entry => {
        rangliste.push({
            Rang: letzterRang,
            Gruppennummer: entry.Gruppennummer,
            Punkte: '-',
            Klasse: entry.Klasse,
            Sensor: true
        });
    });

    window.linienfolgerDaten = rangliste;
}

// ====================
// Tabelle Linienfolger
// ====================
function createTableLinienfolger() {
    const container = document.getElementById('ranglistenContainer');
    if (window.innerWidth < 768) {
        container.style.flexDirection = 'column';
    } else {
        container.style.flexDirection = 'row';
    }
    const tbodySensor = document.querySelector('#rankingTableLinienfolgerMitSensor tbody');
    const tbody = document.querySelector('#rankingTableLinienfolgerOhneSensor tbody');

    tbodySensor.innerHTML = '';
    tbody.innerHTML = '';

    window.linienfolgerDaten.forEach(row => {
        const tr = document.createElement('tr');
        if (row.Sensor) {
            tr.innerHTML = `<td>${row.Rang}</td><td>${row.Klasse}</td><td>${row.Gruppennummer}</td><td>${row.Punkte}</td>`;
            tbodySensor.appendChild(tr);
        } else {
            tr.innerHTML = `<td>${row.Rang}</td><td>${row.Klasse}</td><td>${row.Gruppennummer}</td><td>${row.Punkte}</td>`;
            tbody.appendChild(tr);
        }
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
        Punkte: entry.Rangpunkte,
        Tore: entry.Torpunkte,
        Klasse: entry.Klasse,
    }));

    // Falls zwei Teams genau gleich viel Punkte und Tore haben, haben sie den selben Rang
    rangliste.forEach((row, index) => {
        if (index > 0 && row.Punkte === rangliste[index - 1].Punkte && row.Tore === rangliste[index - 1].Tore) {
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
    const tbody = document.querySelector('#rankingTableRoboBall tbody');
    tbody.innerHTML = '';

    window.roboballDaten.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.Rang}</td><td>${row.Klasse}</td><td>${row.Gruppennummer}</td><td>${row.Punkte}</td><td>${row.Tore}</td>`;
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
    data.forEach(row => {
        window.teams.push({
            team: row.Team
                .split("|")
                .map(s => parseFloat(s.trim())),

            namen: row.Namen
                .split("|")
                .map(s => s.trim()),

            klasse: row.Klasse
        });
    });
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
        const namen = row.namen
        const klasse = row.klasse;
        team.forEach((member) => {
            punkte += window.linienfolgerDaten.filter(t => t.Gruppennummer === member)[0].Rang;
        });
        rangliste.push({ team, punkte, rang, klasse, namen });
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

    rangliste.sort((a, b) => a.punkte - b.punkte);

    rangliste.forEach((row, index) => {
        row.rang = index + 1;

        if (index > 0 && row.punkte === rangliste[index - 1].punkte) {
            row.rang = rangliste[index - 1].rang;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row.rang}</td><td>${row.team}</td><td>${row.klasse}</td><td>${row.namen}</td><td>${row.punkte}</td>`;
        tbody.appendChild(tr);
    });

    const punkteProKlasse = {};
    const anzahlTeamsProKlasse = {};

    rangliste.forEach((row) => {
        // Punkte und Anzahl Teams pro Klasse erfassen
        if (!punkteProKlasse[row.klasse]) {
            punkteProKlasse[row.klasse] = 0;
            anzahlTeamsProKlasse[row.klasse] = 0;
        }
        punkteProKlasse[row.klasse] += row.rang;
        anzahlTeamsProKlasse[row.klasse]++;
    });
    const durchschnittProKlasse = {};
    for (const klasse in punkteProKlasse) {
        durchschnittProKlasse[klasse] = punkteProKlasse[klasse] / anzahlTeamsProKlasse[klasse];
    }

    console.log('Durchschnittliche Punkte pro Klasse:', durchschnittProKlasse);
}