import express, { response } from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
dotenv.config();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors());

//Create connection with MongoDB Atlas
async function createConnection() {
  const MONGO_URL = process.env.MONGO_URL;
  const client = new MongoClient(MONGO_URL);

  await client.connect();
  console.log("Mongo Server connected");
  return client;
}

createConnection();

//Get Home page
app.get("/", (request, response) => {
  response.send("Camera Equipment Rental API");
});

//Get all products
app.get("/products", async (request, response) => {
  const client = await createConnection();

  const products = await client
    .db("equipment-rental")
    .collection("products")
    .find({})
    .toArray();
  response.send(products);
});

//Add new products
app.post("/products", async (request, response) => {
  const client = await createConnection();
  const newProduct = request.body;

  const result = await client
    .db("equipment-rental")
    .collection("products")
    .insertMany(newProduct);
  response.send(result);
});

//Add Admins
app.post("/admins/signup", async (request, response) => {
  const client = await createConnection();
  const { username, password } = request.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const admins = await client
    .db("equipment-rental")
    .collection("admins")
    .insertOne({ username: username, password: hashedPassword });
  response.send(admins);
});

//Get all Admins
app.get("/admins", async (request, response) => {
  const client = await createConnection();

  const admins = await client
    .db("equipment-rental")
    .collection("admins")
    .find({})
    .toArray();
  response.send(admins);
  console.log(admins);
});

//Admin Login
app.post("/admins/login", async (request, response) => {
    const client = await createConnection();
    const { username, password } = request.body;
  
    const result = await client
      .db("equipment-rental")
      .collection("admins")
      .findOne({ "username": username});

    const storedDBPassword = result.password;
    const isPasswordMatch = await bcrypt.compare(password, storedDBPassword);

    if (isPasswordMatch) {
        const token = jwt.sign({id: result._id}, process.env.SECRET_KEY);
        response.send({message: "Successful Login", token: token});
    } else {
        response.send({message: "Invalid login credentials"});
    }
  });

app.listen(PORT, () => console.log("Server started at Port ", PORT));
