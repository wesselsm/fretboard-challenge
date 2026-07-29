export default class Question {
    constructor({ id = crypto.randomUUID(), position, correctAnswer, prompt, startedAt = performance.now() }) {
        this.id = id;
        this.position = Object.freeze({ ...position });
        this.correctAnswer = String(correctAnswer);
        this.prompt = String(prompt);
        this.startedAt = startedAt;
        Object.freeze(this);
    }
}
