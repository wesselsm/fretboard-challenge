export default class FretboardView {
    constructor(element, { stringCount = 6, patternColumns = 16 } = {}) {
        if (!(element instanceof HTMLElement)) {
            throw new TypeError("FretboardView requires an HTML element.");
        }

        this.element = element;
        this.stringCount = stringCount;
        this.patternColumns = patternColumns;
        this.pattern = [];
        this.target = null;
        this.handedness = "left";
    }

    initialize() {
        this.render();
    }

    setHandedness(handedness) {
        this.handedness = handedness === "right" ? "right" : "left";
        this.element.dataset.handedness = this.handedness;
        this.render();
    }

    setPattern(pattern) {
        this.pattern = structuredClone(pattern ?? []);
        this.target = null;
        this.render();
    }

    showTarget(position) {
        this.target = position ? { ...position } : null;
        this.renderTarget();
    }

    clearTarget() {
        this.target = null;
        this.element.querySelectorAll(".target").forEach((cell) => {
            cell.classList.remove("target");
        });
    }

    render() {
        this.element.innerHTML = "";

        const rows = this.pattern.length
            ? this.pattern
            : Array.from({ length: this.stringCount }, () =>
                Array(this.patternColumns).fill("")
            );

        rows.forEach((row, stringIndex) => {
            const visibleCells = row.map((cellCode, columnIndex) => ({
                cellCode,
                columnIndex
            }));

            if (this.handedness === "right") {
                visibleCells.reverse();
            }

            visibleCells.forEach(({ cellCode, columnIndex }) => {
                const cell = document.createElement("div");
                cell.className = `fret string${stringIndex}`;
                cell.dataset.string = String(stringIndex);
                cell.dataset.column = String(columnIndex);

                if (cellCode) {
                    const structureCode = cellCode.charAt(0);
                    cell.classList.add(structureCode === "p" ? "pattern-a" : "pattern-b");
                }

                this.element.appendChild(cell);
            });
        });

        this.renderTarget();
    }

    renderTarget() {
        this.element.querySelectorAll(".target").forEach((cell) => {
            cell.classList.remove("target");
        });

        if (!this.target) {
            return;
        }

        const cell = this.element.querySelector(
            `[data-string="${this.target.stringIndex}"]` +
            `[data-column="${this.target.columnIndex}"]`
        );

        cell?.classList.add("target");
    }

    destroy() {}
}
