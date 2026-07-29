export default class StatisticsChart {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.resizeObserver = new ResizeObserver(() => this.render());
        this.resizeObserver.observe(canvas);
        this.data = [];
        this.metric = "score";
    }

    setData(data, metric = "score") {
        this.data = Array.isArray(data) ? structuredClone(data) : [];
        this.metric = metric;
        this.render();
    }

    render() {
        const bounds = this.canvas.getBoundingClientRect();
        const width = Math.max(320, Math.round(bounds.width || 640));
        const height = Math.max(220, Math.round(bounds.height || 260));
        const ratio = window.devicePixelRatio || 1;

        this.canvas.width = width * ratio;
        this.canvas.height = height * ratio;
        this.context.setTransform(ratio, 0, 0, ratio, 0, 0);

        const ctx = this.context;
        ctx.clearRect(0, 0, width, height);

        if (this.data.length < 2) {
            this.#drawEmpty(width, height);
            return;
        }

        const margin = { top: 22, right: 18, bottom: 38, left: 52 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        const values = this.data.map((item) => this.#metricValue(item));
        const minimum = this.metric === "accuracy" ? 0 : Math.min(...values);
        const maximum = this.metric === "accuracy" ? 100 : Math.max(...values);
        const range = Math.max(1, maximum - minimum);
        const padding = this.metric === "accuracy" ? 0 : range * 0.12;
        const yMin = this.metric === "accuracy" ? 0 : Math.max(0, minimum - padding);
        const yMax = this.metric === "accuracy" ? 100 : maximum + padding;

        ctx.strokeStyle = "rgba(255,255,255,.14)";
        ctx.fillStyle = "rgba(255,255,255,.62)";
        ctx.font = "12px system-ui, sans-serif";
        ctx.lineWidth = 1;

        for (let step = 0; step <= 4; step += 1) {
            const y = margin.top + (chartHeight * step) / 4;
            const value = yMax - ((yMax - yMin) * step) / 4;

            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(width - margin.right, y);
            ctx.stroke();

            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.fillText(this.#formatAxis(value), margin.left - 8, y);
        }

        const point = (value, index) => ({
            x: margin.left + (chartWidth * index) / (values.length - 1),
            y: margin.top + chartHeight - ((value - yMin) / (yMax - yMin)) * chartHeight
        });

        const points = values.map(point);

        const gradient = ctx.createLinearGradient(0, margin.top, 0, margin.top + chartHeight);
        gradient.addColorStop(0, "rgba(255,216,77,.30)");
        gradient.addColorStop(1, "rgba(255,216,77,0)");

        ctx.beginPath();
        ctx.moveTo(points[0].x, margin.top + chartHeight);
        points.forEach((item) => ctx.lineTo(item.x, item.y));
        ctx.lineTo(points.at(-1).x, margin.top + chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        points.forEach((item, index) => {
            if (index === 0) ctx.moveTo(item.x, item.y);
            else ctx.lineTo(item.x, item.y);
        });
        ctx.strokeStyle = "#ffd84d";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        points.forEach((item) => {
            ctx.beginPath();
            ctx.arc(item.x, item.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = "#17191d";
            ctx.fill();
            ctx.strokeStyle = "#ffd84d";
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        const labelIndexes = this.#labelIndexes(points.length);
        ctx.fillStyle = "rgba(255,255,255,.62)";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.font = "11px system-ui, sans-serif";

        labelIndexes.forEach((index) => {
            const date = new Date(this.data[index].completedAt);
            ctx.fillText(
                new Intl.DateTimeFormat("nl-NL", { day: "2-digit", month: "2-digit" }).format(date),
                points[index].x,
                margin.top + chartHeight + 11
            );
        });
    }

    destroy() {
        this.resizeObserver.disconnect();
    }

    #metricValue(item) {
        switch (this.metric) {
            case "accuracy":
                return item.accuracy;
            case "response":
                return item.averageMilliseconds / 1000;
            default:
                return item.totalPoints;
        }
    }

    #formatAxis(value) {
        if (this.metric === "accuracy") return `${Math.round(value)}%`;
        if (this.metric === "response") return `${value.toFixed(1)}s`;
        return `${Math.round(value)}`;
    }

    #labelIndexes(length) {
        if (length <= 5) return Array.from({ length }, (_, index) => index);
        return [0, Math.round((length - 1) / 2), length - 1];
    }

    #drawEmpty(width, height) {
        const ctx = this.context;
        ctx.fillStyle = "rgba(255,255,255,.58)";
        ctx.font = "14px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Minimaal twee afgeronde rondes nodig voor een trendlijn.", width / 2, height / 2);
    }
}
