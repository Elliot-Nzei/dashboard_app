document.addEventListener('DOMContentLoaded', () => {
    // --- Profile Image Loader ---
    function updateSidebarProfilePic() {
        const img = document.getElementById('sidebar-profile-pic');
        const storedImg = localStorage.getItem('profileImage');
        if (img) {
            img.src = storedImg ? storedImg : 'assets/img/placeholder.png';
        }
    }
    updateSidebarProfilePic();

    // --- Username Loader ---
    const displayEl = document.getElementById("username-display");
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && displayEl) displayEl.textContent = storedUsername;

    // --- Sidebar To-Do Loader ---
    function loadSidebarTodos() {
        const todoList = JSON.parse(localStorage.getItem("tasks"));
        const sidebarList = document.getElementById("sidebar-todo-list");
        if (sidebarList) {
            sidebarList.innerHTML = "";
            if (todoList && todoList.length) {
                todoList.forEach(todo => {
                    const li = document.createElement("li");
                    const text = typeof todo === 'string' ? todo : todo.text;
                    li.textContent = text;
                    sidebarList.appendChild(li);
                });
            } else {
                sidebarList.innerHTML = "<li>No to-dos yet.</li>";
            }
        }
    }
    window.loadSidebarTodos = loadSidebarTodos; // <--- Make it globally accessible

    // --- Sidebar Expense Summary Loader ---
    function loadSidebarExpenseSummary() {
        fetch('http://localhost:8000/api/expenses/monthly_total')
          .then(res => res.json())
          .then(data => {
            updateBudgetLines(data.total);
          })
          .catch(() => {
            updateBudgetLines(0);
          });
    }

    loadSidebarTodos();
    loadSidebarExpenseSummary();
});

// --- Listen for profile image changes in localStorage ---
window.addEventListener('storage', function(e) {
    // To-Do sync
    if (e.key === 'tasks' || e.key === 'todos') {
        if (typeof loadSidebarTodos === 'function') loadSidebarTodos();
    }
    // Profile image sync
    if (e.key === 'profileImage') {
        if (typeof updateSidebarProfilePic === 'function') updateSidebarProfilePic();
    }
    // Username sync
    if (e.key === 'username') {
        const displayEl = document.getElementById("username-display");
        if (displayEl) displayEl.textContent = e.newValue || "Guest";
    }
    // Budget/expense sync
    if (e.key === 'monthlyBudget' || e.key === 'expenses') {
        if (typeof loadSidebarExpenseSummary === 'function') loadSidebarExpenseSummary();
    }
});

// --- To-Do Form Submission Handler ---
const todoForm = document.getElementById('todo-form');
if (todoForm) {
    todoForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = document.getElementById('todo-input');
        const task = input.value.trim();
        if (!task) return;

        // Update main task list DOM only
        if (typeof createTaskItem === 'function') {
            const mainTask = createTaskItem(task);
            document.getElementById('todo-list').appendChild(mainTask);
        }

        // Save to localStorage
        if (typeof saveTask === 'function') {
            saveTask(task);
        }

        input.value = '';
    });
}

// Expose functions globally for use in other scripts
window.addTodo = addTodo;
window.removeTodo = removeTodo;
window.updateExpenseSummary = updateExpenseSummary;
window.loadSidebarExpenseSummary = loadSidebarExpenseSummary;
// Expose updateSidebarProfilePic globally so it can be called from other scripts
window.updateSidebarProfilePic = updateSidebarProfilePic;
window.updateBudgetLines = updateBudgetLines;

function updateBudgetLines(monthlySpent) {
    // Get/set budget from localStorage, default ₦100,000
    let budget = parseInt(localStorage.getItem('monthlyBudget'), 10);
    if (isNaN(budget) || budget <= 0) budget = 100000;

    // Update label
    document.getElementById('budget-total').textContent = budget.toLocaleString();
    document.getElementById('budget-spent').textContent = monthlySpent.toLocaleString();

    // Calculate percent for width
    const container = document.querySelector('.budget-lines-bar-bg');
    const width = container ? container.offsetWidth : 120;

    // Green line: budget
    const greenLine = document.getElementById('budget-line-green');
    greenLine.style.width = Math.min(100, (budget / Math.max(budget, monthlySpent)) * 100) + "%";
    greenLine.style.left = "0px";

    // Red line: spent
    const redLine = document.getElementById('budget-line-red');
    redLine.style.width = Math.min(100, (monthlySpent / Math.max(budget, monthlySpent)) * 100) + "%";
    redLine.style.left = "0px";
}

// Fetch and display monthly expense
document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8000/api/expenses/monthly_total')
      .then(res => res.json())
      .then(data => {
        updateBudgetLines(data.total);
      })
      .catch(() => {
        updateBudgetLines(0);
      });
});
