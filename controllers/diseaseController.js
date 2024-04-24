// Import the Redis client
const Disease = require('./../models/diseaseModel');
const dotenv = require('dotenv');
const AppError = require('../utils/AppError');

dotenv.config({ path: "./config.env" });

exports.getAllDiseases = async (req, res, next) => {
    try {
        // Fetch diseases from the database
        const diseases = await Disease.find();

        // Return the fetched data in the response
        res.status(200).json({
            status: 'success',
            data: {
                diseases
            }
        });
    } catch (error) {
        // Handle any errors
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