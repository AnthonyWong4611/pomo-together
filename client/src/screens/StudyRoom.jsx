import { useMemo, useState } from "react";
import { PlayerAvatar } from "../components/PlayerAvatar.jsx";

const ROOM_WIDTH = 720;
const ROOM_HEIGHT = 460;

export function StudyRoom({ guest, onLeave }) {
  const [player, setPlayer] = useState(guest);
  const [todos, setTodos] = useState([]);
  const [draftTodo, setDraftTodo] = useState("");

  const playerList = useMemo(
    () => [
      {
        id: "local",
        displayName: player.displayName,
        avatarUrl: player.avatarUrl,
        color: player.color,
        status: "Idle"
      }
    ],
    [player]
  );

  function movePlayer(deltaX, deltaY) {
    setPlayer((current) => ({
      ...current,
      position: {
        x: Math.min(Math.max(current.position.x + deltaX, 12), ROOM_WIDTH - 52),
        y: Math.min(Math.max(current.position.y + deltaY, 12), ROOM_HEIGHT - 52)
      }
    }));
  }

  function handleRoomKeyDown(event) {
    const step = 18;
    const controls = {
      ArrowUp: [0, -step],
      w: [0, -step],
      ArrowDown: [0, step],
      s: [0, step],
      ArrowLeft: [-step, 0],
      a: [-step, 0],
      ArrowRight: [step, 0],
      d: [step, 0]
    };

    const movement = controls[event.key];
    if (!movement) return;
    event.preventDefault();
    movePlayer(movement[0], movement[1]);
  }

  function addTodo(event) {
    event.preventDefault();
    const title = draftTodo.trim();
    if (!title) return;

    setTodos((current) => [
      ...current,
      { id: crypto.randomUUID(), title, done: false }
    ]);
    setDraftTodo("");
  }

  return (
    <main className="app-shell">
      <section
        className="room-panel"
        onKeyDown={handleRoomKeyDown}
        tabIndex={0}
      >
        <div className="room-header">
          <div>
            <p className="eyebrow">Shared Room</p>
            <h1>Focus Room</h1>
          </div>
          <button className="ghost-button" onClick={onLeave} type="button">
            Leave
          </button>
        </div>

        <div
          aria-label="Study room movement area"
          className="room-stage"
          style={{ width: ROOM_WIDTH, height: ROOM_HEIGHT }}
        >
          <div className="room-rug" />
          <PlayerAvatar player={player} />
        </div>
      </section>

      <aside className="side-panel">
        <section className="panel-card">
          <h2>Online</h2>
          {playerList.map((roomPlayer) => (
            <div className="player-row" key={roomPlayer.id}>
              <PlayerAvatar compact player={{ ...roomPlayer, position: { x: 0, y: 0 } }} />
              <div>
                <strong>{roomPlayer.displayName}</strong>
                <p>{roomPlayer.status}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="panel-card">
          <h2>Pomodoro</h2>
          <p className="placeholder-text">Timer controls land here next.</p>
          <button className="secondary-button" type="button">
            Start Focus
          </button>
        </section>

        <section className="panel-card">
          <h2>Todos</h2>
          <form className="todo-form" onSubmit={addTodo}>
            <input
              value={draftTodo}
              onChange={(event) => setDraftTodo(event.target.value)}
              placeholder="Add a study task"
            />
            <button className="secondary-button" type="submit">
              Add
            </button>
          </form>
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id}>
                <label>
                  <input
                    checked={todo.done}
                    onChange={() =>
                      setTodos((current) =>
                        current.map((item) =>
                          item.id === todo.id ? { ...item, done: !item.done } : item
                        )
                      )
                    }
                    type="checkbox"
                  />
                  <span className={todo.done ? "done" : ""}>{todo.title}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </main>
  );
}
