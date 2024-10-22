const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://adoptpaw-c185c.web.app",
  ],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions))
app.use(express.json());

// MongoDB connection URI
// const uri = process.env.MONGO_URL;
const uri =
  "mongodb+srv://petAdaption:NNjPjRvMVUi149OU@cluster0.cs5wuer.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
MongoClient.connect(uri, )
  .then((client) => {
    console.log("Connected to MongoDB");
    

    const db = client.db("petAdaption"); // Use the default database

    // Example collection: 'users'
    const usersCollection = db.collection("users");
    const petCollection = db.collection("pets");
    const adoptCollection = db.collection("petAdopt");
    const campaignCollection = db.collection("campaign");

    // Routes
    app.get("/", (req, res) => {
      res.send("adopt paw server!");
    });

   

    // Create a new user
     app.post("/users", async (req, res) => {
       const users = req.body;
       const query = { email: users?.email };
       const existingUser = await usersCollection.findOne(query);
       if (existingUser) {
         return res.send({ message: "Already existingUser" });
       }
       const result = await usersCollection.insertOne(users);
       res.send(result);
     });

     // get all user
     app.get("/users", async (req, res) => {
       const users = req.body;
       const result = await usersCollection.find(users).toArray();
       res.send(result);
     });

     // Update a user by ID
     app.patch("/users/admin/:id", async (req, res) => {
       const id = req.params.id;
       const filter = { _id: new ObjectId(id) }; // Ensure that the ID is properly converted to ObjectId
       const updateDoc = {
         $set: {
           role: "admin",
         },
       };

       const result = await usersCollection.updateOne(filter, updateDoc);
       res.send(result);
     });

     // Delete a user by ID
     app.delete("/user/:id", async (req, res) => {
       const id = req.params.id;
       const query = { _id: new ObjectId(id) };
       const result = await usersCollection.deleteOne(query);
       res.send(result);
     });

     //db.collection
     app.get("/pets", async (req, res) => {
       const pets = req.body;
       const result = await petCollection.find(pets).toArray();
       res.send(result);
     });

     app.get("/pet/:id", async (req, res) => {
       const id = req.params.id;
       const query = { _id: new ObjectId(id) };

       const result = await petCollection.findOne(query);
       res.send(result);
     });

     app.post("/pets", async (req, res) => {
       const pet = req.body;
       const result = await petCollection.insertOne(pet);
       res.send(result);

       app.get("/my-added-pet/:email", async (req, res) => {
         const email = req.params.email;
         const query = { email: email };
         const result = await petCollection.find(query).toArray();
         res.send(result);
       });

       // pet data delete
       app.delete("/pet/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await petCollection.deleteOne(query);
         res.send(result);
       });

       // adopt modal data store db
       app.post("/adopt", async (req, res) => {
         const pet = req.body;
         const result = await adoptCollection.insertOne(pet);
         res.send(result);
       });

       // adopt modal data get method & show adoption request
       app.get("/adopt/:email", async (req, res) => {
         const email = req.params.email;
         const query = { "adoptUser.email": email };
         console.log(query);
         const result = await adoptCollection.find(query).toArray();
         res.send(result);
       });

       // 4. Create Donation Campaign
       app.post("/campaign", async (req, res) => {
         const campaign = req.body;
         const result = await campaignCollection.insertOne(campaign);
         res.send(result);
       });
       // get campaign data
       app.get("/campaign", async (req, res) => {
         const result = await campaignCollection.find().toArray();
         res.send(result);
       });

       // donator unique data
       app.get("/donator/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await adoptCollection.findOne(query).toArray();
         res.send(result);
       });

       // get unique email data
       app.get("/campaign/:email", async (req, res) => {
         const email = req.params.email;
         const query = { "campaignUser.email": email };
         console.log("campaign email:", query);
         const result = await campaignCollection.find(query).toArray();
         res.send(result);
       });

       // campaign delete
       app.delete("/campaign/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const result = await campaignCollection.deleteOne(query);
         res.send(result);
       });
     });


    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.error("Failed to connect to MongoDB:", error));
