const client = require("./client");

async function createMessage({
  senderid,
  sendername,
  senderpic,
  receiverid,
  receivername,
  receiverpic,
  note_message,
}) {
  try {
    const {
      rows: [message],
    } = await client.query(
      `
 INSERT INTO channel_messages(senderid, senderName, senderPic, receiverID, receiverName, receiverPic, note_message) 
              VALUES($1, $2, $3, $4, $5, $6, $7)
              RETURNING *;
            `,
      [
        senderid,
        sendername,
        senderpic,
        receiverid,
        receivername,
        receiverpic,
        note_message,
      ]
    );
    return message;
  } catch (error) {
    throw error;
  }
}

async function deleteMessage(id) {
  try {
    const {
      rows: [message],
    } = await client.query(
      `
              DELETE FROM channel_messages
              WHERE id=$1
              RETURNING *;
            `,
      [id]
    );
    return message;
  } catch (error) {
    throw error;
  }
}

async function editMessage(id, note) {
  const { note_message } = note;
  try {
    const { rows } = await client.query(
      `
              UPDATE channel_messages
              SET note_message=$2
              WHERE id=$1
              RETURNING *;
            `,
      [id, note_message]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getMyMessages(receiverid) {
  try {
    const { rows } = await client.query(
      `
              SELECT * FROM channel_messages
              WHERE receiverid=$1 AND noteRead='false';
            `,
      [receiverid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getMySentMessages(senderid) {
  try {
    const { rows } = await client.query(
      `
              SELECT * FROM channel_messages
              WHERE senderid=$1;
            `,
      [senderid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function markRead(id) {
  try {
    const { rows } = await client.query(
      `
              UPDATE channel_messages
              SET noteRead='true'
              WHERE id=$1;
            `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getMyRead(receiverid) {
  try {
    const { rows } = await client.query(
      `
              SELECT * FROM channel_messages
              WHERE receiverid=$1 AND noteRead='true';
            `,
      [receiverid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createConversation({
  user1,
  user1_username,
  user1_pic,
  user1_email,
  user2,
  user2_username,
  user2_pic,
  user2_email,
}) {
  try {
    const {
      rows: [conversation],
    } = await client.query(
      `
 INSERT INTO conversations(user1, user1_username, user1_pic, user1_email, user2, user2_username, user2_pic, user2_email) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING *;
            `,
      [
        user1,
        user1_username,
        user1_pic,
        user1_email,
        user2,
        user2_username,
        user2_pic,
        user2_email,
      ]
    );
    return conversation;
  } catch (error) {
    throw error;
  }
}

async function createConversationMessage({
  conversationid,
  senderid,
  sendername,
  receiverid,
  receivername,
  chat_message,
  message_date,
}) {
  try {
    const {
      rows: [message],
    } = await client.query(
      `
 INSERT INTO conversation_messages(conversationid, senderid, sendername, receiverid, receivername, chat_message, message_date) 
              VALUES($1, $2, $3, $4, $5, $6, $7)
              RETURNING *;
            `,
      [
        conversationid,
        senderid,
        sendername,
        receiverid,
        receivername,
        chat_message,
        message_date,
      ]
    );
    return message;
  } catch (error) {
    throw error;
  }
}

async function getMyConversations(userid) {
  try {
    const { rows } = await client.query(
      `
              SELECT *, conversations.id AS conversationid 
              FROM conversations
              WHERE user1=${userid} OR user2=${userid};
            `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function deleteConversations(id) {
  try {
    const { rows } = await client.query(
      `
              DELETE
              FROM conversations
              WHERE id=$1;
            `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function preventDuplicateConversations(user1, user2) {
  try {
    const { rows } = await client.query(
      `
              SELECT *, conversations.id AS conversationid 
              FROM conversations
              WHERE user1=${user1} AND user2=${user2} OR user1=${user2} AND user2=${user1}  ;
            `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getMyConversationsMessages(conversationid) {
  try {
    const { rows } = await client.query(
      `
              SELECT *
              FROM conversation_messages
              WHERE conversationid=${conversationid};
            `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  createMessage,
  deleteMessage,
  editMessage,
  getMyMessages,
  getMySentMessages,
  markRead,
  getMyRead,
  createConversation,
  createConversationMessage,
  getMyConversations,
  getMyConversationsMessages,
  preventDuplicateConversations,
  deleteConversations,
};
