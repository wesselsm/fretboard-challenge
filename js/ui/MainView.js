import { Events } from "../core/Constants.js";
import FretboardView from "./FretboardView.js";
import StatisticsChart from "./StatisticsChart.js";

export default class MainView {
    constructor(rootElement, config, eventBus) {
        this.rootElement = rootElement;
        this.config = config;
        this.eventBus = eventBus;
        this.unsubscribe = [];
        this.fretboard = null;
        this.scales = [];
        this.activeScaleId = null;
        this.editorState = null;
        this.intervalOptions = ["1", "2", "b3", "3", "4", "b5", "5", "6", "7"];
        this.statisticsChart = null;
        this.statisticsDashboard = null;
        this.statisticsFilter = { scaleId: "all", range: "20", metric: "score" };
        this.roundTimerId = null;
        this.roundStartedAt = null;
        this.feedbackTimerId = null;
    }

    initialize(scales, settings) {
        this.scales = structuredClone(scales);
        this.activeScaleId = settings.activeScaleId;
        this.randomStartPerRound = settings.randomStartPerRound !== false;

        this.rootElement.innerHTML = `
            <main class="app-shell">
                <header class="app-shell__header">
                    <div>
                        <h1>${this.config.appName}</h1>
                        <p>Linkshandige diagonale patroontrainer</p>
                    </div>
                    <span class="app-shell__version">${this.config.version}</span>
                </header>

                <section class="controls">
                    <label>Actief patroon
                        <select id="scaleSelect"></select>
                    </label>
                    <button id="libraryButton" class="secondary-button" type="button">☰ Schaalbibliotheek</button>
<button id="statisticsButton" class="secondary-button" type="button">▦ Statistieken</button>
                    <label class="random-start-control">
                        <input id="randomStartCheckbox" type="checkbox">
                        <span>Willekeurige startpositie</span>
                    </label>
                    <button id="restartButton" type="button">↻ Nieuwe ronde</button>
                    <button id="stopButton" type="button" disabled>Stop</button>
                </section>

                <section class="dashboard">
                    <article class="status-card"><span class="status-card__label">Performance</span><strong id="score">0</strong></article>
                    <article class="status-card"><span class="status-card__label">Correct</span><strong id="correct">0</strong></article>
                    <article class="status-card"><span class="status-card__label">Vraag</span><strong><span id="question">0</span> / ${this.config.trainer.questionsPerRound}</strong></article>
                    <article class="status-card"><span class="status-card__label">Tijd</span><strong id="elapsedTime">00:00</strong></article>
                    <article id="statusCard" class="status-card status-card--ready"><span class="status-card__label">Status</span><strong id="status">Gereed</strong></article>
                </section>

                <h2 id="scaleTitle" class="scale-title">Interval Trainer</h2>
                <p id="prompt" class="question-text">Klik op “Nieuwe ronde”.</p>

                <div class="pattern-scroll">
                    <div id="fretboard" class="fretboard" role="img"
                        aria-label="Linkshandig diagonaal gitaarpatroon met zes snaren en zestien abstracte posities"></div>
                </div>

                <div id="answers" class="answers"></div>
                <section id="resultPanel" class="result-panel" hidden></section>
            </main>

            <div id="libraryModal" class="modal-backdrop" hidden>
                <section class="library-dialog" role="dialog" aria-modal="true" aria-labelledby="libraryTitle">
                    <header class="library-dialog__header">
                        <div>
                            <h2 id="libraryTitle">Schaalbibliotheek</h2>
                            <p>Beheer ingebouwde en eigen schaalpatronen.</p>
                        </div>
                        <button id="libraryCloseButton" class="icon-button" type="button" aria-label="Sluiten">×</button>
                    </header>

                    <form id="newScaleForm" class="new-scale-form">
                        <label>Naam nieuwe schaal
                            <input id="newScaleName" type="text" maxlength="50" placeholder="Bijvoorbeeld: Mijn pentatoniek" required>
                        </label>
                        <label>Gebruik structuur van
                            <select id="newScaleSource"></select>
                        </label>
                        <button type="submit">＋ Toevoegen</button>
                    </form>

                    <section class="library-tools">
                        <div class="library-tools__group">
                            <h3>Import en export</h3>
                            <div class="library-tools__actions">
                                <button id="exportScalesButton" class="secondary-button" type="button">⇩ Exporteren</button>
                                <label class="file-button">
                                    ⇧ Importeren
                                    <input id="importScalesInput" type="file" accept=".json,application/json">
                                </label>
                            </div>
                        </div>
                        <div class="library-tools__group">
                            <h3>Herstel</h3>
                            <div class="library-tools__actions">
                                <button id="resetBuiltInsButton" class="secondary-button" type="button">↺ Ingebouwde schalen herstellen</button>
                                <button id="clearCustomButton" class="danger-button" type="button">Alle eigen schalen wissen</button>
                            </div>
                        </div>
                    </section>

                    <p id="libraryMessage" class="library-message" aria-live="polite"></p>
                    <div id="scaleLibraryList" class="scale-library-list"></div>
                </section>
            </div>

            <div id="statisticsModal" class="modal-backdrop" hidden>
                <section class="statistics-dialog" role="dialog" aria-modal="true" aria-labelledby="statisticsTitle">
                    <header class="library-dialog__header">
                        <div>
                            <h2 id="statisticsTitle">Statistieken en voortgang</h2>
                            <p>Resultaten van volledig afgeronde rondes.</p>
                        </div>
                        <button id="statisticsCloseButton" class="icon-button" type="button" aria-label="Sluiten">×</button>
                    </header>

                    <section class="statistics-controls">
                        <label>Schaal
                            <select id="statisticsScaleFilter">
                                <option value="all">Alle schalen</option>
                            </select>
                        </label>
                        <label>Periode
                            <select id="statisticsRangeFilter">
                                <option value="10">Laatste 10 rondes</option>
                                <option value="20" selected>Laatste 20 rondes</option>
                                <option value="50">Laatste 50 rondes</option>
                                <option value="all">Alle rondes</option>
                            </select>
                        </label>
                        <label>Trendlijn
                            <select id="statisticsMetricFilter">
                                <option value="score">Score</option>
                                <option value="accuracy">Nauwkeurigheid</option>
                                <option value="response">Reactietijd</option>
                            </select>
                        </label>
                    </section>

                    <section class="statistics-chart-panel">
                        <div>
                            <h3 id="statisticsChartTitle">Scoreontwikkeling</h3>
                            <p id="statisticsTrendSummary"></p>
                        </div>
                        <canvas id="statisticsTrendChart" class="statistics-chart"
                            aria-label="Grafiek van de trainingsontwikkeling"></canvas>
                    </section>

                    <p id="statisticsMessage" class="library-message" aria-live="polite"></p>
                    <div id="statisticsContent"></div>

                    <footer class="statistics-footer">
                        <button id="clearStatisticsButton" class="danger-button" type="button">Statistieken wissen</button>
                    </footer>
                </section>
            </div>

            <div id="editorModal" class="modal-backdrop" hidden>
                <section class="editor-dialog" role="dialog" aria-modal="true" aria-labelledby="editorTitle">
                    <header class="library-dialog__header">
                        <div>
                            <h2 id="editorTitle">Patrooneditor</h2>
                            <p>Klik op een positie om leeg, patroon A of patroon B te kiezen.</p>
                        </div>
                        <button id="editorCloseButton" class="icon-button" type="button" aria-label="Sluiten">×</button>
                    </header>

                    <div class="editor-toolbar">
                        <label>Schaalnaam
                            <input id="editorScaleName" type="text" maxlength="50">
                        </label>
                        <div class="editor-legend">
                            <span><i class="editor-swatch editor-swatch--empty"></i> Leeg</span>
                            <span><i class="editor-swatch editor-swatch--a"></i> Patroon A</span>
                            <span><i class="editor-swatch editor-swatch--b"></i> Patroon B</span>
                        </div>
                    </div>

                    <p class="editor-help">
                        Linksklik wisselt de structuur. Selecteer daarna het interval in de cel.
                    </p>

                    <div class="editor-scroll">
                        <div id="patternEditorGrid" class="pattern-editor-grid"></div>
                    </div>

                    <p id="editorMessage" class="library-message" aria-live="polite"></p>

                    <footer class="editor-actions">
                        <button id="editorCancelButton" class="secondary-button" type="button">Annuleren</button>
                        <button id="editorSaveButton" type="button">Opslaan</button>
                    </footer>
                </section>
            </div>
        `;

        this.fretboard = new FretboardView(
            this.rootElement.querySelector("#fretboard"),
            this.config.trainer
        );
        this.fretboard.initialize();
        this.statisticsChart = new StatisticsChart(
            this.rootElement.querySelector("#statisticsTrendChart")
        );
        this.renderScaleControls();

        const randomStartCheckbox =
            this.rootElement.querySelector("#randomStartCheckbox");

        if (randomStartCheckbox) {
            randomStartCheckbox.checked = this.randomStartPerRound;
            randomStartCheckbox.addEventListener("change", (event) =>
                this.eventBus.emit(
                    Events.RANDOM_START_CHANGED,
                    event.target.checked
                )
            );
        }

        this.rootElement.querySelector("#scaleSelect").addEventListener("change", (event) =>
            this.eventBus.emit(Events.SCALE_SELECTED, event.target.value)
        );
        this.rootElement.querySelector("#restartButton").addEventListener("click", () =>
            this.eventBus.emit(Events.TRAINER_RESTART_REQUESTED)
        );
        this.rootElement.querySelector("#stopButton").addEventListener("click", () =>
            this.eventBus.emit(Events.TRAINER_STOP_REQUESTED)
        );
        this.rootElement.querySelector("#libraryButton").addEventListener("click", () => this.openLibrary());
        this.rootElement.querySelector("#statisticsButton").addEventListener("click", () =>
            this.eventBus.emit(Events.STATISTICS_OPEN_REQUESTED)
        );
        this.rootElement.querySelector("#statisticsCloseButton").addEventListener("click", () => this.closeStatistics());
        this.rootElement.querySelector("#statisticsModal").addEventListener("click", (event) => {
            if (event.target.id === "statisticsModal") this.closeStatistics();
        });
        this.rootElement.querySelector("#clearStatisticsButton").addEventListener("click", () => {
            if (window.confirm("Alle opgeslagen trainingsstatistieken definitief wissen?")) {
                this.eventBus.emit(Events.STATISTICS_CLEAR_REQUESTED);
            }
        });
        this.rootElement.querySelector("#statisticsScaleFilter").addEventListener("change", (event) => {
            this.statisticsFilter.scaleId = event.target.value;
            this.renderStatistics(this.statisticsDashboard);
        });
        this.rootElement.querySelector("#statisticsRangeFilter").addEventListener("change", (event) => {
            this.statisticsFilter.range = event.target.value;
            this.renderStatistics(this.statisticsDashboard);
        });
        this.rootElement.querySelector("#statisticsMetricFilter").addEventListener("change", (event) => {
            this.statisticsFilter.metric = event.target.value;
            this.renderStatistics(this.statisticsDashboard);
        });
        this.rootElement.querySelector("#libraryCloseButton").addEventListener("click", () => this.closeLibrary());
        this.rootElement.querySelector("#libraryModal").addEventListener("click", (event) => {
            if (event.target.id === "libraryModal") this.closeLibrary();
        });
        this.rootElement.querySelector("#newScaleForm").addEventListener("submit", (event) => {
            event.preventDefault();
            this.eventBus.emit(Events.SCALE_CREATE_REQUESTED, {
                name: this.rootElement.querySelector("#newScaleName").value,
                sourceId: this.rootElement.querySelector("#newScaleSource").value
            });
        });

        this.rootElement.querySelector("#editorCloseButton").addEventListener("click", () => this.closeEditor());
        this.rootElement.querySelector("#editorCancelButton").addEventListener("click", () => this.closeEditor());
        this.rootElement.querySelector("#editorSaveButton").addEventListener("click", () => this.saveEditor());
        this.rootElement.querySelector("#editorModal").addEventListener("click", (event) => {
            if (event.target.id === "editorModal") this.closeEditor();
        });
        this.rootElement.querySelector("#patternEditorGrid").addEventListener("click", (event) => this.handleEditorCellClick(event));
        this.rootElement.querySelector("#patternEditorGrid").addEventListener("change", (event) => this.handleEditorIntervalChange(event));
        this.rootElement.querySelector("#exportScalesButton").addEventListener("click", () =>
            this.eventBus.emit(Events.SCALE_EXPORT_REQUESTED)
        );
        this.rootElement.querySelector("#importScalesInput").addEventListener("change", (event) => {
            const [file] = event.target.files;
            if (file) {
                this.eventBus.emit(Events.SCALE_IMPORT_REQUESTED, file);
            }
        });
        this.rootElement.querySelector("#resetBuiltInsButton").addEventListener("click", () => {
            if (window.confirm("De ingebouwde schalen opnieuw laden? Eigen schalen blijven behouden.")) {
                this.eventBus.emit(Events.SCALE_RESET_REQUESTED);
            }
        });
        this.rootElement.querySelector("#clearCustomButton").addEventListener("click", () => {
            const customCount = this.scales.filter((scale) => !scale.isBuiltIn).length;
            if (customCount === 0) {
                this.showLibraryError("Er zijn geen eigen schalen om te wissen.");
                return;
            }

            if (window.confirm(`Alle ${customCount} eigen schaal${customCount === 1 ? "" : "en"} definitief wissen?`)) {
                this.eventBus.emit(Events.SCALE_CLEAR_CUSTOM_REQUESTED);
            }
        });
        this.rootElement.addEventListener("click", (event) => this.handleLibraryAction(event));
        document.addEventListener("keydown", this.handleKeyDown);

        this.unsubscribe.push(
            this.eventBus.on(Events.REPOSITORY_CHANGED, ({ scales: nextScales }) => {
                this.scales = structuredClone(nextScales);
                this.renderScaleControls();
                this.renderLibrary();
            }),
            this.eventBus.on(Events.EXERCISE_CHANGED, (payload) => this.renderExercise(payload)),
            this.eventBus.on(Events.QUESTION_CHANGED, (payload) => this.renderQuestion(payload)),
            this.eventBus.on(Events.QUESTION_ANSWERED, ({ result, state }) => this.renderAnswer(result, state)),
            this.eventBus.on(Events.ROUND_STARTED, (state) => this.renderRoundStarted(state)),
            this.eventBus.on(Events.ROUND_STOPPED, (state) => this.renderStopped(state)),
            this.eventBus.on(Events.ROUND_FINISHED, (state) => this.renderFinished(state)),
            this.eventBus.on(Events.STATISTICS_CHANGED, (dashboard) => {
                if (!this.rootElement.querySelector("#statisticsModal").hidden) {
                    this.renderStatistics(dashboard);
                }
            })
        );
    }

