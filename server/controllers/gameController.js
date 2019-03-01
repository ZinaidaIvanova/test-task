const dbQuery = require('../services/dbQuery');
const response = require('../services/response');
const crypto = require('../services/cryptography');
const gameProcess = require('../services/gameProcess');
const  gameResult = require('../config/gameResult');

const createNewGame = (req, res) => {
    const name = req.body.userName;
    const size = req.body.size;
    dbQuery.getPlayerbyName(name, function (err, result) {
        if (err) {
            response.errorResponse(res, 500, err.code);
        } else if(result.length != 0) {
            dbQuery.addGame(name, size, result[0]["id_player"], function(gameToken, name) {
                response.gameCreateResponse(res, gameToken, crypto.getAccessToken(name));
            });
        } else {
            dbQuery.addPlayer(name, function (idOwner) {
                if (err) {
                    response.errorResponse(res, 500, err.code);
                } else {
                    dbQuery.addGame(name, size, idOwner, function(gameToken, name) {
                        response.gameCreateResponse(res, gameToken, crypto.getAccessToken(name));
                    });
                }
            });
        }
    });
}

const getGamesList = (req, res) => {
    dbQuery.getGameList(function (err, list) {
        if (err) {
            response.errorResponse(res, 500, err.code);
        } else {
            response.gameListResponse(res, list);
        }
    });
}

const joinGame = (req, res) => {
    const name = req.body.userName;
    const gameToken = req.body.gameToken;
    dbQuery.getPlayerbyName(name, function (err, result) {
        if (err) {
            response.errorResponse(res, 500, err.code);
        } else if(result.length != 0) {
            dbQuery.joinGame(result[0]["id_player"], gameToken, name, function (name) {
                response.joinGameResponse(res, crypto.getAccessToken(name));
            });
        } else {
            dbQuery.addPlayer(name, function (idOpponent) {
                dbQuery.joinGame(idOpponent, gameToken, name, function (name) {
                        response.joinGameResponse(res, crypto.getAccessToken(name));
                });
            });
        }
    });
}

const gameStepHandler = (req, res) => {
    const accessToken = req.get('Authorization');
    const gameToken = req.get('Game-Token');
    const step = req.body;
    dbQuery.getPlayerbyName(crypto.getNameByToken(accessToken), function (err, result) {
        if (err) {
            response.errorResponse(res, 500, err.code);
        } else if(result.length == 0) {
            response.errorResponse(res, 500, 'This player doesn\'t exist');
        } else {
            dbQuery.getGameProcessInfo(gameToken, function (info) {
                const gameInfo = info[0];
                const idPlayer = result[0]["id_player"];
                if(gameInfo.idProcess != null) {
                    checkAndDoStep(res, step, gameInfo, gameToken, idPlayer);
                } else {
                    dbQuery.addNewGameProcess(gameInfo.idGame, function (err) {
                        if (err) {
                            response.errorResponse(res, 500, err.code);
                        }
                    });
                    checkAndDoStep(res, step, gameInfo, gameToken, idPlayer);
                }
            });
        }
    });
}

const checkAndDoStep = (res, step, gameInfo, gameToken, idPlayer) => {
    if (!gameProcess.isStepPossible(step, gameInfo, idPlayer)) {
        response.errorResponse(res, 500, 'Step is impossible');
    } else {
        const gameStepResult = gameProcess.getNewStepResult(step, gameInfo, idPlayer);
        dbQuery.doStep(step, gameStepResult, gameToken, function () {
            response.OkResponse(res);
        });
    }
}

const getGameState = (req, res) => {
    const accessToken = req.get('Authorization');
    const gameToken = req.get('Game-Token');

    dbQuery.getPlayerbyName(crypto.getNameByToken(accessToken), function (err, result) {
        if (err) {
            response.errorResponse(res, 500, err.code);
        } else if(result.length == 0) {
            response.errorResponse(res, 500, 'This player doesn\'t exist');
        } else {
            dbQuery.getGameProcessInfo(gameToken, function (info) {
                const gameInfo = info[0];
                const idPlayer = result[0]["id_player"];
                if (gameInfo.idResult != gameResult.draw) {
                    const id = gameProcess.getIdWinner(gameInfo);
                    dbQuery.getPlayerById(id, function(nameInfo) {
                        response.gameStateResponse(res, gameProcess.getGameStateInfo(gameInfo, idPlayer, nameInfo[0]["name"]));
                    });
                } else {
                    response.gameStateResponse(res, gameProcess.getGameStateInfo(gameInfo, idPlayer, null));
                }
            });
        }
    });
}


module.exports = {
    createNewGame,
    getGamesList,
    joinGame,
    gameStepHandler,
    getGameState
};