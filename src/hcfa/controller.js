const pool = require("../../db");
const queries = require("./queries");


const getByOwner = (docterId, patientId) => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getByOwner, [docterId], function (err, results) {
            let doctor = {};
            let hcfa = {};
            let claims = {};
            let insured = {};
            let patient = {}
            let result = {};

            if (results && results.rows && results.rows.length > 0) {
                doctor = results.rows[0]
            }
            pool.query(queries.getByOwner, [patientId], function (err, results) {
                if (results && results.rows && results.rows.length > 0) {
                    patient = results.rows[0]
                }
                if (err) return reject(err);
                pool.query(queries.getHcfa, [docterId, patientId], function (err, results) {
                    if (results && results.rows && results.rows.length > 0) {
                        hcfa = results.rows[0];
                    }
                    
                    pool.query(queries.getClaim, [docterId], function (err, results) {
                        if (results && results.rows && results.rows.length > 0) {
                            claims = results.rows[0];
                        }
                        pool.query(queries.getInsured, [patientId], function (err, results) {
                            if (results && results.rows && results.rows.length > 0) {
                                insured = results.rows[0];
                            }
                            result = { doctor: doctor, patient: patient, ...claims, ...insured, ...hcfa}
                            resolve(result); 
                        })
                    })
                })
            });
        });
    });
};

const getPatients = () => {
    return new Promise((resolve, reject) => {
        pool.query(queries.getPatients, function (err, results) {
            if (err) return reject(err);
            resolve(results.rows);
        });
    });
};

const createOrUpdate = (docterId, patientId, data) => {

    return new Promise((resolve, reject) => {
        pool.query(queries.getHcfa, [docterId, patientId], function (err, results) {
            if (err) {
                return reject(err);
            }
            const { rows } = results
            if (rows && rows.length > 0) {
            // Update record because it exists.
                pool.query(
                    queries.put,
                    [
                        docterId,
                        patientId,
                        data
                    ],
                    function (err) {
                        if (err) return reject(err);

                        resolve();
                    }
                );
            } else {
                // Create record
                pool.query(
                    queries.insert,
                    [
                        docterId,
                        patientId,
                        data
                    ],
                    function (err) {
                        if (err) return reject(err);
                        resolve();
                    }
                );
            }
        })
    });
};

module.exports = {
    createOrUpdate,
    getByOwner,
    getPatients,
};
  