import { Rect, preprocess, renderChart, type Dht22PointCloud } from "./chart";
import { fetchData } from "./fetchData";
import { renderDom } from "./renderDom";
import type { Dht22MeasuredValue, Dht22MeasuredValueList } from "./types";

interface Context {
  data: Dht22MeasuredValueList | undefined;
  pointCloud: Dht22PointCloud | undefined;
  position: number;
  width: number;
  range: Rect;
}

function calcRange(context: Context) {
  const hour = 60 * 60;
  const width = context.width * hour;
  
  const positionMin = context.data?.rows.at(0)?.time ?? 0 + width * 0.5;
  const positionMax = (context.data?.rows.at(-1)?.time ?? Infinity) - width * 0.5;
  const position = (context.position / 100) * (positionMax - positionMin) + positionMin | 0;

  return {
    ...context.range,
    xMin: position,
    xMax: position + width,
  };
}

const context = new Proxy<Context>({
  data: undefined,
  pointCloud: undefined,
  position: 0,
  width: 1440,
  range: { xMin: 0, xMax: 1440, yMin: 0, yMax: Infinity, },
}, {
  set(target, prop, value) {
    if (prop === "data") {
      const a = new Map<number, Dht22MeasuredValue>();
      const _rows = target.data?.rows ?? [];
      for (const row of _rows) {
        a.set(row.time, row);
      }
      for (const row of (value as Dht22MeasuredValueList).rows) {
        a.set(row.time, row);
      }
      const rows: Dht22MeasuredValue[] = Array.from(a.values());
      const data: Dht22MeasuredValueList = {
        rows,
        length: rows.length,
      };
      renderDom(document.querySelector("#list")!, data);
      context.pointCloud = preprocess(data, target.range);
      return Reflect.set(target, prop, data);
    } else if (prop === "pointCloud") {
      renderChart(document.querySelector("#chart")!, value);
    } else if (prop === "position") {
      const result = Reflect.set(target, prop, value);
      context.range = calcRange(target);
      return result;
    } else if (prop === "width") {
      const result = Reflect.set(target, prop, value);
      context.range = calcRange(target);
      return result;
    } else if (prop === "range") {
      if (target.data != null) {
        context.pointCloud = preprocess(target.data, value);
      }
    }
    return Reflect.set(target, prop, value);
  }
});

context.data = await fetchData("dht.dat");

window.addEventListener("focus", async () => {
  const epoch = context.data?.rows.at(0)?.time;
  const lastTime = context.data?.rows.at(-1)?.time;
  if (lastTime == null || epoch == null) return;

  const to = Math.ceil(Math.ceil(Date.now() / 1000) / 60) - (epoch / 60 | 0);
  const from = Math.ceil(lastTime / 60) - (epoch / 60 | 0);

  const rangeString = `bytes=${from * 8}-${to * 8 - 1}`;

  if (to > from) {
    context.data = await fetchData("dht.dat", rangeString);
  }
});

const $position = document.querySelector<HTMLInputElement>("#position");
const $scale = document.querySelector<HTMLInputElement>("#scale");

context.width = Number($scale?.value);
context.position = Number($position?.value);

$position?.addEventListener("input", (e) => {
  if (!(e.target instanceof HTMLInputElement)) return;
  const value = Number(e.target.value);
  context.position = value;
});

$scale?.addEventListener("input", (e) => {
  if (!(e.target instanceof HTMLInputElement)) return;
  const value = Number(e.target.value);
  context.width = value;
});