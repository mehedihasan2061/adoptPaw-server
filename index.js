const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection URI
// const uri = process.env.MONGO_URL;
const uri = "mongodb+srv://adoptPaw:5lKiiYuN6QZuIFcq@cluster0.yjkegcv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// Connect to MongoDB
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB");

    const db = client.db("petadoption"); // Use the default database

    // Example collection: 'users'
    const usersCollection = db.collection("users");
    const petCollection = db.collection("pets");

    // Routes

    // Get all users
    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
      }
    });

    app.get("/users/:id", async (req, res) => {
      try {
        const {id} = req.params
        const users = await usersCollection.findOne({uid:id});
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json({ message: "Failed to fetch users",error:error });
      }
    });

    // Create a new user
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      try {
        const result = await usersCollection.insertOne(newUser);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to create user" });
      }
    });

    // Update a user by ID
    app.put("/users/:id", async (req, res) => {
      const { id } = req.params;
      const updatedUser = req.body;

      try {
        const result = await usersCollection.updateOne(
          { _id: new MongoClient.ObjectId(id) },
          { $set: updatedUser }
        );
        if (result.modifiedCount > 0) {
          res.status(200).json({ message: "User updated successfully" });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Failed to update user" });
      }
    });

    // Delete a user by ID
    app.delete("/users/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const result = await usersCollection.deleteOne({
          _id: new MongoClient.ObjectId(id),
        });
        if (result.deletedCount > 0) {
          res.status(200).json({ message: "User deleted successfully" });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
      }
    });

      // 1. Add a Pet
      app.get('/pets', async (req, res) => {
   
       

        try {
            const result = await db.collection('pets').find().toArray();
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add the pet' });
        }
    });
      // 1. Add a Pet
      app.get('/pets/:id', async (req, res) => {
   
       

        try {
            const result = await db.collection('pets').findOne({_id:new ObjectId(req.params.id)});
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add the pet' });
        }
    });
      app.post('/pets', async (req, res) => {
        const pet = req.body;
      

        try {
            const result = await db.collection('pets').insertOne(pet);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add the pet' });
        }
    });

    // 2. Get My Added Pets
    app.get('/my-pets/:userId', async (req, res) => {
        const { userId } = req.params;

        try {
            const pets = await db.collection("pets").find({ userId }).toArray();
            res.status(200).json(pets);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch your pets' });
        }
    });

    // 3. Adoption Request
    app.post('/adopt', async (req, res) => {
        const adoptionRequest = {
            petId: req.body.petId,
            userId: req.body.userId,
            message: req.body.message || '',
        };

        try {
            const result = await db.collection('adoptionRequests').insertOne(adoptionRequest);
            res.status(201).json({ message: 'Adoption request submitted', request: result });
        } catch (error) {
            res.status(500).json({ error: 'Failed to submit adoption request' });
        }
    });

    // 4. Create Donation Campaign
    app.post('/campaigns', async (req, res) => {
        const campaign = {
            title: req.body.title,
            description: req.body.description,
            goal: req.body.goal,
            createdBy: req.body.createdBy,
        };

        try {
            const result = await db.collection('campaigns').insertOne(campaign);
            res.status(201).json(result);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create donation campaign' });
        }
    });

    // 5. Get My Donation Campaigns
    app.get('/my-campaigns/:userId', async (req, res) => {
        const { userId } = req.params;

        try {
            const campaigns = await db.collection('campaigns').find({ createdBy: userId }).toArray();
            res.status(200).json(campaigns);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch your donation campaigns' });
        }
    });

    // 6. Get My Donations
    app.get('/my-donations/:userId', async (req, res) => {
        const { userId } = req.params;

        try {
            const donations = await db.collection('donations').find({ userId }).toArray();
            res.status(200).json(donations);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch your donations' });
        }
    });

    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.error("Failed to connect to MongoDB:", error));
