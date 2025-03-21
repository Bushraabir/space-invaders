/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 enemy1.gltf 
Author: Anna Vidal (Milaein) (https://sketchfab.com/milaein)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/projectile-magma-ball-915c10ddb81543eeaa122f7e159eccc5
Title: Projectile - Magma ball
*/

import React from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model(props) {
  const { nodes, materials } = useGLTF('/enemy1.gltf')
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes['Bolita_fuego_Material_#25_0'].geometry} material={materials.Material_25} position={[0.47, -0.379, 1.21]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.815, 0.867, 0.887]} />
    </group>
  )
}

useGLTF.preload('/enemy1.gltf')
