import { MeshTransmissionMaterial } from "@react-three/drei";
import { LoaderProto, useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { RGBELoader } from "three-stdlib";
import React from "react";

const Mid = ({
  baseHeight,
  midHeightScale,
  blocks,
}: {
  blocks: THREE.Object3D<THREE.Object3DEventMap>[];
  baseHeight: number;
  midHeightScale: number;
}) => {
  const config = {
    samples: 16,
    resolution: 1024,
    transmission: 1,
    thickness: 0.3,
    chromaticAberration: 0.3,
    anisotropy: 0.3,
    roughness: 0.6,
    ior: 1,
    color: "#d2ebff",
  };

  const background = useLoader(
    RGBELoader as LoaderProto<RGBELoader>,
    "/src/assets/texture/umhlanga_sunrise_1k.hdr"
  );

  const geometries = blocks
    .filter((item) => (item.children[0] as THREE.Mesh).isMesh)
    .map((after) => (after.children[0] as THREE.Mesh).geometry);

  const merged = useMemo(
    () => BufferGeometryUtils.mergeGeometries(geometries),
    [geometries]
  );

  return (
    <group
      rotation={[-Math.PI * 0.5, 0, Math.PI * 0.09]}
      position-y={baseHeight + 0.01}
      scale={[1, 1, midHeightScale]}
    >
      <mesh geometry={merged}>
        <MeshTransmissionMaterial
          distortionScale={0}
          temporalDistortion={0}
          {...config}
          background={background}
        />
      </mesh>
    </group>
  );
};

export default Mid;
