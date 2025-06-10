// Wait until DOM is ready
document.addEventListener('DOMContentLoaded', () => {

  // --- Dashboard Chart Renderer ---
  function renderActivityChart() {
    const chartEl = document.getElementById('activityChart');
    if (!chartEl || typeof window.Chart === "undefined") return;

    fetch('http://localhost:8000/api/job_tracker/weekly_activity')
      .then(res => res.json())
      .then(activity => {
      const ctx = chartEl.getContext('2d');
      new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: activity.labels,
          datasets: [{
            label: 'Submissions',
            data: activity.data,
            backgroundColor: 'rgba(41, 128, 185, 0.1)',
            borderColor: '#2980b9',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
      });
  }

  // --- Budget Progress Bar Logic (for dashboard, not sidebar) ---
  function updateBudgetProgressBar(monthlySpent) {
    // Get/set budget from localStorage, default ₦100,000
    let budget = parseInt(localStorage.getItem('monthlyBudget'), 10);
    if (isNaN(budget) || budget <= 0) budget = 100000;

    // Update label
    document.getElementById('budget-spent').textContent = `₦${monthlySpent.toLocaleString()}`;
    document.getElementById('budget-total').textContent = `₦${budget.toLocaleString()}`;
    document.getElementById('budget-input').value = budget;

    // Calculate percent
    let percent = Math.min(100, Math.round((monthlySpent / budget) * 100));
    const bar = document.getElementById('budget-progress-bar');
    bar.style.width = percent + "%";

    // Color code: blue (<70%), orange (70-99%), red (100%+)
    if (percent < 70) {
      bar.style.background = "linear-gradient(90deg, #2980b9 60%, #6dd5fa 100%)";
    } else if (percent < 100) {
      bar.style.background = "linear-gradient(90deg, #f39c12 60%, #f7b731 100%)";
    } else {
      bar.style.background = "linear-gradient(90deg, #c0392b 60%, #e74c3c 100%)";
    }
  }

  // Save budget handler
  const budgetInput = document.getElementById('budget-input');
  const budgetSaveBtn = document.getElementById('budget-save-btn');
  if (budgetInput && budgetSaveBtn) {
    budgetSaveBtn.addEventListener('click', () => {
      let val = parseInt(budgetInput.value, 10);
      if (!isNaN(val) && val > 0) {
        localStorage.setItem('monthlyBudget', val);
        // Re-fetch and update bar with new budget
        fetch('http://localhost:8000/api/expenses/monthly_total')
          .then(res => res.json())
          .then(data => updateBudgetProgressBar(data.total));
      }
    });
  }

  // Fetch and display monthly expense for dashboard
  fetch('http://localhost:8000/api/expenses/monthly_total')
    .then(res => res.json())
    .then(data => {
      document.getElementById('monthly-expense-amount').textContent = `₦${data.total.toLocaleString()}`;
      updateBudgetProgressBar(data.total);
    })
    .catch(() => {
      document.getElementById('monthly-expense-amount').textContent = '₦0';
      updateBudgetProgressBar(0);
    });

  // --- Mood & Productivity Tracker Logic ---

  // Helper to get today's date as YYYY-MM-DD
  function getToday() {
      return new Date().toISOString().slice(0, 10);
  }

  // Load mood/productivity data from localStorage
  function loadMoodData() {
      return JSON.parse(localStorage.getItem('moodProductivityData') || '{}');
  }

  // Save mood/productivity data to localStorage
  function saveMoodData(data) {
      localStorage.setItem('moodProductivityData', JSON.stringify(data));
  }

  // Render the chart
  function renderMoodChart() {
      const data = loadMoodData();
      const days = Object.keys(data).sort();
      const moods = days.map(day => data[day].mood);
      const productivity = days.map(day => data[day].productivity);

      const ctx = document.getElementById('activityChart').getContext('2d');
      if (window.moodProductivityChart) window.moodProductivityChart.destroy();
      window.moodProductivityChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: days,
              datasets: [
                  {
                      label: 'Mood',
                      data: moods,
                      borderColor: '#2980b9',
                      backgroundColor: 'rgba(41,128,185,0.08)',
                      tension: 0.2,
                      yAxisID: 'y',
                  },
                  {
                      label: 'Productivity',
                      data: productivity,
                      borderColor: '#27ae60',
                      backgroundColor: 'rgba(39,174,96,0.08)',
                      tension: 0.2,
                      yAxisID: 'y',
                  }
              ]
          },
          options: {
              responsive: true,
              scales: {
                  y: {
                      min: 1,
                      max: 5,
                      ticks: {
                          stepSize: 1,
                          callback: function(value) {
                              // For mood: 1-5, show emoji; for productivity: show text
                              if (this.getLabelForValue) {
                                  // Mood
                                  return ['😞','😐','🙂','😃','🤩'][value-1] || value;
                              }
                              return value;
                          }
                      }
                  }
              },
              plugins: {
                  legend: { display: true }
              }
          }
      });
  }

  // Handle form submission
  document.getElementById('mood-productivity-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const mood = parseInt(document.getElementById('mood-select').value, 10);
      const productivity = parseInt(document.getElementById('productivity-select').value, 10);
      const today = getToday();
      const data = loadMoodData();
      data[today] = { mood, productivity };
      saveMoodData(data);
      renderMoodChart();
  });

  // Render chart on page load
  document.addEventListener('DOMContentLoaded', renderMoodChart);

  // --- Smart Reminder Modal Logic ---
  const reminderBtn = document.getElementById('add-reminder-btn');
  const reminderModal = document.getElementById('reminder-modal');
  const closeReminderModal = document.getElementById('close-reminder-modal');
  const reminderForm = document.getElementById('reminder-form');
  const reminderList = document.getElementById('reminder-list');

  function getReminders() {
      return JSON.parse(localStorage.getItem('reminders') || '[]');
  }
  function saveReminders(reminders) {
      localStorage.setItem('reminders', JSON.stringify(reminders));
  }
  function renderReminders() {
      const reminders = getReminders();
      reminderList.innerHTML = '';
      reminders
          .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
          .forEach((rem, idx) => {
              const li = document.createElement('li');
              li.innerHTML = `
                  <span class="reminder-title">${rem.title}</span>
                  <span class="reminder-type">${rem.type}</span>
                  <span class="reminder-time">${new Date(rem.datetime).toLocaleString()}</span>
                  <button title="Delete" onclick="deleteReminder(${idx})">&times;</button>
              `;
              reminderList.appendChild(li);
          });
  }
  window.deleteReminder = function(idx) {
      const reminders = getReminders();
      reminders.splice(idx, 1);
      saveReminders(reminders);
      renderReminders();
  };

  if (reminderBtn && reminderModal && closeReminderModal) {
      reminderBtn.onclick = () => { reminderModal.style.display = 'flex'; };
      closeReminderModal.onclick = () => { reminderModal.style.display = 'none'; };
      window.onclick = function(event) {
          if (event.target === reminderModal) reminderModal.style.display = 'none';
      };
  }

  if (reminderForm) {
      reminderForm.onsubmit = function(e) {
          e.preventDefault();
          const title = document.getElementById('reminder-title').value.trim();
          const datetime = document.getElementById('reminder-datetime').value;
          const type = document.getElementById('reminder-type').value;
          if (!title || !datetime) return;
          const reminders = getReminders();
          reminders.push({ title, datetime, type });
          saveReminders(reminders);
          renderReminders();
          reminderModal.style.display = 'none';
          reminderForm.reset();
      };
      renderReminders();
  }

  // --- Savings Streak Logic ---
  function calculateSavingsStreak(expenses) {
    // expenses: [{date: "YYYY-MM-DD", amount: 123}, ...]
    // Group by date, sum per day
    const today = new Date();
    let streak = 0;
    let best = 0;
    let current = 0;
    let dateMap = {};
    expenses.forEach(e => {
      if (!dateMap[e.date]) dateMap[e.date] = 0;
      dateMap[e.date] += Math.abs(Number(e.amount));
    });

    // Find best streak and current streak
    let d = new Date();
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toISOString().slice(0, 10);
      if (!dateMap[dateStr] || dateMap[dateStr] === 0) {
        current++;
        best = Math.max(best, current);
      } else {
        if (i === 0) streak = current;
        current = 0;
      }
      d.setDate(d.getDate() - 1);
    }
    // If today is a savings day, streak = current
    if (!dateMap[today.toISOString().slice(0, 10)] || dateMap[today.toISOString().slice(0, 10)] === 0) {
      streak = current;
    }
    return { streak, best };
  }

  // Fetch expenses and update streak card
  fetch('http://localhost:8000/api/expenses/all')
    .then(res => res.json())
    .then(data => {
      const { streak, best } = calculateSavingsStreak(data);
      document.getElementById('current-savings-streak').textContent = streak;
      document.getElementById('best-savings-streak').textContent = best;
    })
    .catch(() => {
      document.getElementById('current-savings-streak').textContent = 0;
      document.getElementById('best-savings-streak').textContent = 0;
    });

  // --- Count Jobs This Week ---
  function countJobsThisWeek() {
    const jobs = JSON.parse(localStorage.getItem("jobs") || "[]");
    const now = new Date();
    // Set to start of week (Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0,0,0,0);

    let count = 0;
    jobs.forEach(job => {
      if (job.date) {
        const jobDate = new Date(job.date);
        jobDate.setHours(0,0,0,0);
        if (jobDate >= startOfWeek && jobDate <= now) count++;
      }
    });
    const el = document.getElementById('weekly-job-count');
    if (el) el.textContent = count;
  }
  document.addEventListener('DOMContentLoaded', countJobsThisWeek);
  window.addEventListener('storage', function(e) {
    if (e.key === 'jobs') countJobsThisWeek();
  });

  // --- Call dashboard-only functions ---
  renderActivityChart();
});

window.addEventListener('storage', function(e) {
    // Mood & Productivity (if you want to sync across tabs)
    if (e.key === 'moodData') {
        if (typeof updateMoodChart === 'function') updateMoodChart();
    }
    // Reminders
    if (e.key === 'reminders') {
        if (typeof renderReminders === 'function') renderReminders();
    }
    // Profile image
    if (e.key === 'profileImage') {
        const img = document.getElementById('sidebar-profile-pic');
        const storedImg = localStorage.getItem('profileImage');
        if (img) img.src = storedImg ? storedImg : 'assets/img/placeholder.png';
    }
    // Username
    if (e.key === 'username') {
        const displayEl = document.getElementById("username-display");
        if (displayEl) displayEl.textContent = e.newValue || "Guest";
    }
    // Budget/expenses
    if (e.key === 'monthlyBudget' || e.key === 'expenses') {
        fetch('http://localhost:8000/api/expenses/monthly_total')
            .then(res => res.json())
            .then(data => {
                if (typeof updateBudgetProgressBar === 'function') updateBudgetProgressBar(data.total);
            });
    }
});
