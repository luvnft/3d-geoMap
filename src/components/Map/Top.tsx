import * as THREE from "three";
import { useRef, useState } from "react";
import { Text3D, Html, Edges } from "@react-three/drei";
import { gsap } from "gsap";
import React from "react";
import { ThreeEvent } from "@react-three/fiber";

export type Object3DWithProperties = {
  obj: THREE.Object3D;
  properties: JSONData.MapJSONCityWithValue[];
};

const Top = ({
  baseHeight,
  midHeightScale,
  topHeightScale,
  blocks,
  values,
  mapCenter,
}: {
  baseHeight: number;
  midHeightScale: number;
  topHeightScale: number;
  blocks: Object3DWithProperties;
  values: JSONData.Statistics;
  mapCenter: [number, number];
}) => {
  const scale = 3.15;

  let rankInfo = Object.keys(values.features).map(
    (key) => `${key} ${values.features[key]}`
  );
  rankInfo.sort(
    (a, b) => parseFloat(b.split(" ")[1]) - parseFloat(a.split(" ")[1])
  );
  rankInfo = rankInfo.map((item, index) => index + 1 + "." + item);
  let rank: Record<string, string> = {};
  rankInfo.forEach((item) => {
    const suoyin = item.split(".")[1].split(" ")[0] as string;
    rank[suoyin] = item;
  });

  const config = {
    color: "#9cb8e4",
    clearcoat: 0.5,
    reflectivity: 0.35,
    ior: 1.3,
  };

  const blocksRef = useRef<THREE.Mesh[]>([]);
  const namesRef = useRef<THREE.Mesh[]>([]);

  const textConfig = {
    curveSegments: 32,
    bevelEnabled: true,
    bevelSize: 0,
    bevelThickness: 0,
    height: 0.02,
    letterSpacing: 0,
    size: 0.25,
  };

  const [makerVisible, setMakerVisible] = useState(false);
  const [makerPosition, setMakerPosition] = useState<[number, number, number]>([
    0, 2, 0,
  ]);
  const [makerValue, setMakerValue] = useState("");
  const [lines, setLines] = useState<{
    children: {
      start: [number, number, number];
      mid: [number, number, number];
      end: [number, number, number];
    }[];
  }>({ children: [] });
  const [targetPosition, setTargetPosition] = useState({ x: 0, z: 0 });

  const handleClick = (e: ThreeEvent<MouseEvent>, index: number) => {
    e.stopPropagation();
    setLines({ children: [] });
    // 第二次点击选中的地图，让其恢复默认状态
    if (blocksRef.current[index].scale.z == 0.8) handleSecondClick(index);
    else {
      handleFristClick(index);
    }
  };
  const handleFristClick = (index: number) => {
    let tempArr: {
      start: [number, number, number];
      mid: [number, number, number];
      end: [number, number, number];
    }[] = [];
    blocks.obj.children.forEach((block, i) => {
      if (i !== index) {
        const startX =
          (blocks.properties[index].properties.center[0] - mapCenter[0]) *
          scale;
        const startZ =
          -(blocks.properties[index].properties.center[1] - mapCenter[1]) *
          scale;
        const endX =
          (blocks.properties[index].properties.center[0] - mapCenter[0]) *
          scale;
        const endZ =
          -(blocks.properties[index].properties.center[1] - mapCenter[1]) *
          scale;
        tempArr.push({
          start: [
            startX,
            baseHeight * (1 + midHeightScale + topHeightScale) + 0.3,
            startZ,
          ],
          end: [
            endX,
            baseHeight * (1 + midHeightScale + topHeightScale) + 0.3,
            endZ,
          ],
          mid: [
            startX + (endX - startX) / 5,
            baseHeight * (1 + midHeightScale + topHeightScale) + 2,
            startZ + (endZ - startZ) / 5,
          ],
        });
      }
    });
    setLines({ children: [...tempArr] });
    // maker
    const province = blocks.properties[index].properties.name;
    setMakerVisible(true);
    setMakerValue(rank[province]);
    setMakerPosition([
      (blocks.properties[index].properties.center[0] - mapCenter[0]) * scale,
      2,
      -(blocks.properties[index].properties.center[1] - mapCenter[1]) * scale,
    ]);
    // block
    blocksRef.current.forEach((block, lastIndex) => {
      if (block.scale.z === 0.8) {
        gsap.to(blocksRef.current[lastIndex].scale, {
          duration: 0.3,
          z: topHeightScale,
        });
        (namesRef.current[index].material as THREE.MeshBasicMaterial).color =
          new THREE.Color("#9cb8e4");
        (namesRef.current[index].material as THREE.Material).opacity = 1;
      }
    });
    gsap.to(blocksRef.current[index].scale, { duration: 0.3, z: 0.8 });
    (blocksRef.current[index].material as THREE.MeshBasicMaterial).color =
      new THREE.Color("#ffb47e");
    (namesRef.current[index].material as THREE.Material).opacity = 0;
    // bird
    setTargetPosition({
      ...targetPosition,
      x: tempArr[0].start[0],
      z: tempArr[0].start[2],
    });
  };
  const handleSecondClick = (index: number) => {
    setMakerVisible(false);
    setMakerValue("");
    setMakerPosition([0, 2, 0]);
    gsap.to(blocksRef.current[index].scale, {
      duration: 0.3,
      z: topHeightScale,
    });
    (blocksRef.current[index].material as THREE.MeshBasicMaterial).color =
      new THREE.Color("#9cb8e4");
    (namesRef.current[index].material as THREE.MeshBasicMaterial).opacity = 1;
  };
  return (
    <>
      {/* 点击后的城市maker */}
      <Html
        style={{
          transition: "all 0.2s",
          opacity: makerVisible ? 1 : 0,
          transform: `scale(${makerVisible ? 1 : 0.25})`,
          userSelect: "none",
          width: "200px",
          fontFamily: "zaozigongfangtianliti",
          color: "#242424",
        }}
        position={makerPosition}
      >
        <h3>{makerValue}</h3>
      </Html>
      {/* 城市名称 */}
      <group
        rotation={[0, Math.PI * 1.1, Math.PI]}
        position-y={baseHeight + midHeightScale * baseHeight + 0.01}
      >
        {blocks.properties.map((item, index) => (
          <group key={"city_" + index}>
            <Text3D
              ref={(el) => {
                if (el) namesRef.current[index] = el;
              }}
              font={"./MFTianLiNoncommercial_Regular.json"}
              position={[
                (item.properties.centroid[0] - mapCenter[0]) * scale,
                0.01,
                (item.properties.centroid[1] - mapCenter[1]) * scale,
              ]}
              rotation={[-Math.PI * 0.5, Math.PI, Math.PI]}
              {...textConfig}
            >
              {item.properties.name}
              <meshBasicMaterial color={"#ffffff"} transparent />
            </Text3D>
          </group>
        ))}
      </group>
      {/* 城市block */}
      <group
        rotation={[-Math.PI * 0.5, 0, Math.PI * 0.09]}
        position-y={baseHeight + midHeightScale * baseHeight + 0.01}
      >
        {blocks.obj.children.map((item: THREE.Object3D, index: number) => (
          <group key={"top_" + index}>
            <mesh
              scale={[1, 1, topHeightScale]}
              geometry={
                (blocks.obj.children[index].children[0] as THREE.Mesh).geometry
              }
              ref={(el) => {
                if (el) blocksRef.current[index] = el;
              }}
              onClick={(e) => handleClick(e, index)}
            >
              <meshPhysicalMaterial
                {...config}
                transmission={Math.sqrt(
                  blocks.properties[index].value /
                    Math.max(...Object.values(values.features))
                )}
                roughness={Math.sqrt(
                  blocks.properties[index].value /
                    Math.max(...Object.values(values.features))
                )}
              />
              <Edges color={"#ffffff"} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
};

export default Top;
