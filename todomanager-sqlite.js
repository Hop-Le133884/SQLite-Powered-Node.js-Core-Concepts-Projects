// Project 1: SQLite-Powered TODO List Manager
// todomanager-sqlite.js

const initSJ = require('sql.js');
const fs = require('fs').promises;
const path = require('path');

class TodoManagerSQLite {
    // constructor to include the path to todos.db
    constructor (dbPath = 'todos.db') {
        this.dbPath = path.join(__dirname, dbPath);
        this.db = null;
    }

    // Initialize dabase connection
    async init() {
        try {
            const SQL = await initSJ();

            // Try to load existing database
            try {
                const readDB = await fs.readFile(this.dbPath);
                // Create a database with this existing dabase on buffer memory
                this.db = new SQL.Database(readDB);
                console.log('Loaded existing database');
            } catch {
                // Create new database on buffer memory
                this.db = new SQL.Database();
                console.log('Created new database');
            }

            // Create todos table if it doesnot exist
            this.db.run(`
                CREATE TABLE IF NOT EXISTS todos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task TEXT NOT NULL,
                    completed INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    completed_at TEXT,
                    updated_at TEXT
                    )
                `);

                await this.saveDatabase();
                console.log('Database initialized\n');

        } catch (error) {
            throw new Error(`Failed to initilize database: ${error.message}`);
        }
    }

    // Save database to file
    async saveDatabase() {
        const data = this.db.export();
        const buffer = Buffer.from(data);
        await fs.writeFile(this.dbPath, buffer);
    }

    // Add a new todo
    async addTodo(task) {
        try {
            this.db.run(
                'INSERT INTO todos (task) VALUES (?)',
                [task]
            );

            // Get the last inserted ID
            const result = this.db.exec('SELECT last_insert_rowid() as id');
            const id = result[0].values[0][0];

            await this.saveDatabase();

            console.log(`Todo added: "${task}" (ID: ${id})`);
            return {id, task, completed: false };

        } catch (error) {
            console.error('Error adding todo:', error.message);
            return null;
        }
    }

    // List all todos
    async listTodos() {
        try {
            const results = this.db.exec('SELECT * FROM todos ORDER BY id');

            if (!results.length || !results[0].values.length) {
                console.log('No todos found!');
                return [];
            }

            const todos = results[0].values.map(row => ({
                id: row[0],
                task: row[1],
                completed: row[2] === 1,
                created_at: row[3],
                completed_at: row[4],
                updated_at: row[5]
            }));

            console.log('\n=== TODO LIST +++');
            todos.forEach((todo, index) => {
                const status = todo.completed ? 'x' : 'o';
                const taskDisplay = todo.completed ? `\x1b[9m${todo.task}\x1b[0m` :todo.task;
                console.log(`${index + 1}. [${status}] ${taskDisplay} (ID: ${todo.id})`);
            });
            console.log('=================\n');

            return todos;
        } catch (error) {
            console.error('Error listing todos:', error.message);
            return [];
        }
    }

    // Mark todo as complete
    async completeTodo(d) {
        
    }

    // Delete a todo
    async deleteTodo(id) {

    }

    // Update a todo's task
    async updateTodo(id, newTask) {

    }

    // Clear all completed todos
    async clearCompleted() {

    }

    // Get statistics
    async getStats() {

    }

    // Search todos by keyword
    async searchTodos(keyword) {

    }

    // Get todos by completion status
    async getTodosByStatus(completed = false) {

    }

    // Close database
    async close() {
        if (this.db) {
            await this.saveDatabase();
            this.db.close();
            console.log('Database exported and closed');
        }
    }
}

// Demo usage
async function demo() {
  const todoManager = new TodoManagerSQLite();
  
  try {
    console.log('=== SQLite TODO MANAGER DEMO ===\n');
    
    // Initialize database
    await todoManager.init();
    
    // Add todos
    await todoManager.addTodo('Learn Node.js fundamentals');
    await todoManager.addTodo('Practice async/await');
    await todoManager.addTodo('Build a TODO app with SQLite');
    await todoManager.addTodo('Master database operations');
    await todoManager.addTodo('Deploy to production');
    
    console.log('\n--- After adding todos ---');
    const todos = await todoManager.listTodos();
    
    // Complete some todos
    //await todoManager.completeTodo(todos[0].id);
    //await todoManager.completeTodo(todos[2].id);
    
    console.log('\n--- After completing some todos ---');
    await todoManager.listTodos();
    
    // Update a todo
    //await todoManager.updateTodo(todos[1].id, 'Master async/await patterns');
    
    console.log('\n--- After updating a todo ---');
    //await todoManager.listTodos();
    
    // Search todos
    //await todoManager.searchTodos('SQLite');
    
    // Show statistics
    //await todoManager.getStats();
    
    // Get only pending todos
    console.log('--- Pending Todos ---');
    //const pending = await todoManager.getTodosByStatus(false);
    //console.log(`Found ${pending.length} pending todos\n`);
    
    // Clear completed
    //await todoManager.clearCompleted();
    
    console.log('\n--- After clearing completed ---');
    await todoManager.listTodos();
    
    // Close database
    await todoManager.close();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run demo
demo();

// Export for use in other files
module.exports = TodoManagerSQLite;