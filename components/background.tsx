import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Canvas } from "@react-three/fiber";
import { BufferGeometry, Mesh, Material, SphereGeometry } from "three";
import { OrthographicCamera } from "@react-three/drei";
import { LayerMaterial, Fresnel, Normal, Color } from 'lamina'


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

function AnimatedCircle({
  delay,
  direction,
  velocity,
  distance,
  position,
  ...props
}: AnimatedCircleProps) {
  const meshRef = useRef<Mesh<BufferGeometry, Material> | null>(null);
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
        ease: 'power1.inOut',
        delay: delay * getRandomMultiplier(),
        onComplete: () => {
          setIsScaled(true);
        }
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
    
  return ( <mesh ref={meshRef} position={position} {...props}>
            <LayerMaterial>
                <Normal alpha={0.8}/>
                <Fresnel bias={0.1} intensity={2} alpha={0.1}/>
                <Color color={"#1DB954"} alpha={0.6}/>
            </LayerMaterial>
        </mesh> );
}

function Scene({ ...props }) {
  return (
    <>
      <color attach="background" args={["#000414"]} />
      <group {...props} dispose={null}>
        <directionalLight
          name="Directional Light"
          castShadow
          intensity={1}
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
          shadow-camera-near={-10000}
          shadow-camera-far={100000}
          shadow-camera-left={-1000}
          shadow-camera-right={1000}
          shadow-camera-top={1000}
          shadow-camera-bottom={-1000}
          color="#44b078"
          position={[900, 915, 950]}
          rotation={[0.05, -0.5, 0.65]}
          scale={[1, 1, 1.35]}
        />
        <AnimatedCircle
          name="Small Top Right"
          geometry={new SphereGeometry( 60 )}
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
          geometry={new SphereGeometry( 150 )}
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
          geometry={new SphereGeometry( 50 )}
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
          geometry={new SphereGeometry( 140 )}
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
          geometry={new SphereGeometry( 160 )}
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
          geometry={new SphereGeometry( 110 )}
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
          geometry={new SphereGeometry( 140 )}
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
          geometry={new SphereGeometry( 80 )}
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
          geometry={new SphereGeometry( 80 )}
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
          zoom={0.81}
          far={100000}
          near={-100000}
          position={[48.32, 78.43, 995.28]}
          rotation={[-0.04, 0.04, 0]}
          scale={1}
        />
      </group>
    </>
  );
}

const BubbleBackground = () => {
  return (
    <>
      <div className="-z-1 absolute w-screen h-screen object-cover">
        <Canvas>
          <Scene />
        </Canvas>
      </div>
    </>
  );
};

export default BubbleBackground;
