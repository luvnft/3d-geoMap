import * as THREE from "three";
import "@react-three/fiber";
import { useMemo } from "react";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import React from "react";

const Base = ({ blocks }: { blocks: THREE.Object3D[] }) => {
  const matcap = new THREE.TextureLoader().load(
    "/src/assets/texture/C7C7D7_4C4E5A_818393_6C6C74-512px.png"
  );

  const geometries = blocks
    .filter((item) => (item.children[0] as THREE.Mesh).isMesh)
    .map((after) => (after.children[0] as THREE.Mesh).geometry);

  const merged = useMemo(
    () => BufferGeometryUtils.mergeGeometries(geometries),
    [geometries]
  );

  return (
    <group rotation={[-Math.PI * 0.5, 0, Math.PI * 0.09]}>
      <mesh geometry={merged}>
        <meshMatcapMaterial matcap={matcap} />
      </mesh>
    </group>
  );
};

export default Base;
