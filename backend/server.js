import connectDB from "./src/config/db.config.js";
import app from "./src/app.js";

const port = process.env.PORT || 3000;

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...", { stack: err.stack || err });
  process.exit(1);
});

await connectDB()

const server = app.listen(port, () => console.log(`✅ Server running on port ${port}`));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...", { stack: err.stack || err });
  server.close(() => {
    process.exit(1);
  });
});