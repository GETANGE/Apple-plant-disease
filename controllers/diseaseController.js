const Disease = require('./../models/diseaseModel');

exports.getAllDiseases = async (req, res, next) =>{
    try {
        const diseases = await Disease.find();
        res.status(200).json({
            status: 'success',
            data: {
                diseases
            }
        });
    } catch (e) {
        res.status(500).json({
            status: 'error',
            message: e.message
        });
    }
}

exports.getDisease = async (req, res, next) =>{
    try {
        const disease = await Disease.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                disease
            }
        });
    } catch (e) {
        res.status(500).json({
            status: 'error',
            message: e.message
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
    try {
        const disease = await Disease.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
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

exports.deleteDisease = async (req, res, next) =>{
    try {
        await Disease.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
} 
