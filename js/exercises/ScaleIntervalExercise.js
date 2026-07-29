import Exercise from "./Exercise.js";
import Question from "../models/Question.js";

export default class ScaleIntervalExercise extends Exercise {
    constructor(scale) {
        super();
        this.previousKey = null;
        this.setScale(scale);
    }

    setScale(scale) {
        if (!scale || !Array.isArray(scale.pattern)) {
            throw new TypeError("ScaleIntervalExercise requires a pattern matrix.");
        }

        this.scale = structuredClone(scale);
        this.positions = this.#getPlayablePositions(this.scale.pattern);

        if (this.positions.length === 0) {
            throw new Error("The selected pattern contains no playable positions.");
        }
    }

    getTitle() {
        return this.scale.subtitle;
    }

    getAnswerOptions() {
        const preferredOrder = ["1", "2", "b3", "3", "4", "b5", "5", "6", "7"];
        const present = new Set(this.positions.map((position) => position.answer));
        return preferredOrder.filter((answer) => present.has(answer));
    }

    createQuestion() {
        let position;
        let key;

        do {
            position = this.positions[Math.floor(Math.random() * this.positions.length)];
            key = `${position.stringIndex}:${position.columnIndex}`;
        } while (this.positions.length > 1 && key === this.previousKey);

        this.previousKey = key;

        return new Question({
            position: {
                stringIndex: position.stringIndex,
                columnIndex: position.columnIndex,
                color: position.color
            },
            correctAnswer: position.answer,
            prompt: "Welk interval hoort bij de gemarkeerde patroonpositie?"
        });
    }

    #getPlayablePositions(pattern) {
        const positions = [];

        pattern.forEach((row, stringIndex) => {
            row.forEach((cellCode, columnIndex) => {
                if (!cellCode) {
                    return;
                }

                positions.push({
                    stringIndex,
                    columnIndex,
                    color: cellCode.charAt(0),
                    answer: cellCode.substring(1)
                });
            });
        });

        return positions;
    }
}
