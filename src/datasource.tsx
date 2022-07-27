import { For, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api";

export const Datasource = () => {
	let input!: HTMLInputElement;
	const [jsonResults, setJSONResults] = createSignal({});

	return (
		<>
			<div>
				<div id="json-results">
					<pre>{JSON.stringify(jsonResults(), null, 2)}</pre>
				</div>
				<button
					onClick={async () => {
						const url = input.value.trim();
						if (!url || !url.length) {
							setJSONResults({ error: "invalid input" });
							return;
						}

						setJSONResults({ loading: true });
						try {
							const resp = await invoke<{}>("testjson", { url });
							console.log("Response from testjson()", resp);
							setJSONResults(resp);
						} catch (e) {
							console.log("Error from testjson()", e);
							setJSONResults({ error: e });
						}
					}}
				>
					Test JSON
				</button>
				<input placeholder="datasource to single json object" value={"https://httpbin.org/ip"} ref={input} />
			</div>
		</>
	);
};
