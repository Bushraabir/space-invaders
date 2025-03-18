# Space Invaders: Nebula Assault

A modern take on the classic Space Invaders game, built with React, Three.js, and Zustand. Navigate your spaceship through a cosmic battlefield, fend off enemy waves, collect power-ups, and survive the nebula onslaught!

## Features

- **3D Graphics**: Powered by Three.js with a dynamic starfield, spaceship model, and enemy ships.
- **Gameplay Mechanics**:
  - Move with arrow keys, shoot with the spacebar.
  - Enemies with straight or zigzag movement patterns.
  - Collectibles for bonus points.
  - Power-ups: Speed Boost, Shield, and Multi-Shot.
  - Explosions and thruster particle effects.
- **State Management**: Uses Zustand for efficient game state handling.
- **Post-Processing**: Bloom effects via `@react-three/postprocessing`.
- **Audio**: Background music toggle with a HUD interface.
- **Responsive UI**: Styled with `styled-components` for start, game, and game-over screens.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm or yarn

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Bushraabir/space-invaders.git
cd space-invaders
```

### 2. Install Dependencies
Using npm:
```bash
npm install
```
Or using yarn:
```bash
yarn install
```

## Project Structure
Ensure the following assets are in place:
```
/model/spaceship/spaceship.gltf    # Spaceship model
/model/enemy/enemy.gltf            # Enemy model
/src/sounds/background.mp3         # Background music
```
*Note: These assets are preloaded in the code. Replace placeholders with actual GLTF models and audio files.*

## Running the Game
Start the development server:

Using npm:
```bash
npm start
```
Using yarn:
```bash
yarn start
```

Open your browser to `http://localhost:3000` (or the port specified by your setup) to play the game.

## How to Play

### Start Screen:
Click **"Launch Assault"** to begin.

### Controls:
- **Arrow Keys**: Move the spaceship (left, right, up, down).
- **Spacebar**: Shoot bullets.

### Objective:
Destroy enemies, collect yellow collectibles, and grab power-ups while avoiding collisions.

### Power-Ups:
- **Speed (Blue)**: Increases movement and firing speed.
- **Shield (Yellow)**: Not implemented yet (placeholder).
- **Multi-Shot (Purple)**: Fires three bullets at once.

### HUD:
Displays score, lives, and music toggle (🔊/🔇).

### Game Over:
Restart by clicking **"Restart Assault"** when lives reach zero.

## Technical Details

### Tech Stack:
- React with `@react-three/fiber` for Three.js integration.
- Zustand for state management.
- Styled-components for CSS-in-JS styling.
- Three.js for 3D rendering.

### Performance Optimizations:
- Uses `instancedMesh` for efficient rendering of bullets, enemies, and collectibles.
- Dynamic particle systems for thrusters and explosions.

### Assets:
- GLTF models for spaceship and enemies.
- Custom geometries for bullets, collectibles, and power-ups.

## Known Issues

- **Audio**: Currently logs to console; replace `playSound` with actual audio playback logic.
- **Shield Power-Up**: Not fully implemented (no effect on gameplay yet).
- **Model Dependency**: Requires specific GLTF models; placeholders may cause errors if missing.

## Future Improvements

- Add enemy attack patterns (e.g., shooting back).
- Implement shield power-up functionality.
- Enhance sound effects for shooting, explosions, and power-ups.
- Optimize performance for larger enemy waves.
- Add difficulty progression (e.g., faster spawns over time).

## Contributing

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit changes:
   ```bash
   git commit -m "Add feature"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.


---
**Built with 🚀 by [Bushra Khandoker and Muzahidul Islam Abir].** Enjoy the cosmic adventure!

---
