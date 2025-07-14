import express from "express";
import {createClient} from "redis";

const app = express();

const redisClient = await createClient().on("error", (err) => {
    console.log("Error while connecting to redis", err);
}).connect();

app.use(express.json());


app.get("/users/:id", async (req, res) => {
  const cachedUser = await redisClient.json.get(`user:${req.params.id}`);
  if(cachedUser) {
    return res.json(cachedUser);
  }
    await redisClient.json.set(`user:${req.params.id}`, "$", {
      name: "Jaimin",
      age: 20,
      email: "jaimin@gmail.com"
    });
    await redisClient.expire(`user:${req.params.id}`, 3600);
    res.json(userData);
});

app.listen(4000, () => {
  console.log("Server started on 4000");
});

async function getUser(userId) {
  const response = await fetch(`https://fakestoreapi.com/users/${userId}`);
  return await response.json();
}