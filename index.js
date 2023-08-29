const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mv9nczj.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let tasksCollection;

async function run() {
  try {
    await client.connect();
    tasksCollection = client.db('todolistDb').collection('tasks');

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);

// API Routes
app.get('/', (req, res) => {
  res.send('Your Server is running..');
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await tasksCollection.find().toArray();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/tasks', async (req, res) => {
  const newTask = req.body;

  try {
    const result = await tasksCollection.insertOne(newTask);
    newTask._id = result.insertedId;
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  try {
    await tasksCollection.updateOne(
      { _id: ObjectId(taskId) },
      { $set: { status } }
    );

    const updatedTask = await tasksCollection.findOne({ _id: ObjectId(taskId) });
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Your server is running on port ${port}`);
});
