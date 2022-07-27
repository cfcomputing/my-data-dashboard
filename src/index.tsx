import { render } from 'solid-js/web';
import { invoke } from '@tauri-apps/api'

import { Datasource } from './datasource';

// Test integration with tauri
invoke('greet', { name: 'World' }).then((response) => console.log(response))

render(() => <Datasource />, document.getElementById('root')!);
