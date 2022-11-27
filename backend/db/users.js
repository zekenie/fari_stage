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
  // [PERFORMANCE] You don't need to hash the confirm password, just check that it's the same as the password
  // that's proof that the PWs are the same. Bcrypt hashes are deliverately slow, so you're making create user,
  // a vital flow, 2x slower than it has to be. If you want it that slow, double the SALT_COUNT.

  // But! When you compare your confirm pw and your pw, make sure to use 

  // Additionally, you don't need to store a confirmpassword in the database, either.

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
     
     INSERT INTO user_channel(userID, channelName) 
                VALUES($1, $2)
                RETURNING *;
     `,
      [user.id, username]
    );

    await client.query(
      `
     
     INSERT INTO vendors(userid, vendorname) 
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
                INSERT INTO user_channel( userID, channelname, profile_avatar, profile_poster) 
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

async function createVendor({ userid, vendorname }) {
  try {
    const {
      rows: [vendor],
    } = await client.query(
      `
                INSERT INTO vendors(userid, vendorname) 
                VALUES($1, $2)
                RETURNING *;
              `,
      [userid, vendorname]
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
    // [NIT]: You never need to write `something === true`. You can just say `if (passwordMatch)` here
    if (passwordMatch === true) {
      return user;
    }
  } catch (error) {
    console.error("Could not find user in DB.");
  }
}

async function getUserById(id) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        SELECT *, users.id AS userid
        FROM users
        WHERE id=$1
      `,
      [id]
    );
    if (!user) {
      delete user.password;
      return null;
    }
    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  // [PROBLEM]: This operation won't scale if you have any sizable number of users
  // Depending on what you need it for, you'll need other ways to achieve this, perhaps with pagination. 
  // [PROBLEM]: By selecting all columns, you're exposing your pw hashes.
  // These should be kept private!
  const { rows } = await client.query(`SELECT * FROM users;`);

  return rows;
}

async function getAllUsersUsername() {
  const { rows } = await client.query(`
  SELECT users.id AS userid, username, email, user_channel.profile_avatar 
  FROM users
  JOIN users_channel ON users.id = users_channel.userid;
  `);

  return rows;
}

async function getUsersByUsername(username) {
  const { rows } = await client.query(`
  SELECT users.id AS userid, username, email, users_channel.profile_avatar 
  FROM users
  JOIN users_channel ON users.id = users_channel.userid
  WHERE username ILIKE N'%${username}%';
  `);

  return rows;
}

// [OPPORTUNITY]: Depending on what you're using this for, ILIKE may not be the best option.
// Postgres has amazing and powerful search features. Here's an article about them:
// https://leandronsp.com/a-powerful-full-text-search-in-postgresql-in-less-than-20-lines

// [PROBLEM] This will get very slow with many users. At a minimum there should be an index
// on `username`. But even so, you'll need to paginate this function at scale. It can wait a little while
// but if you have even 2000 users, this will get REALLY slow if you're trying to search, serialize to JSON
// and send back to a client
async function userSearch(query) {
  try {
    const { rows } = await client.query(
      `
              SELECT users.id AS userid, username, email
              FROM users
              WHERE username ILIKE N'%${query}%';
            `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllChannels() {
  const { rows } = await client.query(
    `SELECT * FROM user_channel order by random() limit 9;`
  );

  return rows;
}

async function getLiveChannels(userSubed) {
  try {
    const { rows } = await client.query(
      `
  SELECT *, user_channel.id AS channelid
  FROM user_channel
  RIGHT JOIN user_subscriptions ON user_channel.id = user_subscriptions.channelid
  WHERE user_channel.user_islive='true' AND user_subscriptions.userid=$1
  order by random() limit 9;
  `,
      [userSubed]
    );

    return rows;
  } catch (error) {
    console.log("Could not get live channels");
  }
}

async function getUserChannelByChannelID(channelid) {
  try {
    const { rows } = await client.query(
      `
  SELECT *, user_channel.id AS channelid, users.location, users.bio
  FROM user_channel
  RIGHT JOIN users ON user_channel.channelname = users.username
  WHERE user_channel.id=$1;
  `,
      [channelid]
    );

    return rows;
  } catch (error) {
    console.log("Could not get user channel in db");
  }
}

async function getUserChannel(username) {
  try {
    const { rows } = await client.query(
      `
  SELECT *, user_channel.id AS channelid
  FROM users
  RIGHT JOIN user_channel ON users.username = user_channel.channelname
  WHERE username=$1;
  `,
      [username]
    );

    return rows;
  } catch (error) {
    console.log("Could not get user profile from db");
  }
}

async function getUserProfile(username) {
  try {
    const { rows } = await client.query(
      `
  SELECT DISTINCT users.id AS userID, users.username, users.email, user_channel.channelname, user_channel.profile_avatar, user_channel.id AS channelid, user_channel.user_islive,
  vendors.id AS vendorID, vendors.vendorname, vendors.stripe_acctid
  FROM users
  RIGHT JOIN user_channel ON users.username = user_channel.channelname
  RIGHT JOIN vendors ON users.username = vendors.vendorname
  WHERE username=$1;
  `,
      [username]
    );

    return rows;
  } catch (error) {
    console.log("Could not get user profile from db");
  }
}

async function getPostByChannelID(id) {
  try {
    const { rows } = await client.query(
      `
  SELECT *, channel_uploads.id AS videoID
  FROM channel_uploads 
  RIGHT JOIN User_Channel ON channel_uploads.channelid = user_channel.id
  WHERE channelid=$1;
  `,
      [id]
    );

    return rows;
  } catch (error) {
    console.log("Could not get user post from db");
  }
}

async function updateAvatar(channelname, photos) {
  const { profile_avatar } = photos;
  try {
    const { rows } = await client.query(
      `
              UPDATE user_channel
              SET profile_avatar=$2
              WHERE channelname=$1
              RETURNING *;
            `,
      [channelname, profile_avatar]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function updatePosters(channelname, photos) {
  // [NIT]: Doesn't look like `profile_poster` or `photos` is being used
  const { profile_poster } = photos;
  try {
    const { rows } = await client.query(
      `
              UPDATE user_channel
              SET profile_poster=$2
              WHERE channelname=$1
              RETURNING *;
            `,
      // [PROBLEM]: I don't see where `slider_pic1` is defined
      [channelname, slider_pic1]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

// [QUESTION]: Could this information be achieved with a query? Do you have to maintain a `subscriber_count` column?
// If it could be achieved with a query, and you're worried about performance, you could look into a materialized view.
// I'm happy to do a session on these, they're a wonderful trick. It basically is a cached query result that you can
// update when you want.
async function updateChannelSubs(channelname) {
  try {
    const {
      rows: [channel],
    } = await client.query(
      `
              UPDATE user_channel
              SET subscriber_count = subscriber_count + 1
              WHERE channelname=$1
              RETURNING *;
            `,
      [channelname]
    );

    return channel;
  } catch (error) {
    throw error;
  }
}

async function removeChannelSub(id) {
  try {
    const {
      rows: [channel],
    } = await client.query(
      `
              UPDATE user_channel
              SET subscriber_count = subscriber_count - 1
              WHERE id=$1
              RETURNING *;
            `,
      [id]
    );

    return channel;
  } catch (error) {
    throw error;
  }
}

async function zeroSubs() {
  try {
    const { rows } = await client.query(
      `
              UPDATE user_channel
              SET subscriber_count = 0
              RETURNING *;
            `
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getChannelByName(channelName) {
  try {
    const {
      rows: [channels],
    } = await client.query(
      `
  SELECT *, user_channel.id AS channelid
  FROM user_channel
  WHERE channelName=$1;
  `,
      [channelName]
    );

    return channels;
  } catch (error) {
    console.log("Could not get user channel in db");
  }
}

async function goLive(id) {
  try {
    const {
      rows: [channel],
    } = await client.query(
      `
              UPDATE user_channel
              SET user_isLive='true'
              WHERE id=$1
              RETURNING *;
            `,
      [id]
    );

    return channel;
  } catch (error) {
    throw error;
  }
}

async function endLive(id) {
  try {
    const {
      rows: [channel],
    } = await client.query(
      `
              UPDATE user_channel
              SET user_isLive='false'
              WHERE id=$1
              RETURNING *;
            `,
      [id]
    );

    return channel;
  } catch (error) {
    throw error;
  }
}

async function updateUserSubscription(id) {
  // [QUESTION]: Is the type of the column subscribed_user_acct varchar or text? Because you're setting it to 'true' instead of `true`
  // it makes me think it might be. I'd think it should be a boolean?
  try {
    const { rows } = await client.query(
      `
              UPDATE users
              SET subscribed_user_acct='true'
              WHERE id=$1
              RETURNING *;
            `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateChannelSubsStatus(id) {
  try {
    const { rows } = await client.query(
      `
              UPDATE user_channel
              SET vendoractive='true'
              WHERE id=$1
              RETURNING *;
            `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateVendorSubscription(id) {
  try {
    const { rows } = await client.query(
      `
              UPDATE users
              SET subscribed_vendor_acct='true'
              WHERE id=$1
              RETURNING *;
            `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

// [PROBLEM]: Leaking pw hash
// [QUESTION]: Is this the same query as `getUserById`
async function verifyUserSubscriptionStatus(id) {
  try {
    const { rows } = await client.query(
      `
              SELECT * FROM users
              WHERE id=$1;
            `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

// [NIT] I'd rename this function to be `getVendorById`
async function verifiedVendors(id) {
  try {
    const { rows } = await client.query(
      `
 SELECT *
 FROM vendors
 WHERE id=$1;
 `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateChannel(channelname, profile_avatar, profile_poster) {
  try {
    const { rows } = await client.query(
      `
              UPDATE user_channel
              SET profile_avatar=$2, profile_poster=$3
              WHERE channelname=$1
              RETURNING *;
            `,
      [channelname, profile_avatar, profile_poster]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

//Inactive Vendor

// UPDATE vendors
// SET registered = 'false'
// WHERE id = $1

// UPDATE products
// SET vendoractive='false', prod_quantity=0
// WHERE vendorid=$1

// UPDATE users_channel
// SET vendoractive = 'false'
// WHERE id=$1

// UPDATE usersuploads
// SET paid_content = 'free',
// WHERE id=$1

//    UPDATE users
//    SET farivendor_subed='false'
//    WHERE id=$1

module.exports = {
  client,
  createUser,
  addLocation,
  addBio,
  getUser,
  getUserByUsername,
  getUserByEmail,
  getUserById,
  getAllUsers,
  getPostByChannelID,
  getAllChannels,
  createChannel,
  createVendor,
  getUserChannelByChannelID,
  getUserChannel,
  getUserProfile,
  updateAvatar,
  updatePosters,
  updateChannelSubs,
  zeroSubs,
  removeChannelSub,
  getChannelByName,
  goLive,
  endLive,
  getLiveChannels,
  userSearch,
  getAllUsersUsername,
  updatePassword,
  getUsersByUsername,
  updateVendorSubscription,
  updateUserSubscription,
  verifyUserSubscriptionStatus,
  updateChannelSubsStatus,
  verifiedVendors,
  updateChannel,
};
