const client = require("./client");
const { createUser, createChannel, updateChannel } = require("./users");
const { createUploads } = require("./explorer");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
         DROP TABLE IF EXISTS customer_orders;
         DROP TABLE IF EXISTS vendor_products;
         DROP TABLE IF EXISTS vendors;
         DROP TABLE IF EXISTS upload_comments;
         DROP TABLE IF EXISTS channel_uploads;
         DROP TABLE IF EXISTS channel_messages;
         DROP TABLE IF EXISTS user_channel;
         DROP TABLE IF EXISTS users;
         
        `);

    console.log("Finished dropping tables!");
  } catch (error) {
    console.error("Error dropping tables!");
    throw error;
  }
}

async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
         CREATE TABLE Users (
               id SERIAL PRIMARY KEY UNIQUE,
               Username varchar(255) UNIQUE NOT NULL,
               Email TEXT NOT NULL,
               Password varchar(255) NOT NULL,
               ConfirmPassword varchar(255) NOT NULL,
               location varchar(200) NULL,
               bio varchar(8000) NULL,
               CreationDT DATE DEFAULT CURRENT_DATE NOT NULL,
               subscribed_vendor_acct BOOLEAN DEFAULT FALSE,
               subscribed_user_acct BOOLEAN DEFAULT FALSE,
               UNIQUE(Username, Email)
             );
          
    
           CREATE TABLE User_Channel(
            id SERIAL PRIMARY KEY UNIQUE,
            userID INT UNIQUE,
            FOREIGN KEY(userID) REFERENCES Users(id) ON DELETE CASCADE,
            channelname varchar(255) UNIQUE,
            FOREIGN KEY(channelName) REFERENCES Users(Username),
            Profile_Avatar TEXT NULL,
            Profile_Poster TEXT NULL,
            Subscriber_Count INT NULL,
            constraint Subscriber_Count_nonnegative check (Subscriber_Count >= 0),
            user_islive BOOLEAN DEFAULT FALSE,
            vendoractive BOOLEAN DEFAULT FALSE,
            UNIQUE(channelName, userID)
          );


CREATE TABLE channel_messages(
  id SERIAL PRIMARY KEY UNIQUE,
  sender_channelid INT,
  FOREIGN KEY(sender_channelid) REFERENCES user_channel(id) ON DELETE CASCADE,
  senderid INT,
  FOREIGN KEY(senderid) REFERENCES Users(id),
  sendername varchar(255),
  senderpic TEXT NULL,
  receiverid INT,
  receivername varchar(255),
  note_message varchar(8000),
  note_dt DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE TABLE channel_uploads (
  ID SERIAL PRIMARY KEY UNIQUE,
  channelID INT NOT NULL,
  FOREIGN KEY(channelID) REFERENCES User_Channel(id) ON DELETE CASCADE,
  channelname varchar(255),
  channelavi TEXT,
  videoFile TEXT NULL,
  videokey TEXT NULL,
  videoThumbnail TEXT NULL,
  thumbnailKey TEXT NULL,
  videoTitle varchar(255) NULL,
  videoDescription varchar(8000) NULL,
  videoTags varchar(800) NULL,
  videopostDT DATE DEFAULT CURRENT_DATE NOT NULL,
  videoLikeCount INT NULL,
  constraint likes_nonnegative check (videoLikeCount >= 0),
  videodisLikeCount INT NULL,
  constraint dislikes_nonnegative check (videodisLikeCount >= 0),
  videoCommentCount INT NULL,
  constraint comments_nonnegative check (videoCommentCount >= 0),
  videoViewCount INT NULL,
  constraint views_nonnegative check (videoViewCount >= 0),
  content_type varchar(255),
  paid_content varchar(255),
  rental_price varchar(255),
  hold_for_review BOOLEAN DEFAULT FALSE,
  vendor_email varchar(255),
  stipe_acctid TEXT NULL,
  flagged_content BOOLEAN DEFAULT FALSE,
  flag_reason varchar(255) NULL
);

CREATE TABLE upload_comments (
  ID SERIAL PRIMARY KEY UNIQUE,
  videoID INT,
  FOREIGN KEY(videoID) REFERENCES channel_uploads(id) ON DELETE CASCADE,
  commentorID INT,
  FOREIGN KEY(commentorID) REFERENCES users(id),
  commentorName varchar(255),
  commentorPic TEXT,
  user_comment varchar(8000) NULL,
  commentDT DATE DEFAULT CURRENT_DATE NOT NULL,
  flagged_comment BOOLEAN DEFAULT FALSE,
  flag_reason varchar(255) NULL

);

CREATE TABLE upload_copyright_reports (
id SERIAL PRIMARY KEY UNIQUE,
videoid INT NOT NULL,
userid INT NOT NULL,
requestor_name varchar(255) NULL,
owner varchar(255) NULL,
relationship varchar(255) NULL,
address varchar(255) NULL,
city_state_zip varchar(255) NULL,
country varchar(255) NULL,
flagDT DATE DEFAULT CURRENT_DATE NOT NULL
);


CREATE TABLE vendors (
  id SERIAL PRIMARY KEY UNIQUE,
  userid INT UNIQUE NOT NULL,
  FOREIGN KEY(userid) REFERENCES users(id) ON DELETE CASCADE,
  vendorname varchar(255) UNIQUE NOT NULL,
  registered BOOLEAN DEFAULT FALSE,
  vendor_connect_complete BOOLEAN DEFAULT FALSE,
  vendor_subscription_complete BOOLEAN DEFAULT FALSE,
  stripe_acctid TEXT,
  UNIQUE(userid, vendorname)
);

CREATE TABLE vendor_products(
id SERIAL PRIMARY KEY UNIQUE,
vendorID INT,
FOREIGN KEY(vendorid) REFERENCES vendors(id) ON DELETE CASCADE,

vendorname varchar(255),

prod_category varchar(255) NULL,
prod_sub_category varchar(255) NULL,
prod_name varchar(255) NOT NULL,
prod_description varchar(255) NULL,
prod_price decimal(6,2) NOT NULL,
prod_quantity INT NOT NULL,
constraint quantity_nonnegative check (prod_quantity >= 0),

prod_color1 varchar(255) NULL,
prod_color2 varchar(255) NULL,
prod_color3 varchar(255) NULL,
prod_color4 varchar(255) NULL,
prod_color5 varchar(255) NULL,
prod_color6 varchar(255) NULL,

prod_size1 varchar(255) NULL,
prod_size2 varchar(255) NULL,
prod_size3 varchar(255) NULL,
prod_size4 varchar(255) NULL,
prod_size5 varchar(255) NULL,
prod_size6 varchar(255) NULL,

prod_img1 text NOT NULL,
prod_img2 text NULL,
prod_img3 text NULL,
prod_img4 text NULL,
prod_img5 text NULL,
prod_img6 text NULL,

vendor_email varchar(255) NULL,
vendoractive BOOLEAN DEFAULT TRUE,
stripe_acctid TEXT NULL
);

CREATE TABLE customer_orders (
  ID SERIAL PRIMARY KEY UNIQUE,
  customerID INT,
  FOREIGN KEY(customerID) REFERENCES users(id) ON DELETE CASCADE,
  order_date DATE DEFAULT CURRENT_DATE NOT NULL,
  order_total decimal(6,2) NOT NULL,
  order_status varchar(255) NULL,
  vendor_status varchar(255) NULL
);
ALTER SEQUENCE customer_orders_id_seq RESTART WITH 7001;

CREATE TABLE customer_movie_orders(
id SERIAL PRIMARY KEY UNIQUE,
videoid INT,
FOREIGN KEY(videoid) REFERENCES channel_uploads(id) ON DELETE CASCADE,
videotitle varchar(255),
videoprice decimal(6,2),
channelid INT,
videothumbnail TEXT,
userid INT,
rental_date DATE DEFAULT CURRENT_DATE NOT NULL,
vendor_email varchar(255) NULL
);

CREATE TABLE customer_market_orders(
id SERIAL PRIMARY KEY UNIQUE,
orderID INT,
FOREIGN KEY(orderID) REFERENCES customer_orders(id),
productID INT,
FOREIGN KEY(productID) REFERENCES vendor_products(id),
vendorid INT,
FOREIGN KEY(vendorid) REFERENCES vendors(id),
vendorname varchar(255),
purchase_total decimal(6,2) NULL,
product_name varchar(255),
product_qty INT NULL,
product_color varchar(255) NULL,
product_size varchar(255) NULL,
prod_img TEXT NULL,
product_price decimal(6,2) NULL,
product_orderdt DATE DEFAULT CURRENT_DATE NOT NULL,
vendor_email varchar(255)
);

CREATE TABLE chat_conversations(
id SERIAL PRIMARY KEY UNIQUE,
user1 INT,
user1_username varchar(255),
user1_pic TEXT,
user1_email varchar(255),
user2 INT,
user2_username varchar(255),
user2_pic TEXT,
user2_email varchar(255),
start_date DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE TABLE chat_messages(
id SERIAL PRIMARY KEY UNIQUE,
conversationid INT,
FOREIGN KEY(conversationid) REFERENCES chat_conversations(id) ON DELETE CASCADE,
senderid INT,
sendername varchar(255),
receiverid INT,
receivername varchar(255),
chat_message varchar(8000) NOT NULL,
message_date varchar(255),
systemDT DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE TABLE user_favorites (
id SERIAL PRIMARY KEY UNIQUE,
userid INT NOT NULL,
FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
videoid INT NULL,
FOREIGN KEY (videoid) REFERENCES channel_uploads(id) ON DELETE CASCADE,
channelid INT NOT NULL,
channelname varchar(255)  NULL,
channelavi TEXT NULL,
video TEXT NOT NULL,
videoviewcount INT NOT NULL,
thumbnail TEXT NULL,
title varchar(800) NULL,
favedDT DATE DEFAULT CURRENT_DATE NOT NULL

);

CREATE TABLE user_watchlater (
id SERIAL PRIMARY KEY UNIQUE,
userid INT NOT NULL,
FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
videoid INT NULL,
FOREIGN KEY (videoid) REFERENCES channel_uploads(id) ON DELETE CASCADE,
channelid INT NOT NULL,
channelname varchar(255)  NULL,
channelavi TEXT  NULL,

video TEXT NULL,
videoviewcount INT NOT NULL,
thumbnail TEXT NULL,
title varchar(800) NULL,

paidtoview BOOLEAN DEFAULT FALSE,
user_started_watching BOOLEAN DEFAULT FALSE,
first_viewingDT DATE DEFAULT CURRENT_DATE NULL,

watchlatertDT DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE TABLE user_subscriptions (
id SERIAL PRIMARY KEY UNIQUE,
userid INT NOT NULL,
channelID INT NULL,
channelavi TEXT NULL,
channelname varchar(255) NULL,
subedDT DATE DEFAULT CURRENT_DATE NOT NULL
);

CREATE TABLE user_watch_history(
id SERIAL PRIMARY KEY UNIQUE,
userid INT NOT NULL,
FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
videoid INT NULL,
FOREIGN KEY (videoid) REFERENCES channel_uploads(id) ON DELETE CASCADE,
video TEXT NULL,
videoviewcount INT NOT NULL,
thumbnail TEXT NULL,
title varchar(800) NULL
);

CREATE TABLE user_video_likes(
id SERIAL PRIMARY KEY UNIQUE,
userid INT NOT NULL,
FOREIGN KEY (userid) REFERENCES users(id),
videoid INT NULL,
FOREIGN KEY (videoid) REFERENCES channel_uploads(id)
);

CREATE TABLE user_video_dislikes(
id SERIAL PRIMARY KEY UNIQUE,
userid INT NOT NULL,
FOREIGN KEY (userid) REFERENCES users(id),
videoid INT NULL,
FOREIGN KEY (videoid) REFERENCES channel_uploads(id)
);

          
          
          
  `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error;
  }
}

async function buildDB() {
  try {
    client.connect();
    await dropTables();
    await createTables();
  } catch (error) {
    throw error;
  }
}

buildDB();