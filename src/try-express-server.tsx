/*
import { Command } from '@tauri-apps/api/shell'
// alternatively, use `window.__TAURI__.shell.Command`
// `my-sidecar` is the value specified on `tauri.conf.json > tauri > bundle > externalBin`
const command = Command.sidecar('my-sidecar')
const output = await command.execute()
*/

import { createSignal } from "solid-js";
// import { invoke } from "@tauri-apps/api";
import { Command } from '@tauri-apps/api/shell'

export const TryExpressServer = () => {
  const [res, setRes] = createSignal<any>({});
  return (
    <>
      <div>
        <div id="results"><pre>{JSON.stringify(JSON.parse(res().stdout || '{}'), null, 2)}</pre></div>
        <button
          onClick={async () => {
            try {
              const args = {
                foo: 'bar'
              };
              const command = Command.sidecar('binaries/node-app', JSON.stringify(args));
              const output = await command.execute();
              console.log('command', command);
              console.log('output', output);
              setRes(output);
            } catch (e) {
              console.log("Error from connect()", e);
            }
          }}
        >
          Try Express Server
        </button>
      </div>
    </>
  );
};
