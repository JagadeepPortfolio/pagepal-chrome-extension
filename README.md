# PagePal - Chat With Any Website

A Chrome extension that adds an AI chat widget to every webpage you visit. Ask questions about the page content and get instant answers — no copy-pasting, no tab switching.

Built with [Lua Agent OS](https://heylua.ai) + Gemini 2.5 Flash for the Lua Hackathon.

## How It Works

```
You browse any website
        |
        v
Chrome Extension scrapes the page
(title, URL, meta description, first 4000 chars of body text)
        |
        v
Injects LuaPop chat widget with page content as runtimeContext
        |
        v
You ask a question in the chat
        |
        v
Lua Agent answers using Gemini 2.5 Flash, grounded in the page content
```

**No API keys on the client. No backend to manage. No tokens wasted until you actually ask a question.**

## Demo

Open `deck.html` in your browser for the full pitch deck (arrow keys to navigate).

## Setup

### 1. Install the Chrome Extension

1. Clone this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select this folder
5. Visit any website — you'll see the PagePal chat bubble at bottom-right

### 2. Deploy Your Own Lua Agent (optional)

If you want to run your own agent instead of using the default:

```bash
# Install Lua CLI
npm install -g lua-cli

# Authenticate
lua auth configure

# Initialize a project
mkdir my-agent && cd my-agent
lua init

# Update src/index.ts with the agent config (see below)
# Push and deploy
lua push all --force --auto-deploy
```

Then update the `AGENT_ID` in `inject.js` with your agent ID.

### Agent Config (src/index.ts)

```typescript
import { LuaAgent, LuaSkill } from "lua-cli";

const websiteChatSkill = new LuaSkill({
    name: 'website-chat',
    description: 'Chat about any website the user is currently viewing',
    context: `You have access to the current webpage content via runtimeContext.
Use it to answer user questions about the page they are viewing.`,
    tools: [],
});

const agent = new LuaAgent({
    name: 'pagepal',
    persona: `You are PagePal, a friendly assistant that helps users 
understand any webpage they are currently viewing. Answer based on 
the page content in runtimeContext. Be concise. Keep responses under 
200 words unless asked for detail.`,
    model: 'google/gemini-2.5-flash',
    skills: [websiteChatSkill],
});
```

## Architecture

```
chrome-extension/
  manifest.json     ← Manifest V3, injects on all URLs
  content.js        ← Injects LuaPop JS/CSS from extension bundle (bypasses CSP)
  inject.js         ← Runs in page context: scrapes text, inits LuaPop widget
  background.js     ← Right-click context menu handler
  lua-pop.umd.js    ← Bundled LuaPop widget (loaded locally, not from CDN)
  lua-pop.css       ← LuaPop styles
  deck.html         ← Hackathon pitch deck
```

### Why bundle LuaPop locally?

Most websites have a Content Security Policy (CSP) that blocks loading scripts from unknown CDNs. By bundling `lua-pop.umd.js` inside the extension and loading it via `chrome-extension://` URLs, we bypass CSP restrictions entirely.

### What gets scraped (zero AI, zero cost)

| Data | Source | Method |
|------|--------|--------|
| Page URL | `window.location.href` | Browser API |
| Page Title | `document.title` | Browser API |
| Meta Description | `<meta name="description">` | DOM query |
| Body Text | `document.body.innerText` | DOM access, truncated to 4000 chars |

All scraping is pure JavaScript — no AI calls, no API requests. AI is only invoked when the user sends a chat message.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Extension | Chrome Manifest V3 |
| Chat Widget | LuaPop (Lua's embeddable chat) |
| Agent Platform | Lua Agent OS |
| LLM | Google Gemini 2.5 Flash |
| Agent Config | TypeScript + Zod |

## Future Scope

These features are built and ready — pending LuaPop webchat auth resolution:

- **Cross-Page Memory** — Highlight text, save it, search across all saved snippets with vector search (Lua Data API)
- **Action from Page** — "Add this event to my calendar" using Lua's 250+ integrations
- **Page Change Alerts** — Monitor pages via webhooks + scheduled jobs
- **Multi-Channel** — Same agent on WhatsApp, Slack, email via Lua Channels

## License

MIT
