
const redis = require('redis')
const dotenv =require('dotenv')

dotenv.config({ path:'./config.env'})

const redisClient = redis.createClient(
    10269,
    process.env.Redis_DB,
    { no_ready_check: true }
);
redisClient.auth(process.env.Redis_pass, function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});



module.exports=redisClient