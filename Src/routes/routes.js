const express = require('express')
const urlModel = require('../Model/urlModel')
const validUrl = require('valid-url')
const shortid = require('shortid')
const router = express.Router()

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
router.get('/', (err, res) => {
    res.render('index', { shortUrl: "" })
})
router.post('/url', async (req, res) => {

    try {
        let url = req.body
        let longUrl = url.longUrl
        if (!isValidRequestBody(url)) {
            return res.status(400).send({ status: false, msg: " please enter the details" })
        }
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, msg: "please provide valid url" })
        }
        if (!isValidRequestBody(longUrl)) {
            res.redirect('index', { "shortUrl": "" })
        }
        const baseUrl = "http://localhost:3000";
        const urlCode = shortid.generate();
        const shortUrl = baseUrl + '/' + urlCode;

        if (longUrl) {
            const urlPresent = await urlModel.findOne({ longUrl })
            if (urlPresent) {
                return res.render('index', { "shortUrl": urlPresent.shortUrl })
            }
        }

        let data = new urlModel({ longUrl, shortUrl, urlCode })

        const shortenUrl = await urlModel.create(data)

        return res.render('index', { "shortUrl": shortenUrl.shortUrl })


    } catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }
}
)
router.get('/:urlcode', async (req, res) => {
    try {
        const urlCode = req.params.urlcode

        let getUrl = await urlModel.findOne({ urlCode })
        if (!getUrl) {
            return res.status(404).send({ status: false, msg: "url not found" })
        }
        let url = getUrl.longUrl
        return res.redirect(url)


    } catch (err) {
        return res.status(500).send({ error: err.message })

    }
})


module.exports = router
