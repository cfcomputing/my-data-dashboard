import { For, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api";

export const Cats = () => {
	const [cats, setCats] = createSignal<any>({});

	return (
		<>
			<div>
				<div id="cats">
          <h2>Cats</h2>
					<pre>{JSON.stringify(cats(), null, 2)}</pre>
				</div>
				<button
					onClick={async () => {
						try {
							const resp = await invoke<{}>("addcat");
							console.log("Response from addcat()", resp);
						} catch (e) {
							console.log("Error from addcat()", e);
						}
					}}
				>
					Add Cat
				</button>

        <button
					onClick={async () => {
						try {
							const resp = await invoke<{}>("getcats");
							console.log("Response from addcat()", resp);
              setCats(resp);
						} catch (e) {
							console.log("Error from addcat()", e);
						}
					}}
				>
					Get Cats
				</button>
			</div>
		</>
	);
};
