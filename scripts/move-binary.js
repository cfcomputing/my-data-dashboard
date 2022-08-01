/**
 * This script is used to rename the binary with the platform specific postfix.
 * When `tauri build` is ran, it looks for the binary name appended with the platform specific postfix.
 */

 import { execa } from 'execa';
 import fs from 'fs';
 
 let extension = ''
 if (process.platform === 'win32') {
   extension = '.exe'
 }
 
 async function main() {
   const rustInfo = (await execa('rustc', ['-vV'])).stdout
   const targetTriple = /host: (\S+)/g.exec(rustInfo)[1]
   if (!targetTriple) {
     console.error('Failed to determine platform target triple')
   }
   try {
    fs.renameSync(
      `src-tauri/binaries/node-app${extension}`,
      `src-tauri/binaries/node-app-${targetTriple}${extension}`
    );
   } catch(e) {

   }

   try {
    fs.renameSync(
      `src-tauri/binaries/node-app-linux${extension}`,
      `src-tauri/binaries/node-app-${targetTriple.replace('-apple-darwin', '-linux')}${extension}`
    );
   } catch(e) {
    
   }

   try {
    fs.renameSync(
      `src-tauri/binaries/node-app-macos${extension}`,
      `src-tauri/binaries/node-app-${targetTriple}${extension}`
    );
   } catch(e) {
    
   }

   try {
    fs.renameSync(
      `src-tauri/binaries/node-app-win.exe`,
      `src-tauri/binaries/node-app-${targetTriple.replace('-apple-darwin', '-win')}.exe`
    );
   } catch(e) {
    
   }
 }
 
 main().catch((e) => {
   throw e
 });