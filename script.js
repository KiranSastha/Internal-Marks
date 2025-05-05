function addSubject() {
  const container = document.getElementById("subjects");

  const subjectDiv = document.createElement("div");
  subjectDiv.className = "subject";

  subjectDiv.innerHTML = `
    <label>Subject Name: <input type="text" class="subject-name" placeholder="Enter subject name"></label>
    <label>CIA-1 (out of 70): <input type="number" class="cia1"></label>
    <label>CIA-2 (out of 70): <input type="number" class="cia2"></label>
    <label>CIA-3 (out of 100): <input type="number" class="cia3"></label>
    <label>Teacher mark (y): <input type="number" class="teacher"></label>
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
  results.innerHTML = "";

  const subjects = document.querySelectorAll(".subject");

  subjects.forEach(subject => {
    const name = subject.querySelector(".subject-name").value || "Unnamed Subject";
    const cia1 = parseFloat(subject.querySelector(".cia1").value) || 0;
    const cia2 = parseFloat(subject.querySelector(".cia2").value) || 0;
    const cia3 = parseFloat(subject.querySelector(".cia3").value) || 0;
    const teacher = parseFloat(subject.querySelector(".teacher").value) || 0;

    const total = calculateInternal(cia1, cia2, cia3, teacher);
    const resultDiv = document.createElement("div");
    resultDiv.className = "result";

    if (total < 23) {
      resultDiv.classList.add("low");
      resultDiv.innerText = `${name}: ${total} / 40 - You are not eligible!`;
    } else {
      resultDiv.innerText = `${name}: ${total} / 40`;
    }

    results.appendChild(resultDiv);
  });
}
