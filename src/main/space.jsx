import { useEffect, useState, useRef } from 'react';
import { create } from 'zustand';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import styled from 'styled-components';
import * as THREE from 'three';

useGLTF.preload('/model/spaceship/spaceship.gltf');
useGLTF.preload('/model/enemy/enemy.gltf');

const useGameStore = create((set) => ({
  score: 0,
  lives: 3,
  gameOver: false,
  gameStarted: false,
  playerPosition: [0, -8, 0],
  playerVelocity: [0, 0, 0],
  bullets: [],
  powerUps: [],
  enemies: [],
  collectibles: [],
  explosions: [],
  activePowerUps: [],
  setScore: (points) => set((state) => ({ score: state.score + points })),
  setLives: (lives) => set({ lives: Math.max(0, lives) }),
  setGameOver: (gameOver) => set({ gameOver }),
  startGame: () =>
    set({
      gameStarted: true,
      gameOver: false,
      score: 0,
      lives: 3,
      bullets: [],
      powerUps: [],
      enemies: [],
      collectibles: [],
      explosions: [],
      activePowerUps: [],
    }),
  updatePlayerPosition: (pos) => set({ playerPosition: pos }),
  updatePlayerVelocity: (vel) => set({ playerVelocity: vel }),
  addBullet: (bullet) => set((state) => ({ bullets: [...state.bullets, bullet] })),
  addPowerUp: (powerUp) => set((state) => ({ powerUps: [...state.powerUps, powerUp] })),
  addEnemy: (enemy) => set((state) => ({ enemies: [...state.enemies, enemy] })),
  addCollectible: (collectible) => set((state) => ({ collectibles: [...state.collectibles, collectible] })),
  addExplosion: (explosion) => set((state) => ({ explosions: [...state.explosions, explosion] })),
  activatePowerUp: (powerUp) => set((state) => ({ activePowerUps: [...state.activePowerUps, powerUp] })),
  removeBullet: (index) => set((state) => ({ bullets: state.bullets.filter((_, i) => i !== index) })),
  removePowerUp: (index) => set((state) => ({ powerUps: state.powerUps.filter((_, i) => i !== index) })),
  removeEnemy: (index) => set((state) => ({ enemies: state.enemies.filter((_, i) => i !== index) })),
  removeCollectible: (index) => set((state) => ({ collectibles: state.collectibles.filter((_, i) => i !== index) })),
  removeExplosion: (index) => set((state) => ({ explosions: state.explosions.filter((_, i) => i !== index) })),
  deactivatePowerUp: (index) => set((state) => ({ activePowerUps: state.activePowerUps.filter((_, i) => i !== index) })),
}));

const GameContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, #1a173b 0%, #0f0c29 70%);
  overflow: hidden;
  margin: 0;
  padding: 0;
`;

const HUD = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(10, 10, 20, 0.8);
  padding: 25px;
  border-radius: 12px;
  color: #00ffcc;
  text-shadow: 0 0 15px #00ffcc;
  font-family: 'Orbitron', sans-serif;
  font-size: 22px;
  letter-spacing: 4px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(0, 255, 204, 0.4);
`;

const HUDItem = styled.div`
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MusicIcon = styled.div`
  font-size: 24px;
  cursor: pointer;
  color: #00ffcc;
  text-shadow: 0 0 15px #00ffcc;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.2);
    color: #00e6b8;
  }
`;

const StartScreen = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(10, 10, 20, 0.95);
  padding: 60px;
  border-radius: 25px;
  color: #00ffcc;
  text-align: center;
  box-shadow: 0 0 50px rgba(0, 255, 204, 0.7);
  border: 3px solid rgba(0, 255, 204, 0.5);
  h1 {
    font-size: 70px;
    text-shadow: 0 0 20px #00ffcc;
    font-family: 'Orbitron', sans-serif;
  }
  p {
    font-size: 30px;
    margin: 30px 0;
    font-family: 'Roboto Mono', monospace;
  }
`;

const StartButton = styled.button`
  background: linear-gradient(45deg, #00ffcc, #00e6b8);
  color: #0f0c29;
  padding: 15px 40px;
  border: none;
  border-radius: 10px;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 0 25px #00ffcc;
  font-family: 'Orbitron', sans-serif;
  transition: all 0.4s ease;
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 0 40px #00ffcc;
    background: linear-gradient(45deg, #00e6b8, #00ffcc);
  }
`;

