export default class AnswerResult {
    constructor({ question, answer, isCorrect, responseMilliseconds }) {
        this.question = question;
        this.answer = String(answer);
        this.isCorrect = Boolean(isCorrect);
        this.responseMilliseconds = responseMilliseconds;
        Object.freeze(this);
    }
}
