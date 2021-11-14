import React, { useState, useEffect } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from "@react-three/drei"

// 3D model of Earth
function Earth() {
  const [rotation, setRotation] = useState(0);
  const gtlf = useLoader(GLTFLoader, '/3D_models/earth/scene.gltf')

  useEffect(() => {
    setInterval(() => {
      setRotation(old => old + 0.001);
    }, 10);
  }, []);

  return (
    <Canvas id="canvas">
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      <primitive 
        object={gtlf.scene} 
        scale={2} 
        rotation={[0.5, rotation, 0]}
      />
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
    
  )
}

export default Earth