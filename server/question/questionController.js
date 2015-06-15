var Question = require('./questionModel.js');
var Q = require('q');

module.exports = {
	allQuestions: function(req, res, next) {
		var findAll = Q.nbind(Question.find, Question);

		findAll({})
			.then(function(questions) {
				res.json(questions)
			})
			.fail(function(error) {
				next(error);
			});
	}
};
