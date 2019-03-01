const dbConfig = require('../config/dbConfig');
const jwt = require('jsonwebtoken');
const gameState = require('../config/gameState');
const gameResult = require('../config/gameResult');
const crypto = require('./cryptography');
const gameProcess = require('./gameProcess');


const getPlayerbyName = (name, callback) => {
    const sqlQuery = "SELECT * FROM player WHERE name = ?";
    dbConfig.connection.query(sqlQuery, name, function(err, result){
        callback(err, result);
    });
}

const getPlayerById = (id, callback) => {
    const sqlQuery = "SELECT * FROM player WHERE id_player = ?";
    dbConfig.connection.query(sqlQuery, id, function(err, result){
        if (err) throw err;
        callback(result);
    })
}

const addGame = (name, size, idOwner, callback) => {
    const createTime = Date.now();
    const gameToken = jwt.sign(name, String(createTime));
    const sqlQuery = "INSERT INTO game " +
        "(game_create_time, game_token, size, curr_player, id_owner, id_state, id_result) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [createTime, gameToken, size, idOwner, idOwner, gameState.ready, gameResult.draw];
    dbConfig.connection.query(sqlQuery, values, function (err) {
        if (err) throw err;
        callback(values[1], name);
    });
}

const addPlayer = (name, callback) => {
    const accessToken = crypto.getAccessToken(name);
    const sqlQuery = "INSERT INTO player " +
                    "(access_token, name) " +
                    "VALUES (?, ?)";
    const values = [accessToken, name];
    dbConfig.connection.query(sqlQuery, values, function (err, result) {
        if (err) throw err;
        console.log(result);
        callback(result.insertId);
    });

}

const getGameList = (callback) => {
    const sqlQuery = "SELECT game.game_token AS gameToken, " +
        "owner_player.name AS owner, " +
        "opponent_player.name AS opponent, " +
        "game.size AS size," +
        "game.game_duration AS gameDuration, " +
        "result. name AS gameResult, " +
        "state. name AS state " +
        "FROM game " +
        "LEFT JOIN player AS owner_player ON game.id_owner=owner_player.id_player " +
        "LEFT JOIN player AS opponent_player ON game.id_opponent=opponent_player.id_player " +
        "LEFT JOIN result ON game.id_result=result.id_result " +
        "LEFT JOIN state ON game.id_state=state.id_state " +
        "ORDER BY state.name DESC";
        dbConfig.connection.query(sqlQuery, [], function (err, result) {
            callback(err, JSON.parse(JSON.stringify(result)));
    });
}

const joinGame = (idOpponent, gameToken, name, callback) => {
    const sqlQuery = "UPDATE game " +
                    "SET id_opponent = ?," +
                    "last_step_time = ?, " +
                    "game_begin_time = ?, " +
                    "id_state = ? " +
                    "WHERE game_token = ?";
    values = [idOpponent, Date.now(), Date.now(), gameState.playing, gameToken];
    dbConfig.connection.query(sqlQuery, values, function (err) {
        if (err) throw err;
        callback(name);
    })
}

const getGameProcessInfo = (gameToken, callback) => {
    const sqlQuery = "SELECT game.id_game AS idGame, game.game_duration AS duration, " +
                    "game.last_step_time AS lastStep, game.id_owner AS idOwner, " +
                    "game.id_opponent AS idOpponent, game.curr_player AS currPlayer, " +
                    "game_process.f_row_f_col, game_process.f_row_s_col, " +
                    "game_process.f_row_t_col, game_process.s_row_s_col, " +
                    "game_process.s_row_f_col, game_process.s_row_t_col, " +
                    "game_process.t_row_f_col, game_process.t_row_s_col, " +
                    "game_process.t_row_t_col, game_process.id_game_process AS idProcess, " +
                    "game.game_begin_time AS beginTime, game.id_result AS idResult " +
                    "FROM game " +
                    "LEFT JOIN game_process ON game_process.id_game = game.id_game " +
                    "WHERE game.game_token = ?";
    dbConfig.connection.query(sqlQuery, gameToken, function (err, result) {
        if (err) throw err;
        callback(JSON.parse(JSON.stringify(result)));
    })
}

const addNewGameProcess = (idGame, callback) => {
    const sqlQuery = "INSERT INTO game_process " +
                    "(id_game) " +
                    "VALUES (?) ";
    dbConfig.connection.query(sqlQuery, idGame, function (err) {
        callback(err);
    });
}

const doStep = (step, stepResult, gameToken, callback) => {
    const sqlQuery = "UPDATE game " +
                    "LEFT JOIN game_process ON game_process.id_game = game.id_game " +
                    "SET game_process." + gameProcess.getTableColName(step.row, step.col) + " = ?, " +
                    "game.curr_player = ?, " +
                    "game.id_result = ?, " +
                    "game.id_state = ?, " +
                    "game.game_duration = ?, " +
                    "game.last_step_time = ? " +
                    "WHERE game.game_token = ?";
    values = [stepResult.char,
        stepResult.idNextPlayer,
        stepResult.idResult,
        stepResult.idState,
        stepResult.gameDuration,
        stepResult.lastStepTime,
        gameToken];
    dbConfig.connection.query(sqlQuery, values, function (err, result) {
        if (err) throw err;
        callback();
    });
}

module.exports = {
    addGame,
    addPlayer,
    getPlayerbyName,
    getGameList,
    joinGame,
    getGameProcessInfo,
    addNewGameProcess,
    doStep,
    getPlayerById
}