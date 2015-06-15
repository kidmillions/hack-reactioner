var mongoose = require('mongoose');


var QuestionSchema = new mongoose.Schema({
	topic: String,
	sprintName: String,
	votes: {
		Usefulness: [Number, Number],
		Expectations: [Number, Number],
		Experience: [Number, Number],
		Whatever: [Number]
	}
});


module.exports = mongoose.model('Question', QuestionSchema);
