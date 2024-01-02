import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Octree } from 'three/examples/jsm/math/Octree'
import { Capsule } from 'three/examples/jsm/math/Capsule'
import * as THREE from 'three'

namespace Constants {
    export const Gravity = 30
    export const frameSteps = 5
}

type SphereCapsule = {
    sphere?: THREE.Sphere,
    velocity:THREE.Vector3,
    capsule?:Capsule,
}

const SphereCollider = (props: { id: number, radius: number, octree: Octree, position: number[], colliders: SphereCapsule[], checkSphereCollisions: (sphere: THREE.Sphere, velocity: THREE.Vector3) => void, children: React.ReactNode }) => {
    const ref = useRef<THREE.Group>(null!)
    // const normalArrowRef = useRef<THREE.ArrowHelper>(null!)
    // const rotationArrowRef = useRef<THREE.ArrowHelper>(null!)
  
    const sphere = useMemo(() => new THREE.Sphere(new THREE.Vector3(...props.position), props.radius), [props.position, props.radius])
    const velocity = useMemo(() => new THREE.Vector3(), [])
    // const angularVelocity = useMemo(() => new THREE.Vector3(), [])
    // const v0 = useMemo(() => new THREE.Vector3(), [])
    // const q = useMemo(() => new THREE.Quaternion(), [])
    
    useEffect(() => {
        // console.log('adding reference to this sphere collider id=', props.id, " colliders.length=", props.colliders.length)
        console.log('adding reference to this sphere collider')
        props.colliders[props.id] = { sphere: sphere, velocity: velocity }
        // normalArrowRef.current.setColor(new THREE.Color(0xff0000))
        // rotationArrowRef.current.setColor(new THREE.Color(0x00ff00))
    }, [props.colliders, props.id, sphere, velocity])

    const updateSphere = (delta: number, octree: Octree, sphere: THREE.Sphere, velocity: THREE.Vector3) => {
        sphere.center.addScaledVector(velocity, delta)
    
        const result = octree.sphereIntersect(sphere)
    
        if (result) {
          const factor = -result.normal.dot(velocity)
          velocity.addScaledVector(result.normal, factor * 1.5)
    
        //   angularVelocity.x += result.normal.x
        //   angularVelocity.z += result.normal.z
        //   angularVelocity.y += result.normal.y
        //   rotationArrowRef.current.setDirection(result.normal.clone().normalize())
    
          sphere.center.add(result.normal.multiplyScalar(result.depth))
    
        //   normalArrowRef.current.setDirection(result.normal.clone().normalize())
        //   normalArrowRef.current.setLength(factor * 1.5)
        //   normalArrowRef.current.position.copy(sphere.center)
        }
        else {
          velocity.y -= Constants.Gravity * delta
        }
    
        const damping = Math.exp(-1.5 * delta) - 1
        velocity.addScaledVector(velocity, damping)
    
        props.checkSphereCollisions(sphere, velocity)
    
        ref.current.position.copy(sphere.center)
    
        // q.setFromAxisAngle(angularVelocity, delta * props.radius).normalize()
        // ref.current.applyQuaternion(q)
        // angularVelocity.lerp(v0, delta)
    
    }
    
    useFrame((_, delta) => {
        const deltaSteps = Math.min(0.05, delta) / Constants.frameSteps
        for (let i = 0; i < Constants.frameSteps; i++) {
            updateSphere(deltaSteps, props.octree, sphere, velocity)
        }
    })

    return (
        <>
            {/* <arrowHelper ref={normalArrowRef} /> */}
            <group ref={ref}>
                {props.children}
                {/* <arrowHelper ref={rotationArrowRef} /> */}
            </group>
        </>
    )
}
export default SphereCollider;
