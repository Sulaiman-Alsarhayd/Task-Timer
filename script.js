/**
 * TaskTimerSystem Engine
 * Developed with a focus on modularity and persistence.
 */
class TaskTimerSystem {
    constructor() {
        // Retrieve stored tasks from LocalStorage or initialize an empty array
        this.tasks = JSON.parse(localStorage.getItem('taskTimerDB')) || [];
        
        // Storage for active setInterval references to manage multiple timers
        this.intervals = {}; 
        
        this.init();
    }

    /**
     * Initializes the application events and initial render
     */
    init() {
        // Bind the add task button to the creation method
        document.getElementById('addTaskBtn').onclick = () => this.addTask();
        
        // Initial rendering of tasks from storage
        this.render();
    }

    /**
     * Captures user input and creates a new task object
     */
    addTask() {
        const title = document.getElementById('taskInput').value;
        const mins = document.getElementById('taskMinutes').value;
        
        // Simple validation to ensure fields are not empty
        if (!title || !mins) return;

        const task = {
            id: 'id-' + Date.now(), // Generate unique ID based on timestamp
            title: title,
            secondsLeft: parseInt(mins) * 60,
            isRunning: false
        };

        this.tasks.push(task);
        this.saveData();
        this.render();
        
        // Clear input fields after successful addition
        document.getElementById('taskInput').value = '';
        document.getElementById('taskMinutes').value = '';
    }

    /**
     * Toggles the timer state between Running and Paused
     * @param {string} id - The unique task identifier
     */
    toggle(id) {
        const task = this.tasks.find(t => t.id === id);
        
        if (task.isRunning) {
            // Stop the timer interval
            clearInterval(this.intervals[id]);
            task.isRunning = false;
        } else {
            // Start a new interval for the specific task
            task.isRunning = true;
            this.intervals[id] = setInterval(() => {
                if (task.secondsLeft > 0) {
                    task.secondsLeft--;
                    this.updateDisplay(id);
                } else {
                    this.onTimerComplete(id);
                }
            }, 1000);
        }
        this.render(); // Refresh UI to update button text/state
    }

    /**
     * Updates only the timer text in the DOM for better performance
     */
    updateDisplay(id) {
        const task = this.tasks.find(t => t.id === id);
        const el = document.getElementById(`display-${id}`);
        if (el) {
            const m = Math.floor(task.secondsLeft / 60);
            const s = task.secondsLeft % 60;
            // Pad seconds with a leading zero for proper format (MM:SS)
            el.innerText = `${m}:${s.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Handles the logic when a countdown reaches zero
     */
    onTimerComplete(id) {
        clearInterval(this.intervals[id]);
        const task = this.tasks.find(t => t.id === id);
        task.isRunning = false;
        task.secondsLeft = 0;
        alert(`Time's up: ${task.title}`);
        this.saveData();
        this.render();
    }

    /**
     * Removes a task from the system and stops its interval
     */
    remove(id) {
        clearInterval(this.intervals[id]);
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveData();
        this.render();
    }

    /**
     * Persists the current state of tasks to the browser's local storage
     */
    saveData() {
        localStorage.setItem('taskTimerDB', JSON.stringify(this.tasks));
    }

    /**
     * Renders the entire task list into the DOM
     */
    render() {
        const board = document.getElementById('taskBoard');
        board.innerHTML = this.tasks.map(t => {
            const m = Math.floor(t.secondsLeft / 60);
            const s = t.secondsLeft % 60;
            const timeStr = `${m}:${s.toString().padStart(2, '0')}`;

            return `
                <div class="task-card">
                    <div class="task-header">
                        <strong>${t.title}</strong>
                        <i class="fas fa-trash" onclick="app.remove('${t.id}')" style="color:var(--danger); cursor:pointer"></i>
                    </div>
                    <div class="task-controls">
                        <span class="timer-val" id="display-${t.id}">${timeStr}</span>
                        <button class="btn-play" onclick="app.toggle('${t.id}')" 
                                style="background: ${t.isRunning ? 'var(--danger)' : 'var(--success)'}; color: #000;">
                            ${t.isRunning ? 'Pause' : 'Start'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Instantiate the system to start the application
const app = new TaskTimerSystem();