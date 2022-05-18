const urlModel = require('../Model/urlModel')
const shortid = require('shortid')
const validUrl= require('valid-url')
const redis = require('redis')
const {promisify} = require('util')

const redisClient = redis.createClient(
    11994,
    "redis-11994.c264.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("n4nqyhlHbJhbcNsl6JAK4W1Ih54LW0N2", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  });

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const shortUrl = async function(req , res){
    try {
        let url = req.body
        let longUrl = url.longUrl
        if (!isValidRequestBody(url)) {
            return res.status(400).send({status:false , msg:" please enter the details"})
        }
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({status:false,msg:"please provide valid url"})
        }
        const baseUrl ="http://localhost:3000";
        const urlCode= shortid.generate();
        const shortUrl= baseUrl+'/'+urlCode;

        let cahcedProfileData = await GET_ASYNC(`${longUrl}`)
        if(cahcedProfileData) {
         return res.send(JSON.parse(cahcedProfileData))
        }

        const urlPresent = await urlModel.findOne({longUrl}).select({ longUrl: 1, urlCode: 1, shortUrl: 1 })
        if (urlPresent) { 
            return res.status(200).send({ status: true, data: urlPresent }) 
        }

        else{
        let data = new urlModel({longUrl,shortUrl,urlCode})

         const shortenUrl = await urlModel.create(data)
         await SET_ASYNC(`${longUrl}`, JSON.stringify(data))

         return res.status(201).send({status:true,msg:"Url successfuly created", data:shortenUrl})
    }

    } catch (err) {
        return res.status(500).send({status:false, error:err.message})   
    }

}


const getUrl = async function(req, res ){
  try {
    const urlCode = req.params.urlCode
    
    let cachedData = await GET_ASYNC(`${urlCode}`)
    if (cachedData) {
         return res.status(302).redirect(JSON.parse(cachedData)) 
        }

    let getUrl = await urlModel.findOne({urlCode})
    if (!getUrl) {
        return res.status(404).send({status:false,msg:"url not found"})
    }
    let url = getUrl.longUrl

    await SET_ASYNC(`${urlCode}`, JSON.stringify(url))
    return res.redirect(url)
  

  } catch (err) {
      return res.status(500).send({error:err.message})
      
  }

}

module.exports = {shortUrl,getUrl}

// /^(ftp|http|https):\/\/[^ "]+$/.test(url);