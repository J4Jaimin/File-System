import {createClient} from 'redis';

const redisClient = await createClient().on("error", (err) => {
    console.log("Error while connecting to redis", err);
}).connect();


export default redisClient;