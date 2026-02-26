# Promptly - Architecture and Development Guide

## Overview

Promptly is a full-stack AI workspace application that combines a live web-search-augmented language model with a structured chat interface and persistent user history. The core premise is that rather than querying a static, pre-trained model in isolation, the system first searches the live web using Tavily, injects the resulting content into the prompt as grounded context, and then passes the enriched prompt to Google Gemini for final generation. The result is delivered back to the client alongside structured metadata including source URLs, processing time, and auto-generated highlights.

The application consists of two independent services: a Node.js/Express backend (the server) and a React/Vite frontend (the client). They communicate exclusively over REST.

---

## Repository Structure

```
Promptly/
  client/         React + Vite + TypeScript frontend
  server/         Node.js + Express + TypeScript backend
  ARCHITECTURE.md this file
  README.md       Quick start guide
```

---

## Technology Stack

### Backend

| Concern        | Technology                        |
| -------------- | --------------------------------- |
| Runtime        | Node.js                           |
| Framework      | Express 4                         |
| Language       | TypeScript (compiled via ts-node) |
| Database       | MongoDB (via Mongoose)            |
| AI Model       | Google Gemini 2.5 Flash           |
| Web Search     | Tavily AI                         |
| Authentication | bcrypt + JSON Web Tokens (JWT)    |
| Realtime Chat  | Stream Chat (server SDK)          |

### Frontend

| Concern            | Technology                       |
| ------------------ | -------------------------------- |
| Build tool         | Vite                             |
| UI framework       | React 18 + TypeScript            |
| Styling            | Tailwind CSS + custom CSS tokens |
| Animations         | Framer Motion                    |
| Component library  | shadcn/ui (Radix primitives)     |
| Realtime Chat      | Stream Chat React SDK            |
| Markdown rendering | react-markdown                   |

---

## Backend Architecture

### Entry Point

`server/src/index.ts` bootstraps the application:

1. Loads environment variables via `dotenv`.
2. Calls `connectDB()` to establish a MongoDB connection.
3. Mounts three route groups on an Express app.
4. Starts listening on port 3000 (or `PORT` env variable).

### Route Groups

#### Authentication `POST /api/register`, `POST /api/login`, `GET /api/user/:userId`, `PATCH /api/user/:userId/stats`

Located in `server/src/routes/auth.ts`.

Registration flow:

1. Validate `userId` and `password` presence.
2. Check MongoDB for an existing user with the same `userId`.
3. Hash the password using `bcrypt` with a salt factor of 10.
4. Upsert the user into Stream Chat so they can use the realtime channel.
5. Persist the user record to MongoDB.
6. Issue a Stream Chat token and a signed JWT (7-day expiry).
7. Return both tokens and the user document.

Login flow:

1. Look up the user in MongoDB by `userId`.
2. Compare the submitted password against the bcrypt hash.
3. Update `lastLogin` and increment `totalSessions`.
4. Issue fresh tokens and return them alongside the user document.

#### AI Generation `POST /api/generate`, `GET /api/history/:userId`

Located in `server/src/routes/ai.ts`. This is the core generation pipeline.

Generation flow (`POST /api/generate`):

```
Client sends { prompt, includeSearch, userId }
        |
        v
 [Optional] Tavily web search
        |   Queries live web for up to 5 results
        |   Extracts title, URL, and page content per result
        |   Builds a deduplicated list of source domains
        |
        v
 Prompt augmentation
        |   If search ran: prepends context block to the user prompt
        |   If no search: passes the raw prompt directly
        |
        v
 Gemini 2.5 Flash - primary generation
        |   Generates the main response from the (possibly augmented) prompt
        |
        v
 Gemini 2.5 Flash - highlights generation
        |   Second call asking for 2-3 bullet-point takeaways from the response
        |
        v
 Metadata assembly
        |   { sources, domains, processingTime, highlights }
        |
        v
 [Conditional] History persistence
        |   If userId was provided, saves the full record to MongoDB
        |
        v
 Response: { text, metadata }
```

