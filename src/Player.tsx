import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Octree } from 'three/examples/jsm/math/Octree'
import { Capsule } from 'three/examples/jsm/math/Capsule'
import * as THREE from 'three'

const GRAVITY = 30
const STEPS_PER_FRAME = 5

type SphereCapsule = {
    sphere?: THREE.Sphere,
    capsule?:Capsule,
    velocity:THREE.Vector3,
}

export default function Player(props: { octree: Octree, colliders: SphereCapsule[], ballCount: number }) {
    const playerOnFloor = useRef<boolean>(false)
    const playerVelocity = useMemo(() => new THREE.Vector3(), [])
    const playerDirection = useMemo(() => new THREE.Vector3(), [])
    const capsule = useMemo(() => new Capsule(new THREE.Vector3(0, 10, 0), new THREE.Vector3(0, 11, 0), 0.5), [])
    const { camera } = useThree()
    let clicked = 0

    function throwBall(camera: THREE.Camera, capsule: Capsule, playerDirection: THREE.Vector3, playerVelocity: THREE.Vector3, count: number) {
        const { sphere, velocity } = props.colliders[count % props.ballCount]

        camera.getWorldDirection(playerDirection)

        sphere!.center.copy(capsule.end).addScaledVector(playerDirection, capsule.radius * 1.5)

        velocity.copy(playerDirection).multiplyScalar(50)
        velocity.addScaledVector(playerVelocity, 2)
    }

    const onPointerDown = () => {
        throwBall(camera, capsule, playerDirection, playerVelocity, clicked++)
    }

    useEffect(() => {
        document.addEventListener('pointerdown', onPointerDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
        }
    })
    
    useEffect(() => {
        props.colliders[props.ballCount] = { capsule: capsule, velocity: playerVelocity }
    }, [props.colliders, props.ballCount, capsule, playerVelocity])
 
    type jsonkeymap = { [key: string]: boolean }
    const useKeyboard = () => {
        const keyMap = useRef<jsonkeymap>({})
        useEffect(() => {
            const onDocumentKey = (e: KeyboardEvent) => {
                keyMap.current[e.code] = e.type === 'keydown'      
            }
            document.addEventListener('keydown', onDocumentKey)
            document.addEventListener('keyup', onDocumentKey)
            return () => {
                document.removeEventListener('keydown', onDocumentKey)
                document.removeEventListener('keyup', onDocumentKey)
            }
        })
        
        return keyMap.current
    }
    const keyboard = useKeyboard()

    const getForwardVector = (camera: THREE.Camera, playerDirection: THREE.Vector3) => {
        camera.getWorldDirection(playerDirection)
        playerDirection.y = 0
        playerDirection.normalize()
        return playerDirection
    }
    
    const getSideVector = (camera: THREE.Camera, playerDirection: THREE.Vector3) => {
        camera.getWorldDirection(playerDirection)
        playerDirection.y = 0
        playerDirection.normalize()
        playerDirection.cross(camera.up)
        return playerDirection
    }

    const controls = (camera: THREE.Camera, delta: number, playerVelocity: THREE.Vector3, playerOnFloor: boolean, playerDirection: THREE.Vector3) => {
        const speedDelta = delta * (playerOnFloor ? 25 : 8)
        keyboard['KeyA'] && playerVelocity.add(getSideVector(camera, playerDirection).multiplyScalar(-speedDelta))
        keyboard['KeyD'] && playerVelocity.add(getSideVector(camera, playerDirection).multiplyScalar(speedDelta))
        keyboard['KeyW'] && playerVelocity.add(getForwardVector(camera, playerDirection).multiplyScalar(speedDelta))
        keyboard['KeyS'] && playerVelocity.add(getForwardVector(camera, playerDirection).multiplyScalar(-speedDelta))
        if (playerOnFloor) {
            if (keyboard['Space']) {
               playerVelocity.y = 15
            }
        }
    }
    
    const playerCollisions = (capsule: Capsule, octree: Octree, playerVelocity: THREE.Vector3) => {
        const result = octree.capsuleIntersect(capsule)
        let playerOnFloor = false
        if (result) {
          playerOnFloor = result.normal.y > 0
          if (!playerOnFloor) {
            playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity))
          }
          capsule.translate(result.normal.multiplyScalar(result.depth))
        }
        return playerOnFloor
    }
    
    const updatePlayer = (camera: THREE.Camera, delta: number, octree: Octree, capsule: Capsule, playerVelocity: THREE.Vector3, playerOnFloor: boolean) => {
        let damping = Math.exp(-4 * delta) - 1
        if (!playerOnFloor) {
            playerVelocity.y -= GRAVITY * delta
            damping *= 0.1 // small air resistance
        }
        playerVelocity.addScaledVector(playerVelocity, damping)
        const deltaPosition = playerVelocity.clone().multiplyScalar(delta)
        capsule.translate(deltaPosition)
        playerOnFloor = playerCollisions(capsule, octree, playerVelocity)
        camera.position.copy(capsule.end)
        return playerOnFloor
    }
    
    function teleportPlayerIfOob(camera: THREE.Camera, capsule: Capsule, playerVelocity: THREE.Vector3) {
        if (camera.position.y <= -100) {
            playerVelocity.set(0, 0, 0)
            capsule.start.set(0, 10, 0)
            capsule.end.set(0, 11, 0)
            camera.position.copy(capsule.end)
            camera.rotation.set(0, 0, 0)
        }
    }

    useFrame(({ camera }: { camera: THREE.Camera}, delta: number) => {
        controls(camera, delta, playerVelocity, playerOnFloor.current, playerDirection)
        const deltaSteps = Math.min(0.05, delta) / STEPS_PER_FRAME
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          playerOnFloor.current = updatePlayer(camera, deltaSteps, props.octree, capsule, playerVelocity, playerOnFloor.current)
        }
        teleportPlayerIfOob(camera, capsule, playerVelocity)
    })

    return <></>
}