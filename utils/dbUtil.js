const mongoose = require('mongoose');
const { dbConfig } = require('../config');
const { crudService } = require('../services');
const { insertManyInDb } = crudService;

/**
 * Function To Initialize Mongoose Connection
 */
const initConnection = () => {
    return new Promise((resolve, reject) => {
        mongoose.Promise = global.Promise;

        // Connecting Mongo
        mongoose.connect(dbConfig.mongoURI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true });

        // When Successfully Connected
        mongoose.connection.on('connected', () => {
            console.log(`Mongoose default connection open to ${dbConfig.mongoURI}`);
            resolve();
        });

        // If The Connection Throws An Error
        mongoose.connection.on('error', (err) => {
            console.log(`Mongoose default connection error: ${err}`);
            reject(err);
        });

        // When The Connection Is Disconnected
        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose default connection disconnected');
        });
    });
};

/**
 * Function To Close Mongoose Connection
 */
const closeConnection = () => {
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
}

// Exporting Db Utility Methods
module.exports = {
    initConnection,
    closeConnection,
}