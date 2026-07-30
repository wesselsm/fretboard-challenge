import { Events } from "../core/Constants.js";

export default class StatisticsRepository {
    constructor(storage, eventBus, storageKey, maximumRecords = 500) {
        this.storage = storage;
        this.eventBus = eventBus;
        this.storageKey = storageKey;
        this.maximumRecords = maximumRecords;
        this.records = [];
    }

    async initialize() {
        const stored = await this.storage.get(this.storageKey, []);
        this.records = Array.isArray(stored)
            ? stored.filter((record) => this.#isValidRecord(record))
            : [];
        this.#emitChanged();
    }

    async addRound({ scale, state }) {
        if (!scale || !state?.summary) {
            throw new Error("De afgeronde ronde bevat onvoldoende statistiekgegevens.");
        }

        const summary = state.summary;
        const now = new Date().toISOString();
        const responseTimes = state.results.map((result) => result.responseMilliseconds);
        const fastestMilliseconds = responseTimes.length ? Math.min(...responseTimes) : 0;
        const slowestMilliseconds = responseTimes.length ? Math.max(...responseTimes) : 0;

        const intervalStats = {};
        for (const result of state.results) {
            const interval = result.question.correctAnswer;
            const entry = intervalStats[interval] ?? {
                questions: 0,
                correct: 0,
                totalMilliseconds: 0
            };

            entry.questions += 1;
            entry.correct += result.isCorrect ? 1 : 0;
            entry.totalMilliseconds += result.responseMilliseconds;
            intervalStats[interval] = entry;
        }

        const normalizedIntervals = Object.fromEntries(
            Object.entries(intervalStats).map(([interval, entry]) => [
                interval,
                {
                    questions: entry.questions,
                    correct: entry.correct,
                    accuracy: Math.round((entry.correct / entry.questions) * 100),
                    averageMilliseconds: Math.round(entry.totalMilliseconds / entry.questions)
                }
            ])
        );

        const record = {
            id: crypto.randomUUID(),
            scoringVersion: summary.scoringVersion ?? 2,
            completedAt: now,
            scaleId: scale.id,
            scaleName: scale.name,
            questions: summary.questions,
            correct: summary.correct,
            accuracy: summary.accuracy,
            totalPoints: summary.totalPoints,
            averageMilliseconds: summary.averageMilliseconds,
            fastestMilliseconds,
            slowestMilliseconds,
            intervals: normalizedIntervals
        };

        this.records.unshift(record);
        this.records = this.records.slice(0, this.maximumRecords);
        await this.#persist();
        this.#emitChanged();
        return structuredClone(record);
    }

    getAll() {
        return structuredClone(this.records);
    }

    getDashboard() {
        const rounds = this.records.length;
        const questions = this.records.reduce((sum, record) => sum + record.questions, 0);
        const correct = this.records.reduce((sum, record) => sum + record.correct, 0);
        const totalPoints = this.records.reduce((sum, record) => sum + record.totalPoints, 0);
        const weightedMilliseconds = this.records.reduce(
            (sum, record) => sum + record.averageMilliseconds * record.questions,
            0
        );

        return {
            rounds,
            questions,
            correct,
            accuracy: questions ? Math.round((correct / questions) * 100) : 0,
            averageMilliseconds: questions ? Math.round(weightedMilliseconds / questions) : 0,
            totalPoints,
            bestScore: rounds ? Math.max(...this.records.map((record) => record.totalPoints)) : 0,
            bestAccuracy: rounds ? Math.max(...this.records.map((record) => record.accuracy)) : 0,
            records: this.getAll(),
            recent: this.getAll().slice(0, 10),
            perScale: this.#summarizeByScale(),
            perInterval: this.#summarizeByInterval()
        };
    }

    async clear() {
        const count = this.records.length;
        this.records = [];
        await this.#persist();
        this.#emitChanged();
        return count;
    }

    async #persist() {
        await this.storage.set(this.storageKey, this.records);
    }

    #summarizeByScale() {
        const groups = new Map();

        for (const record of this.records) {
            const current = groups.get(record.scaleId) ?? {
                scaleId: record.scaleId,
                scaleName: record.scaleName,
                rounds: 0,
                questions: 0,
                correct: 0,
                totalPoints: 0,
                weightedMilliseconds: 0,
                bestScore: 0
            };

            current.scaleName = record.scaleName;
            current.rounds += 1;
            current.questions += record.questions;
            current.correct += record.correct;
            current.totalPoints += record.totalPoints;
            current.weightedMilliseconds += record.averageMilliseconds * record.questions;
            current.bestScore = Math.max(current.bestScore, record.totalPoints);
            groups.set(record.scaleId, current);
        }

        return [...groups.values()]
            .map((item) => ({
                scaleId: item.scaleId,
                scaleName: item.scaleName,
                rounds: item.rounds,
                questions: item.questions,
                accuracy: item.questions
                    ? Math.round((item.correct / item.questions) * 100)
                    : 0,
                averageMilliseconds: item.questions
                    ? Math.round(item.weightedMilliseconds / item.questions)
                    : 0,
                averageScore: item.rounds
                    ? Math.round(item.totalPoints / item.rounds)
                    : 0,
                bestScore: item.bestScore
            }))
            .sort((a, b) => b.rounds - a.rounds || a.scaleName.localeCompare(b.scaleName, "nl"));
    }

    #summarizeByInterval() {
        const groups = new Map();

        for (const record of this.records) {
            for (const [interval, stats] of Object.entries(record.intervals ?? {})) {
                const current = groups.get(interval) ?? {
                    interval,
                    questions: 0,
                    correct: 0,
                    weightedMilliseconds: 0
                };

                current.questions += stats.questions;
                current.correct += stats.correct;
                current.weightedMilliseconds += stats.averageMilliseconds * stats.questions;
                groups.set(interval, current);
            }
        }

        const preferredOrder = ["1", "2", "b3", "3", "4", "b5", "5", "6", "7"];
        return [...groups.values()]
            .map((item) => ({
                interval: item.interval,
                questions: item.questions,
                accuracy: Math.round((item.correct / item.questions) * 100),
                averageMilliseconds: Math.round(item.weightedMilliseconds / item.questions)
            }))
            .sort((a, b) => preferredOrder.indexOf(a.interval) - preferredOrder.indexOf(b.interval));
    }

    #isValidRecord(record) {
        return Boolean(
            record &&
            typeof record.id === "string" &&
            typeof record.completedAt === "string" &&
            typeof record.scaleId === "string" &&
            typeof record.scaleName === "string" &&
            Number.isFinite(record.questions) &&
            Number.isFinite(record.correct) &&
            Number.isFinite(record.totalPoints) &&
            Number.isFinite(record.averageMilliseconds)
        );
    }

    #emitChanged() {
        this.eventBus.emit(Events.STATISTICS_CHANGED, this.getDashboard());
    }
}
