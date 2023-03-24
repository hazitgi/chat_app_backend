const socket = require("socket.io");
const messageModel = require("../models").Message;
const { sequelize } = require("../models");
const users = new Map();
const userSockets = new Map();

exports.socketServer = (server) => {
  const io = socket(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", async (user) => {
      let sockets = [];
      if (users.has(user.id)) {
        const exisitingUser = users.get(user.id);
        exisitingUser.sockets = [...exisitingUser.sockets, ...[socket.id]];
        users.set(user.id, exisitingUser);
        sockets = [...exisitingUser.sockets, ...[socket.id]];
        userSockets.set(socket.id, user.id);
      } else {
        users.set(user.id, { id: user.id, sockets: [socket.id] });
        sockets.push(socket.id);
        userSockets.set(socket.id, user.id);
      }
      const onlineFriends = []; //ids
      const chatters = await getChattters(user.id); //query
      // console.log(chatters, "chatters");

      //   notify his friends that use is now online

      for (let i = 0; i < chatters.length; i++) {
        if (users.has(chatters[i])) {
          const chatter = users.get(chatters[i]);
          chatter.sockets.forEach((socket) => {
            try {
              io.to(socket).emit("online", user);
            } catch (err) {}
          });
          onlineFriends.push(chatter.id);
        }
      }

      //   send to user sockets which of his friends are online

      sockets.forEach((socket) => {
        try {
          io.to(socket).emit("friends", onlineFriends);
        } catch (err) {}
      });

      //   console.log("new user joined", user.firstName);
      io.to(socket.id).emit("typing", "user typing.....");
    });

    socket.on("message", async (message) => {
      console.log(message, "print message");
      let sockets = [];

      // console.log(users, "print users");
      if (users.has(message.fromUser.id)) {
        sockets = users.get(message.fromUser.id).sockets;
      }

      message.toUserId.forEach((id) => {
        if (users.has(id)) {
          sockets = [...sockets, ...users.get(id).sockets];
        }
      });
      // console.log(sockets, ">>>>>>>>>> print from message");

      try {
        const msg = {
          type: message.type,
          fromUserId: message.fromUser.id,
          chatId: message.chatId,
          message: message.message,
        };
        const savedMessage = await messageModel.create(msg);
        message.User = message.fromUser;
        message.fromUserId = message.fromUser.id;
        message.message = savedMessage.message;
        message.id = savedMessage.id;

        delete message.fromUser;
        sockets.forEach((socket) => {
          io.to(socket).emit("received", message);
        });
      } catch (err) {}
    });

    socket.on("typing", async (message) => {
      console.log(message, " typing ");
      message.toUserId.forEach((id) => {
        if (users.has(id)) {
          users.get(id).sockets.forEach((socket) => {
            console.log("emitting");
            io.to(socket).emit("typing", message);
          });
        }
      });
    });

    socket.on("add-friend", (chats) => {
      try {
        let online = "offline";
        if (users.has(chats[1].Users[0].id)) {
          online = "online";
          chats[0].Users[0].status = "online";
          users.get(chats[1].Users[0].id).sockets.forEach((socket) => {
            io.to(socket).emit("new-chat", chats[0]);
          });
        }

        if (users.has(chats[0].Users[0].id)) {
          chats[1].Users[0].status = online;
          users.get(chats[0].Users[0].id).sockets.forEach((socket) => {
            io.to(socket).emit("new-chat", chats[1]);
          });
        }
      } catch (err) {}
    });
    socket.on("add-user-to-group", ({ chat, newChatter }) => {
      if (users.has(newChatter.id)) {
        newChatter.status = "online";
      }

      // old users
      chat.Users.forEach((user, index) => {
        if (users.has(user.id)) {
          chat.Users[index].status == `online`;
          users.get(user.id).sockets.forEach((socket) => {
            try {
              io.to(socket).emit("added-user-to-group", {
                chat,
                chatters: [newChatter],
              });
            } catch (err) {}
          });
        }
      });

      // send to new chatter
      if (users.has(newChatter.id)) {
        users.get(newChatter.id).sockets.forEach((socket) => {
          try {
            io.to(socket).emit("added-user-to-group", {
              chat,
              chatters: chat.Users,
            });
          } catch (err) {}
        });
      }
    });

    socket.on("disconnect", async () => {
      if (userSockets.has(socket.id)) {
        const user = users.get(userSockets.get(socket.id));
        // console.log(user);
        if (user.sockets.length > 1) {
          user.sockets = user.sockets.filter((sock) => {
            if (sock != socket.id) {
              return true;
            }

            userSockets.delete(sock);
            return false;
          });
          users.set(user.id, user);
        } else {
          // console.log("lllllllllllll oflien");
          const chatters = await getChattters(user.id);
          // console.log(chatters, "lllllllllllll oflien");
          for (let i = 0; i < chatters.length; i++) {
            if (users.has(chatters[i])) {
              users.get(chatters[i]).sockets.forEach((socket) => {
                try {
                  io.to(socket).emit("offline", user);
                } catch (err) {}
              });
            }
          }
          userSockets.delete(socket.id);
          users.delete(user.id);
        }
      }
    });
  });
};

const getChattters = async (userId) => {
  try {
    const [results, metadata] = await sequelize.query(
      `
            select "cu"."userId" from "ChatUsers" as cu
            inner join (
                select "c"."id" from "Chats" as c
                where exists(
                    select "u"."id" from "Users" as u
                    inner join "ChatUsers" on u.id = "ChatUsers"."userId"
                    where u.id = ${parseInt(
                      userId
                    )} and c.id = "ChatUsers"."chatId"
                )
            ) as cjoin on cjoin.id = "cu"."chatId"
            where "cu"."userId" != ${parseInt(userId)}
            `
    );
    return results.length > 0 ? results.map((el) => el.userId) : [];
  } catch (err) {
    console.log(err, "error in getChatter ");
    return [];
  }
};