    handleKeyDown = (event) => {
        if (event.key !== "Escape") return;
        const editor = this.rootElement.querySelector("#editorModal");
        const library = this.rootElement.querySelector("#libraryModal");
        const statistics = this.rootElement.querySelector("#statisticsModal");
        if (!editor.hidden) this.closeEditor();
        else if (!statistics.hidden) this.closeStatistics();
        else if (!library.hidden) this.closeLibrary();
    };

    renderScaleControls() {
        const scaleSelect = this.rootElement.querySelector("#scaleSelect");
        const sourceSelect = this.rootElement.querySelector("#newScaleSource");
        if (!scaleSelect || !sourceSelect) return;

        const options = this.scales.map((scale) =>
            `<option value="${this.escapeAttribute(scale.id)}">${this.escapeHtml(scale.name)}${scale.isBuiltIn ? "" : " · eigen"}</option>`
        ).join("");

        scaleSelect.innerHTML = options;
        sourceSelect.innerHTML = options;

        if (this.scales.some((scale) => scale.id === this.activeScaleId)) {
            scaleSelect.value = this.activeScaleId;
            sourceSelect.value = this.activeScaleId;
        }
    }


    openStatistics(dashboard) {
        this.renderStatistics(dashboard);
        this.rootElement.querySelector("#statisticsModal").hidden = false;
        document.body.classList.add("modal-open");
    }

