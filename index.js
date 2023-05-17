const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x6iur0l.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


   const jobCollection = client.db('jobPortal').collection('jobs')

   const indexKeys = {title: 1, category: 1};
   const indexOptions = {name: 'titleCategory'};
   const result = await jobCollection.createIndex(indexKeys,indexOptions);
  
    app.get('/jobCategorySearch/:text',async(req,res)=>{
      const searchText = req.params.text;
      const result = await jobCollection.find({
        $or:[
          {title: {$regex: searchText, $options: 'i'}},
          {category: {$regex: searchText, $options: 'i'}},
        ]
      }).toArray();
      res.send(result)
    })

     app.post('/postJob', async(req,res)=>{
        const body = req.body;
        body.createdAt = new Date();
        // if(!body){
        //     return res.status(404).send({message: 'body not found'})
        // }
        const result = await jobCollection.insertOne(body)
        res.send(result)
     })

     app.get('/allJobs/:text', async(req,res)=>{
        console.log(req.params.text)
        if(req.params.text === 'remote' || req.params.text=== 'offline'){

            const result = await jobCollection.find({status: req.params.text}).sort({createdAt: -1 }).toArray()
           return res.send(result) 
        }
        const result = await jobCollection.find().sort({createdAt: -1 }).toArray()
      res.send(result) 
     });
  


    app.get('/myJobs/:email' , async(req,res)=>{
       console.log(req.params.email)
       const result = await  jobCollection.find({postedBy: req.params.email}).toArray();
       res.send(result)
    })
     
    app.put('/updateJob/:id', async(req,res)=>{
      const id = req.params.id;
      const body = req.body;
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          title: body.title,
          salary: body.salary,
          category: body.category,
        },
      }
      const result = await jobCollection.updateOne(filter,updateDoc)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/',(req,res)=>{
    res.send('job portal server is running')
})

app.listen(port,()=>{
    console.log(`job portal server is running on port: ${port}`)
})