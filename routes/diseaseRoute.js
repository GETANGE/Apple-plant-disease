const express = require('express');

const diseaseController = require('../controllers/diseaseController');
const authController = require('../controllers/authController');

const router = express.Router();

router
    .route("/")
    .get(diseaseController.getAllDiseases)
    .post(diseaseController.createDisease);

router
    .route("/:id")
    .get(diseaseController.getDisease)
    .patch(diseaseController.updateDisease)
    .delete(authController.protect,authController.restrictTo('admin','user'),diseaseController.deleteDisease)

module.exports = router