let remainingInventory = 0;
let records = [];

// Function to get the day of the week from a date string
function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
}

// Function to add a new record
function addRecord() {
    const date = document.getElementById('date').value;
    if (!date) {
        alert("Please enter a valid date.");
        return;
    }

    const dayOfWeek = getDayOfWeek(date);
    const piecesMade = parseInt(document.getElementById('piecesMade').value) || 0;
    const piecesSold = parseInt(document.getElementById('piecesSold').value) || 0;
    const pricePerPiece = parseFloat(document.getElementById('pricePerPiece').value) || 0;
    const priceOfHair = parseFloat(document.getElementById('priceOfHair').value) || null;
    const paidForHair = document.getElementById('paidForHair').checked ? "Yes" : "No";

    // Update remaining inventory and calculate total value in Ksh
    remainingInventory += piecesMade - piecesSold;
    const totalValue = remainingInventory * pricePerPiece;
    const dailyValueOfPiecesSold = piecesSold * pricePerPiece;

    // Create a record object
    const record = {
        id: records.length,
        date: `${dayOfWeek}, ${date}`,
        piecesMade: piecesMade,
        piecesSold: piecesSold,
        remainingInventory: remainingInventory,
        totalValue: `Ksh ${totalValue.toFixed(2)}`,
        dailyPiecesSold: piecesSold,
        dailyValueOfPiecesSold: `Ksh ${dailyValueOfPiecesSold.toFixed(2)}`,
        priceOfHair: priceOfHair ? `Ksh ${priceOfHair.toFixed(2)}` : 'Nil',
        paidForHair: paidForHair
    };

    records.push(record);
    saveRecords();
    updateTable();
}

// Function to update the table
function updateTable() {
    const tableBody = document.getElementById('recordsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.piecesMade}</td>
            <td>${record.piecesSold}</td>
            <td>${record.remainingInventory}</td>
            <td>${record.totalValue}</td>
            <td>${record.dailyPiecesSold}</td>
            <td>${record.dailyValueOfPiecesSold}</td>
            <td>${record.priceOfHair}</td>
            <td>${record.paidForHair}</td>
            <td><button onclick="deleteRecord(${record.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Save records to local storage
function saveRecords() {
    localStorage.setItem('records', JSON.stringify(records));
}

// Load records from local storage
function loadRecords() {
    const storedRecords = JSON.parse(localStorage.getItem('records'));
    if (storedRecords) {
        records = storedRecords;
        updateTable();
    }
}

// Delete a single record by ID
function deleteRecord(id) {
    records = records.filter(record => record.id !== id);
    saveRecords();
    updateTable();
}

// Delete all records
function deleteAllRecords() {
    if (confirm("Are you sure you want to delete all records?")) {
        records = [];
        remainingInventory = 0;
        saveRecords();
        updateTable();
    }
}

// Function to export records to a spreadsheet
function exportToSpreadsheet() {
    let csvContent = "data:text/csv;charset=utf-8,Date,Pieces Made,Pieces Sold,Remaining Inventory,Total Value (Ksh),Daily Pieces Sold,Daily Value of Pieces Sold (Ksh),Price of Hair (Ksh),Paid for Hair\n";

    records.forEach(record => {
        csvContent += `${record.date},${record.piecesMade},${record.piecesSold},${record.remainingInventory},${record.totalValue},${record.dailyPiecesSold},${record.dailyValueOfPiecesSold},${record.priceOfHair},${record.paidForHair}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lock_production_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Import data from Excel
function importData() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        excelData.forEach((row, index) => {
            if (index === 0) return; // Skip header row
            const [date, piecesMade, piecesSold, remainingInventory, totalValue, dailyPiecesSold, dailyValueOfPiecesSold, priceOfHair, paidForHair] = row;

            const record = {
                id: records.length,
                date,
                piecesMade: parseInt(piecesMade) || 0,
                piecesSold: parseInt(piecesSold) || 0,
                remainingInventory: parseInt(remainingInventory) || 0,
                totalValue: totalValue || 'Ksh 0.00',
                dailyPiecesSold: parseInt(dailyPiecesSold) || 0,
                dailyValueOfPiecesSold: dailyValueOfPiecesSold || 'Ksh 0.00',
                priceOfHair: priceOfHair || 'Nil',
                paidForHair: paidForHair || 'No'
            };

            records.push(record);
        });

        saveRecords();
        updateTable();
    };
    reader.readAsArrayBuffer(file);
}

// Load records on page load
loadRecords();
