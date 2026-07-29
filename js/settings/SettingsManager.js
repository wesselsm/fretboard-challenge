import { Events } from "../core/Constants.js";

export default class SettingsManager {
    constructor(storage, eventBus, storageKey) {
        this.storage = storage;
        this.eventBus = eventBus;
        this.storageKey = storageKey;
        this.settings = {
            activeScaleId: "blues",
            questionsPerRound: 30
        };
    }

    async initialize() {
        this.settings = {
            ...this.settings,
            ...(await this.storage.get(this.storageKey, {}))
        };
        this.eventBus.emit(Events.SETTINGS_CHANGED, this.getAll());
    }

    get(key) {
        return this.settings[key];
    }

    getAll() {
        return structuredClone(this.settings);
    }

    async set(key, value) {
        this.settings[key] = value;
        await this.storage.set(this.storageKey, this.settings);
        this.eventBus.emit(Events.SETTINGS_CHANGED, this.getAll());
    }
}
