const express = require('express');
const urlModel = require('../Model/urlModel');
const shortid = require('shortid');
const router = express.Router();


router.post('/url', async (req, res) => {
    try {
        let longUrl = req.body.longUrl;

        const baseUrl = "https://url-0.herokuapp.com";
        const urlCode = shortid.generate();
        const shortUrl = baseUrl + '/' + urlCode;

        const urlPresent = await urlModel.findOne({ longUrl });
        if (urlPresent) {
            return res.render('index', { "shortUrl": urlPresent.shortUrl });
        }
        let data = new urlModel({ longUrl, shortUrl, urlCode });
        const shortenUrl = await urlModel.create(data);
        return res.render('index', { "shortUrl": shortUrl });
    } 
    catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
});

router.get('/:urlcode', async (req, res) => {
    try {
        let urlCode = req.params.urlcode;

        let getUrl = await urlModel.findOne({ urlCode });
        if (!getUrl) {
            return res.status(404).send({ status: false, msg: "url not found" });
        }
        let url = getUrl.longUrl;
        return res.redirect(url);
    } 
    catch (err) {
        return res.status(500).send({ error: err.message });
    }
});


module.exports = router
