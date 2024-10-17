const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
}
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
    // const client = new MongoClient(uri, {
    //   serverApi: {
    //     version: ServerApiVersion.v1,
    //     strict: true,
    //     deprecationErrors: true,
    //   },
    // });

    const db = client.db("petAdaption"); // Use the default database

    // Example collection: 'users'
    const usersCollection = db.collection("users");
    const petCollection = db.collection("pets");
    const adoptCollection = db.collection("petAdopt");
    const campaignCollection = db.collection("campaign");

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
      // app.get('/pets', async (req, res) => {
   
      // });
        //db.collection
        app.get("/pets", async (req, res) => {
          const pets = req.body;
           const result = await petCollection.find(pets).toArray();
           res.send(result);
         });

        // try {
        //     const result = await petCollection('pets').find().toArray();
        //     res.status(200).json(result);
        // } catch (error) {
        //     res.status(500).json({ error: 'Failed to add the pet' });
        // }
    // 1. Add a Pet
    //"/pets/:id" chilo

      app.get('/pet/:id', async (req, res) => {
        const id = req.params.id;
       const query={_id: new ObjectId(id)}

       const result = await petCollection.findOne(query);
       res.send(result);
        // try {
        //     // res.status(200).json(result);
        // }
        // catch (error) {
        //     res.status(500).json({ error: 'Failed to add the pet' });
        // }
      });
    
    
      app.post('/pets', async (req, res) => {
        const pet = req.body;
         const result = await petCollection.insertOne(pet);
        res.send(result);
        


      

        // try {
        //     const result = await petCollection('pets').insertOne(pet);
        //     res.status(201).json(result);
        // } catch (error) {
        //     res.status(500).json({ error: 'Failed to add the pet' });
        // }
      });
    
    // My Added pet dashboard route

   
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
    

    // 2. Get My Added Pets
    app.get('/my-pets/:userId', async (req, res) => {
        const { userId } = req.params;
        console.log(userId);
        try {
            const pets = await db.collection("pets").find({ userId }).toArray();
            res.status(200).json(pets);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch your pets' });
        }
    });

    // 3. Adoption Request
    app.post('/adoption', async (req, res) => {
      const adoptionRequest = {
        petId: req.body.petId,
        userId: req.body.userId,
        message: req.body.message || "",
      };
      
      try {
        const result = await campaignCollection.insertOne(adoptionRequest);
        res
          .status(201)
          .json({ message: "Adoption request submitted", request: result });
      } catch (error) {
        res.status(500).json({ error: "Failed to submit adoption request" });
      }
    });

    // adopt modal data store db
    app.post('/adopt', async (req, res) => {
      const pet=req.body
      const result = await adoptCollection.insertOne(pet)
      res.send(result)
      
    })

    // adopt modal data get method & show adoption request
    app.get('/adopt/:email', async (req, res) => {
       const email = req.params.email;
      const query = { 'adoptUser.email': email };
      console.log(query);
       const result = await adoptCollection.find(query).toArray();
       res.send(result);
    })

    // 4. Create Donation Campaign
    app.post("/campaign", async (req, res) => {
      const campaign = req.body;
      const result = await campaignCollection.insertOne(campaign)
      res.send(result)
    })
    // get campaign data 
    app.get("/campaign", async (req, res) => {
      const result = await campaignCollection.find().toArray()
      res.send(result)
    })
    
    // donator unique data 
    app.get("/donator/:id", async (req, res) => {
      const id= req.params.id;
      const query = { _id:new ObjectId(id)};
      const result = await adoptCollection.findOne(query).toArray();
      res.send(result);
    });


    // get unique email data 
    app.get("/campaign/:email", async (req, res) => {
      const email = req.params.email;
      const query = { 'campaignUser.email': email };
      console.log("campaign email:",query);
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
    


//     app.post('/campaigns', async (req, res) => {
//         const campaign = {
//             title: req.body.title,
//             description: req.body.description,
//             goal: req.body.goal,
//             createdBy: req.body.createdBy,
//         };
// //db.collection('campaigns')
//         try {
//             const result = await campaignCollection.insertOne(campaign);
//             res.status(201).json(result);
//         } catch (error) {
//             res.status(500).json({ error: 'Failed to create donation campaign' });
//         }
//     });

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
