export interface Dht22MeasuredValue {
  time: number;
  humidity: number;
  temperature: number;
};
export interface Dht22MeasuredValueList {
  rows: Dht22MeasuredValue[];
  length: number;
};