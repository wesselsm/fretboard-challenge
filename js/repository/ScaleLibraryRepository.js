import Scale from "../models/Scale.js";
import { Events } from "../core/Constants.js";

export default class ScaleLibraryRepository {
    constructor(storage, eventBus, storageKey, builtInRepository) {
        this.storage = storage;
        this.eventBus = eventBus;
        this.storageKey = storageKey;
        this.builtInRepository = builtInRepository;
        this.builtIns = new Map();
        this.customScales = new Map();
    }

    async initialize() {
        this.builtInRepository.getAll().forEach((scale) => {
            this.builtIns.set(scale.id, this.#normalizeBuiltIn(scale));
        });

        const stored = await this.storage.get(this.storageKey, []);
        for (const value of Array.isArray(stored) ? stored : []) {
            try {
                const scale = Scale.fromJSON(value);
                if (!this.builtIns.has(scale.id)) {
                    this.customScales.set(scale.id, this.#normalizeCustom(scale.toJSON()));
                }
            } catch (error) {
                console.warn("Een opgeslagen schaal kon niet worden geladen.", error);
            }
        }

        this.#emitChanged();
    }

    getAll() {
        const builtIns = [...this.builtIns.values()];
        const custom = [...this.customScales.values()]
            .sort((a, b) => a.name.localeCompare(b.name, "nl"));

        return structuredClone([...builtIns, ...custom]);
    }

    getCustom() {
        return structuredClone([...this.customScales.values()]);
    }

    getById(id) {
        const scale = this.builtIns.get(id) ?? this.customScales.get(id);
        return scale ? structuredClone(scale) : null;
    }

    isBuiltIn(id) {
        return this.builtIns.has(id);
    }

    async createFrom(sourceId, name) {
        const source = this.getById(sourceId);
        if (!source) {
            throw new Error("De gekozen bronschaal bestaat niet.");
        }

        const cleanName = this.#validateName(name);
        const now = new Date().toISOString();
        const scale = new Scale({
            id: crypto.randomUUID(),
            name: cleanName,
            subtitle: `${cleanName} Challenge`,
            pattern: source.pattern,
            createdAt: now,
            updatedAt: now
        });

        const custom = this.#normalizeCustom(scale.toJSON());
        this.customScales.set(custom.id, custom);
        await this.#persist();
        this.#emitChanged();
        return structuredClone(custom);
    }

    async duplicate(id, name) {
        return this.createFrom(id, name);
    }

    async update(id, changes) {
        if (this.builtIns.has(id)) {
            throw new Error("Ingebouwde schalen zijn beschermd. Dupliceer de schaal om deze te bewerken.");
        }

        const existing = this.customScales.get(id);
        if (!existing) {
            throw new Error("De schaal die je wilt bewerken bestaat niet.");
        }

        const name = this.#validateName(changes.name ?? existing.name);
        const pattern = this.#validatePattern(changes.pattern ?? existing.pattern);
        const now = new Date().toISOString();

        const updated = this.#normalizeCustom({
            ...existing,
            name,
            subtitle: `${name} Challenge`,
            pattern,
            updatedAt: now
        });

        this.customScales.set(id, updated);
        await this.#persist();
        this.#emitChanged();
        return structuredClone(updated);
    }

    async remove(id) {
        if (this.builtIns.has(id)) {
            throw new Error("Ingebouwde schalen zijn beschermd en kunnen niet worden verwijderd.");
        }

        const removed = this.customScales.delete(id);
        if (!removed) {
            return false;
        }

        await this.#persist();
        this.#emitChanged();
        return true;
    }

    exportData() {
        return {
            format: "fretmaster-scale-library",
            version: 1,
            exportedAt: new Date().toISOString(),
            scales: this.getCustom().map((scale) => ({
                id: scale.id,
                name: scale.name,
                subtitle: scale.subtitle,
                pattern: scale.pattern,
                createdAt: scale.createdAt,
                updatedAt: scale.updatedAt
            }))
        };
    }

