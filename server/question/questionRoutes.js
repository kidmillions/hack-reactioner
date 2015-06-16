var questionsController = require('./questionController');

module.exports = function(app) {
	app.route('/')
		.get(questionsController.allQuestions)
		.post(questionsController.newQuestion);


	app.param('topic', questionsController.findQuestion);
	app.post('/:topic/vote', questionsController.addVote);
	app.get('/:topic/vote', questionsController.allVotes);

};