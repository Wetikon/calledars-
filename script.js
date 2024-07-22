document.addEventListener('DOMContentLoaded', () => {
    const months = ['July 2024', 'August 2024', 'September 2024'];
    let currentMonthIndex = 0;
    const calendarData = {
        'July 2024': [
            [1, 2, 3, 4, 5, 6, 7],
            [8, 9, 10, 11, 12, 13, 14],
            [15, 16, 17, 18, 19, 20, 21],
            [22, 23, 24, 25, 26, 27, 28],
            [29, 30, 31, 0, 0, 0, 0]
        ],
        'August 2024': [
            [0, 0, 0, 1, 2, 3, 4],
            [5, 6, 7, 8, 9, 10, 11],
            [12, 13, 14, 15, 16, 17, 18],
            [19, 20, 21, 22, 23, 24, 25],
            [26, 27, 28, 29, 30, 31, 0]
        ],
        'September 2024': [
            [0, 0, 0, 0, 0, 0, 1],
            [2, 3, 4, 5, 6, 7, 8],
            [9, 10, 11, 12, 13, 14, 15],
            [16, 17, 18, 19, 20, 21, 22],
            [23, 24, 25, 26, 27, 28, 29],
            [30, 0, 0, 0, 0, 0, 0]
        ]
    };

    let calendarTasks = JSON.parse(localStorage.getItem('calendarTasks')) || {};
    let copiedTask = JSON.parse(localStorage.getItem('copiedTask'));

    const monthNameEl = document.querySelector('.month-name');
    const daysContainer = document.querySelector('.days');
    const progressEl = document.querySelector('.progress-bar-inner');
    const progressTextEl = document.querySelector('.progress-bar-text');
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');

    const saveTasks = () => {
        localStorage.setItem('calendarTasks', JSON.stringify(calendarTasks));
    };

    const calculateProgress = () => {
        let totalTasks = 0;
        let completedTasks = 0;
        for (let key in calendarTasks) {
            calendarTasks[key].forEach(task => {
                if (!task.noComplete) {
                    totalTasks++;
                    if (task.completed) completedTasks++;
                }
            });
        }
        const progress = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
        progressEl.style.width = `${progress}%`;
        progressTextEl.textContent = `${progress.toFixed(2)}% completed`;
    };

    const checkAndCompleteTask = (month, day, parentTaskIndex) => {
        const task = calendarTasks[`${month}-${day}`][parentTaskIndex];
        const allSubtasksCompleted = task.subtasks.every(subtask => subtask.completed);
        task.completed = allSubtasksCompleted;
    };

    const renderSubtasks = (subtaskListEl, subtasks, month, day, parentTaskIndex) => {
        if (subtasks.length > 0) {
            subtasks.forEach((subtask, subtaskIndex) => {
                const subtaskItem = document.createElement('li');
                const subtaskContent = subtask.link ? `<a href="${subtask.link}" target="_blank">${subtask.text}</a>` : subtask.text;
                subtaskItem.innerHTML = subtaskContent;
                subtaskItem.classList.add('subtask');
                if (subtask.completed) {
                    subtaskItem.classList.add('completed');
                }
                if (subtask.noComplete) {
                    subtaskItem.classList.add('no-complete');
                }
                subtaskItem.addEventListener('click', () => {
                    if (!subtask.noComplete) {
                        subtask.completed = !subtask.completed;
                        checkAndCompleteTask(month, day, parentTaskIndex);
                        saveTasks();
                        renderCalendar();
                    }
                });

                const optionsBtn = document.createElement('button');
                optionsBtn.textContent = ':';
                optionsBtn.classList.add('options-btn');
                const optionsMenu = document.createElement('div');
                optionsMenu.classList.add('options-menu');
                optionsMenu.innerHTML = `
                    <button class="complete-btn">Complete</button>
                    <button class="edit-subtask-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                    <button class="no-complete-btn">No Complete</button>
                    <button class="link-btn">Add Link</button>
                `;

                optionsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const activeMenus = document.querySelectorAll('.options-menu.active');
                    activeMenus.forEach(menu => {
                        if (menu !== optionsMenu) {
                            menu.classList.remove('active');
                        }
                    });
                    optionsMenu.classList.toggle('active');
                });

                const completeSubtaskBtn = optionsMenu.querySelector('.complete-btn');
                completeSubtaskBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    subtask.completed = !subtask.completed;
                    checkAndCompleteTask(month, day, parentTaskIndex);
                    saveTasks();
                    renderCalendar();
                    optionsMenu.classList.remove('active');
                });

                const editSubtaskBtn = optionsMenu.querySelector('.edit-subtask-btn');
                editSubtaskBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newSubtaskText = prompt('Edit subtask:', subtask.text);
                    if (newSubtaskText) {
                        subtask.text = newSubtaskText;
                        saveTasks();
                        renderCalendar();
                        optionsMenu.classList.remove('active');
                    }
                });

                const deleteSubtaskBtn = optionsMenu.querySelector('.delete-btn');
                deleteSubtaskBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    calendarTasks[`${month}-${day}`][parentTaskIndex].subtasks.splice(subtaskIndex, 1);
                    saveTasks();
                    renderCalendar();
                    optionsMenu.classList.remove('active');
                });

                const noCompleteSubtaskBtn = optionsMenu.querySelector('.no-complete-btn');
                noCompleteSubtaskBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    subtask.noComplete = !subtask.noComplete;
                    subtaskItem.classList.toggle('no-complete');
                    saveTasks();
                    renderCalendar();
                    optionsMenu.classList.remove('active');
                });

                const linkBtn = optionsMenu.querySelector('.link-btn');
                linkBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const newLink = prompt('Enter subtask link URL:', subtask.link || '');
                    if (newLink) {
                        subtask.link = newLink;
                        subtaskItem.innerHTML = `<a href="${subtask.link}" target="_blank">${subtask.text}</a>`;
                        saveTasks();
                        renderCalendar();
                        optionsMenu.classList.remove('active');
                    }
                });

                subtaskItem.appendChild(optionsBtn);
                subtaskItem.appendChild(optionsMenu);
                subtaskListEl.appendChild(subtaskItem);
            });
        }
    };

    const renderTasks = (dayEl, month, day) => {
        const taskList = document.createElement('ul');
        taskList.classList.add('task-list');
        const tasks = calendarTasks[`${month}-${day}`] || [];
        tasks.forEach((task, taskIndex) => {
            const taskItem = document.createElement('li');
            const taskContent = task.link ? `<a href="${task.link}" target="_blank">${task.text}</a>` : task.text;
            taskItem.innerHTML = taskContent;
            taskItem.classList.add('task');
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            if (task.noComplete) {
                taskItem.classList.add('no-complete');
            }

            // Create notes icon image
            const notesIcon = document.createElement('img');
            notesIcon.src = 'path-to-your-notes-icon.png'; // Update with your notes icon image path
            notesIcon.classList.add('notes-icon');
            notesIcon.style.display = task.notes ? 'inline' : 'none'; // Only show if notes exist

            // Create notes tooltip
            const notesTooltip = document.createElement('div');
            notesTooltip.classList.add('notes-tooltip');
            notesTooltip.textContent = task.notes || ''; // Display notes if available
            notesTooltip.style.display = task.notes ? 'block' : 'none'; // Only show if notes exist

            taskItem.appendChild(notesIcon);
            taskItem.appendChild(notesTooltip);

            taskItem.addEventListener('mouseover', () => {
                if (task.notes) {
                    notesIcon.style.display = 'inline';
                    notesTooltip.style.display = 'block';
                }
            });

            taskItem.addEventListener('mouseout', () => {
                if (task.notes) {
                    notesIcon.style.display = 'none';
                    notesTooltip.style.display = 'none';
                }
            });

            taskItem.addEventListener('click', () => {
                if (!task.noComplete) {
                    task.completed = !task.completed;
                    checkAndCompleteTask(month, day, taskIndex);
                    saveTasks();
                    renderCalendar();
                }
            });

            const optionsBtn = document.createElement('button');
            optionsBtn.textContent = ':';
            optionsBtn.classList.add('options-btn');
            const optionsMenu = document.createElement('div');
            optionsMenu.classList.add('options-menu');
            optionsMenu.innerHTML = `
                <button class="complete-btn">Complete</button>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
                <button class="add-subtask-btn">Add Subtask</button>
                <button class="copy-btn">Copy</button>
                <button class="paste-btn">Paste</button>
                <button class="no-complete-btn">No Complete</button>
                <button class="open-task-btn">Open Task</button>
                <button class="link-btn">Add Link</button>
                <button class="notes-btn">Notes</button>
            `;

            optionsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const activeMenus = document.querySelectorAll('.options-menu.active');
                activeMenus.forEach(menu => {
                    if (menu !== optionsMenu) {
                        menu.classList.remove('active');
                    }
                });
                optionsMenu.classList.toggle('active');
            });

            const completeTaskBtn = optionsMenu.querySelector('.complete-btn');
            completeTaskBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                task.completed = !task.completed;
                saveTasks();
                renderCalendar();
                optionsMenu.classList.remove('active');
            });

            const editTaskBtn = optionsMenu.querySelector('.edit-btn');
            editTaskBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newTaskText = prompt('Edit task:', task.text);
                if (newTaskText) {
                    task.text = newTaskText;
                    saveTasks();
                    renderCalendar();
                    optionsMenu.classList.remove('active');
                }
            });

            const deleteTaskBtn = optionsMenu.querySelector('.delete-btn');
            deleteTaskBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                calendarTasks[`${month}-${day}`].splice(taskIndex, 1);
                if (calendarTasks[`${month}-${day}`].length === 0) {
                    delete calendarTasks[`${month}-${day}`];
                }
                saveTasks();
                renderCalendar();
                optionsMenu.classList.remove('active');
            });

            const addSubtaskBtn = optionsMenu.querySelector('.add-subtask-btn');
            addSubtaskBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const subtaskText = prompt('Enter subtask:');
                if (subtaskText) {
                    if (!task.subtasks) {
                        task.subtasks = [];
                    }
                    task.subtasks.push({ text: subtaskText, completed: false });
                    saveTasks();
                    renderCalendar();
                    optionsMenu.classList.remove('active');
                }
            });

            const copyTaskBtn = optionsMenu.querySelector('.copy-btn');
            copyTaskBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                copiedTask = task;
                localStorage.setItem('copiedTask', JSON.stringify(copiedTask));
                alert('Task copied!');
                optionsMenu.classList.remove('active');
            });

            const pasteTaskBtn = optionsMenu.querySelector('.paste-btn');
            pasteTaskBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (copiedTask) {
                    if (!calendarTasks[`${month}-${day}`]) {
                        calendarTasks[`${month}-${day}`] = [];
                    }
                    const newTask = JSON.parse(JSON.stringify(copiedTask));
                    calendarTasks[`${month}-${day}`].push(newTask);
                    saveTasks();
                    renderCalendar();
                    optionsMenu.classList.remove('active');
                } else {
                    alert('No task copied.');
                }
            });

            const noCompleteTaskBtn = optionsMenu.querySelector('.no-complete-btn');
            noCompleteTaskBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                task.noComplete = !task.noComplete;
                taskItem.classList.toggle('no-complete');
                saveTasks();
                renderCalendar();
                optionsMenu.classList.remove('active');
            });

            const openTaskBtn = optionsMenu.querySelector('.open-task-btn');
            openTaskBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openTaskWindow(task, month, day, taskIndex);
                optionsMenu.classList.remove('active');
            });

            const linkBtn = optionsMenu.querySelector('.link-btn');
            linkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newLink = prompt('Enter task link URL:', task.link || '');
                if (newLink) {
                    task.link = newLink;
                    taskItem.innerHTML = `<a href="${task.link}" target="_blank">${task.text}</a>`;
                    saveTasks();
                    renderCalendar();
                    optionsMenu.classList.remove('active');
                }
            });

            const notesBtn = optionsMenu.querySelector('.notes-btn');
            notesBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newNotes = prompt('Enter notes for this task:', task.notes || '');
                if (newNotes !== null) {
                    task.notes = newNotes;
                    notesTooltip.textContent = newNotes;
                    notesIcon.style.display = newNotes ? 'inline' : 'none';
                    notesTooltip.style.display = newNotes ? 'block' : 'none';
                    saveTasks();
                    renderCalendar();
                    optionsMenu.classList.remove('active');
                }
            });

            taskItem.appendChild(optionsBtn);
            taskItem.appendChild(optionsMenu);
            const subtaskList = document.createElement('ul');
            subtaskList.classList.add('subtask-list');
            renderSubtasks(subtaskList, task.subtasks || [], month, day, taskIndex);
            taskItem.appendChild(subtaskList);
            taskList.appendChild(taskItem);
        });
        dayEl.appendChild(taskList);
    };

    const openTaskWindow = (task, month, day, taskIndex) => {
        const taskWindow = document.createElement('div');
        taskWindow.classList.add('task-window');
        const taskText = document.createElement('p');
        taskText.classList.add('task-text');
        if (task.link) {
            taskText.innerHTML = `<a href="${task.link}" target="_blank">${task.text}</a>`;
        } else {
            taskText.textContent = task.text;
        }
        taskWindow.appendChild(taskText);
        const subtaskList = document.createElement('ul');
        subtaskList.classList.add('subtask-list');
        renderSubtasks(subtaskList, task.subtasks || [], month, day, taskIndex);
        taskWindow.appendChild(subtaskList);
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.classList.add('close-button');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(taskWindow);
        });
        taskWindow.appendChild(closeButton);
        document.body.appendChild(taskWindow);
    };

    const renderCalendar = () => {
        monthNameEl.textContent = months[currentMonthIndex];
        daysContainer.innerHTML = '';
        calendarData[months[currentMonthIndex]].forEach(week => {
            week.forEach(day => {
                const dayEl = document.createElement('div');
                dayEl.classList.add('day');
                if (day === 0) {
                    dayEl.classList.add('empty');
                } else {
                    dayEl.textContent = day;
                    const addButton = document.createElement('button');
                    addButton.textContent = '+';
                    addButton.classList.add('add-task-btn');
                    addButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const taskText = prompt('Enter task:');
                        if (taskText) {
                            if (!calendarTasks[`${months[currentMonthIndex]}-${day}`]) {
                                calendarTasks[`${months[currentMonthIndex]}-${day}`] = [];
                            }
                            calendarTasks[`${months[currentMonthIndex]}-${day}`].push({ text: taskText, completed: false });
                            saveTasks();
                            renderCalendar();
                        }
                    });
                    dayEl.appendChild(addButton);
                    renderTasks(dayEl, months[currentMonthIndex], day);
                }
                daysContainer.appendChild(dayEl);
            });
        });
        calculateProgress();
    };

    prevMonthBtn.addEventListener('click', () => {
        if (currentMonthIndex > 0) {
            currentMonthIndex--;
            renderCalendar();
        }
    });

    nextMonthBtn.addEventListener('click', () => {
        if (currentMonthIndex < months.length - 1) {
            currentMonthIndex++;
            renderCalendar();
        }
    });

    renderCalendar();
});
