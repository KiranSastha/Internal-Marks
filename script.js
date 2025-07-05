// Theme toggle
const toggleBtn = document.getElementById("toggleTheme");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
});

// Load subjects from localStorage
window.onload = () => {
  const saved = localStorage.getItem("subjectsData");
  if (saved) {
    const data = JSON.parse(saved);
    data.forEach(d => addSubject(d));
  }
};

function addSubject(prefill = {}) {
  const container = document.getElementById("subjects");

  const subjectDiv = document.createElement("div");
  subjectDiv.className = "subject";

  subjectDiv.innerHTML = `
    <label>Subject Name:
      <input type="text" class="subject-name" placeholder="Enter subject name" value="${prefill.name || ""}" required>
    </label>
    <label>CIA-1 (out of 70):
      <input type="number" class="cia1" min="0" max="70" value="${prefill.cia1 || ""}" required>
    </label>
    <label>CIA-2 (out of 70):
      <input type="number" class="cia2" min="0" max="70" value="${prefill.cia2 || ""}" required>
    </label>
    <label>CIA-3 (out of 100):
      <input type="number" class="cia3" min="0" max="100" value="${prefill.cia3 || ""}" required>
    </label>
    <label>Teacher mark (out of 15):
      <input type="number" class="teacher" min="0" max="15" value="${prefill.teacher || ""}" required>
    </label>
    <button class="remove-btn" onclick="this.parentElement.remove(); saveToLocal()">Remove</button>
  `;

  container.appendChild(subjectDiv);
}

function calculateInternal(cia1, cia2, cia3, teacherMark) {
  const cia1Score = (cia1 / 70) * 7.5;
  const cia2Score = (cia2 / 70) * 7.5;
  const cia3Score = (cia3 / 100) * 10;
  return (cia1Score + cia2Score + cia3Score + teacherMark).toFixed(2);
}

function calculateAll() {
  const results = document.getElementById("results");
  const chartCanvas = document.getElementById("chart");
  results.innerHTML = "";

  const subjects = document.querySelectorAll(".subject");
  let chartLabels = [], chartData = [];
  let allValid = true;

  const subjectData = [];

  subjects.forEach((subject, index) => {
    const name = subject.querySelector(".subject-name").value || `Subject ${index + 1}`;
    const cia1Input = subject.querySelector(".cia1");
    const cia2Input = subject.querySelector(".cia2");
    const cia3Input = subject.querySelector(".cia3");
    const teacherInput = subject.querySelector(".teacher");

    const cia1 = parseFloat(cia1Input.value);
    const cia2 = parseFloat(cia2Input.value);
    const cia3 = parseFloat(cia3Input.value);
    const teacher = parseFloat(teacherInput.value);

    [cia1Input, cia2Input, cia3Input, teacherInput].forEach(input => input.classList.remove("invalid"));

    if (cia1 > 70 || cia1 < 0) {
      alert(`${name}: CIA-1 should be between 0 and 70.`);
      cia1Input.classList.add("invalid");
      allValid = false; return;
    }
    if (cia2 > 70 || cia2 < 0) {
      alert(`${name}: CIA-2 should be between 0 and 70.`);
      cia2Input.classList.add("invalid");
      allValid = false; return;
    }
    if (cia3 > 100 || cia3 < 0) {
      alert(`${name}: CIA-3 should be between 0 and 100.`);
      cia3Input.classList.add("invalid");
      allValid = false; return;
    }
    if (teacher > 15 || teacher < 0) {
      alert(`${name}: Teacher mark should be between 0 and 15.`);
      teacherInput.classList.add("invalid");
      allValid = false; return;
    }

    const total = calculateInternal(cia1 || 0, cia2 || 0, cia3 || 0, teacher || 0);
    const resultDiv = document.createElement("div");
    resultDiv.className = "result";

    if (total < 23) {
      resultDiv.classList.add("low");
      resultDiv.innerText = `${name}: ${total} / 40 - You are not eligible!`;
    } else {
      resultDiv.innerText = `${name}: ${total} / 40`;
    }

    results.appendChild(resultDiv);
    chartLabels.push(name);
    chartData.push(total);
    subjectData.push({ name, cia1, cia2, cia3, teacher });
  });

  if (allValid) {
    saveToLocal(subjectData);
    drawChart(chartLabels, chartData);
  }
}

function saveToLocal(data = null) {
  const subjects = data || Array.from(document.querySelectorAll(".subject")).map(subject => ({
    name: subject.querySelector(".subject-name").value,
    cia1: subject.querySelector(".cia1").value,
    cia2: subject.querySelector(".cia2").value,
    cia3: subject.querySelector(".cia3").value,
    teacher: subject.querySelector(".teacher").value,
  }));
  localStorage.setItem("subjectsData", JSON.stringify(subjects));
}

function exportCSV() {
  const rows = ["Subject,CIA-1,CIA-2,CIA-3,Teacher Mark"];
  document.querySelectorAll(".subject").forEach(subject => {
    const name = subject.querySelector(".subject-name").value;
    const cia1 = subject.querySelector(".cia1").value;
    const cia2 = subject.querySelector(".cia2").value;
    const cia3 = subject.querySelector(".cia3").value;
    const teacher = subject.querySelector(".teacher").value;
    rows.push(`${name},${cia1},${cia2},${cia3},${teacher}`);
  });
  const blob = new Blob([rows.join("\n")], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "internal_marks.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportPDF() {
  window.print();
}

let chartInstance;
function drawChart(labels, data) {
  const ctx = document.getElementById('chart').getContext('2d');
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Internal Marks',
        data,
        backgroundColor: '#007acc'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} / 40` } }
      },
      scales: {
        y: { beginAtZero: true, max: 40 }
      }
    }
  });
}
