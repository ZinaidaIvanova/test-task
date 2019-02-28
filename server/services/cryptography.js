const jwt = require('jsonwebtoken');
const projectConst = require('../config/projectConst');

const getAccessToken = (name) => {
    return jwt.sign(name, projectConst.userKey);
}

const getNameByToken = (accessToken) => {
    let name;
    try {
        name = jwt.verify(accessToken, projectConst.userKey);
    } catch(err) {
        if (err instanceof jwt.JsonWebTokenError) {
            throw err;
        }
    }
    return name;
}


module.exports = {
    getAccessToken,
    getNameByToken
}