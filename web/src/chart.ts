import type { Dht22MeasuredValueList } from "./types";
import { calculateDiscomfortIndex } from "./utils";

export interface Rect {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface Point {
  x: number;
  y: number;
};

export interface PreparedDht22Data {
  humidity: Point[],
  temperature: Point[],
  discomfortIndex: Point[],
}


export interface AggregatedPointCloud {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xSum: number;
  ySum: number;
}

export interface PointCloud {
  points: Point[],
  aggregation: AggregatedPointCloud;
  range: Rect;
}

export interface Dht22PointCloud {
  humidity: PointCloud;
  temperature: PointCloud;
  discomfortIndex: PointCloud;
}

function prepare(data: Dht22MeasuredValueList): PreparedDht22Data {
  const preparedData: PreparedDht22Data = {
    humidity: [],
    temperature: [],
    discomfortIndex: [],
  };
  for (const row of data.rows) {
    preparedData.humidity.push({ x: row.time, y: row.humidity });
    preparedData.temperature.push({ x: row.time, y: row.temperature });
    preparedData.discomfortIndex.push({ x: row.time, y: calculateDiscomfortIndex(row.temperature, row.humidity) });
  }
  return preparedData;
}

function filter(points: Point[], range: Rect) {
  return points.filter(point =>
    point.x < range.xMax && point.x >= range.xMin &&
    point.y < range.yMax && point.y >= range.yMin
  );
}

function aggregate(points: Point[]): AggregatedPointCloud {
  let xMin = Number.MAX_SAFE_INTEGER;
  let xMax = Number.MIN_SAFE_INTEGER;
  let yMin = Number.MAX_SAFE_INTEGER;
  let yMax = Number.MIN_SAFE_INTEGER;
  let xSum = 0;
  let ySum = 0;

  for (const point of points) {
    if (point.x < xMin) {
      xMin = point.x;
    }
    if (point.x > xMax) {
      xMax = point.x;
    }
    if (point.y < yMin) {
      yMin = point.y;
    }
    if (point.y > yMax) {
      yMax = point.y;
    }
    xSum += point.x;
    ySum += point.y;
  }

  return {
    xMin,
    xMax,
    yMin,
    yMax,
    xSum,
    ySum,
  };
}

const memoStore = new WeakMap<any, unknown>();

function memo<T>(key: any, x: () => T): T {
  if (memoStore.has(key)) {
    return memoStore.get(key) as T;
  }
  return x();
}

export function preprocess(data: Dht22MeasuredValueList, range: Rect): Dht22PointCloud {
  const preparedData = memo(data, () => prepare(data));
  const humidity = filter(preparedData.humidity, range);
  const temperature = filter(preparedData.temperature, range);
  const discomfortIndex = filter(preparedData.discomfortIndex, range);

  return {
    humidity: {
      points: humidity,
      aggregation: aggregate(humidity),
      range,
    },
    temperature: {
      points: temperature,
      aggregation: aggregate(temperature),
      range,
    },
    discomfortIndex: {
      points: discomfortIndex,
      aggregation: aggregate(discomfortIndex),
      range,
    }
  };
}

function normalize(x: number, a: number, b: number) {
  if (b - a === 0) return 0.5;
  return (x - a) / (b - a);
}

export function renderChart(canvas: HTMLCanvasElement, data: Dht22PointCloud) {
  const context = canvas.getContext("2d");
  if (context == null) throw new Error("Context is null");
  const width = canvas.width;
  const height = canvas.height;
  const padding = 50;
  context.clearRect(0, 0, width, height);
  const render = (data: PointCloud, fillStyle: string | CanvasGradient | CanvasPattern, heightLimit?: { min: number, max: number }) => {
    const agg = data.aggregation;
    const range = data.range;
    const hl = heightLimit ?? ({
      min: agg.yMin,
      max: agg.yMax,
    });
    context.fillStyle = fillStyle;
    for (const point of data.points) {
      const normalizedX = normalize(point.x, range.xMin, range.xMax);
      const normalizedY = 1 - normalize(
        point.y,
        hl.min,
        hl.max,
      );

      const x = normalizedX * (width - padding * 2) + padding;
      const y = normalizedY * (height - padding * 2) + padding;

      context.beginPath();
      context.arc(x, y, 1, 0, Math.PI * 2);
      context.fill();
    }
  }
  render(data.humidity, "dodgerblue", { min: 40, max: 60 });
  render(data.temperature, "orangered", { min: 25, max: 35 });
  render(data.discomfortIndex, "goldenrod", { min: 20, max: 30 });
}