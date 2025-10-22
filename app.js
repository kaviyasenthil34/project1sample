// Load saved data if exists
let attendanceList = JSON.parse(localStorage.getItem("attendanceList")) || [];

// Update table initially
updateTable();

// Function to handle scanned QR data
function onScanSuccess(decodedText, decodedResult) {
  document.getElementById("result").innerText = `Scanned: ${decodedText}`;

  try {
    // Expecting QR code to contain JSON like: {"roll":"22CSE001","name":"Kaviya Shree"}
    const data = JSON.parse(decodedText);
    markAttendance(data);
  } catch (e) {
    alert("Invalid QR format! Please encode JSON data like {roll:'22CSE001', name:'Kaviya Shree'}");
  }
}

// Initialize the scanner
const html5QrcodeScanner = new Html5QrcodeScanner("reader", {
  fps: 10,
  qrbox: 250
});
html5QrcodeScanner.render(onScanSuccess);

// Add student to attendance table
function markAttendance(data) {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  // Prevent duplicate entries for same date
  const exists = attendanceList.find(
    (item) => item.roll === data.roll && item.date === date
  );
  if (exists) {
    alert(`${data.name} already marked present today!`);
    return;
  }

  // Add to attendance
  attendanceList.push({
    roll: data.roll,
    name: data.name,
    date: date,
    time: time
  });

  saveToLocal();
  updateTable();
}

// Save to local storage
function saveToLocal() {
  localStorage.setItem("attendanceList", JSON.stringify(attendanceList));
}

// Update table UI
function updateTable() {
  const tbody = document.querySelector("#attendanceTable tbody");
  tbody.innerHTML = "";

  attendanceList.forEach((item) => {
    const row = `<tr>
      <td>${item.roll}</td>
      <td>${item.name}</td>
      <td>${item.date}</td>
      <td>${item.time}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

// Export attendance to CSV
document.getElementById("downloadBtn").addEventListener("click", () => {
  if (attendanceList.length === 0) {
    alert("No attendance data to download!");
    return;
  }

  let csvContent = "Roll,Name,Date,Time\n";
  attendanceList.forEach((item) => {
    csvContent += `${item.roll},${item.name},${item.date},${item.time}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `attendance_${new Date().toLocaleDateString()}.csv`;
  link.click();
});