const GameOverScreen = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(15, 5, 20, 0.98);
  padding: 60px;
  border-radius: 25px;
  color: #ff3366;
  text-align: center;
  box-shadow: 0 0 50px rgba(255, 51, 102, 0.7);
  border: 3px solid rgba(255, 51, 102, 0.5);
  h1 {
    font-size: 70px;
    text-shadow: 0 0 20px #ff3366;
    font-family: 'Orbitron', sans-serif;
  }
  p {
    font-size: 30px;
    margin: 30px 0;
    font-family: 'Roboto Mono', monospace;
  }
`;

const MovingStars = () => {
  const starsRef = useRef();
  const [starsPositions] = useState(() => {
    const positions = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400 - 200;
    }
    return positions;
  });

  useFrame((state, delta) => {
    const positions = starsRef.current.geometry.attributes.position.array;
    for (let i = 2; i < positions.length; i += 3) {
      positions[i] += 20 * delta;
      if (positions[i] > 15) positions[i] = -200;
    }
    starsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={500}
          array={starsPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.15} color="#ffffff" />
    </points>
  );
};

const Explosion = ({ position, startTime }) => {
  const fireParticlesRef = useRef();
  const smokeParticlesRef = useRef();
  const shockwaveRef = useRef();
  const lightRef = useRef();

  const [fireParticles] = useState(() => {
    const particles = [];
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 5;
      const velocity = [
        Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
        0
      ];
      const size = 0.05 + Math.random() * 0.15;
      const lifetime = 1 + Math.random() * 1;
      particles.push({
        position: [0, 0, 0],
        velocity,
        size,
        lifetime,
      });
    }
    return particles;
  });

  const [smokeParticles] = useState(() => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2;
      const velocity = [
        Math.cos(angle) * speed + (Math.random() - 0.5) * 1,
        Math.sin(angle) * speed + 1 + (Math.random() - 0.5) * 1,
        0
      ];
      const size = 0.3 + Math.random() * 0.7;
      const lifetime = 3 + Math.random() * 2;
      particles.push({
        position: [0, 0, 0],
        velocity,
        size,
        lifetime,
      });
    }
    return particles;
  });

  useFrame((state, delta) => {
    const currentTime = state.clock.getElapsedTime();
    const age = currentTime - startTime;

    if (age > 5) return;

    fireParticles.forEach((p, i) => {
      const t = Math.min(1, age / p.lifetime);
      const scale = Math.sin(t * Math.PI) * p.size;
      p.position[0] += p.velocity[0] * delta;
      p.position[1] += p.velocity[1] * delta;
      p.position[2] += p.velocity[2] * delta;
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(...p.position),
        new THREE.Quaternion(),
        new THREE.Vector3(scale, scale, scale)
      );
      fireParticlesRef.current.setMatrixAt(i, matrix);
    });
    fireParticlesRef.current.instanceMatrix.needsUpdate = true;

    smokeParticles.forEach((p, i) => {
      const t = Math.min(1, age / p.lifetime);
      const scale = t * p.size;
      p.position[0] += p.velocity[0] * delta;
      p.position[1] += p.velocity[1] * delta;
      p.position[2] += p.velocity[2] * delta;
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(...p.position),
        new THREE.Quaternion(),
        new THREE.Vector3(scale, scale, scale)
      );
      smokeParticlesRef.current.setMatrixAt(i, matrix);
    });
    smokeParticlesRef.current.instanceMatrix.needsUpdate = true;

    if (age < 1) {
      const scale = age * 10;
      shockwaveRef.current.scale.set(scale, scale, scale);
      shockwaveRef.current.material.opacity = 1 - age;
    } else {
      shockwaveRef.current.visible = false;
    }

    if (age < 0.5) {
      lightRef.current.intensity = 10 * (1 - age / 0.5);
    } else {
      lightRef.current.intensity = 0;
    }
  });

  const fireMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
    blending: THREE.AdditiveBlending,
  });

  const smokeMaterial = new THREE.MeshBasicMaterial({
    color: 0x888888,
    transparent: true,
    opacity: 0.3,
  });

  return (
    <group position={position}>
      <pointLight ref={lightRef} distance={10} color="#ffaa00" />
      <instancedMesh ref={fireParticlesRef} args={[new THREE.SphereGeometry(1, 16, 16), fireMaterial, 100]} />
      <instancedMesh ref={smokeParticlesRef} args={[new THREE.SphereGeometry(1, 16, 16), smokeMaterial, 50]} />
      <mesh ref={shockwaveRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ff0000" transparent />
      </mesh>
    </group>
  );
};

const GameLogic = () => {
  const enemySpawnTimer = useRef(0);
  const powerUpSpawnTimer = useRef(0);
  const collectibleSpawnTimer = useRef(0);

  useFrame((state, delta) => {
    if (useGameStore.getState().gameOver) return;

    useGameStore.setState((state) => ({ score: state.score + delta * 20 }));

    const enemySpawnInterval = 2;
    enemySpawnTimer.current += delta;
    if (enemySpawnTimer.current >= enemySpawnInterval) {
      const x = Math.random() * 16 - 8;
      const type = Math.random() < 0.3 ? "zigzag" : "straight";
      const velocity = type === "straight" ? [Math.random() * 2 - 1, -3 - Math.random() * 2, 0] : [0, -3 - Math.random() * 2, 0];
      const amplitude = type === "zigzag" ? 2 : 0;
      const frequency = type === "zigzag" ? 5 : 0;
      const spawnTime = state.clock.getElapsedTime();
      useGameStore.getState().addEnemy({
        position: [x, 10, 0],
        initialPosition: [x, 10, 0],
        velocity,
        type,
        amplitude,
        frequency,
        spawnTime,
      });
      enemySpawnTimer.current = 0;
    }

    const powerUpSpawnInterval = 10;
    powerUpSpawnTimer.current += delta;
    if (powerUpSpawnTimer.current >= powerUpSpawnInterval) {
      const x = Math.random() * 16 - 8;
      const type = Math.random() < 0.33 ? "speed" : Math.random() < 0.66 ? "shield" : "multi-shot";
      useGameStore.getState().addPowerUp({
        position: [x, 10, 0],
        type,
        duration: 5,
      });
      powerUpSpawnTimer.current = 0;
    }

    const collectibleSpawnInterval = 5;
    collectibleSpawnTimer.current += delta;
    if (collectibleSpawnTimer.current >= collectibleSpawnInterval) {
      const x = Math.random() * 16 - 8;
      const size = 0.3 + Math.random() * 0.7;
      useGameStore.getState().addCollectible({
        position: [x, 10, 0],
        velocity: [0, -2, 0],
        size,
        spawnTime: state.clock.getElapsedTime(),
      });
      collectibleSpawnTimer.current = 0;
    }

    const { playerPosition, bullets, powerUps, enemies, collectibles } = useGameStore.getState();

    let playerCollisions = [];
    enemies.forEach((enemy, enemyIndex) => {
      if (
        Math.abs(enemy.position[0] - playerPosition[0]) < 0.6 &&
        Math.abs(enemy.position[1] - playerPosition[1]) < 0.6
      ) {
        playerCollisions.push(enemyIndex);
      }

      bullets.forEach((bullet, bulletIndex) => {
        if (
          Math.abs(enemy.position[0] - bullet.position[0]) < 0.6 &&
          Math.abs(enemy.position[1] - bullet.position[1]) < 0.6
        ) {
          useGameStore.getState().removeEnemy(enemyIndex);
          useGameStore.getState().removeBullet(bulletIndex);
          useGameStore.getState().addExplosion({
            position: enemy.position,
            time: state.clock.getElapsedTime(),
          });
          useGameStore.getState().setScore(100);
          playSound('enemyHit');
        }
      });
    });

    if (playerCollisions.length > 0) {
      playerCollisions.sort((a, b) => b - a);
      playerCollisions.forEach((index) => useGameStore.getState().removeEnemy(index));
      const newLives = useGameStore.getState().lives - playerCollisions.length;
      useGameStore.getState().setLives(newLives);
      if (newLives <= 0) useGameStore.getState().setGameOver(true);
    }

    powerUps.forEach((powerUp, powerUpIndex) => {
      if (
        Math.abs(powerUp.position[0] - playerPosition[0]) < 0.6 &&
        Math.abs(powerUp.position[1] - playerPosition[1]) < 0.6
      ) {
        useGameStore.getState().removePowerUp(powerUpIndex);
        useGameStore.getState().activatePowerUp({
          type: powerUp.type,
          startTime: state.clock.getElapsedTime(),
          duration: powerUp.duration,
        });
        playSound('powerUp');
      }
    });

    collectibles.forEach((collectible, index) => {
      const distance = Math.sqrt(
        (collectible.position[0] - playerPosition[0]) ** 2 +
        (collectible.position[1] - playerPosition[1]) ** 2
      );
      if (distance < 0.5 + collectible.size / 2) {
        useGameStore.getState().removeCollectible(index);
        const points = Math.floor(collectible.size * 100);
        useGameStore.getState().setScore(points);
        playSound('collect');
      }
    });

    const currentTime = state.clock.getElapsedTime();
    useGameStore.setState((state) => ({
      enemies: state.enemies
        .map((enemy) => {
          const timeElapsed = currentTime - enemy.spawnTime;
          let newX = enemy.type === "straight"
            ? enemy.initialPosition[0] + enemy.velocity[0] * timeElapsed
            : enemy.initialPosition[0] + enemy.amplitude * Math.sin(enemy.frequency * timeElapsed);
          const newY = enemy.initialPosition[1] + enemy.velocity[1] * timeElapsed;
          return { ...enemy, position: [newX, newY, 0] };
        })
        .filter((enemy) => enemy.position[1] > -12),
      collectibles: state.collectibles
        .map((collectible) => ({
          ...collectible,
          position: [
            collectible.position[0] + collectible.velocity[0] * delta,
            collectible.position[1] + collectible.velocity[1] * delta,
            0,
          ],
        }))
        .filter((collectible) => collectible.position[1] > -12),
      powerUps: state.powerUps
        .map((powerUp) => ({
          ...powerUp,
          position: [powerUp.position[0], powerUp.position[1] - 2 * delta, 0],
        }))
        .filter((powerUp) => powerUp.position[1] > -12),
      bullets: state.bullets
        .map((bullet) => ({
          ...bullet,
          position: [
            bullet.position[0] + bullet.velocity[0] * delta,
            bullet.position[1] + bullet.velocity[1] * delta,
            0,
          ],
        }))
        .filter((bullet) => bullet.position[1] < 12),
      explosions: state.explosions.filter((exp) => currentTime - exp.time < 5),
      activePowerUps: state.activePowerUps.filter((pu) => currentTime - pu.startTime < pu.duration),
    }));
  });

  return null;
};

const Player = () => {
  const [keys, setKeys] = useState({ left: false, right: false, up: false, down: false, shoot: false });
  const playerRef = useRef();
  const shootTimer = useRef(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setKeys((k) => ({ ...k, left: true }));
      if (e.key === 'ArrowRight') setKeys((k) => ({ ...k, right: true }));
      if (e.key === 'ArrowUp') setKeys((k) => ({ ...k, up: true }));
      if (e.key === 'ArrowDown') setKeys((k) => ({ ...k, down: true }));
      if (e.key === ' ') setKeys((k) => ({ ...k, shoot: true }));
    };
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') setKeys((k) => ({ ...k, left: false }));
      if (e.key === 'ArrowRight') setKeys((k) => ({ ...k, right: false }));
      if (e.key === 'ArrowUp') setKeys((k) => ({ ...k, up: false }));
      if (e.key === 'ArrowDown') setKeys((k) => ({ ...k, down: false }));
      if (e.key === ' ') setKeys((k) => ({ ...k, shoot: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (useGameStore.getState().gameOver || !playerRef.current) return;

    const { playerVelocity, activePowerUps } = useGameStore.getState();
    const maxSpeed = activePowerUps.some((pu) => pu.type === 'speed') ? 8 : 6;
    const acceleration = 30;
    const deceleration = 20;

    let accelX = 0;
    let accelY = 0;
    if (keys.left) accelX -= acceleration;
    if (keys.right) accelX += acceleration;
    if (keys.up) accelY += acceleration;
    if (keys.down) accelY -= acceleration;

    let newVelX = playerVelocity[0] + accelX * delta;
    let newVelY = playerVelocity[1] + accelY * delta;
    const speed = Math.sqrt(newVelX ** 2 + newVelY ** 2);
    if (speed > maxSpeed) {
      const ratio = maxSpeed / speed;
      newVelX *= ratio;
      newVelY *= ratio;
    }

    if (!keys.left && !keys.right) newVelX -= newVelX * deceleration * delta;
    if (!keys.up && !keys.down) newVelY -= newVelY * deceleration * delta;

    const newX = playerRef.current.position.x + newVelX * delta;
    const newY = playerRef.current.position.y + newVelY * delta;
    const clampedX = Math.max(-8, Math.min(8, newX));
    const clampedY = Math.max(-8, Math.min(8, newY));

    playerRef.current.position.set(clampedX, clampedY, 0);
    playerRef.current.rotation.z = -newVelX * 0.1;
    playerRef.current.rotation.x = newVelY * 0.05;
    useGameStore.setState({
      playerPosition: [clampedX, clampedY, 0],
      playerVelocity: [newVelX, newVelY, 0],
    });

    shootTimer.current += delta;
    const shootInterval = activePowerUps.some((pu) => pu.type === 'speed') ? 0.05 : 0.15;
    if (keys.shoot && shootTimer.current >= shootInterval) {
      const currentTime = state.clock.getElapsedTime();
      const isMultiShotActive = activePowerUps.some(
        (pu) => pu.type === 'multi-shot' && currentTime - pu.startTime < pu.duration
      );
      if (isMultiShotActive) {
        useGameStore.getState().addBullet({ position: [clampedX - 0.3, clampedY + 0.6, 0], velocity: [-1, 10, 0] });
        useGameStore.getState().addBullet({ position: [clampedX, clampedY + 0.6, 0], velocity: [0, 10, 0] });
        useGameStore.getState().addBullet({ position: [clampedX + 0.3, clampedY + 0.6, 0], velocity: [1, 10, 0] });
      } else {
        useGameStore.getState().addBullet({ position: [clampedX, clampedY + 0.6, 0], velocity: [0, 10, 0] });
      }
      shootTimer.current = 0;
      playSound('shoot');
    }
  });

  return (
    <group ref={playerRef} position={[0, -8, 0]} scale={[0.2, 0.2, 0.2]}>
      <primitive object={useGLTF('/model/spaceship/spaceship.gltf').scene} />
      <pointLight intensity={2.5} distance={8} color="#ffcc00" />
    </group>
  );
};

const ThrusterParticles = () => {
  const { playerPosition, playerVelocity } = useGameStore();
  const [particles, setParticles] = useState([]);

  useFrame((state, delta) => {
    const speed = Math.sqrt(playerVelocity[0] ** 2 + playerVelocity[1] ** 2);
    if (speed > 0.1) {
      const numParticles = Math.min(3, Math.floor(speed / 2));
      for (let i = 0; i < numParticles; i++) {
        const lifetime = 0.4 + Math.random() * 0.4;
        const size = 0.04 + Math.random() * 0.04;
        const velocity = [(Math.random() - 0.5) * 2, -2 - Math.random() * 2, 0];
        particles.push({
          position: [playerPosition[0], playerPosition[1] - 0.3, 0],
          velocity,
          lifetime,
          size,
          creationTime: state.clock.getElapsedTime(),
        });
      }
    }

    const currentTime = state.clock.getElapsedTime();
    setParticles((prev) =>
      prev
        .map((p) => ({
          ...p,
          position: [
            p.position[0] + p.velocity[0] * delta,
            p.position[1] + p.velocity[1] * delta,
            0,
          ],
          scale: 1 - (currentTime - p.creationTime) / p.lifetime,
        }))
        .filter((p) => currentTime - p.creationTime < p.lifetime)
    );
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length}
          array={new Float32Array(particles.flatMap((p) => p.position))}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particles.length}
          array={new Float32Array(particles.map((p) => p.size * p.scale))}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffaa00" sizeAttenuation transparent opacity={0.8} />
    </points>
  );
};

const Bullets = () => {
  const maxBullets = 100;
  const bulletGeometry = new THREE.CapsuleGeometry(0.1, 0.4, 8, 16);
  const bulletMaterial = new THREE.MeshStandardMaterial({ color: '#00ffcc', emissive: '#00ffcc', emissiveIntensity: 2.5 });
  const bulletsRef = useRef();

  useFrame(() => {
    const { bullets } = useGameStore.getState();
    bulletsRef.current.count = bullets.length;
    bullets.forEach((bullet, i) => {
      const matrix = new THREE.Matrix4().makeTranslation(...bullet.position);
      bulletsRef.current.setMatrixAt(i, matrix);
    });
    bulletsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={bulletsRef} args={[bulletGeometry, bulletMaterial, maxBullets]} />
  );
};

const Enemies = () => {
  const { enemies } = useGameStore();
  const { nodes, materials } = useGLTF('/model/enemy/enemy.gltf');

  const enemyMeshData = [
    { geometry: nodes.Object_4.geometry, material: materials['Material.009'], position: [-0.042, 1.508, 0], rotation: [0.333, -0.685, 0.602], scale: 1.19 },
    { geometry: nodes.Object_6.geometry, material: materials['Material.007'], position: [-0.043, 1.509, -0.006], rotation: [0, 0, -0.052], scale: 0.973 },
    { geometry: nodes.Object_8.geometry, material: materials['Material.008'], position: [-0.055, 1.508, 0], rotation: [-3.012, 0.811, 2.526], scale: 1.06 },
    { geometry: nodes.Object_10.geometry, material: materials['Material.008'], position: [0, 1.827, -0.067], rotation: [2.377, 0.416, 0.13], scale: [2.364, 4.549, 2.364] },
    { geometry: nodes.Object_12.geometry, material: materials['Material.007'], position: [-0.052, 1.615, 0.011], rotation: [0, 0, 0], scale: [1.953, 3.758, 1.953] },
    { geometry: nodes.Object_14.geometry, material: materials['Material.008'], position: [-0.052, 0.583, 0.011], rotation: [0, 0, 0], scale: [1.729, 3.327, 1.729] },
    { geometry: nodes.Object_16.geometry, material: materials['Material.008'], position: [-0.047, 0.329, 0.011], rotation: [0, 0, 0], scale: [0.748, 1.438, 0.748] },
    { geometry: nodes.Object_18.geometry, material: materials['Material.009'], position: [0.015, 1.781, -0.14], rotation: [0.692, 0.004, 0.24], scale: [2.816, 5.418, 2.816] },
    { geometry: nodes.Object_20.geometry, material: materials['Material.008'], position: [-0.047, 0.256, 0.011], rotation: [0, 0, 0], scale: [0.542, 1.042, 0.542] },
  ];

  const maxEnemies = 50;
  const instancedMeshes = enemyMeshData.map(() => useRef());

  useFrame((state) => {
    const currentTime = state.clock.getElapsedTime();
    const numEnemies = enemies.length;

    instancedMeshes.forEach((ref, j) => {
      if (ref.current) {
        ref.current.count = numEnemies;
        enemies.forEach((enemy, i) => {
          const timeElapsed = currentTime - enemy.spawnTime;
          const rotationSpeed = 2;
          const angle = rotationSpeed * timeElapsed;
          const groupRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
          const groupMatrix = new THREE.Matrix4().compose(
            new THREE.Vector3(...enemy.position),
            groupRotation,
            new THREE.Vector3(0.3, 0.3, 0.3)
          );

          const data = enemyMeshData[j];
          const localRotation = data.rotation ? new THREE.Quaternion().setFromEuler(new THREE.Euler(...data.rotation)) : new THREE.Quaternion();
          const localScale = data.scale instanceof Array ? new THREE.Vector3(...data.scale) : new THREE.Vector3(data.scale, data.scale, data.scale);
          const localMatrix = new THREE.Matrix4().compose(
            new THREE.Vector3(...data.position),
            localRotation,
            localScale
          );
          const instanceMatrix = new THREE.Matrix4().multiplyMatrices(groupMatrix, localMatrix);
          ref.current.setMatrixAt(i, instanceMatrix);
        });
        ref.current.instanceMatrix.needsUpdate = true;
      }
    });
  });

  return (
    <>
      {enemyMeshData.map((data, index) => (
        <instancedMesh key={index} ref={instancedMeshes[index]} args={[data.geometry, data.material, maxEnemies]} />
      ))}
    </>
  );
};

const Collectibles = () => {
  const maxCollectibles = 20;
  const collectibleGeometry = new THREE.SphereGeometry(1, 32, 32);
  const collectibleMaterial = new THREE.MeshStandardMaterial({ color: '#ffff00', emissive: '#ffff00', emissiveIntensity: 2 });
  const collectiblesRef = useRef();

  useFrame((state) => {
    const { collectibles } = useGameStore.getState();
    const currentTime = state.clock.getElapsedTime();
    const rotationSpeed = 2;
    collectiblesRef.current.count = collectibles.length;
    collectibles.forEach((collectible, i) => {
      const scale = collectible.size;
      const angle = rotationSpeed * (currentTime - collectible.spawnTime);
      const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      const matrix = new THREE.Matrix4().compose(
        new THREE.Vector3(...collectible.position),
        rotation,
        new THREE.Vector3(scale, scale, scale)
      );
      collectiblesRef.current.setMatrixAt(i, matrix);
    });
    collectiblesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={collectiblesRef} args={[collectibleGeometry, collectibleMaterial, maxCollectibles]} />
  );
};

const PowerUp = ({ position, type }) => {
  const meshRef = useRef();

  useFrame((state) => {
    meshRef.current.rotation.z = state.clock.getElapsedTime() * 2;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color={type === 'speed' ? '#00ccff' : type === 'shield' ? '#ffcc00' : '#ff00ff'}
        emissive={type === 'speed' ? '#00ccff' : type === 'shield' ? '#ffcc00' : '#ff00ff'}
        emissiveIntensity={2.5}
      />
    </mesh>
  );
};

const PowerUps = () => {
  const { powerUps } = useGameStore();
  return (
    <>
      {powerUps.map((powerUp, i) => (
        <PowerUp key={i} position={powerUp.position} type={powerUp.type} />
      ))}
    </>
  );
};

const GameScene = () => {
  const { explosions } = useGameStore();
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 80 }}>
      <ambientLight intensity={1} />
      <directionalLight position={[10, 10, 10]} intensity={2.5} castShadow />
      <MovingStars />
      <Environment preset="night" background blur={0.7} />
      <GameLogic />
      <Player />
      <ThrusterParticles />
      <Bullets />
      <Enemies />
      <Collectibles />
      <PowerUps />
      {explosions.map((exp, i) => (
        <Explosion key={i} position={exp.position} startTime={exp.time} />
      ))}
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
      </EffectComposer>
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
};

const SpaceInvaders = () => {
  const { gameStarted, startGame, gameOver, score, lives } = useGameStore();
  const audioRef = useRef(new Audio('src/sounds/background.mp3'));
  audioRef.current.loop = true;
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);

  useEffect(() => {
    if (gameStarted && !gameOver && isMusicEnabled) {
      audioRef.current.play().catch((error) => console.log('Audio play failed:', error));
    } else {
      audioRef.current.pause();
    }
  }, [gameStarted, gameOver, isMusicEnabled]);

  return (
    <GameContainer>
      {!gameStarted ? (
        <StartScreen>
          <h1>Space Invaders: Nebula Assault</h1>
          <p>Arrow keys to move, Spacebar to shoot. Survive the cosmic onslaught!</p>
          <StartButton onClick={startGame}>Launch Assault</StartButton>
        </StartScreen>
      ) : (
        <>
          <GameScene />
          <HUD>
            <HUDItem>🌟 SCORE: {Math.floor(score)}</HUDItem>
            <HUDItem>❤️ LIVES: {lives}</HUDItem>
            <HUDItem>
              <MusicIcon onClick={() => setIsMusicEnabled(!isMusicEnabled)}>
                {isMusicEnabled ? '🔊' : '🔇'}
              </MusicIcon>
            </HUDItem>
          </HUD>
          {gameOver && (
            <GameOverScreen>
              <h1>GAME OVER</h1>
              <p>Final Score: {Math.floor(score)}</p>
              <StartButton onClick={() => window.location.reload()}>
                Restart Assault
              </StartButton>
            </GameOverScreen>
          )}
        </>
      )}
    </GameContainer>
  );
};

const playSound = (soundName) => {
  console.log(`Playing sound: ${soundName}`);
};

export default SpaceInvaders;