History retrieval (`GET /api/history/:userId`) fetches the 20 most recent records for a given user, sorted newest first.

#### Agent `POST /api/agent/start`, `POST /api/agent/message`

Located in `server/src/routes/agent.ts`. Exposes the `Agent` class from `server/src/lib/agent.ts`, which is a Stream Chat-integrated conversational bot.

Agent initialization creates or upserts an `ai-agent` user in Stream and adds it as a member to the specified channel. Message processing applies a heuristic: if the message text contains the word "search", Tavily is invoked and the results are injected as context before the Gemini prompt is assembled. The agent then posts its response directly to the Stream channel using the server-side SDK.

### Library Modules

`server/src/lib/gemini.ts` — initialises the `GoogleGenerativeAI` client with the `GEMINI_API_KEY` and exports a configured `model` instance pointed at `gemini-2.5-flash`.

`server/src/lib/tavily.ts` — exports `searchWeb(query)`, which creates a Tavily client on each call and performs a basic-depth search returning up to 5 results.

`server/src/lib/db.ts` — exports `connectDB()`, which establishes a Mongoose connection to the MongoDB URI from the environment.

`server/src/lib/stream.ts` — exports a singleton `streamClient` using the Stream server-side SDK, used by both authentication and the Agent.

`server/src/lib/agent.ts` — contains the `Agent` class that encapsulates channel interaction and message processing logic as described above.

### Mongoose Models

**User** (`server/src/models/User.ts`)

| Field                  | Type   | Notes                            |
| ---------------------- | ------ | -------------------------------- |
| userId                 | String | Unique identifier chosen by user |
| name                   | String | Display name                     |
| password               | String | bcrypt hash                      |
| avatar                 | String | Optional URL                     |
| lastLogin              | Date   | Updated on each login            |
| metadata.totalSessions | Number | Incremented on login             |
| metadata.totalChannels | Number | Incremented via PATCH endpoint   |
| createdAt / updatedAt  | Date   | Auto-managed by Mongoose         |

**History** (`server/src/models/History.ts`)

| Field                   | Type   | Notes                            |
| ----------------------- | ------ | -------------------------------- |
| userId                  | String | Indexed for fast per-user lookup |
| prompt                  | String | The original user prompt         |
| response                | String | The full Gemini response         |
| metadata.sources        | Array  | `{ title, url }` per web result  |
| metadata.domains        | Array  | Unique hostnames from sources    |
| metadata.processingTime | Number | Seconds (float), e.g. 3.42       |
| metadata.highlights     | Array  | Up to 3 bullet-point strings     |
| createdAt               | Date   | Auto-managed by Mongoose         |

**ChatSession** (`server/src/models/ChatSession.ts`) — stored but currently used as a supplementary model for session tracking.

---

## Frontend Architecture

### Entry Points

`client/src/main.tsx` — mounts the React tree into `#root`.  
`client/src/App.tsx` — the root component that owns all global state and controls which top-level view is rendered.

### Global State in App.tsx

| State variable    | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `client`          | The StreamChat instance. `null` means the user is logged out  |
| `isConnecting`    | Whether an auth request is in flight                          |
| `userProfile`     | The MongoDB user document returned after login                |
| `lastMetadata`    | The metadata from the most recent AI generation               |
| `aiStateKey`      | Integer bumped to force-remount `AIAssistantPanel`            |
| `selectedHistory` | A history item selected from the sidebar; pre-fills the panel |

On mount, `App.tsx` reads `promptly_token` and `promptly_userId` from `localStorage` and attempts to restore the session silently.

### View Routing

There is no client-side router. View selection is conditional:

- If `client` is `null` (not authenticated), render `LandingPage`.
- If `client` is set, render the authenticated workspace wrapped in Stream's `Chat` context provider.

