import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import {
  SphereGeometry,
  ShaderMaterial,
} from "three";
import { OrthographicCamera } from "@react-three/drei";

type AnimatedCircleProps = {
  delay: number;
  direction: number;
  velocity: number;
  distance: number;
  position: [number, number, number];
  geometry: any;
  castShadow: boolean;
  receiveShadow: boolean;
  name: string;
  rotation: [number, number, number];
};

const getRandomMultiplier = () => {
  return 0.8 + Math.random() * 0.4;
};

const layerMaterial = new ShaderMaterial({
    uniforms: {
      alpha: { value: 0.8 },
      bias: { value: 0.1 },
      intensity: { value: 2 },
    },
    vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }    
    `,
    fragmentShader: `
    varying vec2 vUv;

    void main() {
      vec3 normal = normalize(vec3(vUv - 0.55, 0.0));
      normal.xy *= 2.0;
      
      float intensity = dot(normal, vec3(0.0, 0.0, 1.0));
      vec3 toonColor = vec3(0.0);
      if (intensity > 0.95) {
        toonColor = vec3(1.0);
      } else if (intensity > 0.5) {
        toonColor = vec3(0.7);
      } else if (intensity > 0.25) {
        toonColor = vec3(0.5);
      } else {
        toonColor = vec3(0.3);
      }
      
      float fresnel = pow(1.0 - abs(dot(normalize(normal), normalize(vec3(0.0, 0.0, 1.0)))), 5.0);
      vec3 fresnelColor = vec3(1.0) * fresnel;
      
      vec3 colorLayer = vec3(0.11, 0.72, 0.33);
      
      vec3 color = mix(colorLayer, mix(fresnelColor, mix(toonColor, normal * 0.5 + 0.5, 0.5), 0.7), 0.7);
      
      gl_FragColor = vec4(color, 1.0);
    }
   `,
  });

  const sphereGeo50 = new SphereGeometry(50);
  const sphereGeo60 = new SphereGeometry(60);
  const sphereGeo80 = new SphereGeometry(80);
  const sphereGeo110 = new SphereGeometry(110);
  const sphereGeo140 = new SphereGeometry(140);
  const sphereGeo150 = new SphereGeometry(150);
  const sphereGeo160 = new SphereGeometry(160);
  

function AnimatedCircle({
  delay,
  direction,
  velocity,
  distance,
  position,
  ...props
}: AnimatedCircleProps) {
  const meshRef = useRef<any | null>(null);
  const [isScaled, setIsScaled] = useState(false);
  const startPosition = position[1];
  const targetPosition = startPosition + distance;

  useEffect(() => {
    const timeline = gsap.timeline({ repeat: -1, yoyo: true });

    if (!isScaled) {
      const scaleTimeline = gsap.timeline();
      scaleTimeline.from(meshRef.current!.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1 * getRandomMultiplier(),
        ease: "power1.inOut",
        delay: delay * getRandomMultiplier(),
        onComplete: () => {
          setIsScaled(true);
        },
      });
    }

    timeline.to(meshRef.current!.position, {
      y: targetPosition,
      duration: distance / velocity,
      ease: "power1.inOut",
    });

    timeline.to(meshRef.current!.position, {
      y: startPosition,
      duration: distance / velocity,
      ease: "power1.inOut",
    });

    return () => {
      timeline.kill();
    };
  }, [delay, distance, startPosition, targetPosition, velocity, isScaled]);

  return (
    <mesh
      ref={meshRef}
      position={position}
      material={layerMaterial}
      {...props}
    />
  );
}

export default function Scene({ ...props }) {
  return (
    <>
      <color attach="background" args={["#000414"]} />
      <group {...props} dispose={null}>
        <AnimatedCircle
          name="Small Top Right"
          geometry={sphereGeo60}
          castShadow
          receiveShadow
          position={[320, 190, -235]}
          rotation={[0, 0.03, 0]}
          direction={1}
          velocity={20}
          distance={50}
          delay={0.2}
        />
        <AnimatedCircle
          name="Big Center Right"
          geometry={sphereGeo150}
          castShadow
          receiveShadow
          position={[485, -95, 85]}
          rotation={[0, 0.03, 0]}
          direction={-1}
          velocity={30}
          distance={70}
          delay={0.4}
        />
        <AnimatedCircle
          name="Small Bottom Left"
          geometry={sphereGeo50}
          castShadow
          receiveShadow
          position={[-180, -170, 185]}
          rotation={[0, 0.03, 0]}
          direction={1}
          velocity={20}
          distance={60}
          delay={0.8}
        />
        <AnimatedCircle
          name="Big Top Right"
          geometry={sphereGeo140}
          castShadow
          receiveShadow
          position={[315, 350, 215]}
          rotation={[0, 0.03, 0]}
          direction={1}
          velocity={40}
          distance={55}
          delay={0.1}
        />
        <AnimatedCircle
          name="Big Top Left"
          geometry={sphereGeo160}
          castShadow
          receiveShadow
          position={[-400, 180, -225]}
          rotation={[0, 0.03, 0]}
          direction={-1}
          velocity={30}
          distance={60}
          delay={0.35}
        />
        <AnimatedCircle
          name="Big Bottom Left"
          geometry={sphereGeo110}
          castShadow
          receiveShadow
          position={[-400, -195, 0]}
          rotation={[0, 0.03, 0]}
          direction={1}
          velocity={35}
          distance={40}
          delay={0.85}
        />
        <AnimatedCircle
          name="Big Bottom Center"
          geometry={sphereGeo140}
          castShadow
          receiveShadow
          position={[140, -325, 140]}
          rotation={[0, 0.03, 0]}
          direction={-1}
          velocity={15}
          distance={40}
          delay={0}
        />
        <AnimatedCircle
          name="Small Bottom Center"
          geometry={sphereGeo80}
          castShadow
          receiveShadow
          position={[200, -200, -150]}
          rotation={[0, 0.03, 0]}
          direction={1}
          velocity={45}
          distance={60}
          delay={0.75}
        />
        <AnimatedCircle
          name="Small Bottom Left"
          geometry={sphereGeo80}
          castShadow
          receiveShadow
          position={[-525, -225, 180]}
          rotation={[0, 0.03, 0]}
          direction={-1}
          velocity={40}
          distance={80}
          delay={0.5}
        />
        <OrthographicCamera
          name="1"
          makeDefault={true}
          zoom={0.8}
          far={100000}
          near={-100000}
          position={[50, 80, 1000]}
          rotation={[0, 0, 0]}
          scale={1}
        />
      </group>
    </>
  );
}