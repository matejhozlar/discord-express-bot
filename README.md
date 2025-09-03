# Discord + Express Bot Template

A ready-to-publish npm package template for a Discord bot that also runs an Express web server. Built for Node 18+ and Discord.js v14.

## Features

- Slash-command framework with auto-loader (`/ping` included)
- Express server with health and root routes
- `.env` support with safe defaults
- Graceful shutdown
- Dev workflow with `nodemon`
- Command registration script (guild-scoped for fast iteration)

## Prerequisites

- Node.js 18.17+ (required for Discord.js v14)
- npm 9+ (comes with Node)
- A Discord application and bot token ([guide](https://discord.com/developers/docs/getting-started))

## Creating a Discord bot

1. Create a new application at https://discord.com/developers/applications
2. Add a bot user under the **Bot** tab
3. Copy the **Bot Token** into your `.env`
4. Copy the **Application (Client) ID** into your `.env`
5. Get your **Guild ID** by enabling Developer Mode in Discord → right click your server → "Copy Server ID"

## Quick start

1. **Clone & install**

```bash
npm install
```

2. **Configure environment**
   Copy `.env.example` to `.env` and fill in your values:

```
DISCORD_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-application-client-id
DISCORD_GUILD_ID=your-dev-guild-id
PORT=3000
NODE_ENV=development
```

3. **Register commands (guild)**

```bash
npm run register:commands
```

4. **Run the bot + server**

```bash
npm run dev
# or
npm start
```

Visit http://localhost:3000 to see the web server.

## Project structure

```
.
├── scripts/
│   └── register-commands.js
├── src/
│   ├── bot.js
│   ├── commands/
│   │   └── ping.js
│   ├── index.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Deploy notes

- Update `register-commands.js` to use global commands once stable (can take up to 1h to propagate).
- Keep your token secret. Never commit `.env`.
- Add process manager (e.g. PM2) or containerize for production. A simple Dockerfile is included.

## License

MIT
