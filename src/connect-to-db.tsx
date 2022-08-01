
        import { createSignal } from "solid-js";
        import { invoke } from "@tauri-apps/api";
        
        export const ConnectToDb = () => {
          return (
            <>
              <div>
                <button
                  onClick={async () => {
                    try {
                      const resp = await invoke<{}>("connect");
                      console.log("Response from connect()", resp);
                    } catch (e) {
                      console.log("Error from connect()", e);
                    }
                  }}
                >
                  Connect & init DB
                </button>
              </div>
            </>
          );
        };
        