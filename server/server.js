const express = require('express');
const bodyParser = require('body-parser');
const gameController = require('./controllers/gameController');
const auth = require('./middleware/auth');
var cors = require('cors');




const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/games/new', gameController.createNewGame);
app.get('/games/list', gameController.getGamesList);
app.post('/games/join', gameController.joinGame);
app.post('/games/do_step', auth, gameController.gameStepHandler);
app.get('/games/state', auth, gameController.getGameState);


app.listen(3000);