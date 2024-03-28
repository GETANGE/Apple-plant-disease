// Import the Redis client
const Disease = require('./../models/diseaseModel');
const dotenv = require('dotenv');
const AppError = require('../utils/AppError');
const Redis = require('ioredis');

dotenv.config({ path: "./config.env" });

//Create and configure the Redis client
const redisClient = new Redis({
    host: 'redis-13393.c274.us-east-1-3.ec2.cloud.redislabs.com',
    port: 13393, 
    password: 'pkajlxlgCUq9WypiNGVmbDTRalEBAGPG',
}).on('connect', () => {
    console.log('Connected to Redis 💯');
}).on ('disconnect', () =>{
    console.log('Disconnected from Redis 💥');
});


exports.getAllDiseases = async (req, res, next) => {
    try {
        const key = 'diseases';
        let diseases;

        // Attempt to fetch data from the cache
        let cachedData = await redisClient.get(key);

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
            diseases = await Disease.find();

            // Cache the fetched data for future requests
            await redisClient.setex(key, 86400, JSON.stringify(diseases));

            // Return the fetched data in the response
            res.status(200).json({
                status: 'success',
                data: {
                    diseases
                }
            });
        }
    } catch (error) {
        console.error("Error:", error);
        // Handle errors
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
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
