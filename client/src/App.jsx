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

  function handleSubmit(event) {
    event.preventDefault();

    const displayName = nameInput.trim() || `Guest ${guestCount}`;


    setGuest({
      displayName
    });
  }

  if (guest) {
    return (
      <main className="app">
        <section className="room">
          <p className="eyebrow">Focus Room</p>
          <h1>Welcome, {guest.displayName}</h1>
          <p>You are now in the study room.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <form className="guest-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Focus Room</p>
        <h1>Enter as guest</h1>
        <p>Choose a display name, or leave it blank to get one automatically.</p>

        <label htmlFor="displayName">Display name</label>
        <input
          id="displayName"
          maxLength={24}
          onChange={(event) => setNameInput(event.target.value)}
          placeholder="Example: Ashley"
          value={nameInput}
        />

        <button type="submit">Enter room</button>
      </form>
    </main>
  );
}

export default App;