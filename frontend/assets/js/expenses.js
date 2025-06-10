// frontend/assets/js/expenses.js

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fileInput = document.getElementById('csvFile');
  if (!fileInput.files.length) {
    alert("Please select a CSV file.");
    return;
  }

  const formData = new FormData();
  formData.append('csvFile', fileInput.files[0]);

  try {
    const response = await fetch('http://localhost:8000/api/expenses/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.transactions.length === 0) {
      alert("No transactions found in uploaded file.");
      return;
    }

    renderSummary(data);
  } catch (error) {
    alert("Upload failed: " + error.message);
  }
});

// Show previous results on page load if present
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('lastExpensesSummary')) {
    const data = JSON.parse(localStorage.getItem('lastExpensesSummary'));
    renderSummary(data);
  }
});

function renderSummary(data) {
  // Save results after each upload
  localStorage.setItem('lastExpensesSummary', JSON.stringify(data));

  // Show summary section
  document.getElementById('summarySection').style.display = 'block';

  // Highest Expense
  const maxExp = data.maxExpense;
  document.getElementById('maxExpense').textContent = `${maxExp.amount.toFixed(2)} in ${maxExp.category} (${maxExp.month})`;

  // Render transactions table
  const tbody = document.querySelector('#transactionTable tbody');
  tbody.innerHTML = '';
  data.transactions.forEach(txn => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${txn.date}</td>
      <td>${txn.description}</td>
      <td>${txn.amount.toFixed(2)}</td>
      <td>${txn.category}</td>
    `;
    tbody.appendChild(tr);
  });

  // Render main summary chart
  renderChart(data.summary);

  // Fetch and render additional insights (other charts)
  fetch('http://localhost:8000/api/expenses/insights')
    .then(res => res.json())
    .then(insights => {
      renderSavedAmountChart(insights.savedPerMonth);
      renderTopCategoriesChart(insights.topCategories);
      renderMonthlyTrendsChart(insights.monthlyTrends);
      renderRecurringList(insights.recurring);
      renderTopMerchants(insights.topMerchants);
      updateBudgetWidget(insights.budget, insights.monthlyTotals);
      // Make sure summary section is visible even if insights fail
      document.getElementById('summarySection').style.display = 'block';
    })
    .catch(err => {
      console.error("Insights fetch failed", err);
      document.getElementById('summarySection').style.display = 'block';
    });
}

// Saved Amount Per Month
function renderSavedAmountChart(savedPerMonth) {
  const ctx = document.getElementById('savedAmountChart').getContext('2d');
  if (window.savedAmountChart && typeof window.savedAmountChart.destroy === 'function') {
    window.savedAmountChart.destroy();
  }
  window.savedAmountChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(savedPerMonth),
      datasets: [{
        label: 'Saved Amount',
        data: Object.values(savedPerMonth),
        backgroundColor: '#109618'
      }]
    }
  });
}

// Top Categories Pie Chart
function renderTopCategoriesChart(topCategories) {
  const ctx = document.getElementById('topCategoriesChart').getContext('2d');
  if (window.topCategoriesChart) window.topCategoriesChart.destroy();
  window.topCategoriesChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(topCategories),
      datasets: [{
        data: Object.values(topCategories),
        backgroundColor: generateColors(Object.keys(topCategories).length)
      }]
    }
  });
}

// Monthly Trends Line Chart
function renderMonthlyTrendsChart(monthlyTrends) {
  const ctx = document.getElementById('monthlyTrendsChart').getContext('2d');
  if (window.monthlyTrendsChart) window.monthlyTrendsChart.destroy();
  window.monthlyTrendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: monthlyTrends.months,
      datasets: [
        {
          label: 'Expenses',
          data: monthlyTrends.expenses,
          borderColor: '#DC3912',
          fill: false
        },
        {
          label: 'Income',
          data: monthlyTrends.income,
          borderColor: '#3366CC',
          fill: false
        }
      ]
    }
  });
}

// Recurring Expenses List
function renderRecurringList(recurring) {
  const ul = document.getElementById('recurringList');
  ul.innerHTML = '';
  recurring.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.description} (${item.amount.toFixed(2)} per month)`;
    ul.appendChild(li);
  });
}

// Top Merchants List
function renderTopMerchants(topMerchants) {
  const ul = document.getElementById('topMerchantsList');
  ul.innerHTML = '';
  topMerchants.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.description} (${item.count} times, ${item.total.toFixed(2)})`;
    ul.appendChild(li);
  });
}

// Budget Widget
document.getElementById('budgetForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const budget = parseFloat(document.getElementById('monthlyBudget').value);
  localStorage.setItem('monthlyBudget', budget);
  document.getElementById('budgetStatus').textContent = 'Budget saved!';
});

function updateBudgetWidget(budget, monthlyTotals) {
  const userBudget = parseFloat(localStorage.getItem('monthlyBudget') || 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const spent = monthlyTotals[currentMonth] || 0;
  let status = '';
  if (userBudget) {
    if (spent > userBudget) {
      status = `You have exceeded your budget by ${(spent - userBudget).toFixed(2)} this month!`;
    } else {
      status = `You have ${(userBudget - spent).toFixed(2)} left in your budget this month.`;
    }
  }
  document.getElementById('budgetStatus').textContent = status;
  document.getElementById('budget-total').textContent = userBudget.toFixed(2);
  document.getElementById('budget-spent').textContent = spent.toFixed(2);
  updateBudgetProgressBar(spent, userBudget);
}

function renderChart(summary) {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  if (window.expenseChart && typeof window.expenseChart.destroy === 'function') {
    window.expenseChart.destroy();
  }
  window.expenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(summary),
      datasets: [{
        label: 'Expenses',
        data: Object.values(summary),
        backgroundColor: '#2980b9'
      }]
    }
  });
}

function generateColors(num) {
  const palette = [
    '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
    '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395'
  ];
  const colors = [];
  for (let i = 0; i < num; i++) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
}

window.addEventListener('storage', function(e) {
    // Budget or expenses changed
    if (e.key === 'monthlyBudget' || e.key === 'expenses') {
        // Optionally re-fetch and update budget widget and charts
        if (typeof updateBudgetWidget === 'function') {
            // You may want to re-fetch or just re-read localStorage
            // For example, you could call renderSummary with last summary:
            if (localStorage.getItem('lastExpensesSummary')) {
                const data = JSON.parse(localStorage.getItem('lastExpensesSummary'));
                renderSummary(data);
            }
        }
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
});