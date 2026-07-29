import Config from "../core/Config.js";
import EventBus from "../core/EventBus.js";
import { Events } from "../core/Constants.js";
import LocalStorageProvider from "../storage/LocalStorageProvider.js";
import BuiltInScaleRepository from "../repository/BuiltInScaleRepository.js";
import ScaleLibraryRepository from "../repository/ScaleLibraryRepository.js";
import StatisticsRepository from "../repository/StatisticsRepository.js";
import SettingsManager from "../settings/SettingsManager.js";
import ScaleIntervalExercise from "../exercises/ScaleIntervalExercise.js";
import PerformanceCalculator from "../trainer/PerformanceCalculator.js";
import Trainer from "../trainer/Trainer.js";
import MainView from "../ui/MainView.js";

export default class FretMasterApp {
    constructor(rootElement) {
        this.config = Config;
        this.events = new EventBus();
        this.storage = new LocalStorageProvider(this.config.storageNamespace);
        this.builtInScales = new BuiltInScaleRepository();
        this.scales = new ScaleLibraryRepository(
            this.storage,
            this.events,
            this.config.storageKeys.scales,
            this.builtInScales
        );
        this.statistics = new StatisticsRepository(
            this.storage,
            this.events,
            this.config.storageKeys.statistics
        );
        this.settings = new SettingsManager(
            this.storage,
            this.events,
            this.config.storageKeys.settings
        );
        this.performanceCalculator = new PerformanceCalculator(this.config.scoring);
        this.trainer = new Trainer(
            this.events,
            this.performanceCalculator,
            this.config.trainer
        );
        this.view = new MainView(rootElement, this.config, this.events);
        this.unsubscribe = [];
    }

    async initialize() {
        await this.settings.initialize();
        await this.scales.initialize();
        await this.statistics.initialize();

        const scales = this.scales.getAll();
        const requestedScaleId = this.settings.get("activeScaleId");
        const activeScale = this.scales.getById(requestedScaleId) ?? scales[0];

        this.view.initialize(scales, {
            ...this.settings.getAll(),
            activeScaleId: activeScale.id
        });

        this.unsubscribe.push(
            this.events.on(Events.TRAINER_RESTART_REQUESTED, () => this.trainer.start()),
            this.events.on(Events.TRAINER_STOP_REQUESTED, () => this.trainer.stop()),
            this.events.on(Events.ANSWER_SELECTED, (answer) => this.trainer.answer(answer)),
            this.events.on(Events.SCALE_SELECTED, (id) => this.selectScale(id)),
            this.events.on(Events.SCALE_CREATE_REQUESTED, (payload) => this.createScale(payload)),
            this.events.on(Events.SCALE_DUPLICATE_REQUESTED, (payload) => this.duplicateScale(payload)),
            this.events.on(Events.SCALE_DELETE_REQUESTED, (id) => this.deleteScale(id)),
            this.events.on(Events.SCALE_SAVE_REQUESTED, (payload) => this.saveScale(payload)),
            this.events.on(Events.SCALE_EXPORT_REQUESTED, () => this.exportScales()),
            this.events.on(Events.SCALE_IMPORT_REQUESTED, (file) => this.importScales(file)),
            this.events.on(Events.SCALE_RESET_REQUESTED, () => this.resetBuiltIns()),
            this.events.on(Events.SCALE_CLEAR_CUSTOM_REQUESTED, () => this.clearCustomScales()),
            this.events.on(Events.ROUND_FINISHED, (state) => this.recordFinishedRound(state)),
            this.events.on(Events.STATISTICS_OPEN_REQUESTED, () => this.openStatistics()),
            this.events.on(Events.STATISTICS_CLEAR_REQUESTED, () => this.clearStatistics())
        );

        await this.selectScale(activeScale.id);

        this.events.emit(Events.APP_INITIALIZED, {
            name: this.config.appName,
            version: this.config.version
        });
    }

    async selectScale(id) {
        const scale = this.scales.getById(id) ?? this.scales.getAll()[0];
        if (!scale) throw new Error("Er zijn geen schalen beschikbaar.");

        if (this.trainer.getState().status === "running") {
            this.trainer.stop();
        }

        this.exercise = new ScaleIntervalExercise(scale);
        this.trainer.setExercise(this.exercise);

        this.events.emit(Events.EXERCISE_CHANGED, {
            scale,
            answerOptions: this.exercise.getAnswerOptions()
        });

        await this.settings.set("activeScaleId", scale.id);
    }

    async createScale({ sourceId, name }) {
        try {
            const scale = await this.scales.createFrom(sourceId, name);
            await this.selectScale(scale.id);
            this.view.showLibrarySuccess(`“${scale.name}” is toegevoegd en actief gemaakt.`);
        } catch (error) {
            this.view.showLibraryError(error.message);
        }
    }

