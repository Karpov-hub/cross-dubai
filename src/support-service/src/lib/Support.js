import db from "@lib/db";
import FileProvider from "@lib/fileprovider";

async function createTicket(data, realmId, userId) {
  let filesID = [];
  let filesName = [];
  let filesSize = [];

  for (const file of data.files) {
    filesID.push(file.code);
    filesSize.push(file.size);
    filesName.push(file.name);
  }

  let cTickets = await db.ticket.findAll({
    where: { user_id: userId, realm_id: realmId }
  });

  let ticket = {
    title: data.title,
    category: data.category,
    message: data.message,
    file_id: filesID,
    file_name: filesName,
    file_size: filesSize,
    files: data.files,
    user_id: userId,
    realm_id: realmId,
    number_of_ticket: "NT" + (cTickets.length + 1),
    type: 0,
    is_user_message: data.is_user_message
  };

  let ticketId = await db.ticket.create(ticket);
  ticket.ticket_id = ticketId.id;

  await createComment(ticket, realmId, userId);

  return {
    success: true,
    ticket
  };
}

async function createComment(data, realmId, userId) {
  let filesID = [];
  let filesName = [];
  let filesSize = [];

  for (const file of data.files) {
    filesID.push(file.code);
    filesSize.push(file.size);
    filesName.push(file.name);
  }

  let comment = {
    ticket_id: data.ticket_id,
    sender: userId,
    receiver: null,
    message: data.message,
    file_id: filesID,
    file_name: filesName,
    file_size: filesSize,
    realm_id: realmId,
    is_user_message: data.is_user_message
  };

  let commentId = await db.comment.create(comment);
  comment.id = commentId.id;

  if (!data.is_user_message)
    await db.ticket.update(
      { new_message: true, mtime: new Date() },
      {
        where: { id: data.ticket_id }
      }
    );

  return {
    success: true,
    comment
  };
}

async function getTickets(data, realmId, userId) {
  const sequelize = db.Sequelize;

  let filters = {
    user_id: userId,
    realm_id: realmId
  };

  if (data.search_ticket) {
    filters.title = sequelize.where(
      sequelize.fn("LOWER", sequelize.col("title")),
      "LIKE",
      "%" + data.search_ticket + "%"
    );
  }

  const count = await db.ticket.count({
    where: filters
  });

  if (!data.start) data.start = 0;
  if (!data.limit) data.limit = 100;

  let tickets = await db.ticket.findAll({
    where: filters,
    offset: data.start,
    limit: data.limit,
    order: [["ctime", "ASC"]]
  });

  if (tickets == null) throw "NOTICKETS";

  return {
    success: true,
    count: count,
    tickets
  };
}

async function getComments(data, realmId, userId) {
  let comments = await db.comment.findAll({
    where: {
      realm_id: realmId,
      ticket_id: data.ticketId
    },
    include: [
      {
        model: db.ticket,
        attributes: ["number_of_ticket", "title"]
      }
    ]
  });

  await db.ticket.update(
    { new_message: false },
    {
      where: { id: data.ticketId }
    }
  );

  return {
    success: true,
    comments
  };
}

async function reopenTicket(data, realmId, userId) {
  const res = await db.user.update(
    { status: 0 },
    {
      where: { id: data.ticket_id, realm_id: realmId }
    }
  );
  if (res) return { success: true };
}

// 0 - all
// 1 - only new
async function getNotifications(data, realmId, userId) {
  let filter = {
    new: data.is_new,
    user_id: userId
  };

  if (filter.new == 0) delete filter.new;

  if (!data.start) data.start = 0;
  if (!data.limit) data.limit = 100;

  const count = await db.notification.count({
    where: filter
  });

  const notifications = await db.notification.findAll({
    where: filter,
    order: [["new", "ASC"]],
    offset: data.start,
    limit: data.limit
  });

  const notifications_id = notifications.map((item) => item.id).flat();

  if (data.mark_is_read) {
    await db.notification.update(
      { new: 0 },
      {
        where: { id: notifications_id }
      }
    );
  }

  return {
    success: true,
    notifications,
    count
  };
}

async function sendNotification(data, realmId, userId) {
  if (!data.message) throw "INVALIDMESSAGE";
  data.sender_id = userId;
  let res = await db.notification.create(data);

  if (!res && !res.dataValues) throw "NOTIFICATIONNOTCREATED";
  return {
    success: true,
    res
  };
}

export default {
  createTicket,
  createComment,
  getComments,
  getTickets,
  reopenTicket,
  getNotifications,
  sendNotification
};
