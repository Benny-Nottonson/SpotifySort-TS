import React from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./scene";

const BubbleBackground = () => {
  const glProps = {
    antialias: true,
    alpha: false,
    premultipliedAlpha: false,
    stencil: false,
    depth: false,
    logarithmicDepthBuffer: true,
    powerPreference: "high-performance",
    autoClear: false,
    sortObjects: false,
  };

  return (
    <div className="-z-1 absolute w-screen h-screen object-cover">
      <React.Suspense fallback={null} />
      <Canvas
        gl={glProps}
        shadows
        orthographic
        camera={{
          zoom: 0.8,
          far: 100000,
          near: -1000000,
          position: [50, 80, 1000],
        }}
      >
        <Scene />
      </Canvas>
      <React.Suspense />
    </div>
  );
};

export default BubbleBackground;