    closeStatistics() {
        this.rootElement.querySelector("#statisticsModal").hidden = true;
        if (
            this.rootElement.querySelector("#libraryModal").hidden &&
            this.rootElement.querySelector("#editorModal").hidden
        ) {
            document.body.classList.remove("modal-open");
        }
        this.showStatisticsMessage("");
    }


    renderStatistics(dashboard) {
        this.statisticsDashboard = dashboard;
        const content = this.rootElement.querySelector("#statisticsContent");
        const clearButton = this.rootElement.querySelector("#clearStatisticsButton");
        const scaleFilter = this.rootElement.querySelector("#statisticsScaleFilter");
        const rangeFilter = this.rootElement.querySelector("#statisticsRangeFilter");
        const metricFilter = this.rootElement.querySelector("#statisticsMetricFilter");
        if (!content || !dashboard) return;

        clearButton.disabled = dashboard.rounds === 0;

        const scaleOptions = [
            '<option value="all">Alle schalen</option>',
            ...dashboard.perScale.map((item) =>
                `<option value="${this.escapeAttribute(item.scaleId)}">${this.escapeHtml(item.scaleName)}</option>`
            )
        ].join("");

        scaleFilter.innerHTML = scaleOptions;
        if ([...scaleFilter.options].some((option) => option.value === this.statisticsFilter.scaleId)) {
            scaleFilter.value = this.statisticsFilter.scaleId;
        } else {
            this.statisticsFilter.scaleId = "all";
            scaleFilter.value = "all";
        }

        rangeFilter.value = this.statisticsFilter.range;
        metricFilter.value = this.statisticsFilter.metric;

        const selectedRecords = dashboard.records
            .filter((record) =>
                this.statisticsFilter.scaleId === "all" ||
                record.scaleId === this.statisticsFilter.scaleId
            );

        const limit = this.statisticsFilter.range === "all"
            ? selectedRecords.length
            : Number(this.statisticsFilter.range);

        const filteredRecords = selectedRecords.slice(0, limit);
        const chronologicalRecords = [...filteredRecords].reverse();
        const filteredSummary = this.calculateFilteredStatistics(filteredRecords);

        this.renderStatisticsTrend(chronologicalRecords, filteredSummary);

        if (dashboard.rounds === 0) {
            content.innerHTML = `
                <section class="statistics-empty">
                    <strong>Nog geen afgeronde rondes</strong>
                    <p>Voltooi een ronde van ${this.config.trainer.questionsPerRound} vragen om voortgang op te bouwen.</p>
                </section>
            `;
            return;
        }

        if (filteredRecords.length === 0) {
            content.innerHTML = `
                <section class="statistics-empty">
                    <strong>Geen resultaten binnen deze selectie</strong>
                    <p>Kies een andere schaal of periode.</p>
                </section>
            `;
            return;
        }

        const formatTime = (milliseconds) => `${(milliseconds / 1000).toFixed(2)} s`;
        const formatDate = (value) => new Intl.DateTimeFormat("nl-NL", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(new Date(value));

        const scaleRows = filteredSummary.perScale.map((item) => `
            <tr>
                <td>${this.escapeHtml(item.scaleName)}</td>
                <td>${item.rounds}</td>
                <td>${item.accuracy}%</td>
                <td>${formatTime(item.averageMilliseconds)}</td>
                <td>${item.averageScore}</td>
                <td>${item.bestScore}</td>
            </tr>
        `).join("");

        const intervalCards = filteredSummary.perInterval.map((item) => `
            <article class="interval-stat-card">
                <strong>${this.escapeHtml(item.interval)}</strong>
                <span>${item.accuracy}% correct</span>
                <small>${formatTime(item.averageMilliseconds)} gemiddeld · ${item.questions} vragen</small>
            </article>
        `).join("");

        const recentRows = filteredRecords.slice(0, 10).map((record) => `
            <tr>
                <td>${formatDate(record.completedAt)}</td>
                <td>${this.escapeHtml(record.scaleName)}</td>
                <td>${record.totalPoints}</td>
                <td>${record.accuracy}%</td>
                <td>${formatTime(record.averageMilliseconds)}</td>
            </tr>
        `).join("");

        content.innerHTML = `
            <section class="statistics-overview">
                <article><span>Rondes</span><strong>${filteredSummary.rounds}</strong></article>
                <article><span>Vragen</span><strong>${filteredSummary.questions}</strong></article>
                <article><span>Nauwkeurigheid</span><strong>${filteredSummary.accuracy}%</strong></article>
                <article><span>Gemiddelde tijd</span><strong>${formatTime(filteredSummary.averageMilliseconds)}</strong></article>
                <article><span>Beste score</span><strong>${filteredSummary.bestScore}</strong></article>
                <article><span>Hoogste nauwkeurigheid</span><strong>${filteredSummary.bestAccuracy}%</strong></article>
            </section>

            <section class="statistics-section">
                <h3>Per schaal</h3>
                <div class="statistics-table-scroll">
                    <table class="statistics-table">
                        <thead><tr>
                            <th>Schaal</th><th>Rondes</th><th>Correct</th>
                            <th>Tijd</th><th>Gem. score</th><th>Beste score</th>
                        </tr></thead>
                        <tbody>${scaleRows}</tbody>
                    </table>
                </div>
            </section>

            <section class="statistics-section">
                <h3>Per interval</h3>
                <div class="interval-stat-grid">${intervalCards}</div>
            </section>

            <section class="statistics-section">
                <h3>Laatste rondes binnen selectie</h3>
                <div class="statistics-table-scroll">
                    <table class="statistics-table">
                        <thead><tr>
                            <th>Datum</th><th>Schaal</th><th>Score</th>
                            <th>Correct</th><th>Tijd</th>
                        </tr></thead>
                        <tbody>${recentRows}</tbody>
                    </table>
                </div>
            </section>
        `;
    }

    calculateFilteredStatistics(records) {
        const questions = records.reduce((sum, record) => sum + record.questions, 0);
        const correct = records.reduce((sum, record) => sum + record.correct, 0);
        const totalPoints = records.reduce((sum, record) => sum + record.totalPoints, 0);
        const weightedMilliseconds = records.reduce(
            (sum, record) => sum + record.averageMilliseconds * record.questions,
            0
        );

        const scaleMap = new Map();
        const intervalMap = new Map();

        records.forEach((record) => {
            const scale = scaleMap.get(record.scaleId) ?? {
                scaleId: record.scaleId,
                scaleName: record.scaleName,
                rounds: 0,
                questions: 0,
                correct: 0,
                totalPoints: 0,
                weightedMilliseconds: 0,
                bestScore: 0
            };

            scale.rounds += 1;
            scale.questions += record.questions;
            scale.correct += record.correct;
            scale.totalPoints += record.totalPoints;
            scale.weightedMilliseconds += record.averageMilliseconds * record.questions;
            scale.bestScore = Math.max(scale.bestScore, record.totalPoints);
            scaleMap.set(record.scaleId, scale);

            Object.entries(record.intervals ?? {}).forEach(([interval, stats]) => {
                const item = intervalMap.get(interval) ?? {
                    interval,
                    questions: 0,
                    correct: 0,
                    weightedMilliseconds: 0
                };

                item.questions += stats.questions;
                item.correct += stats.correct;
                item.weightedMilliseconds += stats.averageMilliseconds * stats.questions;
                intervalMap.set(interval, item);
            });
        });

        const preferredOrder = ["1", "2", "b3", "3", "4", "b5", "5", "6", "7"];

        return {
            rounds: records.length,
            questions,
            accuracy: questions ? Math.round((correct / questions) * 100) : 0,
            averageMilliseconds: questions ? Math.round(weightedMilliseconds / questions) : 0,
            bestScore: records.length ? Math.max(...records.map((record) => record.totalPoints)) : 0,
            bestAccuracy: records.length ? Math.max(...records.map((record) => record.accuracy)) : 0,
            perScale: [...scaleMap.values()].map((item) => ({
                ...item,
                accuracy: Math.round((item.correct / item.questions) * 100),
                averageMilliseconds: Math.round(item.weightedMilliseconds / item.questions),
                averageScore: Math.round(item.totalPoints / item.rounds)
            })),
            perInterval: [...intervalMap.values()].map((item) => ({
                interval: item.interval,
                questions: item.questions,
                accuracy: Math.round((item.correct / item.questions) * 100),
                averageMilliseconds: Math.round(item.weightedMilliseconds / item.questions)
            })).sort((a, b) =>
                preferredOrder.indexOf(a.interval) - preferredOrder.indexOf(b.interval)
            )
        };
    }

    renderStatisticsTrend(records, summary) {
        const title = this.rootElement.querySelector("#statisticsChartTitle");
        const description = this.rootElement.querySelector("#statisticsTrendSummary");
        const metric = this.statisticsFilter.metric;

        const titles = {
            score: "Scoreontwikkeling",
            accuracy: "Ontwikkeling nauwkeurigheid",
            response: "Ontwikkeling reactietijd"
        };

        title.textContent = titles[metric];
        this.statisticsChart.setData(records, metric);

        if (records.length < 2) {
            description.textContent = "Nog onvoldoende gegevens om een trend te bepalen.";
            return;
        }

        const split = Math.max(1, Math.floor(records.length / 2));
        const older = records.slice(0, split);
        const newer = records.slice(split);
        const average = (items, getter) =>
            items.reduce((sum, item) => sum + getter(item), 0) / Math.max(1, items.length);

        let olderValue;
        let newerValue;
        let unit;
        let improvement;

        if (metric === "accuracy") {
            olderValue = average(older, (item) => item.accuracy);
            newerValue = average(newer, (item) => item.accuracy);
            unit = " procentpunt";
            improvement = newerValue - olderValue;
        } else if (metric === "response") {
            olderValue = average(older, (item) => item.averageMilliseconds) / 1000;
            newerValue = average(newer, (item) => item.averageMilliseconds) / 1000;
            unit = " seconde";
            improvement = olderValue - newerValue;
        } else {
            olderValue = average(older, (item) => item.totalPoints);
            newerValue = average(newer, (item) => item.totalPoints);
            unit = " punt";
            improvement = newerValue - olderValue;
        }

        const magnitude = Math.abs(improvement);
        const label = magnitude < 0.05
            ? "vrijwel stabiel"
            : improvement > 0
                ? `verbeterd met ${magnitude.toFixed(metric === "score" ? 0 : 2)}${unit}${magnitude === 1 ? "" : "en"}`
                : `gedaald met ${magnitude.toFixed(metric === "score" ? 0 : 2)}${unit}${magnitude === 1 ? "" : "en"}`;

        description.textContent =
            `Vergelijking tussen de eerste en tweede helft van deze selectie: ${label}.`;
    }

    showStatisticsMessage(message, type = "") {
        const element = this.rootElement.querySelector("#statisticsMessage");
        element.textContent = message;
        element.className = `library-message${type ? ` library-message--${type}` : ""}`;
    }

    openLibrary() {
        this.renderLibrary();
        this.rootElement.querySelector("#libraryModal").hidden = false;
        document.body.classList.add("modal-open");
        this.rootElement.querySelector("#newScaleName").focus();
    }

    closeLibrary() {
        this.rootElement.querySelector("#libraryModal").hidden = true;
        if (this.rootElement.querySelector("#editorModal").hidden) {
            document.body.classList.remove("modal-open");
        }
        this.setLibraryMessage("");
    }

    renderLibrary() {
        const list = this.rootElement.querySelector("#scaleLibraryList");
        if (!list) return;

        list.innerHTML = this.scales.map((scale) => {
            const isActive = scale.id === this.activeScaleId;
            return `
                <article class="scale-library-card ${isActive ? "is-active" : ""}">
                    <div class="scale-library-card__body">
                        <div class="scale-library-card__title-row">
                            <h3>${this.escapeHtml(scale.name)}</h3>
                            <span class="scale-badge ${scale.isBuiltIn ? "scale-badge--builtin" : "scale-badge--custom"}">
                                ${scale.isBuiltIn ? "Ingebouwd" : "Eigen"}
                            </span>
                        </div>
                        <p>${this.escapeHtml(scale.subtitle || "Intervaltrainer")}</p>
                        <small>${this.countPositions(scale.pattern)} speelbare posities${isActive ? " · actief" : ""}</small>
                    </div>
                    <div class="scale-library-card__actions">
                        <button type="button" class="secondary-button" data-action="select-scale" data-id="${this.escapeAttribute(scale.id)}" ${isActive ? "disabled" : ""}>
                            ${isActive ? "Actief" : "Gebruiken"}
                        </button>
                        <button type="button" class="secondary-button" data-action="edit-scale" data-id="${this.escapeAttribute(scale.id)}" ${scale.isBuiltIn ? "disabled title=\"Dupliceer eerst een ingebouwde schaal\"" : ""}>
                            Bewerken
                        </button>
                        <button type="button" class="secondary-button" data-action="duplicate-scale" data-id="${this.escapeAttribute(scale.id)}">
                            Dupliceren
                        </button>
                        <button type="button" class="danger-button" data-action="delete-scale" data-id="${this.escapeAttribute(scale.id)}" ${scale.isBuiltIn ? "disabled title=\"Ingebouwde schalen zijn beschermd\"" : ""}>
                            Verwijderen
                        </button>
                    </div>
                </article>
            `;
        }).join("");
    }

    handleLibraryAction(event) {
        const button = event.target.closest("[data-action]");
        if (!button) return;

        const id = button.dataset.id;
        const scale = this.scales.find((item) => item.id === id);
        if (!scale) return;

        switch (button.dataset.action) {
            case "select-scale":
                this.eventBus.emit(Events.SCALE_SELECTED, id);
                break;
            case "edit-scale":
                this.openEditor(scale);
                break;
            case "duplicate-scale": {
                const name = window.prompt("Naam van de kopie:", `${scale.name} kopie`);
                if (name !== null) {
                    this.eventBus.emit(Events.SCALE_DUPLICATE_REQUESTED, { id, name });
                }
                break;
            }
            case "delete-scale":
                if (window.confirm(`Weet je zeker dat je “${scale.name}” wilt verwijderen?`)) {
                    this.eventBus.emit(Events.SCALE_DELETE_REQUESTED, id);
                }
                break;
        }
    }

    openEditor(scale) {
        if (scale.isBuiltIn) {
            this.showLibraryError("Dupliceer eerst een ingebouwde schaal voordat je deze bewerkt.");
            return;
        }

        this.editorState = {
            id: scale.id,
            name: scale.name,
            pattern: structuredClone(scale.pattern)
        };

        this.rootElement.querySelector("#editorScaleName").value = scale.name;
        this.setEditorMessage("");
        this.renderPatternEditor();
        this.rootElement.querySelector("#editorModal").hidden = false;
        document.body.classList.add("modal-open");
    }

    closeEditor() {
        this.rootElement.querySelector("#editorModal").hidden = true;
        this.editorState = null;
        if (this.rootElement.querySelector("#libraryModal").hidden) {
            document.body.classList.remove("modal-open");
        }
        this.setEditorMessage("");
    }

    renderPatternEditor() {
        const grid = this.rootElement.querySelector("#patternEditorGrid");
        if (!this.editorState) {
            grid.innerHTML = "";
            return;
        }

        grid.innerHTML = this.editorState.pattern.map((row, stringIndex) =>
            row.map((cellCode, columnIndex) => {
                const group = cellCode ? cellCode.charAt(0) : "";
                const interval = cellCode ? cellCode.substring(1) : "1";
                const className = group === "p" ? "is-a" : group === "g" ? "is-b" : "is-empty";

                return `
                    <div class="editor-cell ${className}" data-string="${stringIndex}" data-column="${columnIndex}">
                        <button type="button" class="editor-cell__toggle"
                            data-string="${stringIndex}" data-column="${columnIndex}"
                            aria-label="Structuur wijzigen">
                            ${group ? (group === "p" ? "A" : "B") : "·"}
                        </button>
                        <select class="editor-cell__interval"
                            data-string="${stringIndex}" data-column="${columnIndex}"
                            ${group ? "" : "disabled"}>
                            ${this.intervalOptions.map((option) =>
                                `<option value="${option}" ${option === interval ? "selected" : ""}>${option}</option>`
                            ).join("")}
                        </select>
                    </div>
                `;
            }).join("")
        ).join("");
    }

    handleEditorCellClick(event) {
        const button = event.target.closest(".editor-cell__toggle");
        if (!button || !this.editorState) return;

        const stringIndex = Number(button.dataset.string);
        const columnIndex = Number(button.dataset.column);
        const current = this.editorState.pattern[stringIndex][columnIndex];

        let next;
        if (!current) next = "p1";
        else if (current.charAt(0) === "p") next = `g${current.substring(1)}`;
        else next = "";

        this.editorState.pattern[stringIndex][columnIndex] = next;
        this.renderPatternEditor();
    }

    handleEditorIntervalChange(event) {
        if (!event.target.matches(".editor-cell__interval") || !this.editorState) return;

        const stringIndex = Number(event.target.dataset.string);
        const columnIndex = Number(event.target.dataset.column);
        const current = this.editorState.pattern[stringIndex][columnIndex];
        if (!current) return;

        this.editorState.pattern[stringIndex][columnIndex] =
            `${current.charAt(0)}${event.target.value}`;
    }

    saveEditor() {
        if (!this.editorState) return;

        const name = this.rootElement.querySelector("#editorScaleName").value.trim();
        this.eventBus.emit(Events.SCALE_SAVE_REQUESTED, {
            id: this.editorState.id,
            name,
            pattern: structuredClone(this.editorState.pattern)
        });
    }

    finishPatternEdit(scale) {
        this.closeEditor();
        this.renderLibrary();
        this.activeScaleId = scale.id;
    }

    showEditorError(message) {
        this.setEditorMessage(message, "error");
    }

    setEditorMessage(message, type = "") {
        const element = this.rootElement.querySelector("#editorMessage");
        element.textContent = message;
        element.className = `library-message${type ? ` library-message--${type}` : ""}`;
    }


    resetImportInput() {
        const input = this.rootElement.querySelector("#importScalesInput");
        if (input) input.value = "";
    }

    showLibrarySuccess(message) {
        this.setLibraryMessage(message, "success");
        this.rootElement.querySelector("#newScaleForm").reset();
        const source = this.rootElement.querySelector("#newScaleSource");
        if (this.scales.some((scale) => scale.id === this.activeScaleId)) {
            source.value = this.activeScaleId;
        }
    }

    showLibraryError(message) {
        this.setLibraryMessage(message, "error");
    }

    setLibraryMessage(message, type = "") {
        const element = this.rootElement.querySelector("#libraryMessage");
        element.textContent = message;
        element.className = `library-message${type ? ` library-message--${type}` : ""}`;
    }

    setScale(scale) {
        this.activeScaleId = scale.id;
        this.fretboard.setPattern(scale.pattern);
        this.rootElement.querySelector("#scaleTitle").textContent = scale.subtitle;
        this.renderScaleControls();
        this.renderLibrary();
    }

    renderExercise({ scale, answerOptions }) {
        this.setScale(scale);
        this.fretboard.clearTarget();
        this.renderAnswerButtons(answerOptions, false);
        this.rootElement.querySelector("#prompt").textContent =
            "Klik op “Nieuwe ronde” om met deze schaal te beginnen.";
        this.setStatus("ready");
        this.rootElement.querySelector("#resultPanel").hidden = true;
    }

    renderAnswerButtons(answerOptions, enabled = true) {
        const answers = this.rootElement.querySelector("#answers");
        answers.style.setProperty("--answer-count", answerOptions.length);
        answers.innerHTML = answerOptions.map((answer) => `
            <button type="button" data-answer="${this.escapeAttribute(answer)}" ${enabled ? "" : "disabled"}>
                ${this.escapeHtml(answer)}
            </button>
        `).join("");

        if (!enabled) return;
        answers.querySelectorAll("button").forEach((button) => {
            button.addEventListener("click", () =>
                this.eventBus.emit(Events.ANSWER_SELECTED, button.dataset.answer)
            );
        });
    }

    renderQuestion({ question, answerOptions, title, state }) {
        this.rootElement.querySelector("#scaleTitle").textContent = title;
        this.rootElement.querySelector("#prompt").textContent = question.prompt;
        this.fretboard.showTarget(question.position);
        this.renderAnswerButtons(answerOptions, true);
        this.renderState(state);
    }

    renderAnswer(result, state) {
        if (this.feedbackTimerId !== null) {
            window.clearTimeout(this.feedbackTimerId);
        }

        document.body.classList.remove("correct", "wrong");
        document.body.classList.add(result.isCorrect ? "correct" : "wrong");

        this.feedbackTimerId = window.setTimeout(() => {
            document.body.classList.remove("correct", "wrong");
            this.feedbackTimerId = null;
        }, this.config.trainer.answerDelay);

        this.setStatus(
            result.isCorrect ? "correct" : "wrong",
            result.isCorrect ? "Goed" : `Fout: ${result.question.correctAnswer}`
        );
        this.renderState(state, false);
    }

    setStatus(status, text = null) {
        const card = this.rootElement.querySelector("#statusCard");
        const value = this.rootElement.querySelector("#status");

        const labels = {
            ready: "Gereed",
            running: "Bezig",
            stopped: "Gestopt",
            finished: "Voltooid"
        };

        if (value) {
            value.textContent = text ?? labels[status] ?? labels.ready;
        }

        if (card) {
            card.classList.remove(
                "status-card--ready",
                "status-card--running",
                "status-card--stopped",
                "status-card--finished",
                "status-card--correct",
                "status-card--wrong"
            );
            card.classList.add(`status-card--${status}`);
        }
    }

    renderRoundStarted(state) {
        if (state.roundPattern) {
            this.fretboard.setPattern(state.roundPattern);
        }

        this.startRoundTimer(state.startedAt);
        this.renderState(state);
    }

    renderState(state, updateStatus = true) {
        this.rootElement.querySelector("#score").textContent = state.score;
        this.rootElement.querySelector("#correct").textContent = state.correct;
        this.rootElement.querySelector("#question").textContent =
            Math.min(state.answered + (state.status === "running" ? 1 : 0), state.questionsPerRound);
        const isRunning = state.status === "running";
        this.rootElement.querySelector("#stopButton").disabled = !isRunning;
        this.rootElement.querySelector("#restartButton").disabled = isRunning;

        if (updateStatus) {
            const statusMap = {
                running: "running",
                stopped: "stopped",
                finished: "finished",
                idle: "ready"
            };
            this.setStatus(statusMap[state.status] ?? "ready");
        }
    }

    startRoundTimer(startedAt) {
        this.clearRoundTimer();
        this.roundStartedAt = Number.isFinite(startedAt)
            ? startedAt
            : performance.now();
        this.updateElapsedTime();

        this.roundTimerId = window.setInterval(
            () => this.updateElapsedTime(),
            100
        );
    }

    stopRoundTimer(elapsedMilliseconds = null) {
        this.clearRoundTimer();

        if (Number.isFinite(elapsedMilliseconds)) {
            this.showElapsedTime(elapsedMilliseconds);
        }
    }

    clearRoundTimer() {
        if (this.roundTimerId !== null) {
            window.clearInterval(this.roundTimerId);
            this.roundTimerId = null;
        }
    }

    updateElapsedTime() {
        if (!Number.isFinite(this.roundStartedAt)) {
            return;
        }

        this.showElapsedTime(performance.now() - this.roundStartedAt);
    }

    showElapsedTime(milliseconds) {
        const element = this.rootElement.querySelector("#elapsedTime");
        if (!element) return;

        const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        element.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    renderStopped(state) {
        this.stopRoundTimer(state.elapsedMilliseconds);
        this.renderState(state, false);
        this.setStatus("stopped");
        this.fretboard.clearTarget();
        this.rootElement.querySelector("#prompt").textContent = "Ronde gestopt.";
        this.rootElement.querySelector("#answers").innerHTML = "";
    }

    renderFinished(state) {
        this.stopRoundTimer(state.elapsedMilliseconds);
        this.renderState(state, false);
        this.setStatus("finished");
        this.fretboard.clearTarget();
        this.rootElement.querySelector("#answers").innerHTML = "";
        this.rootElement.querySelector("#prompt").textContent = "Ronde voltooid.";

        const summary = state.summary;
        const panel = this.rootElement.querySelector("#resultPanel");
        panel.hidden = false;
        panel.innerHTML = `
            <h2>Resultaat</h2>
            <div class="result-grid">
                <div class="result-item result-item--score"><span>Eindscore</span><strong>${summary.totalPoints}</strong></div>
                <div class="result-item"><span>Correct</span><strong>${summary.correct} / ${summary.questions}</strong></div>
                <div class="result-item"><span>Nauwkeurigheid</span><strong>${summary.accuracy}%</strong></div>
                <div class="result-item"><span>Gemiddelde tijd</span><strong>${(summary.averageMilliseconds / 1000).toFixed(2)} s</strong></div>
            </div>
        `;
    }

    countPositions(pattern) {
        return pattern.flat().filter(Boolean).length;
    }

    escapeHtml(value) {
        const element = document.createElement("div");
        element.textContent = String(value);
        return element.innerHTML;
    }

    escapeAttribute(value) {
        return this.escapeHtml(value).replace(/"/g, "&quot;");
    }

    destroy() {
        document.removeEventListener("keydown", this.handleKeyDown);
        this.unsubscribe.forEach((fn) => fn());
        this.fretboard?.destroy();
        this.statisticsChart?.destroy();
    }
}
