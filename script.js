document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Load tasks from LocalStorage
    let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];
    let currentFilter = 'all';

    // Set today as default date in input
    const today = new Date().toISOString().split('T')[0];
    taskDate.value = today;

    // Render tasks
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks.map((task, index) => ({...task, originalIndex: index}));
        
        if (currentFilter === 'active') {
            filteredTasks = filteredTasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = filteredTasks.filter(t => t.completed);
        }

        filteredTasks.forEach((task) => {
            const index = task.originalIndex;
            const dateStr = task.date ? escapeHtml(task.date) : ''; // Backward compatibility for old data

            const li = document.createElement('li');
            li.className = `task-item task-enter flex flex-col p-4 bg-[#171717] border ${task.completed ? 'border-dark-border opacity-60' : 'border-[#333] hover:border-gray-500'} rounded-sm group`;
            
            li.innerHTML = `
                <div class="flex items-start justify-between gap-3">
                    <label class="flex items-start gap-4 flex-1 min-w-0 cursor-pointer pt-0.5">
                        <input type="checkbox" class="custom-checkbox shrink-0 mt-0.5" ${task.completed ? 'checked' : ''} data-index="${index}">
                        <div class="flex flex-col flex-1 min-w-0 gap-1.5">
                            <span class="block text-[15px] ${task.completed ? 'text-gray-500 completed-task' : 'text-gray-200'}">
                                <span class="line-through-transition break-words whitespace-pre-wrap">${escapeHtml(task.text)}</span>
                            </span>
                            ${dateStr ? `<span class="text-[11px] text-neon-orange font-bold uppercase tracking-wider flex items-center gap-1.5 opacity-90">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                ${dateStr}
                            </span>` : ''}
                        </div>
                    </label>
                    <button class="delete-btn opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-2 text-gray-500 hover:text-neon-orange hover:bg-neon-orange/10 rounded-sm shrink-0 outline-none focus:ring-1 focus:ring-neon-orange" data-index="${index}" aria-label="Delete task">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;
            taskList.appendChild(li);
        });
        updateTaskCount();
        attachEventListeners();
    }

    // Helper to escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return '';
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
        const date = taskDate.value;
        if (text) {
            tasks.push({ text: text, completed: false, date: date });
            saveTasks();
            taskInput.value = '';
            // taskDate.value continues to be the last used date
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
        let count = 0;
        if (currentFilter === 'all') {
            count = tasks.length;
        } else if (currentFilter === 'active') {
            count = tasks.filter(t => !t.completed).length;
        } else if (currentFilter === 'completed') {
            count = tasks.filter(t => t.completed).length;
        }
        taskCount.textContent = count === 1 ? '1 TASK' : `${count} TASKS`;
    }

    // Filter Navigation
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active classes
            filterBtns.forEach(b => {
                b.classList.remove('text-neon-blue', 'border-neon-blue', 'shadow-[0_4px_10px_-4px_rgba(0,255,255,0.5)]');
                b.classList.add('text-gray-500', 'border-transparent');
            });
            
            // Add active classes to target
            const target = e.currentTarget;
            target.classList.remove('text-gray-500', 'border-transparent');
            target.classList.add('text-neon-blue', 'border-neon-blue', 'shadow-[0_4px_10px_-4px_rgba(0,255,255,0.5)]');
            
            currentFilter = target.getAttribute('data-filter');
            renderTasks();
        });
    });

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
