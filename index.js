import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
dotenv.config();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors()); 

async function createConnection () {
    const MONGO_URL = process.env.MONGO_URL;
    const client = new MongoClient(MONGO_URL);

    await client.connect();
    console.log("Mongo Server connected");
    return client;
}

createConnection();

app.get('/', (request, response) => {
    response.send("Camera Equipment Rental API");
});

app.get('/products', async (request, response) => {
    const client = await createConnection();

    const products = await client.db("equipment-rental").collection("products").find({}).toArray();
    response.send(products);
});

app.post('/products', async (request, response) => {
    const client = await createConnection();
    const newProduct = request.body;

    const result = await client.db("equipment-rental").collection("products").insertMany(newProduct);
    response.send(result);
});

app.listen(PORT, () => console.log("Server started at Port ", PORT));