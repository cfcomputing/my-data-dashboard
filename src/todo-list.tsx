import { For, createSignal } from 'solid-js';
import { invoke } from '@tauri-apps/api'

type Todo = { id: number, text: string, completed: boolean };

export const TodoList = () => {
  let input!: HTMLInputElement;
  let todoId = 0;
  const [todos, setTodos] = createSignal<Todo[]>([])
  const addTodo = (text: string) => {
    setTodos([...todos(), { id: ++todoId, text, completed: false }]);
  }
  const toggleTodo = (id: number) => {
    setTodos(todos().map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo)
    );
  }

  const [jsonResults, setJSONResults] = createSignal({});

  return (
    <>
      <div>
        <div id="connection-results" />
        <div id="json-results"><pre>{JSON.stringify(jsonResults(), null, 2)}</pre></div>
        <button onClick={() => {
          invoke('connect', { })
            // `invoke` returns a Promise
            .then((response) => console.log(response))
        }}>Click Me To Connect</button>
         <button onClick={() => {
          setJSONResults({ loading: true });
          setTimeout(async () => {
            const { foo } = await invoke('testjson', { })
            console.log(foo);
            setJSONResults(foo);
          }, 3000);
        }}>Test JSON</button>
        <input placeholder="new todo here" ref={input} />
        <button
          onClick={() => {
            if (!input.value.trim()) return;
            addTodo(input.value);
            input.value = "";
          }}
        >
          Add Todo
        </button>
      </div>
      <For each={todos()}>
        {(todo) => {          
          const { id, text } = todo;
          return <div>
            <input
              type="checkbox"
              checked={todo.completed}
              onchange={[toggleTodo, id]}
            />
            <span
              style={{ "text-decoration": todo.completed ? "line-through" : "none" }}
            >{text}</span>
          </div>
        }}
      </For>
    </>
  );
}