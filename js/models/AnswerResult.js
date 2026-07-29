export default class AnswerResult {
    constructor({ question, answer, isCorrect, responseMilliseconds, points }) {
        this.question = question;
        this.answer = String(answer);
        this.isCorrect = Boolean(isCorrect);
        this.responseMilliseconds = responseMilliseconds;
        this.points = points;
        Object.freeze(this);
    }
}
