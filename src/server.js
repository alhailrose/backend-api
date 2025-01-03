import { createApp } from "./config/app.js";

const app = createApp(); // Create app instance
const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
