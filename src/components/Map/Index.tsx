import * as THREE from "three";
import * as d3 from "d3-geo";
import Base from "./Base";
import Mid from "./Mid";
import Top, { Object3DWithProperties } from "./Top";
import React from "react";

const processing = (
  oriData: JSONData.MapJSONProvince,
  values: JSONData.Statistics
) => {
  const mapData: JSONData.MapJSONCityWithValue[] = oriData.features.map(
    (province: JSONData.MapJSONCity) => {
      const mapCityWithValue: JSONData.MapJSONCityWithValue = {
        ...province,
        value: 0,
      };
      mapCityWithValue.value = values.features[province.properties.name];
      return mapCityWithValue;
    }
  );

  return {
    type: oriData.type,
    features: mapData,
  };
};

const Map = ({
  baseHeight,
  midHeightScale,
  topHeightScale,
  values,
  geoJson,
  mapCenter,
}: {
  baseHeight: number;
  midHeightScale: number;
  topHeightScale: number;
  values: JSONData.Statistics;
  geoJson: JSONData.MapJSONProvince;
  mapCenter: [number, number];
}) => {
  const map: Object3DWithProperties = {
    obj: new THREE.Object3D(),
    properties: [],
  };
  const projection = d3.geoMercator().center(mapCenter).translate([0, 0]);

  // 整合数据
  processing(geoJson, values).features.forEach((element, index) => {
    const province: {
      obj: THREE.Object3D;
      properties: JSONData.MapJSONCityWithValue;
    } = {
      obj: new THREE.Object3D(),
      properties: {
        ...element,
        value: 0,
      },
    };
    const coordinates = element.geometry.coordinates;

    coordinates.forEach((multiPolygon, index) => {
      multiPolygon.forEach((polygon) => {
        const shape = new THREE.Shape();
        const lineMaterial = new THREE.LineBasicMaterial({
          color: "#ffffff",
        });
        const lineGeometry = new THREE.BufferGeometry();

        const vertices = [];
        for (let i = 0; i < polygon.length; i++) {
          let x = null;
          let y = null;
          if (polygon[i] instanceof Array) {
            const tempXY = projection(polygon[i]);
            if (tempXY !== null) {
              x = tempXY[0];
              y = tempXY[1];
              if (i === 0) {
                shape.moveTo(x, -y);
              }
              shape.lineTo(x, -y);
              vertices.push(x, -y, baseHeight * topHeightScale + 0.001);
            }
          }
        }
        lineGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(new Float32Array(vertices), 3)
        );

        const extrudeSettings = {
          depth: baseHeight,
          bevelEnabled: false,
        };

        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshBasicMaterial();
        const material1 = new THREE.MeshBasicMaterial();
        const mesh = new THREE.Mesh(geometry, [material, material1]);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        province.obj.add(mesh);
        province.obj.add(line);
      });
    });
    map.obj.add(province.obj);
    map.properties.push(province.properties);
    console.log(map);
  });

  return (
    <group>
      <Base blocks={map.obj.children} />
      <Mid
        blocks={map.obj.children}
        baseHeight={baseHeight}
        midHeightScale={midHeightScale}
      />
      <Top
        blocks={map}
        baseHeight={baseHeight}
        midHeightScale={midHeightScale}
        topHeightScale={topHeightScale}
        values={values}
        mapCenter={mapCenter}
      />
    </group>
  );
};

export default Map;