### Authenticated Workspace Layout

`WorkspaceLayout` divides the screen into three named slots:

| Slot        | Component          | Responsibility                                             |
| ----------- | ------------------ | ---------------------------------------------------------- |
| `sidebar`   | `Sidebar`          | Conversation history list, new conversation button, logout |
| `main`      | `AIAssistantPanel` | Prompt input and response display                          |
| `assistant` | `ChatInterface`    | Metadata display (sources, highlights, processing time)    |

### Component Responsibilities

**LandingPage** — marketing page with animated hero section, feature cards, auth modal. Calls `onLogin` passed from `App` on form submission.

**AIAssistantPanel** — the primary interaction surface. Contains:

- Quick-prompt template cards (visible before any response exists).
- A fixed-to-bottom input area: a label, the "Deep Discovery" (web search) toggle, a `Textarea` for the prompt, and the Generate button.
- A scrollable results area showing the Gemini response rendered as Markdown.
- A "New Synthesis" button to clear and reset.
- On generation, calls `POST /api/generate` and propagates the returned metadata upward via `onMetadata`.

**ChatInterface** — receives `lastMetadata` as a prop and displays the structured metadata returned per generation: web sources, domains searched, processing time, and highlights.

**Sidebar** — fetches `GET /api/history/:userId` on mount and when a new conversation starts. Renders history items as a list. Selecting an item calls `onSelectHistory` in App, which sets `selectedHistory` and bumps `aiStateKey` to remount the panel with the historical data pre-loaded.

**ThemeProvider / ThemeToggle** — wraps the app in a dark/light theme context backed by `localStorage`.

**AgentHandler** — a lightweight component that wires up the Stream Chat agent endpoint for the realtime channel.

---

## Complete Agentic Workflow

Below is the end-to-end sequence for a typical AI generation request with web search enabled.

```
User types a prompt and clicks "Begin Generation"
        |
        v
AIAssistantPanel calls POST /api/generate
  Body: { prompt, includeSearch: true, userId }
        |
        v
[Server] routes/ai.ts receives the request
        |
        v
searchWeb(prompt) is called via lib/tavily.ts
  Tavily API is queried with searchDepth: "basic", maxResults: 5
  Returns: list of { title, url, content } objects
        |
        v
Context block is assembled from Tavily results
  Format: "Source [N]: <url>\nContent: <snippet>"
  Final prompt = context block + original user question
        |
        v
model.generateContent(finalPrompt)
  Google Gemini 2.5 Flash produces the main response
        |
        v
model.generateContent(highlightPrompt)
  Second Gemini call derives 2-3 key takeaways from the response
        |
        v
Metadata object is assembled:
  sources:        [{ title, url }, ...]
  domains:        ["example.com", ...]      (deduplicated hostnames)
  processingTime: 3.42                      (wall-clock seconds)
  highlights:     ["Point one", ...]
        |
        v
History.create({ userId, prompt, response, metadata })
  Saved to MongoDB for future retrieval
        |
        v
Response: { text, metadata } sent to client
        |
        v
AIAssistantPanel renders Markdown response in scrollable area
onMetadata(metadata) lifts state up to App.tsx
        |
        v
ChatInterface receives metadata via lastMetadata prop
  Renders: source cards, domain list, processing time, highlights
        |
        v
Sidebar auto-refreshes history list on next "New Conversation" click
```

### With Web Search Disabled (Deep Discovery off)

Steps 3 and 4 are skipped entirely. The raw user prompt is sent to Gemini without any injected context. All other steps remain the same.

### Agent Channel Flow (Stream Chat path)

```
POST /api/agent/start  ->  Agent.initialize()
  Stream: upsert "ai-agent" user, add to channel as member

User sends a message in the Stream channel
POST /api/agent/message  ->  Agent.processMessage(text)
  If text contains "search": searchWeb(text) runs, context is built
  Prompt is assembled with context + user message
  Gemini generates a conversational response
  channel.sendMessage() posts the reply back to Stream as "ai-agent"
```

