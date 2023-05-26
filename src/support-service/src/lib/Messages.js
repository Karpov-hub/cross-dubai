import db from "@lib/db";

async function getMessages(data, realm_id, user_id) {
  let messages = await db.support_message.findAndCountAll({
    where: {
      user_id
    },
    order: [["ctime", "DESC"]],
    offset: data.start,
    limit: data.limit,
    raw: true
  });
  const client_data = await db.user.findOne({
    where: { id: user_id },
    attributes: ["legalname"],
    raw: true
  });
  let messages_list = messages.rows.map((el) => ({
    ...el,
    sender_name: el.sender == user_id ? client_data.legalname : "Support"
  }));
  return { count: messages.count, messages: messages_list };
}

async function sendMessage(data, realm_id, user_id) {
  await db.support_message.create({
    user_id,
    sender: data.sender || user_id,
    text: data.message,
    attachments: data.files,
    is_new: true,
    ctime: new Date(),
    mtime: new Date()
  });
  let result = { success: true };
  if (data.get_messages)
    result = await getMessages({ start: 0, limit: 50 }, realm_id, user_id);
  return result;
}

async function markAsRead(data, realm_id, user_id) {
  await db.support_message.update(
    {
      is_new: false
    },
    {
      where: {
        id: data.message_id
      }
    }
  );
  return { success: true };
}

async function getAdminDialogsList(data) {
  let active_users = await db.user.findAll({
    where: {
      activated: true
    },
    attributes: ["id", "legalname"],
    raw: true
  });

  const messages = await db.support_message.findAll({
    where: { user_id: active_users.map((el) => el.id) },
    order: [["ctime", "DESC"]],
    raw: true
  });

  let users_id_list = messages.map((message) => message.user_id);

  let clients = await db.user.findAll({
    where: { id: users_id_list },
    attributes: ["id", "legalname"],
    raw: true
  });

  let out_arr = [],
    new_messages_counter = 0;

  const sortByTime = (arr) => {
    return arr.sort((a, b) => {
      const time_a = new Date(a.ctime).getTime(),
        time_b = new Date(b.ctime).getTime();
      if (time_a > time_b) return -1;
      if (time_a < time_b) return 1;
      return 0;
    });
  };
  for (let client of clients) {
    let client_messages = messages.filter(
      (message) => message.user_id == client.id
    );
    client_messages = sortByTime(client_messages);

    if (client_messages[0].is_new) new_messages_counter++;

    out_arr.push({
      client_id: client.id,
      client_name: client.legalname,
      last_message: client_messages[0].text,
      is_new: client_messages[0].is_new,
      ctime: client_messages[0].ctime
    });
  }
  let old_messages = sortByTime(out_arr.filter((el) => !el.is_new));
  let new_messages = sortByTime(out_arr.filter((el) => el.is_new));

  return {
    count: new_messages_counter,
    dialogs: [...new_messages, ...old_messages]
  };
}

export default {
  getMessages,
  sendMessage,
  markAsRead,
  getAdminDialogsList
};
