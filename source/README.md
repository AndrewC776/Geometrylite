# GeometryLite Native

Original Canvas + Web Audio rhythm platformer. No iframe, runtime dependencies, remote music files or external sprites. Three authored levels (128/136/144 BPM), cube/ship/wave, gravity portals, SAT spike collision, jump pads/orbs, coins, practice checkpoints, six icons and ten colors, a local JSON level editor and actual PNG capture.

## Run and build

Node 22 and Python 3 are sufficient. No npm install is required for the game.

```
cd native
node --test tests/engine.test.mjs
node tools/build.mjs
python3 -m http.server 8080 --directory dist
```

`dist/index.html` is a self-contained game. `dist/game.js` registers `<geometry-lite-game>` for same-origin embedding directly into a page, without an iframe. Set the host height explicitly. Removing the element stops rendering and closes its audio context.

Play: Space / Up / W / click / touch. Hold to jump again or fly. Escape pauses, R retries, M mutes, F fullscreen. Practice: Z adds a safe-ground checkpoint, X removes it. The visible watch controller uses the same collisions as the player and never changes records. Practice records do not count as normal completion. Scores/settings/custom levels are on-device only, not account/cloud synced.

## Verification and publication

The isolated GitHub Actions workflow runs engine and real browser checks, captures original App Store reference images, builds self-contained HTML, and publishes only this new game to `native-dash-demo-20260908`. It does not modify the main branch or expose the private geometrylite-net website source. The resulting commit-addressed raw.githack.com URL is then tested over public HTTPS. The downloadable evidence artifact contains actual screenshots, browser checks, live synthesized music capture and audio measurements.

## Similarity scope

This is an independent original web game, not an official RobTop release. The reference is https://apps.apple.com/us/app/geometry-dash/id625334537. No commercial soundtrack or extracted game assets are bundled. Similar visual vocabulary and core controls do NOT establish an objectively measured 90% match to the complete commercial app. Screenshot comparisons are of different authored scenes; SSIM is not a valid overall gameplay or music score. There are three levels, not the original app's whole catalog or full online/editor system. Physical iPhone input/audio latency and perceptual equivalence require device comparison; browser touch emulation is labeled accordingly.
