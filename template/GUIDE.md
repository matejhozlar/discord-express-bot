
# Bot Expansion Guide

This guide explains how to expand your Discord + Express bot template: add new commands, build a frontend, connect to APIs, and prepare for production.

---

## 0) Prerequisites recap
- Node.js 18.17+  
- A Discord app with a **bot token**, **client ID**, and a dev **guild ID**.  
- Template installed and working (`/ping` replies, web at `http://localhost:3000`).

---

## 1) How the command system works (recap)
- Each command file lives in `src/commands/`.
- It **exports** `{ data, execute }`, where:
  - `data`: a `SlashCommandBuilder` defining the command schema.
  - `execute(interaction)`: the handler.
- On startup, the bot **auto-loads** all `*.js` in `src/commands/`.
- You register (or refresh) commands via:
  ```bash
  npm run register:commands
  ```
  (Guild-scoped for fast iteration. Switch to global when you’re stable.)

---

## 2) Add a new command (basic)

### Example: `/echo` with a required `text` option
`src/commands/echo.js`
```js
import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Echo back your message")
    .addStringOption(opt =>
      opt.setName("text")
         .setDescription("What should I say back?")
         .setRequired(true)
    ),
  async execute(interaction) {
    const text = interaction.options.getString("text");
    await interaction.reply({ content: text });
  },
};
```

1) Save the file.  
2) Run `npm run register:commands`.  
3) In Discord: `/echo text: hello`.

---

## 3) Subcommands, choices, and validation

### Subcommands
`/math add a b` and `/math multiply a b`:
```js
import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("math")
    .setDescription("Simple math")
    .addSubcommand(sub =>
      sub.setName("add")
         .setDescription("Add two numbers")
         .addIntegerOption(o => o.setName("a").setDescription("A").setRequired(true))
         .addIntegerOption(o => o.setName("b").setDescription("B").setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName("multiply")
         .setDescription("Multiply two numbers")
         .addIntegerOption(o => o.setName("a").setDescription("A").setRequired(true))
         .addIntegerOption(o => o.setName("b").setDescription("B").setRequired(true))
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const a = interaction.options.getInteger("a");
    const b = interaction.options.getInteger("b");
    const result = sub === "add" ? a + b : a * b;
    await interaction.reply(`Result: ${result}`);
  },
};
```

### Choices
```js
.addStringOption(o =>
  o.setName("color")
   .setDescription("Pick a color")
   .addChoices(
     { name: "Red", value: "red" },
     { name: "Blue", value: "blue" },
   )
)
```

---

## 4) Permissions & guild-only commands

### Require user permissions
```js
if (!interaction.memberPermissions?.has("ManageMessages")) {
  return interaction.reply({ content: "You lack permission.", ephemeral: true });
}
```

### Guild-only
```js
if (!interaction.inGuild()) {
  return interaction.reply({ content: "Use this in a server.", ephemeral: true });
}
```

---

## 5) Autocomplete, buttons, selects, modals

### Autocomplete
```js
import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search with autocomplete")
    .addStringOption(o =>
      o.setName("query")
       .setDescription("What to search")
       .setAutocomplete(true)
       .setRequired(true)
    ),
  async autocomplete(interaction) {
    const focused = interaction.options.getFocused();
    const choices = ["apple","banana","carrot","candy","candle"]
      .filter(x => x.startsWith(focused.toLowerCase()))
      .slice(0, 25);
    await interaction.respond(choices.map(c => ({ name: c, value: c })));
  },
  async execute(interaction) {
    const q = interaction.options.getString("query", true);
    await interaction.reply(`You chose: ${q}`);
  },
};
```

### Buttons
```js
import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("press").setDescription("Press a button"),
  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("press_ok")
        .setLabel("OK")
        .setStyle(ButtonStyle.Primary)
    );
    await interaction.reply({ content: "Click the button:", components: [row] });
  },
  async handleComponent(interaction) {
    if (interaction.customId === "press_ok") {
      await interaction.reply({ content: "You clicked OK!", ephemeral: true });
    }
  }
};
```

### Modals
```js
import { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("feedback").setDescription("Send feedback"),
  async execute(interaction) {
    const modal = new ModalBuilder().setCustomId("feedback_modal").setTitle("Feedback");
    const input = new TextInputBuilder()
      .setCustomId("message")
      .setLabel("Your message")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },
  async handleModal(interaction) {
    if (interaction.customId !== "feedback_modal") return;
    const msg = interaction.fields.getTextInputValue("message");
    await interaction.reply({ content: `Thanks! You said: ${msg}`, ephemeral: true });
  }
};
```

---

## 6) Error handling & cooldowns

### Cooldown helper
```js
const buckets = new Map();

export function useCooldown(userId, command, ms) {
  const key = `${userId}:${command}`;
  const now = Date.now();
  const until = buckets.get(key) ?? 0;
  if (now < until) return until - now;
  buckets.set(key, now + ms);
  return 0;
}
```

---

## 7) Organizing commands at scale
- Use subfolders, e.g. `src/commands/mod/ban.js`.  
- Recursively load commands.  
- Keep logic in `src/services/*`.

---

## 8) Global commands
```js
await rest.put(
  Routes.applicationCommands(clientId),
  { body: commands }
);
```

Global commands take up to **1 hour** to appear.

---

## 9) HTTP API routes

### Example: `/api/stats`
```js
app.get("/api/stats", (_req, res) => {
  res.json({ uptime: process.uptime(), memory: process.memoryUsage().rss });
});
```

---

## 10) Frontend dashboard

### Static HTML
`server.js`:
```js
app.use(express.static("public"));
```

`public/index.html`:
```html
<!doctype html>
<html>
  <body>
    <h1>Bot Dashboard</h1>
    <pre id="stats">Loading…</pre>
    <button id="refresh">Refresh</button>
    <script>
      async function loadStats() {
        const res = await fetch("/api/stats");
        const json = await res.json();
        document.getElementById("stats").textContent = JSON.stringify(json, null, 2);
      }
      document.getElementById("refresh").onclick = loadStats;
      loadStats();
    </script>
  </body>
</html>
```

---

## 11) Discord OAuth2 (optional)

- Use scopes: `identify`, `guilds`.  
- Flow: frontend → Discord OAuth2 → callback → issue session cookie.  
- Never expose bot token to browser.

---

## 12) Guild settings storage

```js
const store = new Map();

export function getGuildSettings(guildId) {
  return store.get(guildId) ?? { adminRoleId: null };
}
export function setGuildSettings(guildId, data) {
  store.set(guildId, { ...(store.get(guildId) ?? {}), ...data });
}
```

---

## 13) Deployment notes

- Use PM2 or Docker.  
- Global commands are slow.  
- Keep secrets in env vars.  
- Keep port open for dashboard.

---

## 14) Checklist
- [ ] Add command file to `src/commands/`.  
- [ ] Register with `npm run register:commands`.  
- [ ] Update frontend if needed.  
- [ ] Test in guild.  
- [ ] Deploy.

---
