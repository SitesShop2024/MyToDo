const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs')

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


const { Client } = require('pg');

const client = new Client({
    user: "tododb_6vgm_user",
    host: "dpg-d0rj7qadbo4c73admr40-a",
    database: "tododb_6vgm",
    password: "MIepRlI7WOWIeMZr9MOnz0ihzvGHlWWB",
    port: 5432,
});

async function CreateStartTable() {
    try {
        await client.connect();
        console.log("Connected to PostgreSQL.");

        await client.query(`CREATE TABLE IF NOT EXISTS todos (id SERIAL PRIMARY KEY, title TEXT NOT NULL, completed BOOLEAN DEFAULT FALSE)`);

        console.log("Table Todos created!");
    } catch (err) {
        console.error("Error:", err);
    }
};
CreateStartTable();

app.get('/', async (req, res) => {
    try{
        const result = await client.query(`SELECT * FROM todos`);
    res.render("todo", { todos: result.rows });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Server error.");
    }
});

app.post('/toggle/:id', async (req, res) => {
    const id = req.params.id;
    try{
        const result = await client.query("SELECT completed FROM todos WHERE id = $1", [id]);
        const current = result.rows[0].completed;

        await client.query("UPDATE todos SET completed = $1 WHERE id = $2", [!current, id]);

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error with updating task!");
    }
});
app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await client.query("DELETE FROM todos WHERE id = $1", [id]);
        res.redirect('/');
    } catch (err) {
        console.error("Ошибка при удалении задачи:", err);
        res.status(500).send("Ошибка сервера при удалении задачи.");
    }
});


app.get('/addTodo', (req, res) => {
    res.render('addTodo');
});

app.post("/addTodo", async (req, res) => {
    const { title } = req.body;
    try {
        const result = await client.query("INSERT INTO todos (title) VALUES ($1)", [title]);
        res.redirect('/')
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Error with adding task!");
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log("Server working now! http://localhost:3000")
});