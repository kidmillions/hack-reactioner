var questionsController = require('./questionController');

module.exports = function(app) {
	app.route('/')
		.get(questionsController.allQuestions);
		// .post(questionsController.newQuestion);

	// app.get('/:id', questionsController.navToQuestion);

};