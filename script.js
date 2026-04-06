document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');

    // Load tasks from LocalStorage
    let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];

    // Render tasks
    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `task-item task-enter flex items-center justify-between p-4 bg-white border ${task.completed ? 'border-slate-100 bg-slate-50/50' : 'border-slate-100'} rounded-xl shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] group`;
            
            li.innerHTML = `
                <label class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                    <input type="checkbox" class="custom-checkbox shrink-0" ${task.completed ? 'checked' : ''} data-index="${index}">
                    <span class="truncate block text-[15px] ${task.completed ? 'text-slate-400 completed-task' : 'text-slate-700 font-medium'}">
                        <span class="line-through-transition">${escapeHtml(task.text)}</span>
                    </span>
                </label>
                <button class="delete-btn opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg ml-2 shrink-0 outline-none focus:ring-2 focus:ring-red-200" data-index="${index}" aria-label="Delete task">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            `;
            taskList.appendChild(li);
        });
        updateTaskCount();
        attachEventListeners();
    }

    // Helper to escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    // Add Task
    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ text: text, completed: false });
            saveTasks();
            taskInput.value = '';
            renderTasks();
            taskInput.focus();
        }
    }

    // Save to LocalStorage
    function saveTasks() {
        localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    }

    // Update Count
    function updateTaskCount() {
        const count = tasks.length;
        taskCount.textContent = count === 1 ? '1 task' : `${count} tasks`;
    }

    // Event Listeners for Dynamic Elements
    function attachEventListeners() {
        const checkboxes = document.querySelectorAll('.custom-checkbox');
        checkboxes.forEach(box => {
            box.addEventListener('change', (e) => {
                const index = e.target.getAttribute('data-index');
                tasks[index].completed = e.target.checked;
                saveTasks();
                renderTasks();
            });
        });

        const deleteBtns = document.querySelectorAll('.delete-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
            });
        });
    }

    // Add Button Click
    addBtn.addEventListener('click', addTask);

    // Enter Key Press
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Initial Render
    renderTasks();
});
