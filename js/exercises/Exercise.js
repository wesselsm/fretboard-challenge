export default class Exercise {
    createQuestion() {
        throw new Error("Exercise.createQuestion() must be implemented.");
    }

    getAnswerOptions() {
        throw new Error("Exercise.getAnswerOptions() must be implemented.");
    }

    getTitle() {
        return "Exercise";
    }
}
