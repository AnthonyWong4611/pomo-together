import { useState } from "react";

const AVATAR_COLORS = ["#4f8cff", "#f97316", "#22c55e", "#ec4899", "#a855f7"];

export function GuestEntry({ onEnter }) {
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const displayName = name.trim();

    if (!displayName) {
      setError("Pick a display name first.");
      return;
    }

    onEnter({
      displayName,
      avatarUrl: avatarUrl.trim(),
      color,
      position: { x: 220, y: 180 }
    });
  }

  return (
    <main className="entry-page">
      <form className="entry-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Focus Room</p>
        <h1>Join a study room</h1>
        <p className="entry-copy">
          Enter as a guest, choose how you appear, and start focusing with other people.
        </p>

        <label>
          Display name
          <input
            value={name}
            maxLength={24}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="ex: theo"
          />
        </label>

        <label>
          Avatar image URL
          <input
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="Optional"
          />
        </label>

        <div className="color-row" aria-label="Avatar color options">
          {AVATAR_COLORS.map((option) => (
            <button
              aria-label={`Choose ${option}`}
              className={`color-dot ${color === option ? "selected" : ""}`}
              key={option}
              onClick={() => setColor(option)}
              style={{ backgroundColor: option }}
              type="button"
            />
          ))}
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        <button className="primary-button" type="submit">
          Enter Room
        </button>
      </form>
    </main>
  );
}
