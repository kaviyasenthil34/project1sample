// Initialize table and data storage
let attendance = JSON.parse(localStorage.getItem("attendance")) || [];
const tableBody = document.querySelector("#attendanceTable tbody");

function renderTable() {
  tableBody.innerHTML = "";
  attendance.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${entry.roll}</td><td>${entry.name}</td><td>${entry.date}</td><td>${entry.time}</td>`;
    tableBody.appendChild(row);
  });
}
renderTable();

// Function to handle QR success
function onScanSuccess(decodedText) {
  try {
    const data = JSON.parse(decodedText);
    const roll = data.roll;
    const name = data.name;
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    const exists = attendance.find(a => a.roll === roll && a.date === date);
    if (exists) {
      alert(`${name} already marked present today!`);
      return;
    }

    attendance.push({ roll, name, date, time });
    localStorage.setItem("attendance", JSON.stringify(attendance));
    renderTable();

    document.getElementById("result").innerText = `Scanned: ${name} (${roll})`;
  } catch {
    document.getElementById("result").innerText = "Invalid QR Code format!";
  }
}

// Initialize QR Scanner
const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: { width: 250, height: 250 },
});
html5QrcodeScanner.render(onScanSuccess);

// CSV Download Function
document.getElementById("downloadCsvBtn").addEventListener("click", () => {
  if (attendance.length === 0) {
    alert("No attendance data to download!");
    return;
  }

  const csvRows = [];
  csvRows.push(["Roll No", "Name", "Date", "Time"]);
  attendance.forEach(entry => {
    csvRows.push([entry.roll, entry.name, entry.date, entry.time]);
  });

  const csvString = csvRows.map(e => e.join(",")).join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", "attendance.csv");
  a.click();
});
