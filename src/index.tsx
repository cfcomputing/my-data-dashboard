import { render } from 'solid-js/web';
import { invoke } from '@tauri-apps/api'

import { ConnectToDb } from './connect-to-db';
import { Datasource } from './datasource';
import { Cats } from './cats';
import { TryExpressServer } from './try-express-server';

// Test integration with tauri
invoke('greet', { name: 'World' }).then((response) => console.log(response))

render(() => <div><ConnectToDb /><Datasource /><Cats /><TryExpressServer /></div>, document.getElementById('root')!);
