import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";


/*function generateGuestName() {
  const name = guestNames[Math.floor(Math.random() * guestNames.length)];
  const number = Math.floor(Math.random() * 900) + 100;
  return `${name} ${number}`;
}
  */

function App() {
  const [nameInput, setNameInput] = useState("");
  const [guest, setGuest] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarColor, setAvatarColor] = useState("#ff8fa3");
  const [avatarPosition, setAvatarPosition] = useState({ x: 50, y: 50 });
  const [socket, setSocket] = useState(null);
  const [remotePlayers, setRemotePlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [timerMode, setTimerMode] = useState("focus");
  const [timerRunning, setTimerRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [todoOpen, setTodoOpen] = useState(false);
  const [todoInput, setTodoInput] = useState("");
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem("focus-room-todos");

    if (!savedTodos) {
      return [];
    }

    try {
      return JSON.parse(savedTodos);
    } catch {
      return [];
    }
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io("http://localhost:4000");

    newSocket.on("players:current", (players) => {
      setRemotePlayers(players);
    });

    newSocket.on("player:joined", (player) => {
      setRemotePlayers((current) => [...current, player]);
    });

    newSocket.on("player:moved", (updatedPlayer) => {
      setRemotePlayers((current) =>
        current.map((player) =>
          player.id === updatedPlayer.id ? updatedPlayer : player
        )
      );
    });

    newSocket.on("player:left", (playerId) => {
      setRemotePlayers((current) =>
        current.filter((player) => player.id !== playerId)
      );
    });

    newSocket.on("chat:message", (message) => {
      setChatMessages((current) => [...current, message]);
    });

    newSocket.on("pomodoro:updated", (updatedPlayer) => {
      setRemotePlayers((current) =>
        current.map((player) =>
          player.id === updatedPlayer.id
            ? { ...player, pomodoro: updatedPlayer.pomodoro }
            : player
        )
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (!timerRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setTimerRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [timerRunning]);

  useEffect(() => {
    if (!guest) {
      return;
    }

    socket?.emit("pomodoro:update", {
      mode: timerMode,
      remainingSeconds,
      running: timerRunning
    });
  }, [guest, socket, timerMode, remainingSeconds, timerRunning]);

  useEffect(() => {
    localStorage.setItem("focus-room-todos", JSON.stringify(todos));
  }, [todos]);

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const leftoverSeconds = seconds % 60;

    return `${minutes}:${leftoverSeconds.toString().padStart(2, "0")}`;
  }

  function formatPomodoroStatus(pomodoro) {
    if (!pomodoro || pomodoro.mode === "idle") {
      return "Idle";
    }

    const label = pomodoro.mode === "focus" ? "Focus" : "Break";
    const pausedText = pomodoro.running ? "" : " paused";

    return `${label} ${formatTime(pomodoro.remainingSeconds)}${pausedText}`;
  }

  function setFocusLength(event) {
    const nextMinutes = Number(event.target.value);

    setFocusMinutes(nextMinutes);

    if (timerMode === "focus" && !timerRunning) {
      setRemainingSeconds(nextMinutes * 60);
    }
  }

  function setBreakLength(event) {
    const nextMinutes = Number(event.target.value);

    setBreakMinutes(nextMinutes);

    if (timerMode === "break" && !timerRunning) {
      setRemainingSeconds(nextMinutes * 60);
    }
  }

  function skipTimer() {
    const nextMode = timerMode === "focus" ? "break" : "focus";

    setTimerMode(nextMode);
    setTimerRunning(false);
    setRemainingSeconds((nextMode === "focus" ? focusMinutes : breakMinutes) * 60);
  }

  function resetTimer() {
    setTimerMode("focus");
    setTimerRunning(false);
    setRemainingSeconds(focusMinutes * 60);
  }

  function copyPomodoro(pomodoro) {
    if (!pomodoro || pomodoro.mode === "idle") {
      return;
    }

    setTimerMode(pomodoro.mode);
    setRemainingSeconds(pomodoro.remainingSeconds);
    setTimerRunning(pomodoro.running);
    setPomodoroOpen(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const displayName = nameInput.trim() || `Guest ${guestCount}`;

    if (!nameInput.trim()) {
      setGuestCount((current) => current + 1);
    }
    setGuest({
      displayName,
      avatarUrl: avatarUrl.trim(),
      avatarColor,
    });
    socket?.emit("player:join", {
      displayName,
      avatarUrl: avatarUrl.trim(),
      avatarColor,
      position: avatarPosition
    });
  }

  function moveAvatar(event) {
    const room = event.currentTarget.getBoundingClientRect();

    // click = center of avatar, (x,y) = top left corner of avatar
    const avatarSize = 132;
    const x = event.clientX - room.left - avatarSize / 2;
    const y = event.clientY - room.top - avatarSize / 2;

    // Ensures avatar is within room
    const nextPosition = {
      x: Math.min(Math.max(x, 0), room.width - avatarSize),
      y: Math.min(Math.max(y, 0), room.height - avatarSize)
    };

    setAvatarPosition(nextPosition);
    socket?.emit("player:move", nextPosition);
  }

  function sendChatMessage(event) {
    event.preventDefault();

    const body = chatInput.trim();

    if (!body || !guest) {
      return;
    }

    socket?.emit("chat:send", {
      body,
      senderName: guest.displayName
    });

    setChatInput("");
  }

  function addTodo(event) {
    event.preventDefault();

    const text = todoInput.trim();

    if (!text) {
      return;
    }

    setTodos((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        editing: false
      }
    ]);

    setTodoInput("");
  }

  function toggleTodo(todoId) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  function editTodo(todoId, text) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === todoId ? { ...todo, text } : todo
      )
    );
  }

  function setTodoEditing(todoId, editing) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === todoId ? { ...todo, editing } : todo
      )
    );
  }

  function deleteTodo(todoId) {
    setTodos((current) => current.filter((todo) => todo.id !== todoId));
  }

  /* GUEST ROOM */
  if (guest) {
    const onlinePlayers = [
      {
      id: "self",
      displayName: guest.displayName,
      avatarUrl: guest.avatarUrl,
      avatarColor: guest.avatarColor,
      pomodoro: {
        mode: timerMode,
        remainingSeconds,
        running: timerRunning
      }
      },
      ...remotePlayers
    ];
    return (
      <main className="study-room-page">
        <section className="study-room">
          <header className="room-header">
            <div>
              <p className="eyebrow">Focus Room</p>
              <h1>Study Room</h1>
            </div>

            <div className="guest-badge">
              <div className="avatar small-avatar" style={{ backgroundColor: guest.avatarColor }}>
                {guest.avatarUrl ? (
                  <img src={guest.avatarUrl} alt={`${guest.displayName} avatar`} />
                ) : (
                  <span>{guest.displayName[0].toUpperCase()}</span>
                )}
              </div>
              <span>{guest.displayName}</span>
            </div>
          </header>

          <div className="room-stage" onClick={moveAvatar}>
            <div className="avatar player-avatar" style={{ backgroundColor: guest.avatarColor, left: `${avatarPosition.x}px`, top: `${avatarPosition.y}px` }}>
              {guest.avatarUrl ? (
                <img src={guest.avatarUrl} alt={`${guest.displayName} avatar`} />
              ) : (
                <span>{guest.displayName[0].toUpperCase()}</span>
              )}
            </div>

            {remotePlayers.map((player) => (
              <div className="avatar player-avatar remote-avatar" key={player.id} style={{ backgroundColor: player.avatarColor, left: `${player.position.x}px`, top: `${player.position.y}px` }}>
                {player.avatarUrl ? (
                  <img src={player.avatarUrl} alt={`${player.displayName} avatar`} />
                ) : (
                  <span>{player.displayName[0].toUpperCase()}</span>
                )}
              </div>
            ))}

            <p className="stage-note">Main study room placeholder</p>
          </div>
        </section>

        <aside className="tool-panel">
          <section className="online-list">
            <h2>Tools</h2>
          </section>

          <button type="button" onClick={() => setChatOpen((current) => !current)}>
            Chat
          </button>
          <button type="button" onClick={() => setPomodoroOpen((current) => !current)}>
            Pomodoro
          </button>
          <button type="button" onClick={() => setTodoOpen((current) => !current)}>
            To-Do List
          </button>
          <button type="button">Notepad</button>

          <section className="online-list">
            <h2>Online</h2>

            {onlinePlayers.map((player) => (
              <div className="online-player" key={player.id}>
                <div className="avatar list-avatar" style={{ backgroundColor: player.avatarColor }}>
                  {player.avatarUrl ? (
                    <img src={player.avatarUrl} alt={`${player.displayName} avatar`} />
                  ) : (
                    <span>{player.displayName[0].toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <span>{player.displayName}</span>
                  <button
                    className="status-button"
                    disabled={!player.pomodoro || player.pomodoro.mode === "idle"}
                    onClick={() => copyPomodoro(player.pomodoro)}
                    type="button"
                  >
                    {formatPomodoroStatus(player.pomodoro)}
                  </button>
                </div>
              </div>
            ))}
          </section>


        </aside>
        
        {chatOpen && (
          <section className="floating-chat">
            <header className="chat-header">
              <h2>Room Chat</h2>
              <button type="button" onClick={() => setChatOpen(false)}>x</button>
            </header>

            <div className="chat-messages">
              {chatMessages.map((message) => (
                <p className="chat-line" key={message.id}>
                  <strong>{message.senderName}:</strong> {message.body}
                </p>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-form" onSubmit={sendChatMessage}>
              <input
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Type a message"
                value={chatInput}
              />
              <button type="submit">Send</button>
            </form>
          </section>
        )}

        {pomodoroOpen && (
          <section className="floating-pomodoro">
            <header className="chat-header">
              <h2>Pomodoro</h2>
              <button type="button" onClick={() => setPomodoroOpen(false)}>x</button>
            </header>

            <p className="timer-mode">{timerMode === "focus" ? "Focus" : "Break"}</p>
            <p className="timer-display">{formatTime(remainingSeconds)}</p>

            <div className="timer-controls">
              <button type="button" onClick={() => setTimerRunning((current) => !current)}>
                {timerRunning ? "Pause" : "Start"}
              </button>
              <button type="button" onClick={skipTimer}>Skip</button>
              <button type="button" onClick={resetTimer}>Reset</button>
            </div>

            <label htmlFor="focusMinutes">Focus minutes</label>
            <input
              id="focusMinutes"
              min="1"
              onChange={setFocusLength}
              type="number"
              value={focusMinutes}
            />

            <label htmlFor="breakMinutes">Break minutes</label>
            <input
              id="breakMinutes"
              min="1"
              onChange={setBreakLength}
              type="number"
              value={breakMinutes}
            />
          </section>
        )}

        {todoOpen && (
          <section className="floating-todo">
            <header className="chat-header">
              <h2>To-Do List</h2>
              <button type="button" onClick={() => setTodoOpen(false)}>x</button>
            </header>

            <form className="todo-form" onSubmit={addTodo}>
              <input
                onChange={(event) => setTodoInput(event.target.value)}
                placeholder="Add a task"
                value={todoInput}
              />
              <button type="submit">Add</button>
            </form>

            <div className="todo-list">
              {todos.length === 0 ? (
                <p className="empty-todos">No todos yet</p>
              ) : (
                todos.map((todo) => (
                  <div className="todo-item" key={todo.id}>
                    <input
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      type="checkbox"
                    />

                    {todo.editing ? (
                      <input
                        onBlur={() => setTodoEditing(todo.id, false)}
                        onChange={(event) => editTodo(todo.id, event.target.value)}
                        value={todo.text}
                      />
                    ) : (
                      <span className={todo.completed ? "todo-completed" : ""}>
                        {todo.text}
                      </span>
                    )}

                    <button type="button" onClick={() => setTodoEditing(todo.id, !todo.editing)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => deleteTodo(todo.id)}>
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </main>
    );
  }


  /* GUEST CARD */
  return (
    <main className="app">

      <form className="guest-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Focus Room</p>
        <h1>Enter as guest</h1>
        <p className="guest-copy">
          Choose a display name, or leave it blank to get one automatically.
        </p>

        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          maxLength={24}
          onChange={(event) => setNameInput(event.target.value)}
          placeholder="Example: Ashley"
          value={nameInput}
        />

        <label htmlFor="avatarUrl">Avatar image URL</label>
        <input
          id="avatarUrl"
          onChange={(event) => setAvatarUrl(event.target.value)}
          placeholder="Optional image link"
          value={avatarUrl}
        />

        <label htmlFor="avatarColor">Avatar color</label>
        <input
          id="avatarColor"
          onChange={(event) => setAvatarColor(event.target.value)}
          type="color"
          value={avatarColor}
        />

        <button type="submit">Enter room</button>
      </form>
    </main>
  );
}

export default App;
