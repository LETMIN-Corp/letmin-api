const { Schema, model } = require('mongoose');

const CombinationsSchema = new Schema({
    vacancy_id: {
        type: Schema.Types.ObjectId,
        ref: 'Vacancy',
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true
    }
});

module.exports = model('Combinations', CombinationsSchema);
