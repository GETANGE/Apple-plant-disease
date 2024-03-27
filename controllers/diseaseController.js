const Disease = require('./../models/diseaseModel');
const AppError = require('../utils/AppError');
const {redisClient} = require('../Server');

exports.getAllDiseases = async (req, res, next) =>{
    // const client = await redisClient;
    // console.log(client);
    // const cached = await client.get('diseases');
    // if(cached){
    //     res.status(200).json({
    //         status:'success',
    //         data: {
    //             diseases: JSON.parse(cached)
    //         }
    //     });
    // }else{
    //     const diseases = await Disease.find();
    // await client.setEx('diseases',86400, JSON.stringify(diseases));
    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         diseases
    //     }
    // });
    // }
    const diseases = await Disease.find();
    // await client.setEx('diseases',86400, JSON.stringify(diseases));
    res.status(200).json({
        status: 'success',
        data: {
            diseases
        }
    });
   
}

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
