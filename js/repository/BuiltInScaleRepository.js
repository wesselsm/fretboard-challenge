export default class BuiltInScaleRepository {
    constructor() {
        this.scales = [
            {
                id: "minor-pentatonic",
                name: "Minor Pentatonic",
                subtitle: "Minor Pentatonic Challenge",
                category: "standard",
                orientation: "left-handed",
                pattern: [
                    ["p1", "", "p7", "", "", "g5", "", "g4", "", "gb3", "", "", "p1", "", "p7", ""],
                    ["p5", "", "p4", "", "pb3", "", "", "g1", "", "g7", "", "", "p5", "", "p4", ""],
                    ["gb3", "", "", "p1", "", "p7", "", "", "g5", "", "g4", "", "gb3", "", "", "p1"],
                    ["g7", "", "", "p5", "", "p4", "", "pb3", "", "", "g1", "", "g7", "", "", "p5"],
                    ["g4", "", "gb3", "", "", "p1", "", "p7", "", "", "g5", "", "g4", "", "gb3", ""],
                    ["g1", "", "g7", "", "", "p5", "", "p4", "", "pb3", "", "", "g1", "", "g7", ""]
                ]
            },
            {
                id: "major-pentatonic",
                name: "Major Pentatonic",
                subtitle: "Major Pentatonic Challenge",
                category: "standard",
                orientation: "left-handed",
                pattern: [
                    ["p6", "", "p5", "", "", "g3", "", "g2", "", "g1", "", "", "p6", "", "p5", ""],
                    ["p3", "", "p2", "", "p1", "", "", "g6", "", "g5", "", "", "p3", "", "p2", ""],
                    ["g1", "", "", "p6", "", "p5", "", "", "g3", "", "g2", "", "g1", "", "", "p6"],
                    ["g1", "", "", "p3", "", "p2", "", "p1", "", "", "g6", "", "g5", "", "", "p3"],
                    ["g2", "", "g1", "", "", "p6", "", "p5", "", "", "g3", "", "g2", "", "g1", ""],
                    ["g6", "", "g5", "", "", "p3", "", "p2", "", "p1", "", "", "g6", "", "g5", ""]
                ]
            },
            {
                id: "blues",
                name: "Blues Scale",
                subtitle: "Blues Scale Challenge",
                category: "standard",
                orientation: "left-handed",
                pattern: [
                    ["p1", "", "p7", "", "", "g5", "gb5", "g4", "", "gb3", "", "", "p1", "", "p7", ""],
                    ["p5", "pb5", "p4", "", "pb3", "", "", "g1", "", "g7", "", "", "p5", "pb5", "p4", ""],
                    ["gb3", "", "", "p1", "", "p7", "", "", "g5", "gb5", "g4", "", "gb3", "", "", "p1"],
                    ["g7", "", "", "p5", "pb5", "p4", "", "pb3", "", "", "g1", "", "g7", "", "", "p5"],
                    ["g4", "", "gb3", "", "", "p1", "", "p7", "", "", "g5", "gb5", "g4", "", "gb3", ""],
                    ["g1", "", "g7", "", "", "p5", "pb5", "p4", "", "pb3", "", "", "g1", "", "g7", ""]
                ]
            }
        ];
    }

    getAll() {
        return structuredClone(this.scales);
    }

    getById(id) {
        const scale = this.scales.find((item) => item.id === id);
        return scale ? structuredClone(scale) : null;
    }
}
