import dotenv from "dotenv";

import app from "./app/app.js";

dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, (req, res) => {
  console.log(`Express app listening on http://localhost:${PORT}`);
});