    async importData(data) {
        if (!data || data.format !== "fretmaster-scale-library" || data.version !== 1) {
            throw new Error("Dit is geen geldig FretMaster-schaalbibliotheekbestand.");
        }

        if (!Array.isArray(data.scales)) {
            throw new Error("Het importbestand bevat geen geldige schalenlijst.");
        }

        const result = {
            imported: 0,
            renamed: 0,
            skipped: 0,
            errors: []
        };

        for (const raw of data.scales) {
            try {
                const name = this.#validateName(raw.name);
                const pattern = this.#validatePattern(raw.pattern);
                const id = this.#resolveImportedId(raw.id);
                const uniqueName = this.#resolveImportedName(name);
                const now = new Date().toISOString();

                if (uniqueName !== name) {
                    result.renamed += 1;
                }

                const custom = this.#normalizeCustom({
                    id,
                    name: uniqueName,
                    subtitle: `${uniqueName} Challenge`,
                    pattern,
                    createdAt: raw.createdAt || now,
                    updatedAt: now
                });

                this.customScales.set(custom.id, custom);
                result.imported += 1;
            } catch (error) {
                result.skipped += 1;
                result.errors.push(error.message);
            }
        }

        await this.#persist();
        this.#emitChanged();
        return result;
    }

    async clearCustom() {
        const count = this.customScales.size;
        this.customScales.clear();
        await this.#persist();
        this.#emitChanged();
        return count;
    }

    async resetBuiltIns() {
        this.builtIns.clear();
        this.builtInRepository.getAll().forEach((scale) => {
            this.builtIns.set(scale.id, this.#normalizeBuiltIn(scale));
        });
        this.#emitChanged();
        return this.builtIns.size;
    }

    async #persist() {
        const values = [...this.customScales.values()].map((scale) => ({
            id: scale.id,
            name: scale.name,
            subtitle: scale.subtitle,
            pattern: structuredClone(scale.pattern),
            createdAt: scale.createdAt,
            updatedAt: scale.updatedAt
        }));

        await this.storage.set(this.storageKey, values);
    }

    #resolveImportedId(candidate) {
        const value = typeof candidate === "string" && candidate.trim()
            ? candidate.trim()
            : crypto.randomUUID();

        if (!this.builtIns.has(value) && !this.customScales.has(value)) {
            return value;
        }

        return crypto.randomUUID();
    }

    #resolveImportedName(candidate) {
        const existing = new Set(
            this.getAll().map((scale) => scale.name.toLocaleLowerCase("nl"))
        );

        if (!existing.has(candidate.toLocaleLowerCase("nl"))) {
            return candidate;
        }

        let counter = 2;
        let next = `${candidate} (${counter})`;

        while (existing.has(next.toLocaleLowerCase("nl"))) {
            counter += 1;
            next = `${candidate} (${counter})`;
        }

        return next;
    }

    #normalizeBuiltIn(scale) {
        return {
            ...structuredClone(scale),
            isBuiltIn: true,
            category: "built-in"
        };
    }

    #normalizeCustom(scale) {
        return {
            ...structuredClone(scale),
            isBuiltIn: false,
            category: "custom",
            orientation: scale.orientation ?? "left-handed"
        };
    }

    #validatePattern(pattern) {
        if (!Array.isArray(pattern) || pattern.length !== 6) {
            throw new Error("Een patroon moet precies zes snaren bevatten.");
        }

        const validIntervals = new Set(["1", "2", "b3", "3", "4", "b5", "5", "6", "7"]);
        let playablePositions = 0;

        const normalized = pattern.map((row) => {
            if (!Array.isArray(row) || row.length !== 16) {
                throw new Error("Elke snaar moet precies zestien patroonposities bevatten.");
            }

            return row.map((cell) => {
                if (!cell) return "";

                const code = String(cell);
                const group = code.charAt(0);
                const interval = code.substring(1);

                if (!["p", "g"].includes(group) || !validIntervals.has(interval)) {
                    throw new Error(`Ongeldige patrooncode: ${code}`);
                }

                playablePositions += 1;
                return `${group}${interval}`;
            });
        });

        if (playablePositions === 0) {
            throw new Error("Het patroon moet minimaal één speelbare positie bevatten.");
        }

        return normalized;
    }

    #validateName(name) {
        const value = String(name ?? "").trim();
        if (!value) {
            throw new Error("Geef de schaal een naam.");
        }
        if (value.length > 50) {
            throw new Error("De schaalnaam mag maximaal 50 tekens bevatten.");
        }
        return value;
    }

    #emitChanged() {
        this.eventBus.emit(Events.REPOSITORY_CHANGED, {
            count: this.builtIns.size + this.customScales.size,
            scales: this.getAll()
        });
    }
}
