import Exercise from "./Exercise.js";
import Question from "../models/Question.js";

export default class ScaleIntervalExercise extends Exercise {
    constructor(scale, { patternColumns = 16, patternPeriod = 12, randomStart = true } = {}) {
        super();
        this.patternColumns = patternColumns;
        this.patternPeriod = patternPeriod;
        this.randomStart = randomStart;
        this.previousKey = null;
        this.previousOffset = null;
        this.roundOffset = 0;
        this.setScale(scale);
    }

    setScale(scale) {
        if (!scale || !Array.isArray(scale.pattern)) {
            throw new TypeError("ScaleIntervalExercise requires a pattern matrix.");
        }

        this.scale = structuredClone(scale);
        this.prepareRound(false);
    }

    setRandomStart(enabled) {
        this.randomStart = Boolean(enabled);
    }

    prepareRound(chooseNewOffset = true) {
        if (chooseNewOffset && this.randomStart) {
            this.roundOffset = this.#chooseOffset();
        } else {
            this.roundOffset = 0;
        }

        this.roundPattern = this.#createShiftedPattern(
            this.scale.pattern,
            this.roundOffset
        );
        this.positions = this.#getPlayablePositions(this.roundPattern);
        this.previousKey = null;

        if (this.positions.length === 0) {
            throw new Error("The selected pattern contains no playable positions.");
        }

        return {
            pattern: this.getPattern(),
            offset: this.roundOffset
        };
    }

    getPattern() {
        return structuredClone(this.roundPattern);
    }

    getRoundOffset() {
        return this.roundOffset;
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

    #chooseOffset() {
        if (this.patternPeriod <= 1) return 0;

        let offset;
        do {
            offset = Math.floor(Math.random() * this.patternPeriod);
        } while (offset === this.previousOffset);

        this.previousOffset = offset;
        return offset;
    }

    #createShiftedPattern(pattern, offset) {
        return pattern.map((row) =>
            Array.from({ length: this.patternColumns }, (_, visibleColumn) => {
                const sourceColumn =
                    (visibleColumn + offset) % this.patternPeriod;
                return row[sourceColumn] ?? "";
            })
        );
    }

    #getPlayablePositions(pattern) {
        const positions = [];

        pattern.forEach((row, stringIndex) => {
            row.forEach((cellCode, columnIndex) => {
                if (!cellCode) return;

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
