/**
 * @typedef {Object} Teilnehmer
 * @property {string} Name
 * @property {number|string} Zeit
 */

// Excel-Datei laden
fetch('KWI-RoboChallange_Rangliste_FS2025.xlsx')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => {
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        /** @type {Teilnehmer[]} */
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const gueltigeZeiten = jsonData.filter(t => t.Zeit !== 'x' && !isNaN(parseFloat(t.Zeit)));
        const ungueltigeZeiten = jsonData.filter(t => t.Zeit === 'x');

        gueltigeZeiten.sort((a, b) => parseFloat(a.Zeit) - parseFloat(b.Zeit));

        const tbody = document.querySelector('#rankingTable tbody');
        tbody.innerHTML = '';

        gueltigeZeiten.forEach((row, index) => {
            const zeitAnzeigen = parseFloat(row.Zeit).toFixed(2);
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${index + 1}</td><td>${row.Gruppennummer}</td><td>${zeitAnzeigen}</td><td>${row.Klasse}</td>`;
            tbody.appendChild(tr);
        });

        const letzterRang = gueltigeZeiten.length + 1;

        ungueltigeZeiten.forEach((row) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${letzterRang}</td><td>${row.Gruppennummer}</td><td>-</td><td>${row.Klasse}</td>`;
            tbody.appendChild(tr);
        });
    })
    .catch(error => {
        console.error('Fehler beim Laden der Excel-Datei:', error);
    });