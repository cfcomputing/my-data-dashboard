cd src-node-sidecar
npm run package
cd ../
node scripts/move-binary.js
# npm run tauri dev