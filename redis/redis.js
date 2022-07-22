const redis = require('redis')

const redisClient = redis.createClient(
    10269,
    "redis-10269.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("YLY1q832YZYVk5eRkQouNN03ycLQbLVD", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});
module.exports=redisClient
