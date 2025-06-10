// --- Helper to show popup messages ---
function showPopup(message) {
  let popup = document.createElement('div');
  popup.className = 'custom-popup';
  popup.textContent = message;
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.remove();
  }, 2000);
}

// --- Helper to render all jobs from localStorage ---
function renderJobs() {
  const jobList = JSON.parse(localStorage.getItem("jobs")) || [];
  const jobContainer = document.getElementById('job-list');
  if (!jobContainer) return;
  jobContainer.innerHTML = '';
  jobList.forEach((job, idx) => {
    addJobCard(job, idx);
  });
}

function addJobCard(job, idx) {
  const jobContainer = document.getElementById('job-list');
  if (!jobContainer) return;
  const jobCard = document.createElement('div');
  jobCard.classList.add('job-card');

  const detailsDiv = document.createElement('div');
  detailsDiv.classList.add('details');
  detailsDiv.innerHTML = `<strong>${job.title}</strong> | ${job.company} | ${job.fileName}`;
  jobCard.appendChild(detailsDiv);

  // View CV button if fileUrl exists
  if (job.fileUrl) {
    const viewBtn = document.createElement('button');
    viewBtn.classList.add('view-cv');
    viewBtn.textContent = 'View CV';
    viewBtn.addEventListener('click', () => {
      window.open(job.fileUrl, '_blank');
    });
    jobCard.appendChild(viewBtn);
  }

  const actionsDiv = document.createElement('div');
  actionsDiv.classList.add('actions');

  const acceptedBtn = document.createElement('button');
  acceptedBtn.classList.add('accepted');
  acceptedBtn.textContent = 'Accepted';

  const rejectedBtn = document.createElement('button');
  rejectedBtn.classList.add('rejected');
  rejectedBtn.textContent = 'Rejected';

  const pendingBtn = document.createElement('button');
  pendingBtn.classList.add('pending');
  pendingBtn.textContent = 'Pending';

  actionsDiv.appendChild(acceptedBtn);
  actionsDiv.appendChild(rejectedBtn);
  actionsDiv.appendChild(pendingBtn);
  jobCard.appendChild(actionsDiv);

  jobContainer.appendChild(jobCard);

  // Button functionality
  acceptedBtn.addEventListener('click', () => {
    const jobList = JSON.parse(localStorage.getItem("jobs")) || [];
    jobList.splice(idx, 1);
    localStorage.setItem("jobs", JSON.stringify(jobList));
    jobCard.remove();
    showPopup('Congrats on landing the job!');
    renderJobs();
  });

  rejectedBtn.addEventListener('click', () => {
    const jobList = JSON.parse(localStorage.getItem("jobs")) || [];
    jobList.splice(idx, 1);
    localStorage.setItem("jobs", JSON.stringify(jobList));
    jobCard.remove();
    showPopup('There are more chances to succeed!');
    renderJobs();
  });

  pendingBtn.addEventListener('click', () => {
    jobCard.classList.toggle('pending-state');
  });
}

const jobForm = document.getElementById('job-form');
if (jobForm) {
  jobForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('job-title')?.value || '';
    const company = document.getElementById('company-name')?.value || '';
    const fileInput = document.getElementById('portfolio-file');
    const file = fileInput && fileInput.files[0];
    const fileName = file ? file.name : 'N/A';

    // Create a file URL for preview if file exists
    let fileUrl = '';
    if (file) {
      fileUrl = URL.createObjectURL(file);
    }

    const job = { 
      title, 
      company, 
      fileName, 
      fileUrl, 
      date: new Date().toISOString().slice(0, 10) // Add this line
    };

    // Save to localStorage
    const jobList = JSON.parse(localStorage.getItem("jobs")) || [];
    jobList.push(job);
    localStorage.setItem("jobs", JSON.stringify(jobList));

    renderJobs();
    showPopup('Job added!');

    // Clear form
    this.reset();
  });
}

// --- Listen for job changes in localStorage ---
window.addEventListener('storage', function(e) {
  if (e.key === 'jobs') {
    renderJobs();
  }
});

// --- Job Tracker Initialization ---
document.addEventListener('DOMContentLoaded', function () {
  renderJobs();
});

// --- Add styles for popup and pending state ---
const style = document.createElement('style');
style.textContent = `
.custom-popup {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #222;
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  z-index: 9999;
  font-size: 1rem;
  opacity: 0.95;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.job-card.pending-state {
  background: #fffbe6;
  border: 2px solid #ffe066;
}
.job-card .actions button,
button.view-cv {
  margin: 6px 6px 0 0;
  background: #f5f5f5;
  color: #222;
  border: 1px solid #ccc;
  padding: 6px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: background 0.2s, transform 0.1s;
  display: inline-block;
  vertical-align: middle;
}
.job-card .actions button:hover,
button.view-cv:hover {
  background: #e0e0e0;
  transform: translateY(-2px) scale(1.04);
}
.job-card .view-cv {
  margin-left: 0;
  margin-right: 6px;
}
`;
document.head.appendChild(style);
