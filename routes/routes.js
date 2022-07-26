const express = require('express');
const urlModel = require('../Model/urlModel');
const shortid = require('shortid');
const router = express.Router();
const {promisify}= require('util')
const redisClient = require('../redis')

//Connection setup for redis
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



router.post('/', async (req, res) => {
    try {
        let longUrl = req.body.longUrl;

        const baseUrl = "https://url-5qmc.onrender.com";
        const urlCode = shortid.generate();
        const shortUrl = baseUrl + '/' + urlCode;

        const urlPresent = await urlModel.findOne({ longUrl });
        if (urlPresent) {
            return res.status(200).render('index', { "shortUrl": urlPresent.shortUrl });
        }
        let data = new urlModel({ longUrl, shortUrl, urlCode });
        const shortenUrl = await urlModel.create(data);

        await SET_ASYNC(`${shortenUrl}`, JSON.stringify(shortUrl))
        return res.status(201).render('index', { "shortUrl": shortUrl });
    } 
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
});

router.get('/:urlcode', async (req, res) => {
    try {
        let urlCode = req.params.urlcode;

        let cachedUrlCode = await GET_ASYNC(`${urlCode}`)
        if(cachedUrlCode){
            let parseUrl = JSON.parse(cachedUrlCode)
                let cachedLongUrl = parseUrl.longUrl
                return res.status(302).redirect(cachedLongUrl)
        }
        let getUrl = await urlModel.findOne({ urlCode });
        if (!getUrl) {
            return res.status(404).send({ msg: "url not found" });
        }
        let url = getUrl.longUrl;
        await SET_ASYNC(`${urlCode}`, JSON.stringify(getUrl))
        return res.status(302).redirect(url);
    } 
    catch (err) {
        return res.status(500).send({ error: err.message });
    }
});

module.exports = router
