const jwt = require('jsonwebtoken');
const projectConst = require('../config/projectConst');
const response = require('../services/response');


module.exports = (req, res, next) => {
    const accessToken = req.get('Authorization');
    console.log(accessToken);
    if (!accessToken) {
        return response.errorResponse(res, 401, "Authorization error");
    }

    try {
        jwt.verify(accessToken, projectConst.userKey);
    } catch(e) {
        if (e instanceof jwt.JsonWebTokenError) {
            return response.errorResponse(res, 401, "Invalid token");
        }
    }

    next();
};