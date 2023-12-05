/// <reference types="react-scripts" />

declare namespace JSONData {
  type Statistics = {
    title: string;
    unit: string;
    features: Record<string, number>;
  };

  type MapJSONProvince = {
    type: string;
    features: MapJSONCity[];
  };

  type MapJSONCity = {
    type: string;
    properties: {
      adcode: number;
      name: string;
      center: [number, number];
      centroid: [number, number];
      childrenNum: number;
      level: string;
      parent: string;
      subFeatureIndex: number;
      acroutes: number[];
    };
    geometry: {
      type: string;
      coordinates: Array<Array<Array<[number, number]>>>;
    };
  };

  interface MapJSONCityWithValue extends MapJSONCity {
    value: number;
  }
}
