const Config = Object.freeze({
    appName: "FretMaster Studio",
    version: "4.0.1 Alpha 1 — Sprint 4.2.1",
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
        answerDelay: 250
    }),
    scoring: Object.freeze({
        maximumQuestionPoints: 100,
        penaltyPerSecond: 20,
        minimumQuestionPoints: 10
    })
});

export default Config;
