export default class PerformanceCalculator {
    constructor(config) {
        this.config = config;
    }

    calculateQuestionPoints(isCorrect, responseMilliseconds) {
        if (!isCorrect) {
            return 0;
        }

        const seconds = Math.max(0, responseMilliseconds / 1000);
        const calculated = Math.round(
            this.config.maximumQuestionPoints -
            this.config.penaltyPerSecond * seconds
        );

        return Math.max(this.config.minimumQuestionPoints, calculated);
    }

    summarize(results) {
        const correct = results.filter((result) => result.isCorrect).length;
        const totalPoints = results.reduce((sum, result) => sum + result.points, 0);
        const averageMilliseconds = results.length
            ? Math.round(results.reduce((sum, result) => sum + result.responseMilliseconds, 0) / results.length)
            : 0;

        return {
            questions: results.length,
            correct,
            accuracy: results.length ? Math.round((correct / results.length) * 100) : 0,
            totalPoints,
            averageMilliseconds
        };
    }
}
