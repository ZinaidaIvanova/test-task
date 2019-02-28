const errorResponse = (res, errorCode, errorMessage) => {
    const answer = {
        "status": "error",
        "code": errorCode,
        "message": errorMessage
    };
    res.json(answer);
}

const OkResponse = (res) => {
    const answer = {
        "status": "ok",
        "code": 0
    };
    res.json(answer);
}

const gameCreateResponse = (res, gameToken, accessToken) => {
    const answer = {
        "status": "ok",
        "code": 0,
        "accessToken": accessToken,
        "gameToken": gameToken
    };
    res.json(answer);
}

const gameListResponse = (res, list) => {
    res.json({
        "status": 'ok',
        "code": 0,
        "games": list
    });
}

const joinGameResponse = (res, accessToken) => {
    res.json({
        "status": 'ok',
        "code": 0,
        "accessToken": accessToken
    });
}

const gameStateResponse = (res, info) => {
    const answer = {
        "status": "ok",
        "code": 0,
        "youTurn": info.youTurn,
        "gameDuration": info.duration,
        "field": info.field,
        "winner" : info.winner
    };
    res.json(answer);
}

module.exports = {
    errorResponse,
    gameCreateResponse,
    gameListResponse,
    joinGameResponse,
    OkResponse,
    gameStateResponse
};