const express = require("express");
const http = require("http");
const cors = require("cors");
const { userJoin, getCurrentUser, userLeaves } = require("./utils/party-users");
const { formatMessage } = require("./utils/format-message");
const dotenv = require("dotenv");

dotenv.config();

const mainPort = process.env.PORT;
const app = express();
app.use(cors());
const httpServer = http.createServer(express());
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
    methods: ["GET", "POST"],
  },
  connectTimeout: 60000,
});

const shoutPartyNameSpace = io.of("/live-party");

shoutPartyNameSpace.on("connection", async (socket) => {
  // connect to the particular shout party room
  socket.on(
    "joinParty",
    async ({ username, party_name, party_id, user_id, image_url }) => {
      // add new user info in the Redis cache, and save

      const { user, party_users } = userJoin(
        socket.id,
        user_id,
        username,
        party_name,
        image_url,
        party_id
      );
      // join user to the party room

      socket.join(user.party_id);

      // Welcome a user to room  message

      socket.emit(
        "welcome",
        formatMessage({
          image_url: user.image_url,
          username: user.username,
          message: `Welcome to ${user.party_name} `,
          type: "user action",
          party_users,
        })
      );

      // Broadcast user joined message to all users in the party room

      socket.broadcast.to(user.party_id).emit(
        "joinedParty",
        formatMessage({
          image_url: user.image_url,
          username: user.username,
          message: `${user.username.toLowerCase()} joined`,
          type: "user action",
          party_users,
        })
      );
    }
  );
  // Emit Like feeds to the user's party room
  socket.on("like", async ({ party_id }) => {
    // fetch socket id of user chatting from the cache
    shoutPartyNameSpace.to(party_id).emit("like", { type: "reaction" });
  });

  // Broadcast a users message to all users in the party room
  socket.on("chat", async ({ message, mentions }) => {
    // fetch socket id of user chatting from the cache
    const user = getCurrentUser(socket.id);

    shoutPartyNameSpace.to(user.party_id).emit(
      "message",
      formatMessage({
        image_url: user.image_url,
        username: user.username,
        message,
        type: "chat",
        mentions,
      })
    );
  });

  // Broadcast user left the party message
  socket.on("disconnect", async () => {
    // remove user from the cache memory
    const { party_users, user } = userLeaves(socket.id);
    console.log(user, party_users);
    if (user.user_id) {
      socket.broadcast.to(user.party_id).emit(
        "message",
        formatMessage({
          image_url: user.image_url,
          username: user.username,
          message: `${user.username} left the party`,
          party_users,
          type: "user action",
        })
      );
    }
  });
});

app.all("*", (req, res) =>
  res.status(404).send({
    status: "error",
    message: "Route does not exists!",
  })
);

httpServer.listen(mainPort, () =>
  console.log(`Welcome, listening on ${mainPort}`)
);
