const client = require("./client");
const bcrypt = require("bcrypt");
const SALT_COUNT = 10;

async function createUser({
  username,
  email,
  password,
  confirmpassword,
  location,
}) {
  const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
  const confirmedhashedPassword = await bcrypt.hash(
    confirmpassword,
    SALT_COUNT
  );
  try {
    const {
      rows: [user],
    } = await client.query(
      `
                INSERT INTO users(username, email, password, confirmpassword, location) 
                VALUES($1, $2, $3, $4, $5)
                RETURNING *;
              `,
      [username, email, hashedPassword, confirmedhashedPassword, location]
    );

    await client.query(
      `
     
     INSERT INTO Users_Channel(userID, channelName) 
                VALUES($1, $2)
                RETURNING *;
     `,
      [user.id, username]
    );

    await client.query(
      `
     
     INSERT INTO vendors(userid, vendor_name) 
                VALUES($1, $2)
                RETURNING *;
     `,
      [user.id, username]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function addLocation(id, { location }) {
  try {
    const { rows } = await client.query(
      `
                UPDATE users
                SET location=$2
                WHERE id=$1;
              `,
      [id, location]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function addBio(id, { bio }) {
  try {
    const { rows } = await client.query(
      `
                UPDATE users
                SET bio=$2
                WHERE id=$1;
              `,
      [id, bio]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createChannel({
  userID,
  channelname,
  profile_avatar,
  profile_poster,
}) {
  try {
    const {
      rows: [channel],
    } = await client.query(
      `
                INSERT INTO Users_Channel( userID, channelname, profile_avatar, profile_poster) 
                VALUES($1, $2, $3, $4 )
                RETURNING *;
              `,
      [userID, channelname, profile_avatar, profile_poster]
    );
    return channel;
  } catch (error) {
    throw error;
  }
}

async function createVendor({ userid, vendor_name }) {
  try {
    const {
      rows: [vendor],
    } = await client.query(
      `
   INSERT INTO vendors(userid, vendor_name) 
                VALUES($1, $2)
                RETURNING *;
              `,
      [userid, vendor_name]
    );
    return vendor;
  } catch (error) {
    throw error;
  }
}

async function updatePassword(id, { password, confirmpassword }) {
  const UpdatedhashedPassword = await bcrypt.hash(password, SALT_COUNT);
  const UpdatedconhashedPassword = await bcrypt.hash(
    confirmpassword,
    SALT_COUNT
  );
  try {
    const { rows } = await client.query(
      `
                UPDATE users
                SET password=$2, confirmpassword=$3
                WHERE id=$1;
              `,
      [id, UpdatedhashedPassword, UpdatedconhashedPassword]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserByUsername(username) {
  try {
    const { rows } = await client.query(
      `
           SELECT *
           FROM users
           WHERE username=$1
         `,
      [username]
    );
    if (!rows || !rows.length) {
      console.log("User not found");
      return null;
    }
    const [user] = rows;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserByEmail(email) {
  try {
    const { rows } = await client.query(
      `
           SELECT *
           FROM users
           WHERE email=$1
         `,
      [email]
    );

    if (!rows || !rows.length) {
      console.log("Email not found");
      return null;
    }
    const [user] = rows;
    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({ username, password }) {
  if (!username || !password) {
    return null;
  }
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return null;
    }
    const hashedPassword = user.password;
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (passwordMatch === true) {
      return user;
    }
  } catch (error) {
    console.error("Could not find user in DB.");
  }
}
