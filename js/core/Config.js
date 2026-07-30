const Config = Object.freeze({
    appName: "FretMaster Studio",
    version: "4.0.1 Alpha 1 — Sprint 5.0.2",
    storageNamespace: "fretmaster-studio",
    storageKeys: Object.freeze({
        project: "project",
        scales: "scales",
        settings: "settings",
        highScores: "high-scores",
        statistics: "statistics"
    }),
    trainer: Object.freeze({
        questionsPerRound: 30,
        stringCount: 6,
        patternColumns: 16,
        patternPeriod: 12,
        answerDelay: 250
    }),
    scoring: Object.freeze({
        version: 2,
        maximumBaseScore: 1000,
        timeFactors: Object.freeze([
            Object.freeze({ seconds: 1, factor: 1.50 }),
            Object.freeze({ seconds: 2, factor: 1.35 }),
            Object.freeze({ seconds: 3, factor: 1.20 }),
            Object.freeze({ seconds: 4, factor: 1.10 }),
            Object.freeze({ seconds: 5, factor: 1.00 }),
            Object.freeze({ seconds: 6, factor: 0.90 }),
            Object.freeze({ seconds: 7, factor: 0.80 }),
            Object.freeze({ seconds: 8, factor: 0.70 }),
            Object.freeze({ seconds: 10, factor: 0.50 })
        ])
    })
});

export default Config;
