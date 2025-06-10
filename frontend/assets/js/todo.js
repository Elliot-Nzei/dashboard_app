// Load existing tasks from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        const mainTask = createTaskItem(task.text, false, task.id);
        document.getElementById('todo-list').appendChild(mainTask);

        // Notify sidebar.js to add this task
        document.dispatchEvent(new CustomEvent('sidebar:add', { detail: { text: task.text } }));
    });
});

// Handle task submission
document.getElementById('todo-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const input = document.getElementById('todo-input');
    const task = input.value.trim();
    if (!task) return;

    // Update DOM
    const mainTask = createTaskItem(task);
    document.getElementById('todo-list').appendChild(mainTask);

    // Notify sidebar.js to add this task
    document.dispatchEvent(new CustomEvent('sidebar:add', { detail: { text: task } }));

    // Save to localStorage
    saveTask(task);

    input.value = '';
});

function createTaskItem(taskText, isSidebar = false, taskId = null) {
    const li = document.createElement('li');
    li.textContent = taskText;
    if (taskId) {
        li.dataset.id = taskId;
    }

    if (!isSidebar) {
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            li.remove();
            removeMatchingSidebarTask(taskText);
            deleteTask(taskText);
        });

        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.justifyContent = 'space-between';
        li.style.gap = '4px';

        const textSpan = document.createElement('span');
        textSpan.textContent = taskText;
        li.textContent = '';
        li.appendChild(textSpan);

        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.className = 'edit-btn';
        editBtn.style.marginRight = '8px';

        const btnContainer = document.createElement('span');
        btnContainer.style.display = 'flex';
        btnContainer.style.gap = '4px';
        btnContainer.appendChild(editBtn);
        btnContainer.appendChild(removeBtn);

        li.appendChild(btnContainer);

        li.classList.add('todo-item');
        textSpan.className = 'todo-text';

        editBtn.addEventListener('click', () => {
            const li = editBtn.closest('.todo-item');
            const textSpan = li.querySelector('.todo-text');
            const taskText = textSpan.textContent.trim();

            const input = document.createElement('input');
            input.type = 'text';
            input.value = taskText;
            input.className = 'edit-input';
            input.style.flex = '1';

            li.replaceChild(input, textSpan);
            input.focus();

            function saveEdit() {
                const newText = input.value.trim();
                if (newText && newText !== taskText) {
                    updateTask(taskText, newText, li);
                }
                const newSpan = document.createElement('span');
                newSpan.className = 'todo-text';
                newSpan.textContent = newText || taskText;
                li.replaceChild(newSpan, input);
            }

            input.addEventListener('blur', saveEdit);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') input.blur();
                else if (e.key === 'Escape') {
                    li.replaceChild(textSpan, input);
                }
            });
        });
    }

    return li;
}

function removeMatchingSidebarTask(taskText) {
    document.dispatchEvent(new CustomEvent('sidebar:remove', { detail: { text: taskText } }));
}

function saveTask(taskText) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (!tasks.some(task => task.text === taskText)) {
        const newTask = { id: Date.now(), text: taskText };
        tasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateSidebarTodosNow(); // <-- Add this line
        window.dispatchEvent(new StorageEvent('storage', { key: 'tasks', newValue: JSON.stringify(tasks) }));
    }
}

function deleteTask(taskText) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.text !== taskText);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateSidebarTodosNow(); // <-- Add this line
    window.dispatchEvent(new StorageEvent('storage', { key: 'tasks', newValue: JSON.stringify(tasks) }));
}

function updateTask(oldText, newText, li) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.text === oldText);
    if (task) {
        task.text = newText;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateSidebarTodosNow(); // <-- Add this line
        window.dispatchEvent(new StorageEvent('storage', { key: 'tasks', newValue: JSON.stringify(tasks) }));
        li.childNodes[0].textContent = newText;
        document.dispatchEvent(new CustomEvent('sidebar:update', { detail: { oldText, newText } }));
    }
}

function updateSidebarTodosNow() {
    if (typeof window.loadSidebarTodos === 'function') {
        window.loadSidebarTodos();
    }
}

window.addEventListener('storage', function(e) {
    if (e.key === 'tasks' || e.key === 'todos') {
        if (typeof renderTodoList === 'function') renderTodoList();
    }
    if (e.key === 'profileImage') {
        const img = document.getElementById('sidebar-profile-pic');
        const storedImg = localStorage.getItem('profileImage');
        if (img) img.src = storedImg ? storedImg : 'assets/img/placeholder.png';
    }
    if (e.key === 'username') {
        const displayEl = document.getElementById("username-display");
        if (displayEl) displayEl.textContent = e.newValue || "Guest";
    }
});