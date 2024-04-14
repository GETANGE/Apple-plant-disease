const { MongoClient } = require('mongoose');

describe('insert', function () {
    let connection;
    let db;

    beforeAll(async function() {
        connection = await MongoClient.connect('mongodb+srv://Getange:zaki6971@apple-plant-disease-cla.ujldn5o.mongodb.net/Disease?retryWrites=true&w=majority&appName=apple-plant-disease-classification', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        db = connection.db('Disease');
    });

    afterAll(async function() {
        await connection.close();
    });

    it('should insert a new disease', async function() {
        const disease = db.collection('diseases');

        const mockDisease = {
            name: 'Apocalipto',
            images: ['test'],
            description: 'testing the jest framework',
            symptoms: ['red brown patched leaves'],
            treatment: 'regular treatment'
        }

        await disease.insertOne(mockDisease);

        const result = await disease.findOne({ name: 'Apocalipto' });
        expect(result).toEqual(mockDisease); 
    });
});