const mongoose = require('mongoose');
const Diseases = require('../models/diseaseModel');
const fs = require('fs');

// Connect to the database mongoose server
const db = "mongodb+srv://Getange:zaki6971@apple-plant-disease-cla.ujldn5o.mongodb.net/Disease?retryWrites=true&w=majority&appName=apple-plant-disease-classification"
mongoose.connect(db).then(() => {
    console.log('Connected to the database ���');
}).catch((error) => {
    console.log('Error connecting to the database ��', error);
});

//reading the JSON file
const disease = JSON.parse(fs.readFileSync(`${__dirname}/diseaseData.json`, 'utf8'));

// importing development data
const importedData = async () =>{
    try{
        await Diseases.create(disease);
        console.log('Data imported successfully');
    }catch(e){
        console.log(e);
    }
    process.exit();
}

// delete development data
const deleteData = async () => {
    try{
        await Diseases.deleteMany();
        console.log('Data deleted successfully');
    }catch(e){
        console.log(e);
    }
    process.exit();
}

if(process.argv[2] == '--import'){
    importedData();
}else if(process.argv[2] == '--delete'){
    deleteData();
}