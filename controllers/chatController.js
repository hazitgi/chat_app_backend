const models = require("../models");

const ChatModel = models.Chat;
const UserModel = models.User;
const MessageModel = models.Message;
const ChatUserModel = models.ChatUser;
const { Op } = require("sequelize");
const { sequelize } = require("../models");

exports.index = async (req, res) => {
  const user = await UserModel.findOne({
    where: {
      id: req.user.id,
    },
    include: [
      {
        model: ChatModel,
        include: [
          {
            model: UserModel,
            where: {
              [Op.not]: {
                id: req.user.id,
              },
            },
          },
          {
            model: MessageModel,
            include: [
              {
                model: UserModel,
              },
            ],
            limit: 20,
            order: [["id", "DESC"]],
          },
        ],
      },
    ],
  });
  return res.status(200).json(user.Chats);
};

exports.create = async (req, res) => {
  const { partnerId } = req.body;
  const t = await sequelize.transaction();
  try {
    const user = await UserModel.findOne({
      where: {
        id: req.user.id,
      },
      include: [
        {
          model: ChatModel,
          where: { type: "dual" },
          include: [
            {
              model: ChatUserModel,
              where: { userId: partnerId },
            },
          ],
        },
      ],
    });

    if (user && user?.Chats.length > 0)
      return res.status(403).json({
        status: "Error",
        message: "Chat with this user already exisits!",
      });

    const chat = await ChatModel.create({ type: "dual" }, { transaction: t });
    await ChatUserModel.bulkCreate(
      [
        {
          chatId: chat.id,
          userId: req.user.id,
        },
        {
          chatId: chat.id,
          userId: partnerId,
        },
      ],
      { transaction: t }
    );

    await t.commit();
    // const Newchat = await ChatModel.findOne({
    //   where: {
    //     id: chat.id,
    //   },
    //   include: [
    //     {
    //       model: UserModel,
    //       where: {
    //         [Op.not]: {
    //           id: req.user.id,
    //         },
    //       },
    //     },
    //     {
    //       model: MessageModel,
    //     },
    //   ],
    // });

    const creator = await UserModel.findOne({ where: { id: req.user.id } });

    const partner = await UserModel.findOne({ where: { id: partnerId } });

    const forCreate = {
      id: chat.id,
      type: "dual",
      Users: [partner],
      Messages: [],
    };
    const forReceeiver = {
      id: chat.id,
      type: "dual",
      Users: [creator],
      Messages: [],
    };

    return res.status(200).json([forCreate, forReceeiver]);
  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.messages = async (req, res) => {
  const limit = req.body.limit || 10;
  const page = req.query.page || 1;
  const offset = page > 1 ? page * limit : 0;

  const messages = await MessageModel.findAndCountAll({
    where: {
      chatId: req.query.id,
    },
    include: [
      {
        model: UserModel,
      },
    ],
    limit,
    offset,
    order: [["id", "DESC"]],
  });
  const totalPages = Math.ceil(messages.count / limit);

  if (page > totalPages) {
    return res.json({ data: { messages: [] } });
  }

  const results = {
    messages: messages.rows,
    pagination: {
      page,
      totalPages,
    },
  };

  return res.json(results);
};

exports.deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const chat = await ChatModel.findOne({
      where: { id },

      include: [
        {
          model: UserModel,
        },
      ],
    });

    const notifyUsers = chat.Users.map((user) => user.id);

    await chat.destroy();

    return res.status(200).json({ chatId: id, notifyUsers });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.imageUpload = (req, res) => {
  if (req.file) {
    return res.send(req.file.filename);
  }
  return res.status(500).json({ message: "No image uploaded" });
};

exports.addUserToGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const chat = await ChatModel.findOne({
      where: {
        id: chatId,
      },
      include: [
        {
          model: UserModel,
        },
        {
          model: MessageModel,
          include: [
            {
              model: UserModel,
            },
          ],
          order: [["id", "DESC"]],
          limit: 20,
        },
      ],
    });

    chat.Messages.reverse();
    // check if already in the group
    // await chat.Users.forEach((user) => {
    //   if (user.id === userId) {
    //     console.log(">>>>>>>>>>>>>>>>>>");
    //     return res.status(403).json({ message: "User already in the group" });
    //   }
    // });
    for (let user of chat.Users) {
      if (user.id === userId) {
        console.log(">>>>>>>>>>>>>>>>>>");
        return res.status(403).json({ message: "User already in the group" });
      }
    }

    await ChatUserModel.create({ chatId, userId });

    const newChatter = await UserModel.findOne({ where: { id: userId } });

    console.log("chat type '>>>>>>>>>> '", chat.type);
    if (chat.type === "dual") {
      chat.type = "group";
      console.log(">>>>>>>>>>>>>>>>>>>>>>>");
      await chat.save();
    }
    return res.json({ chat, newChatter });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.leaveCurrentChat = async (req, res) => {
  try {
    console.log(req.body);
    const { chatId } = req.body;
    const chat = await ChatModel.findOne({
      where: { id: chatId },
      include: [
        {
          model: UserModel,
        },
      ],
    });
    if (chat.Users.length === 2) {
      return res
        .status(403)
        .json({ state: "Error", message: "You can't leave this chat" });
    }
    if (chat.Users.length === 3) {
      chat.type = "dual";
      await chat.save();

      await ChatUserModel.destroy({
        where: {
          chatId,
          userId: req.user.id,
        },
      });

      await MessageModel.destroy({
        where: {
          chatId,
          fromUserId: req.user.id,
        },
      });

      const notifyUsers = chat.Users.map((user) => user.id);

      return res.status(200).json({
        chatId: chat.id,
        userId: req.user.id,
        currentUserId: req.user.id,
        notifyUsers,
      });
    } else if (chat.Users.length > 3) {
      await ChatUserModel.destroy({
        where: {
          chatId,
          userId: req.user.id,
        },
      });

      await MessageModel.destroy({
        where: {
          chatId,
          fromUserId: req.user.id,
        },
      });

      const notifyUsers = chat.Users.map((user) => user.id);

      return res.status(200).json({
        chatId: chat.id,
        userId: req.user.id,
        currentUserId: req.user.id,
        notifyUsers,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "Error", message: error.message });
  }
};