---

## Authentication and Session Flow

```
User submits register or login form on LandingPage
        |
        v
App.tsx calls POST /api/register or POST /api/login
        |
        v
Server validates credentials
  Register: bcrypt.hash(password, 10), save User to MongoDB
  Login:    bcrypt.compare(password, user.password)
        |
        v
Server issues two tokens:
  streamToken - signed by Stream, used with StreamChat.connectUser()
  jwtToken    - signed with JWT_SECRET, available for future protected routes
        |
        v
Client receives { token, jwt, user }
  streamToken  -> localStorage as "promptly_token"
  jwtToken     -> localStorage as "promptly_jwt"
  userId       -> localStorage as "promptly_userId"
  StreamChat.getInstance(apiKey).connectUser({ id, name }, streamToken)
        |
        v
App.tsx sets client state -> workspace is rendered
        |
        v
On F5 / revisit: useEffect restores session from localStorage
  Reconnects StreamChat silently, fetches user profile
```

Logout disconnects the StreamChat user, clears localStorage, and sets `client` to null, returning to the LandingPage.

---

## Environment Variables

### Server (`server/.env`)

| Variable            | Purpose                         |
| ------------------- | ------------------------------- |
| `GEMINI_API_KEY`    | Google AI Studio API key        |
| `TAVILY_API_KEY`    | Tavily search API key           |
| `MONGODB_URI`       | MongoDB connection string       |
| `JWT_SECRET`        | Secret for signing JWT tokens   |
| `STREAM_API_KEY`    | Stream Chat application API key |
| `STREAM_API_SECRET` | Stream Chat application secret  |
| `PORT`              | HTTP port (defaults to 3000)    |

### Client (`client/.env`)

| Variable              | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| `VITE_BACKEND_URL`    | Full base URL of the server (e.g. http://localhost:3000) |
| `VITE_STREAM_API_KEY` | Stream Chat API key (public, frontend-safe)              |

---

## Development Setup

### Start the backend

```bash
cd server
npm install
npm run dev
```

The server compiles TypeScript on the fly via `ts-node` and listens on port 3000.

### Start the frontend

```bash
cd client
npm install
npm run dev
```

Vite starts a dev server with HMR on port 5173.

Both services must run simultaneously for the application to function.

---

## Data Flow Diagram

```
Browser (React + Vite)
  |
  |  REST (fetch)
  v
Express Server (Node.js)
  |          |           |
  v          v           v
MongoDB   Gemini AI   Tavily AI
(users,   (generation, (live web
history)   highlights)  search)
  |
  v
Stream Chat (realtime, agent channel)
```

---

## Key Design Decisions

**Dual Gemini call per request** — a second, lighter call is made after primary generation to extract structured highlights. This keeps the main generation prompt clean and decoupled from summarization concerns.

**Metadata as first-class output** — rather than discarding Web search provenance, sources and domains are tracked and persisted, then surfaced to the user in the right-panel `ChatInterface`. This makes the AI's reasoning partially auditable.

**aiStateKey remount pattern** — instead of managing complex reset logic inside `AIAssistantPanel`, `App.tsx` increments an integer key passed as React's `key` prop. This forces a clean unmount/remount, resetting all local state naturally.

**No client-side router** — the application has only two views (landing and workspace). A conditional render in `App.tsx` is sufficient and avoids introducing routing dependencies.

**Fixed prompt input area** — the input section sits outside the scrollable content container in `AIAssistantPanel`, anchored at the bottom of the flex column. This matches the interaction model of well-known chat interfaces and ensures the input is always accessible regardless of response length.

**bcrypt + JWT alongside Stream tokens** — the Stream token alone is sufficient for realtime chat but carries no application-level claims. A separate JWT is issued for potential future use with protected API routes without depending on Stream's infrastructure.
