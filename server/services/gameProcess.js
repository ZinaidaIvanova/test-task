const crypto = require('../services/cryptography');
const  gameResult = require('../config/gameResult');
const  gameState = require('../config/gameState');



const getTableColName = (row, col) => {
    let rowName, colName;
    rowName = getName(row, 'row');
    colName = getName(col, 'col');
    return rowName + '_' + colName;
}

const getName = (value, name) => {
    let variable;
    switch (value) {
        case 1:
        variable = "f_" + name;
            break;
        case 2:
        variable = "s_" + name;
            break;
        case 3:
        variable = "t_" + name;
            break;
        default:
            break;
    }
    return variable
}

const isStepPossible = (step, gameInfo, idPlayer) => {
    colName = getTableColName(step.row, step.col);
    console.log("currPlayer " + gameInfo.currPlayer);
    console.log("idPlayer " + idPlayer);
    console.log("char " + gameInfo[colName]);
    if (gameInfo.currPlayer != idPlayer) {
        console.log("false id");
        return false;
    }
    if ((gameInfo[colName] !== '?') && (gameInfo[colName] != null)) {
        console.log((gameInfo[colName] !== '?'));
        console.log((gameInfo[colName] != null));
        console.log((gameInfo[colName] !== '?') || (gameInfo[colName] != null));
        console.log("false char");
        return false;
    }
    console.log("true");
    return true;
}

const getGameMatrix = (gameInfo) => {
    let matrix = [];
    for (let i = 0; i < 3; i++) {
        let row = [];
        for (let j = 0; j < 3; j++) {
            row.push(gameInfo[getTableColName(i+1, j+1)]);
        }
        matrix.push(row);
    }
    console.log(matrix);
    return matrix;
}

const checkRows = (matrix) => {
    let result = false;
    let winner = gameResult.draw;
    let state = gameState.playing;

    for (let i = 0; i < 3; i++) {
        let elem = matrix[i][0];

        for (let j = 1; j < 3; j++) {
            if((elem === matrix[i][j]) && (elem !== '?')) {
                result = true;
            } else {
                result = false;
                break;
            }
        }

        if (result) {
            state = gameState.done;
            if (elem === 'x') {
                winner = gameResult.owner;
                break;
            } else if (elem === 'o') {
                winner = gameResult.opponent;
                break;
            }
        }
    }

    return {"result": result, "winner": winner, "state": state};
}

const checkColmns = (matrix) => {
    let result = false;
    let winner = gameResult.draw;
    let state = gameState.playing;

    for (let i = 0; i < 3; i++) {
        let elem = matrix[0][i];

        for (let j = 1; j < 3; j++) {
            if ((elem === matrix[j][i]) && (elem !== '?')) {
                result = true;
            } else {
                result = false;
                break;
            }
        }

        if (result) {
            state = gameState.done;
            if (elem === 'x') {
                winner = gameResult.owner;
                break;
            } else if (elem === 'o') {
                winner = gameResult.opponent;
                break;
            }
        }
    }

    return {"result": result, "winner": winner, "state": state};
}

const cheakDiagonal = (matrix) => {
    let result = false;
    let winner = gameResult.draw;
    let state = gameState.playing;

    let elem = matrix[0][0];
    for (let i = 1; i < 3; i++) {
        if((elem === matrix[i][i]) && (elem !== '?')) {
            result = true;
        } else {
            result = false;
            break;
        }
    }

    if (!result) {
        elem = matrix[0][2];
        for (let i = 1; i < 3; i++) {
            if((elem === matrix[i][2-i]) && (elem !== '?')) {
                result = true;
            } else {
                result = false;
                break;
            }
        }
    }

    if (result) {
        if (elem === 'x') {
            winner = gameResult.owner;
        } else if (elem === 'o') {
            winner = gameResult.opponent;
        }
        state = gameState.done;
    }

    return {"result": result, "winner": winner, "state": state};
}

const getPlayerChar = (gameInfo, idPlayer) => {
    if (idPlayer == gameInfo.idOwner) {
        return 'x';
    } else if (idPlayer == gameInfo.idOpponent) {
        return 'o';
    }
}

const getNextPlayer = (gameInfo, idPlayer) => {
    if (idPlayer == gameInfo.idOwner) {
        return gameInfo.idOpponent;
    } else if (idPlayer == gameInfo.idOpponent) {
        return gameInfo.idOwner;
    }
}

const checkWinner = (step, gameInfo, idPlayer) => {
    colName = getTableColName(step.row, step.col);
    let matrix = getGameMatrix(gameInfo);
    matrix[step.row - 1][step.col - 1] = getPlayerChar(gameInfo, idPlayer);

    let winnerInd = checkColmns(matrix);
    if (!winnerInd.result) {
        winnerInd = checkRows(matrix);
        if (!winnerInd.result) {
            winnerInd = cheakDiagonal(matrix);
        }
    }

    return winnerInd;
}

const getTimeInfo = (gameInfo) => {
    currTime = Date.now();
    duration = gameInfo.duration + currTime - gameInfo.lastStep;
    return {"gameDuration": duration, "lastStepTime": currTime};
}

const getNewStepResult = (step, gameInfo, idPlayer) => {
    const char = getPlayerChar(gameInfo, idPlayer);
    const time = getTimeInfo(gameInfo);
    const nextPlayer = getNextPlayer(gameInfo,idPlayer);
    const stepResult = checkWinner(step, gameInfo, idPlayer);
    return {
        "char": char,
        "idResult": stepResult.winner,
        "idState": stepResult.state,
        "idNextPlayer": nextPlayer,
        "gameDuration": time.gameDuration,
        "lastStepTime": time.lastStepTime
    };
}

const getFields = (gameInfo) => {
    let matrix = getGameMatrix(gameInfo);
    let row = '';
    let result = [];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            row += matrix[i][j];
        }
        result.push(row);
        row = '';
    }
    return result;
}

const getDuration = (gameInfo) => {
    return (Date.now() - gameInfo.beginTime);
}

const isPlayerTurn = (gameInfo, idPlayer) => {
    return (gameInfo.currPlayer == idPlayer);
}

const getGameStateInfo = (gameInfo, idPlayer, winnerName) => {
    const info = {
        "youTurn": isPlayerTurn(gameInfo, idPlayer),
        "gameDuration": getDuration(gameInfo),
        "field": getFields(gameInfo),
        "winner": winnerName
    };
    return info;
}

const getIdWinner = (gameInfo) => {
    let id = null;
    switch (gameInfo.idResult) {
        case gameResult.owner:
            id = gameInfo.idOwner;
            break;
        case gameResult.opponent:
            id = gameInfo.idOpponent;
            break;
        default:
            break;
    }
    return id;
}

module.exports = {
    getTableColName,
    isStepPossible,
    checkWinner,
    getNextPlayer,
    getPlayerChar,
    getNewStepResult,
    getGameStateInfo,
    getIdWinner
}