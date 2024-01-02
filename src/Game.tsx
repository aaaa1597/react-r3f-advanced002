import { useEffect, useMemo, useRef } from 'react'
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper'
import { useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Octree } from 'three/examples/jsm/math/Octree'
import { Capsule } from 'three/examples/jsm/math/Capsule'
import { useControls } from 'leva'
import * as THREE from 'three'
import SphereCollider from './SphereCollider'
import { GLTF } from 'three-stdlib'
import Player from './Player'

namespace Constants {
    export const ballCount = 100
    export const radius = 0.2
    export const balls = [...Array(ballCount)].map(() => ({ position: [Math.random() * 50 - 25, 20, Math.random() * 50 - 25] }))
    export const v1 = new THREE.Vector3()
    export const v2 = new THREE.Vector3()
    export const v3 = new THREE.Vector3()
}

type GLTFResult = GLTF & {
    nodes: { Suzanne007: THREE.Mesh }
    materials: { Suzanne007: THREE.MeshStandardMaterial }
    scene: THREE.Object3D<THREE.Object3DEventMap>
}

type SphereCapsule = {
    sphere?: THREE.Sphere,
    velocity:THREE.Vector3,
    capsule?:Capsule,
}

const useOctreeHelper = (octree: Octree) => {
    //console.log('in useOctreeHelper')
    const { scene } = useThree()
    useEffect(() => {
        console.log('new OctreeHelper')
        const helper = new OctreeHelper(octree, 'hotpink')
        helper.name = 'octreeHelper'
        scene.add(helper)
        return () => {
            console.log('removing OctreeHelper')
            scene.remove(helper)
        }
    }, [octree, scene])

    useControls('Octree Helper', {
        visible: {
            value: false,
            onChange: (v) => {
                scene.getObjectByName('octreeHelper')!.visible = v
                //if (document.getElementById('Octree Helper.visible')) document.getElementById('Octree Helper.visible').blur()
            }
        }
    })
}
  
const useOctree = (scene: THREE.Object3D<THREE.Object3DEventMap>) => {
    console.log('in useOctree')
    const octree = useMemo(() => {
        console.log('new Octree')
        return new Octree().fromGraphNode(scene)
    }, [scene])

    return octree
}
  
const Ball = (props: { radius: number }) => {
    return (
      <mesh castShadow>
        <sphereGeometry args={[props.radius, 16, 16]} />
        <meshStandardMaterial />
        {/* <meshNormalMaterial wireframe /> */}
      </mesh>
    )
  }
  
const Physics = () => {
    // const { nodes, scene } = useGLTF('assets/Apartment2.glb') as GLTFResult
    const { nodes, scene } = useGLTF('assets/scene-transformed.glb') as GLTFResult
    const octree = useOctree(scene)
    useOctreeHelper(octree)

    const colliders = useRef<SphereCapsule[]>([])

    const checkSphereCollisions = (sphere: THREE.Sphere, velocity: THREE.Vector3) => {
        for (let i = 0, length = colliders.current.length; i < length; i++) {
            const c = colliders.current[i]
            if (c.sphere) {
                const d2 = sphere.center.distanceToSquared(c.sphere.center)
                const r = sphere.radius + c.sphere.radius
                const r2 = r * r
        
                if (d2 < r2) {
                    const normal  = Constants.v1.subVectors(sphere.center, c.sphere.center).normalize()
                    const impact1 = Constants.v2.copy(normal).multiplyScalar(normal.dot(velocity))
                    const impact2 = Constants.v3.copy(normal).multiplyScalar(normal.dot(c.velocity))
                      velocity.add(impact2).sub(impact1)
                    c.velocity.add(impact1).sub(impact2)
                    const d = (r - Math.sqrt(d2)) / 2
                      sphere.center.addScaledVector(normal,  d)
                    c.sphere.center.addScaledVector(normal, -d)
                  }
            }
            else if (c.capsule) {
                const center = Constants.v1.addVectors(c.capsule.start, c.capsule.end).multiplyScalar(0.5)
                const r = sphere.radius + c.capsule.radius
                const r2 = r * r
                for (const point of [c.capsule.start, c.capsule.end, center]) {
                    const d2 = point.distanceToSquared(sphere.center)
                    if (d2 < r2) {
                        const normal  = Constants.v1.subVectors(point, sphere.center).normalize()
                        const impact1 = Constants.v2.copy(normal).multiplyScalar(normal.dot(c.velocity))
                        const impact2 = Constants.v3.copy(normal).multiplyScalar(normal.dot(velocity))
                        c.velocity.add(impact2).sub(impact1)
                          velocity.add(impact1).sub(impact2)
                        const d = (r - Math.sqrt(d2)) / 2
                        sphere.center.addScaledVector(normal, -d)
                    }
                }
            }
        }
    }

    return (
        <>
            <group dispose={null}>
                <mesh castShadow receiveShadow geometry={nodes.Suzanne007.geometry} material={nodes.Suzanne007.material} position={[1.74, 1.04, 24.97]} />
            </group>
            {Constants.balls.map(({ position }, i) => (
                <SphereCollider key={i} id={i} radius={Constants.radius} octree={octree} position={position} colliders={colliders.current} checkSphereCollisions={checkSphereCollisions}>
                    <Ball radius={Constants.radius} />
                </SphereCollider>
            ))}
            <Player ballCount={Constants.ballCount} octree={octree} colliders={colliders.current} />
        </>
    )
}
export default Physics;
