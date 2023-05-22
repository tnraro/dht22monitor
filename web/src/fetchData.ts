import type { Dht22MeasuredValueList } from "./types";

export async function fetchData(dataPath: string, range?: string): Promise<Dht22MeasuredValueList> {
  const headers = new Headers();
  if (range != null) {
    headers.set("Range", range);
  }
  const res = await fetch(dataPath, {
    headers,
  });
  if (res.status > 400) throw new Error(`Http status: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const view = new DataView(buffer);
  const TIME_SIZE = 4;
  const HUMIDITY_SIZE = 2;
  const TEMPERATURE_SIZE = 2;
  const rowSize = TIME_SIZE + HUMIDITY_SIZE + TEMPERATURE_SIZE;
  const rowCount = view.byteLength / rowSize | 0;
  const rows: Dht22MeasuredValueList["rows"] = [];
  for (let row = 0; row < rowCount; row++) {
    const time = view.getUint32(row * rowSize, true);
    const humidity = view.getInt16(row * rowSize + TIME_SIZE, true) / 10;
    const temperature = view.getInt16(row * rowSize + TIME_SIZE + HUMIDITY_SIZE, true) / 10;
    rows.push({
      time,
      humidity,
      temperature
    });
  }
  return {
    rows,
    length,
  };
}