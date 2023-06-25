import React from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './scene';

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
      <Canvas gl={glProps} shadows camera={{ position: [0, 5, 10], fov: 25 }}>
        <Scene />
      </Canvas>
    </div>
  );
};

export default BubbleBackground;
