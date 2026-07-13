import { useState } from "react";
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
  }

function moveAvatar(event) {
  const room = event.currentTarget.getBoundingClientRect();

  // click = center of avatar, (x,y) = top left corner of avatar
  const avatarSize = 132;
  const x = event.clientX - room.left - avatarSize / 2;
  const y = event.clientY - room.top - avatarSize / 2;

  // Ensures avatar is within room
  setAvatarPosition({
    x: Math.min(Math.max(x, 0), room.width - avatarSize),
    y: Math.min(Math.max(y, 0), room.height - avatarSize)
  });
}
  
  /* GUEST ROOM */
  if (guest) {
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
            <div className="avatar player-avatar" style={{ backgroundColor: guest.avatarColor, left: avatarPosition.x, top: avatarPosition.y }}>
              {guest.avatarUrl ? (
                <img src={guest.avatarUrl} alt={`${guest.displayName} avatar`} />
              ) : (
                <span>{guest.displayName[0].toUpperCase()}</span>
              )}
            </div>
            <p className="stage-note">Main study room placeholder</p>
          </div>
        </section>

        <aside className="tool-panel">
          <button type="button">Chat</button>
          <button type="button">Pomodoro</button>
          <button type="button">To-Do List</button>
          <button type="button">Notepad</button>
        </aside>
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