document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const taskCount = document.getElementById('task-count');
    const congratsOverlay = document.getElementById('congrats-overlay');
    const closeCongratsBtn = document.getElementById('close-congrats-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Save tasks to localStorage
    const saveTasksToLocalStorage = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Update task count and check for completion
    const updateTaskCount = () => {
        const pendingTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${tasks.length} tasks`;

        if (tasks.length > 0 && pendingTasks === 0) {
            congratsOverlay.classList.add('visible');
        } else {
            congratsOverlay.classList.remove('visible');
        }
    };

    // Add a new task
    const addTask = () => {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;

        if (taskText) {
            tasks.push({
                text: taskText,
                priority,
                completed: false,
            });
            taskInput.value = '';
            saveTasksToLocalStorage();
            renderTasks();
        }
    };

    // Render tasks based on filters
    const renderTasks = (filter = 'all') => {
        taskList.innerHTML = '';

        let filteredTasks = tasks;

        if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (filter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        }

        filteredTasks.forEach((task, index) => {
            const taskItem = document.createElement('li');
            taskItem.className = task.completed ? 'completed' : '';
            taskItem.style.backgroundColor = '#6c9da6';
            taskItem.style.color = '#000';

            taskItem.innerHTML = `
                <span class="task-text" data-index="${index}">${task.text}</span>
                <span class="priority-label ${task.priority}">${task.priority}</span>
                <div class="task-actions">
                    ${
                        task.completed
                            ? `<button class="undo-btn" data-index="${index}">Undo</button>`
                            : `<button class="complete-btn" data-index="${index}">Complete</button>`
                    }
                    <button class="delete-btn" data-index="${index}">Delete</button>
                </div>
            `;

            taskItem.querySelectorAll('.task-actions button').forEach(button => {
                button.style.fontWeight = 'bold';
            });

            // Handle double-click for inline editing
            const taskText = taskItem.querySelector('.task-text');
            taskText.addEventListener('dblclick', () => enableEditTask(taskText, index));

            taskList.appendChild(taskItem);
        });

        updateTaskCount();
    };

    // Enable editing of a task
    const enableEditTask = (taskText, index) => {
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = taskText.textContent;
        inputField.className = 'edit-input';
        inputField.style.width = '60%';

        taskText.replaceWith(inputField);
        inputField.focus();

        // Save edited task when clicking anywhere on the screen
        const saveEditedTask = () => {
            const newText = inputField.value.trim();
            if (newText) {
                tasks[index].text = newText;
                saveTasksToLocalStorage();
                renderTasks();
            } else {
                alert('Task text cannot be empty!');
                renderTasks();
            }
            document.removeEventListener('click', saveEditedTask); // Remove event listener after saving
        };

        document.addEventListener('click', (event) => {
            if (event.target !== inputField) {
                saveEditedTask();
            }
        }, { once: true });
    };

    // Mark a task as complete
    const completeTask = (index) => {
        tasks[index].completed = true;
        saveTasksToLocalStorage();
        renderTasks();
    };

    // Undo a completed task
    const undoTask = (index) => {
        tasks[index].completed = false;
        saveTasksToLocalStorage();
        renderTasks();
    };

    // Delete a task
    const deleteTask = (index) => {
        tasks.splice(index, 1);
        saveTasksToLocalStorage();
        renderTasks();
    };

    // Handle task actions
    taskList.addEventListener('click', (e) => {
        const index = e.target.dataset.index;

        if (e.target.classList.contains('complete-btn')) {
            completeTask(index);
        } else if (e.target.classList.contains('undo-btn')) {
            undoTask(index);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteTask(index);
        }
    });

    // Handle filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            renderTasks(filter);
        });
    });

    // Handle the "Add" button
    addTaskBtn.addEventListener('click', addTask);

    // Handle "Enter" key for adding tasks
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Close congratulations message
    closeCongratsBtn.addEventListener('click', () => {
        congratsOverlay.classList.remove('visible');
    });

    // Initial render
    renderTasks();
});
