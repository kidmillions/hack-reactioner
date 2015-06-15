var morgan      = require('morgan');
var bodyParser  = require('body-parser');
var path = require('path');


module.exports = function(app, express) {
	var questionRouter = express.Router();
	app.use(morgan('dev'));

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	app.use(express.static(path.join(__dirname, '../../app')));

	app.use('/api/question', questionRouter);


	require('../question/questionRoutes.js')(questionRouter);

}