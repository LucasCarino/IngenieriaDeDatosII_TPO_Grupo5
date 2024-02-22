const { redis } = require('../../db');

let client = redis;

exports.init = (_client) => {
    if(!_client) throw new Error('Missing redis client object');
    client = _client;
}

exports.getAllItems = async (userId) => {
    console.log(userId);
    return new Promise((resolve, reject) => {
        client.hgetall(`cart:${userId}`, (err, res) => {
            if(err) {
                return reject(err);
            }
            resolve(res);
            console.log(res);
        });
    });
}

exports.addItem = (itemId, userId) => {
    console.log("estoy en el cart controller")
    // console.log(client);
    return new Promise((resolve, reject) => {
        client.hget(`cart:${userId}`, itemId, (err, obj) => {
            if(err) {
                reject(err);
            }
            if(!obj) {
                return client.hset(`cart:${userId}`, itemId, 1, (seterr, res) => {

                    if(seterr) {
                        return reject(seterr);
                    }
                    resolve(res);
                })
            }
            return client.hincrby(`cart:${userId}`, itemId, 1, (increrr, res) => {
                if(increrr) {
                    return reject(increrr);
                }
                resolve(res);
            });
        });
    });
};

exports.removeItem = async (itemId, userId) => {
    return new Promise((resolve, reject) => {
        client.hdel(`cart:${userId}`, itemId, (err, res) => {
            if(err) {
                return reject(err);
            }
            resolve(res);
        });
    });
}