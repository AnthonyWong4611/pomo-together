import { useState } from "react";
import { GuestEntry } from "./screens/GuestEntry.jsx";
import { StudyRoom } from "./screens/StudyRoom.jsx";

export default function App() {
  const [guest, setGuest] = useState(null);

  return guest ? (
    <StudyRoom guest={guest} onLeave={() => setGuest(null)} />
  ) : (
    <GuestEntry onEnter={setGuest} />
  );
}
