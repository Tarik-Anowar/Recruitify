const express = require("express");
const app = express();
const http = require("http");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const socketServer = require("./socketServer");
const errorMiddleware = require("./middleware/error");
const dotenv = require("dotenv");
require("dotenv").config({ path: "./secret.env" });
const connectDatabase = require("./database/database");
const { redisConnection } = require("./socketHandlers/pubSub");
const User = require("./models/userModel");
const Skill = require("./models/skillModel");
// GraphQL imports
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { isAuthenticatedUserGraphQl } = require("./middleware/auth");

// Middleware Setup
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://recruitingwebsite.online",
      "https://www.recruitingwebsite.online",
    ],
    credentials: true,
  })
);

// Route Imports
app.get("/", (req, res) => {
  res.send("Recruitify Api is working fine");
});
const user = require("./routes/userRoute");
const group = require("./routes/groupRoutes");
const friendInvitationRoutes = require("./routes/friendInvitationRoutes");
const posts = require("./routes/postRouter");
const jobs = require("./routes/jobsRouter");
const profile = require("./routes/profileRouter");
const skills = require("./routes/skillsRouter");

app.use("/api/v1", user);
app.use("/api/v1", group);
app.use("/api/friend-invitation", friendInvitationRoutes);
app.use("/api/posts", posts);
app.use("/api/jobs", jobs);
app.use("/api/profile", profile);
app.use("/api/skills", skills);

// Static files (optional)
// app.use(express.static(path.join(__dirname, "./frontend/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "./frontend/build/index.html"));
// });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error Middleware
app.use(errorMiddleware);

// Connecting to the database
connectDatabase();
redisConnection();

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Uncaught Exception`);
  process.exit(1);
});

// ApolloServer Setup (GraphQL)
async function startApolloServer() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  app.use(
    "/graphql",
    isAuthenticatedUserGraphQl,
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        user: req.user,
      }),
    })
  );
}

// Initialize Apollo Server
startApolloServer();

// Creating HTTP Server
const server = http.createServer(app);

// Register Socket.IO server
socketServer.registerSocketServer(server);

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});

// Unhandled Promise Rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