    async duplicateScale({ id, name }) {
        try {
            const scale = await this.scales.duplicate(id, name);
            await this.selectScale(scale.id);
            this.view.showLibrarySuccess(`“${scale.name}” is als kopie toegevoegd.`);
        } catch (error) {
            this.view.showLibraryError(error.message);
        }
    }


    async saveScale({ id, name, pattern }) {
        try {
            const scale = await this.scales.update(id, { name, pattern });
            await this.selectScale(scale.id);
            this.view.finishPatternEdit(scale);
            this.view.showLibrarySuccess(`“${scale.name}” is opgeslagen.`);
        } catch (error) {
            this.view.showEditorError(error.message);
        }
    }


    exportScales() {
        try {
            const data = this.scales.exportData();
            const count = data.scales.length;

            if (count === 0) {
                this.view.showLibraryError("Er zijn geen eigen schalen om te exporteren.");
                return;
            }

            const blob = new Blob(
                [JSON.stringify(data, null, 2)],
                { type: "application/json" }
            );
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const date = new Date().toISOString().slice(0, 10);

            link.href = url;
            link.download = `fretmaster-scales-${date}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            this.view.showLibrarySuccess(`${count} eigen schaal${count === 1 ? "" : "en"} geëxporteerd.`);
        } catch (error) {
            this.view.showLibraryError(error.message);
        }
    }

    async importScales(file) {
        try {
            if (!(file instanceof File)) {
                throw new Error("Kies eerst een JSON-bestand.");
            }

            if (file.size > 2_000_000) {
                throw new Error("Het importbestand is groter dan 2 MB.");
            }

            const text = await file.text();
            const data = JSON.parse(text);
            const result = await this.scales.importData(data);

            const details = [
                `${result.imported} geïmporteerd`,
                result.renamed ? `${result.renamed} hernoemd` : null,
                result.skipped ? `${result.skipped} overgeslagen` : null
            ].filter(Boolean).join(" · ");

            this.view.showLibrarySuccess(details || "Import voltooid.");
        } catch (error) {
            const message = error instanceof SyntaxError
                ? "Het geselecteerde bestand bevat geen geldige JSON."
                : error.message;
            this.view.showLibraryError(message);
        } finally {
            this.view.resetImportInput();
        }
    }

    async resetBuiltIns() {
        try {
            const count = await this.scales.resetBuiltIns();
            this.view.showLibrarySuccess(`${count} ingebouwde schalen zijn opnieuw geladen.`);
        } catch (error) {
            this.view.showLibraryError(error.message);
        }
    }

    async clearCustomScales() {
        try {
            const activeId = this.settings.get("activeScaleId");
            const activeWasCustom = !this.scales.isBuiltIn(activeId);
            const count = await this.scales.clearCustom();

            if (activeWasCustom) {
                const fallback = this.scales.getAll()[0];
                await this.selectScale(fallback.id);
            }

            this.view.showLibrarySuccess(`${count} eigen schaal${count === 1 ? "" : "en"} verwijderd.`);
        } catch (error) {
            this.view.showLibraryError(error.message);
        }
    }


    async recordFinishedRound(state) {
        try {
            const scale = this.exercise?.scale;
            if (!scale) return;
            await this.statistics.addRound({ scale, state });
        } catch (error) {
            console.error("Resultaat kon niet worden opgeslagen.", error);
        }
    }

    openStatistics() {
        this.view.openStatistics(this.statistics.getDashboard());
    }

    async clearStatistics() {
        try {
            const count = await this.statistics.clear();
            this.view.renderStatistics(this.statistics.getDashboard());
            this.view.showStatisticsMessage(
                `${count} opgeslagen ronde${count === 1 ? "" : "s"} verwijderd.`,
                "success"
            );
        } catch (error) {
            this.view.showStatisticsMessage(error.message, "error");
        }
    }

    async deleteScale(id) {
        try {
            const deletedScale = this.scales.getById(id);
            if (!deletedScale) return;

            const wasActive = this.settings.get("activeScaleId") === id;
            await this.scales.remove(id);

            if (wasActive) {
                const fallback = this.scales.getAll()[0];
                await this.selectScale(fallback.id);
            }

            this.view.showLibrarySuccess(`“${deletedScale.name}” is verwijderd.`);
        } catch (error) {
            this.view.showLibraryError(error.message);
        }
    }

    run() {
        console.info(`${this.config.appName} ${this.config.version} started.`);
    }

    handleError(error) {
        console.error(error);
        document.getElementById("app").innerHTML =
            `<section class="error-panel"><h1>Startfout</h1><p>${error.message}</p></section>`;
    }
}
