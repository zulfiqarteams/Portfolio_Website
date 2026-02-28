const inputBox = document.getElementById("inputbox");
const addBtn = document.getElementById("addbtn");
const taskList = document.getElementById("tasklist");
localStorage.removeItem("tasks");
addBtn.addEventListener("click", () => {
  if (inputBox.value === '') {
    alert("You must write something!");
  } else {
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;

    // Add delete button (cross)
    let span = document.createElement("span");
    span.innerHTML = "\u00d7"; // Unicode for ×
    li.appendChild(span);

    taskList.appendChild(li);
    inputBox.value = "";
    saveData();
  }
});

// Toggle checked state OR delete task
taskList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    e.target.classList.toggle("checked");
    saveData();
  } else if (e.target.tagName === "SPAN") {
    e.target.parentElement.remove();
    saveData();
  }
});

// Save tasks to localStorage
function saveData() {
  localStorage.setItem("tasks", taskList.innerHTML);
}

// Load tasks from localStorage
function showTasks() {
  taskList.innerHTML = localStorage.getItem("tasks") || "";
}
const clearBtn = document.getElementById("clearbtn");

clearBtn.addEventListener("click", () => {
  taskList.innerHTML = "";
  saveData();
});
showTasks();