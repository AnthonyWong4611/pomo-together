# Focus Room

Focus Room is a realtime multiplayer study room where users can join as guests, move around a shared room, chat, start pomodoro sessions, and manage study tasks.

## MVP Features

- Guest entry with display name and avatar image or fallback color
- Shared study room with live player movement
- Online player list
- Room chat
- Pomodoro timer with visible study/break status
- Joinable pomodoro sessions
- Personal todo panel

## Tech Stack

- React + Vite frontend
- Node.js + Express backend
- Socket.IO for realtime room state
- Local storage for MVP todo persistence

## Local Setup

Install dependencies:

```bash
npm install
```

Run frontend and backend together:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:4000`

## Roadmap

- [ ] Scaffold frontend app
- [ ] Scaffold Socket.IO backend
- [ ] Add guest entry screen
- [ ] Add avatar image and fallback color
- [ ] Create study room layout
- [ ] Add local avatar movement
- [ ] Add realtime room presence
- [ ] Sync player movement
- [ ] Render other online players
- [ ] Add online player list
- [ ] Add room chat
- [ ] Add pomodoro timer
- [ ] Broadcast pomodoro status
- [ ] Show timer/status in player list
- [ ] Add joinable pomodoro sessions
- [ ] Add todo panel
- [ ] Persist todos locally
- [ ] Add responsive layout polish
- [ ] Add screenshots/demo GIF

## Known MVP Limits

- Guest profiles are temporary.
- Todos persist only in the current browser.
- Pomodoro joining copies the current timer state, then runs independently.
