// Import the Redis client
const Disease = require('./../models/diseaseModel');
const dotenv = require('dotenv');
const AppError = require('../utils/AppError');
const Redis = require('ioredis');

dotenv.config({ path: "./config.env" });

//Create and configure the Redis client
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT, 
    password: process.env.REDIS_PASSWORD,
}).on('connect', () => {
    console.log('Connected to Redis 💯');
}).on ('disconnect', () =>{
    console.log('Disconnected from Redis 💥');
});


exports.getAllDiseases = async (req, res, next) => {

    try{
        // Attempt to fetch data from the cache
        let cachedData = await redisClient.get('diseases');

        if (cachedData) {
            // Data found in cache, parse and send it in the response
            const parsedData = JSON.parse(cachedData);
            
            res.status(200).json({
                status: 'success',
                data: {
                    diseases: parsedData
                }
            });
        } else {
            // Data not found in cache, fetch it from the database
            let diseases = await Disease.find();

            // Cache the fetched data for future requests
            await redisClient.setex('diseases', 86400, JSON.stringify(diseases));

            // Return the fetched data in the response
            res.status(200).json({
                status: 'success',
                data: {
                    diseases
                }
            });
        }
    }catch(error){
        return next(new AppError('Internal Server Error', 500));
    }
};

exports.getDisease = async (req, res, next) =>{
        const disease = await Disease.findById(req.params.id);

        if(!disease){
            return next(new AppError('Disease not found', 404));
        }else{
            res.status(200).json({
                status: 'success',
                data: {
                    disease
                }
            });
        }
}

exports.createDisease = async (req, res, next) => {
    try {
        const disease = await Disease.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                disease
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
}

exports.updateDisease = async (req, res, next) => {

        const disease = await Disease.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!disease) {
            return next(new AppError('Disease not found', 404));
        }else {
            res.status(200).json({
                status: 'success',
                data: {
                    disease
                }
            });
        }
}

exports.deleteDisease = async (req, res, next) =>{

    const disease =  await Disease.findByIdAndDelete(req.params.id);

    if(!disease) {
        return next(new AppError('Disease not found', 404));
    }else {
        res.status(200).json({
            status:'success',
            data:  null 
        });
    }
} 