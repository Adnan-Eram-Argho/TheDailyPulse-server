const express = require('express');
const app = express();
const cors = require('cors')
const port = 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken");

app.use(cors());
app.use(express.json())






const uri = "mongodb+srv://adnaneramargho:lfw0AQo6LhPENsPw@thedailypulse.jvo5yjq.mongodb.net/?retryWrites=true&w=majority&appName=TheDailyPulse";


function createToken(user){
    const token = jwt.sign({
        email:user.email
      }, 'secret', { expiresIn: '7d' });

      return token;
}
function verifyToken(req, res, next) {
    const token = req.headers.authorization.split(" ")[1];
    const verify = jwt.verify(token, "secret");
    console.log(verify)
    if (!verify?.email) {
      return res.send("You are not authorized");
    }
    req.user = verify.email;
    next();
  }


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
  
});

async function run() {
    try {
        
        client.connect();
        const newsDB = client.db("newsDB");
        const userDB = client.db("userDB");
        const news_articles_collection = newsDB.collection("news_articles_collection");
        const news_types_collection = newsDB.collection("news_types_collection");
        const userCollection = userDB.collection("userCollection");

        //news atticles routes
        app.post('/news_articles', verifyToken, async (req, res) => {
            const newsData = req.body;
            const result = await news_articles_collection.insertOne(newsData)
            res.send(result)
        })
        app.get('/news_articles', async (req, res) => {
            const newsData = news_articles_collection.find()
            const result = await newsData.toArray();
            res.send(result)
        })
        app.get('/news_articles/:id', async (req, res) => {
            const id = req.params.id;
            const newsData = await news_articles_collection.findOne({ _id: new ObjectId(id) })
            res.send(newsData)
        })
        app.patch('/news_articles/:id', verifyToken,async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            const newsData = await news_articles_collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            )
            res.send(newsData)
        })
        app.delete('/news_articles/:id',verifyToken, async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const newsData = await news_articles_collection.deleteOne({ _id: new ObjectId(id) })
            res.send(newsData)
        })


        //news Types routes
        app.get('/news_types', async (req, res) => {
            const newsData = news_types_collection.find()
            const result = await newsData.toArray();
            res.send(result)
        })


        //user
        app.post('/user', async (req, res) => {
            const user = req.body;
            const token=createToken(user)
            console.log(token)
            const isUserExist = await userCollection.findOne({ email: user?.email });
            if (isUserExist?._id) {
                return res.send({
                    statu: "success",
                    message: "Login success",
                      token,
                });
            }
             await userCollection.insertOne(user);
            res.send({token})
        })

        app.get("/user/get/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const result = await userCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
          });

        app.get("/user/:email", async (req, res) => {
            const email = req.params.email;
            const result = await userCollection.findOne({ email });
            res.send(result);
        });

        app.patch("/user/:email", verifyToken, async (req, res) => {
            const email = req.params.email;
            const userData = req.body;
            const result = await userCollection.updateOne(
              { email },
              { $set: userData },
              { upsert: true }
            );
            res.send(result);
          });
      


        console.log("Database Connected!");
    } finally {

    }
}
run().catch(console.dir);














app.get('/', (req, res) => {
    res.send(" route is working")
})


app.listen(port, (req, res) => {
    console.log("app is listening on port :", port)
})



//lfw0AQo6LhPENsPw
//adnaneramargho