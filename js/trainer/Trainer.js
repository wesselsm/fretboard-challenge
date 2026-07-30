import { Events } from "../core/Constants.js";
import AnswerResult from "../models/AnswerResult.js";

export default class Trainer {
    constructor(eventBus, performanceCalculator, options = {}) {
        this.eventBus = eventBus;
        this.performanceCalculator = performanceCalculator;
        this.questionsPerRound = options.questionsPerRound ?? 30;
        this.exercise = null;
        this.reset();
    }

    setExercise(exercise) {
        this.exercise = exercise;
    }

    start() {
        if (!this.exercise) {
            throw new Error("No exercise selected.");
        }

        this.reset();
        const roundLayout = this.exercise.prepareRound();
        this.roundPattern = roundLayout.pattern;
        this.roundOffset = roundLayout.offset;
        this.status = "running";
        this.startedAt = performance.now();

        this.eventBus.emit(Events.ROUND_STARTED, this.getState());
        this.nextQuestion();
    }

    stop() {
        if (this.status !== "running") return;
        this.status = "stopped";
        this.currentQuestion = null;
        this.eventBus.emit(Events.ROUND_STOPPED, this.getState());
    }

    answer(answer) {
        if (this.status !== "running" || !this.currentQuestion) return null;

        const responseMilliseconds = Math.round(
            performance.now() - this.currentQuestion.startedAt
        );
        const isCorrect = String(answer) === this.currentQuestion.correctAnswer;
        const result = new AnswerResult({
            question: this.currentQuestion,
            answer,
            isCorrect,
            responseMilliseconds
        });

        this.results.push(result);
        this.score = this.performanceCalculator.summarize(
            this.results
        ).totalPoints;

        this.eventBus.emit(Events.QUESTION_ANSWERED, {
            result,
            state: this.getState()
        });

        if (this.results.length >= this.questionsPerRound) {
            this.finish();
        } else {
            this.nextQuestion();
        }

        return result;
    }

    nextQuestion() {
        this.currentQuestion = this.exercise.createQuestion();
        this.eventBus.emit(Events.QUESTION_CHANGED, {
            question: this.currentQuestion,
            answerOptions: this.exercise.getAnswerOptions(),
            title: this.exercise.getTitle(),
            state: this.getState()
        });
    }

    finish() {
        this.status = "finished";
        this.finishedAt = performance.now();
        this.currentQuestion = null;
        this.summary = this.performanceCalculator.summarize(this.results);

        this.eventBus.emit(Events.ROUND_FINISHED, this.getState());
    }

    reset() {
        this.status = "idle";
        this.currentQuestion = null;
        this.results = [];
        this.score = 0;
        this.summary = null;
        this.startedAt = null;
        this.finishedAt = null;
        this.roundPattern = null;
        this.roundOffset = 0;
    }

    getState() {
        return {
            status: this.status,
            answered: this.results.length,
            correct: this.results.filter((result) => result.isCorrect).length,
            score: this.score,
            questionsPerRound: this.questionsPerRound,
            currentQuestion: this.currentQuestion,
            summary: this.summary,
            results: [...this.results],
            roundPattern: this.roundPattern
                ? structuredClone(this.roundPattern)
                : null,
            roundOffset: this.roundOffset
        };
    }
}
