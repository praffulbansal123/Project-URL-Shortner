const UrlModel = require('../model/urlModel')
const createError = require('http-errors')
const { nanoid } = require('nanoid')
const { isValid, urlschema } = require('../utils/validator')
const redis = require('redis')
const { promisify } = require('util')

//----------------------------------Redis-----------------------------------------------------------------//
const redisClient = redis.createClient(
    18737,
    "redis-18737.c245.us-east-1-3.ec2.cloud.redislabs.com", { no_ready_check: true }
);

redisClient.auth("yYakwkjGgnOPwetUbnN8GgtEkK5i3bth", function(err) {
    if (err) throw err;
});

redisClient.on("connect", async function() {
    console.log("connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

//---------------------------Creating URL shortner--------------------------------------------------------//



const urlShortner = async function (req, res, next) {
    try{
        const requestBody = req.body
        const requestQuery = req.query

        if(isValid(requestQuery)) throw createError.BadRequest('Invalid input as query params should be empty')

        if(!isValid(requestBody)) throw createError.NotAcceptable('Input data should be of length 1')

        const longUrl = requestBody.longUrl
        const baseUrl = "http://localhost:3000"
        const validLongUrl = await urlschema.extract("longUrl").validateAsync(longUrl)

        const urlFromDB = await UrlModel.findOne({longUrl: validLongUrl})

        if(urlFromDB) throw createError.Conflict('This Url has already been shorten and stored in the DB')
        
        const urlCode = nanoid()
        const shortUrl = baseUrl + '/' + urlCode

        const urlData = {
            urlCode: urlCode,
            longUrl: validLongUrl.trim(),
            shortUrl: shortUrl
        }

        const newUrl = await UrlModel.create(urlData)
    
        return res.status(200).send({status: true, mssg: 'Url shortning successful', data: newUrl})
    }
    catch(err){
        if(err.isJoi == true) err.status = 422
        next(err)
    }
}

const getUrl = async function (req, res,next) {
    try{
        const requestBody = req.body
        const requestQuery = req.query
        const urlCode = req.params.urlCode

        if(isValid(requestBody)) throw createError.BadRequest('No input data is required in the body')

        if(isValid(requestQuery)) throw createError.BadRequest('Invalid Request as no data is required in query params')

        const urlFromUrlCode = await UrlModel.findOne({urlCode}).select({shortUrl: 1,longUrl: 1,_id: 0,})

        if(!urlFromUrlCode) throw createError.NotFound('No such url code exits in the DB')

        return res.status(200).redirect(urlFromUrlCode.longUrl)
    }
    catch(err){
        next(err)
    }
}

module.exports = {urlShortner, getUrl}