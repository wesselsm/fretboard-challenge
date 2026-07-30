export default class PerformanceCalculator {
    constructor(config) {
        this.config = config;
    }

    summarize(results) {
        const questions = results.length;
        const correct = results.filter((result) => result.isCorrect).length;
        const averageMilliseconds = questions
            ? Math.round(
                results.reduce(
                    (sum, result) => sum + result.responseMilliseconds,
                    0
                ) / questions
            )
            : 0;

        const accuracyRatio = questions ? correct / questions : 0;
        const accuracy = Math.round(accuracyRatio * 100);
        const baseScore = Math.round(
            accuracyRatio * this.config.maximumBaseScore
        );
        const timeFactor = this.calculateTimeFactor(averageMilliseconds);
        const totalPoints = Math.round(baseScore * timeFactor);

        return {
            scoringVersion: this.config.version,
            questions,
            correct,
            accuracy,
            averageMilliseconds,
            baseScore,
            timeFactor,
            totalPoints
        };
    }

    calculateTimeFactor(averageMilliseconds) {
        if (!averageMilliseconds) {
            return 0;
        }

        const seconds = averageMilliseconds / 1000;
        const points = this.config.timeFactors;

        if (seconds <= points[0].seconds) {
            return points[0].factor;
        }

        for (let index = 1; index < points.length; index += 1) {
            const lower = points[index - 1];
            const upper = points[index];

            if (seconds <= upper.seconds) {
                const position =
                    (seconds - lower.seconds) /
                    (upper.seconds - lower.seconds);

                return this.#roundFactor(
                    lower.factor +
                    (upper.factor - lower.factor) * position
                );
            }
        }

        return points.at(-1).factor;
    }

    #roundFactor(value) {
        return Math.round(value * 1000) / 1000;
    }
}
