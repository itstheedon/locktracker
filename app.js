// Initialize inventory, records, and daily cumulative values
let remainingInventory = 0;
let records = [];

// Function to get the day of the week from a date string
function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
}

// Function to add a new record with the day of the week included
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
    const priceOfHair = parseFloat(document.getElementById('priceOfHair').value) || 0;
    const paidForHair = document.getElementById('paidForHair').checked ? "Yes" : "No";

    // Update remaining inventory and calculate total value in Ksh
    remainingInventory += piecesMade - piecesSold;
    const totalValue = remainingInventory * pricePerPiece;

    // Daily cumulative values for pieces sold and their total value in Ksh
    const dailyCumulativePiecesSold = piecesSold;
    const dailyCumulativeValueOfPiecesSold = piecesSold * pricePerPiece;

    // Create the record with daily cumulative values
    const record = {
        date: `${dayOfWeek}, ${date}`,
        piecesMade: piecesMade,
        piecesSold: piecesSold,
        remainingInventory: remainingInventory,
        totalValue: `Ksh ${totalValue.toFixed(2)}`,
        cumulativePiecesSold: dailyCumulativePiecesSold,
        cumulativeValueOfPiecesSold: `Ksh ${dailyCumulativeValueOfPiecesSold.toFixed(2)}`,
        priceOfHair: priceOfHair ? `Ksh ${priceOfHair.toFixed(2)}` : 'Nil', // Display 'Nil' if no price entered
        paidForHair: paidForHair
    };

    // Add the record to the records array
    records.push(record);
    saveRecordsToLocalStorage(); // Save to local storage
    updateTable();
}

// Function to update the table display
function updateTable() {
    const tableBody = document.getElementById('recordsTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    // Populate the table with records
    records.forEach((record, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.piecesMade}</td>
            <td>${record.piecesSold}</td>
            <td>${record.remainingInventory}</td>
            <td>${record.totalValue}</td>
            <td>${record.cumulativePiecesSold}</td>
            <td>${record.cumulativeValueOfPiecesSold}</td>
            <td>${record.priceOfHair}</td>
            <td>${record.paidForHair}</td>
            <td><button onclick="deleteRecord(${index})">Delete</button></td> <!-- Delete button added -->
        `;
        tableBody.appendChild(row);
    });
}

// Function to delete a specific record
function deleteRecord(index) {
    if (index > -1 && index < records.length) {
        records.splice(index, 1);
        saveRecordsToLocalStorage(); // Update local storage after deletion
        updateTable();
    }
}

// Function to save records to local storage
function saveRecordsToLocalStorage() {
    localStorage.setItem('lockProductionRecords', JSON.stringify(records));
}

// Function to load records from local storage
function loadRecordsFromLocalStorage() {
    const savedRecords = localStorage.getItem('lockProductionRecords');
    if (savedRecords) {
        records = JSON.parse(savedRecords);
        updateTable(); // Refresh the table with loaded records
    }
}

// Function to export records to a spreadsheet
function exportToSpreadsheet() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Pieces Made,Pieces Sold,Remaining Inventory,Total Value (Ksh),Cumulative Pieces Sold,Cumulative Value of Pieces Sold (Ksh),Price of Hair (Ksh),Paid for Hair\n";

    records.forEach(record => {
        csvContent += `${record.date},${record.piecesMade},${record.piecesSold},${record.remainingInventory},${record.totalValue},${record.cumulativePiecesSold},${record.cumulativeValueOfPiecesSold},${record.priceOfHair},${record.paidForHair}\n`;
    });

    // Download the CSV file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "lock_production_records.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
}

// Load records from local storage when the page loads
document.addEventListener('DOMContentLoaded', loadRecordsFromLocalStorage);
