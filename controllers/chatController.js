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
    const Newchat = await ChatModel.findOne({
      where: {
        id: chat.id,
      },
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
        },
      ],
    });

    return res.status(200).json(Newchat);
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
    await ChatModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    return res
      .status(200)
      .json({ status: "Success", message: "Chat deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: error.message });
  }
};

exports.imageUpload = (req, res) => {
  if (req.file) {
    return res.json({ url: req.file.filename });
  }
  return res.status(500).json({ message: "No image uploaded" });
};
