import React, {useRef} from 'react';
import './App.css';
import { Canvas, useFrame, MeshProps  } from '@react-three/fiber'
import * as THREE from 'three'
import { Stats, Environment, OrbitControls, PointerLockControls } from '@react-three/drei'
import Game from './Game';

const Box = (props: MeshProps) => {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame((_, delta) => {
    if( !ref.current) return
    ref.current.rotation.x += 1 * delta
    ref.current.rotation.y += 0.5 * delta
  })

  return (
    <mesh {...props} ref={ref}>
      <boxGeometry />
      <meshNormalMaterial />
    </mesh>
  )
}

const App = () => {
  return (
    <div style={{ width: "100vw", height: "75vh" }}>
      <Canvas shadows>
        <directionalLight
            intensity={1}
            castShadow={true}
            shadow-bias={-0.00015}
            shadow-radius={4}
            shadow-blur={10}
            shadow-mapSize={[2048, 2048]}
            position={[85.0, 80.0, 70.0]}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
        <Box position={[1, 1, 1]} name="A" />
        <Environment files="/assets/kloofendal_48d_partly_cloudy_puresky_1k.hdr" background />
        <Game />
        <OrbitControls />
        {/* <PointerLockControls /> */}
        <axesHelper args={[5]} />
        <gridHelper />
        <Stats />
      </Canvas>
    </div>
  );
}

export default App;
