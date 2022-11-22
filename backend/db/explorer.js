const client = require("./client");

async function createUploads({
channelID,
channel_name, 
channelpic,  
videoFile,
videoKey,  
videoThumbnail,
thumbnailKey,  
videoTitle, 
videoDescription, 
videoTags,
content_type,
paid_content, 
rental_price,
vendor_paypal,
vendor_email,
stripe_acctid
}) {
  try {
    const {
      rows: [uploads],
    } = await client.query(
      `
              INSERT INTO useruploads(channelID, channel_name, channelpic, videoFile, videoKey, videoThumbnail, thumbnailKey, videoTitle, videoDescription, videoTags, content_type, paid_content, rental_price, vendor_paypal, vendor_email, stripe_acctid) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
              RETURNING *;
            `,
      [channelID, channel_name, channelpic, videoFile, videoKey, videoThumbnail, thumbnailKey, videoTitle, videoDescription, videoTags, content_type, paid_content, rental_price, vendor_paypal, vendor_email, stripe_acctid]
    );
    return uploads;
  } catch (error) {
    throw error;
  }
}

async function editUpload(id, updateInfo) {
  const {videoTitle, videoDescription, videoTags} = updateInfo
  try {
    
    const { rows } = await client.query(
      `
              UPDATE useruploads
              SET videoTitle=$2, videoDescription=$3, videoTags=$4
              WHERE id=$1
              RETURNING *;
            `,[id, videoTitle, videoDescription, videoTags]
    );
    return rows; 
  }catch(error){
    throw error;
  
  }


}

async function deleteUpload(id) {
  
  try {
    
    const {
      rows: [upload],
    } = await client.query(
      `
              DELETE FROM useruploads
              WHERE id=$1
              RETURNING *;
            `,[id]
    );
    return upload;
  
  
  }catch(error){
    throw error;
  
  }



}

async function getAllUploads() {
  const { rows } = await client.query(`
  SELECT *, useruploads.id AS videoID
  FROM useruploads
  ORDER BY random();
  `);

  return rows;
}

async function getFreeContent() {
  const { rows } = await client.query(`
  SELECT *, useruploads.id AS videoID
  FROM useruploads
  WHERE paid_content='free' OR paid_content IS NULL
  ORDER BY random() limit 1000;
  `);

  return rows;
}

async function getPayToViewContent() {
  const { rows } = await client.query(`
  SELECT *, useruploads.id AS videoID
  FROM useruploads
  WHERE content_type='film' AND paid_content='pay' OR content_type='shows' AND paid_content='pay'
  ORDER BY random() limit 1000;
  `);

  return rows;
}

async function getLimitedUploads() {
  const { rows } = await client.query(`
  SELECT *, useruploads.id AS videoID
  FROM useruploads
  WHERE paid_content='free' OR paid_content IS NULL OR content_type='vlog' OR content_type='other' OR content_type IS NULL
  ORDER BY random() limit 100;
  `);

  return rows;
}

async function getTopUploads() {
  const { rows } = await client.query(`
  SELECT *, useruploads.id AS videoID
  FROM useruploads
  WHERE paid_content='free' OR paid_content IS NULL OR content_type='vlog' OR content_type='other' OR content_type IS NULL
  ORDER BY random() limit 10;
  `);

  return rows;
}






async function getUploadByID(id) {
  
  try{
    const { rows } = await client.query(`
    
  SELECT *, useruploads.id AS videoID, users_channel.channelname, users_channel.profile_avatar
  FROM useruploads 
  RIGHT JOIN users_channel ON useruploads.channelid = users_channel.id
  WHERE useruploads.id=$1;
  `,
       [id]
  ); 
  return rows;  
  }catch(error){
   console.error("Could not get that video");
  }
  
}


async function createComments({videoID, commentorID, commentorName, commentorPic, user_comment}) {
  try {
    const {
      rows: [comment],
    } = await client.query(
      `
              INSERT INTO uploadComments(videoID, commentorID, commentorName, commentorPic, user_comment) 
              VALUES($1, $2, $3, $4, $5)
              RETURNING *;
            `,
      [videoID, commentorID, commentorName, commentorPic, user_comment]
    );
    return comment;
  } catch (error) {
    throw error;
  }
}

async function editComment(id, thecomment) {
  const { user_comment } = thecomment;
  try {
    const { rows } = await client.query(
      `
              UPDATE uploadComments
              SET user_comment=$2
              WHERE id=$1
              RETURNING *;
     `,
      [id, user_comment]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function deleteComment(id) {
  try {
    const { rows } = await client.query(
      `
              DELETE
              FROM uploadComments
              WHERE id=$1;
            `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getVideoComments(videoid) {
  
  try{
    const { rows } = await client.query(`
    
  SELECT *, uploadComments.id AS commentid, users_channel.id AS channelid
  FROM uploadComments
  RIGHT JOIN users_channel ON uploadComments.commentorname = users_channel.channelname
  WHERE videoID=$1;
  `,
       [videoid]
  ); 
  return rows;  
  }catch(error){
   console.error("Could not get that video");
  }
  
}

async function updateUploadsPicture(channel_name, pic) {
  const {channelpic} = pic;
  try {
    const { rows } = await client.query(
      `
              UPDATE useruploads
              SET channelpic=$2
              WHERE channel_name=$1
              RETURNING *;
            `,
      [channel_name, channelpic]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateCommentsPic(commentorName, pic) {
  const {commentorpic} = pic;
  try {
    const { rows } = await client.query(
      `
              UPDATE uploadComments
              SET commentorPic=$2
              WHERE commentorName=$1
              RETURNING *;
            `,
      [commentorName, commentorpic]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}




async function videoSearch(query) {
  try {
    const { rows } = await client.query(
      `
              SELECT *, useruploads.id AS videoid
              FROM useruploads
              WHERE videotags ILIKE N'%${query}%' OR videotitle ILIKE N'%${query}%' OR channel_name ILIKE N'%${query}%'
              ORDER BY random();
            `,
    )
    return rows;
  } catch (error) {
    throw error;
  }
}


async function animationSearch() {
  try {
    const { rows } = await client.query(
      `
              SELECT *, useruploads.id AS videoid
              FROM useruploads
              WHERE videotags ILIKE any (array['%Animation%','%Animiations%', '%Animated%']) AND paid_content='free' OR videotags ILIKE any (array['%Animation%','%Animations%', '%Animated%']) AND paid_content IS NULL
              ORDER BY random() limit 1000;
            `,
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function movieSearch() {
  try {
    const { rows } = await client.query(
      `
              SELECT *, useruploads.id AS videoid
              FROM useruploads
              WHERE videotags ILIKE any (array['%Movie%', '%ShortFilm%', '%Films%', '%FullMovie%','%Standup%']) AND paid_content='free' OR videotags ILIKE any (array['%Movie%', '%ShortFilm%', '%Films%', '%FullMovie%','%Standup%']) AND paid_content IS NULL
              ORDER BY random() limit 1000;
            `,
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function showsSearch() {
  try {
    const { rows } = await client.query(
      `
              SELECT *, useruploads.id AS videoid
              FROM useruploads
              WHERE videotags ILIKE any (array['%Series%','%Sitcom%', '%Webseries%']) AND paid_content='free' OR videotags ILIKE any (array['%Series%','%Sitcom%', '%Webseries%']) AND paid_content IS NULL
              ORDER BY random() limit 1000;
            `,
    );
    return rows;
  } catch (error) {
    throw error;
  }
}




async function vlogSearch() {
  try {
    const { rows } = await client.query(
      `
              SELECT *, useruploads.id AS videoid
              FROM useruploads
              WHERE videotags ILIKE any (array['%Vlog%','%Vlogs%']) AND paid_content='free' OR videotags ILIKE any (array['%Vlog%','%Vlogs%']) AND paid_content IS NULL
              ORDER BY random() limit 1000;
            `,
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function videoLikes(id) {
  try {
    const {
      rows: [uploads],
    } = await client.query(
      `
              UPDATE useruploads
              SET videolikecount = videolikecount + 1
              WHERE id=$1
              RETURNING *;
            `,[id]
    );
    return uploads;
  } catch (error) {
    throw error;
  }
}

async function revokeLikes(videoid) {
  try {
    const {
      rows: [uploads],
    } = await client.query(
      `
              UPDATE useruploads
              SET videolikecount = videolikecount - 1
              WHERE id=$1
              RETURNING *;
            `,[videoid]
    );
    return uploads;
  } catch (error) {
    throw error;
  }
}


async function usersLikes({likedUser, videoid}){
  try {
    const {
      rows: [likedvideo],
    } = await client.query(
      `
              INSERT INTO users_likes(likedUser, videoid)
              VALUES($1, $2)
              RETURNING *;
            `,[likedUser, videoid]
    );
    return likedvideo;
  } catch (error) {
    throw error;
  }
}

async function userUnLikes(id){
  try {
    const {
      rows: [likedvideo],
    } = await client.query(
      `
              DELETE FROM users_likes
              WHERE id=$1;
            `,[id]
    );
    return likedvideo;
  } catch (error) {
    throw error;
  }
}

async function myLikes(videoid ,likedUser){
  try {
    const { rows } = await client.query(
      `
              SELECT *, users_likes.id AS likeid
              FROM users_likes
              WHERE videoid=$1 AND likedUser=$2 ;
            `,[videoid, likedUser]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function videoDisLikes(id) {
  try {
    const {
      rows: [uploads],
    } = await client.query(
      `
              UPDATE useruploads
              SET videodislikecount = videodislikecount + 1
              WHERE id=$1
              RETURNING *;
            `,[id]
    );
    return uploads;
  } catch (error) {
    throw error;
  }
}


async function revokeDisLikes(videoid) {
  try {
    const {
      rows: [uploads],
    } = await client.query(
      `
              UPDATE useruploads
              SET videodislikecount = videodislikecount - 1
              WHERE id=$1
              RETURNING *;
            `,[videoid]
    );
    return uploads;
  } catch (error) {
    throw error;
  }
}


async function usersDisLikes({dislikedUser, videoid}){
  try {
    const {
      rows: [dislikedvideo],
    } = await client.query(
      `
              INSERT INTO users_dislikes(dislikedUser, videoid)
              VALUES($1, $2)
              RETURNING *;
            `,[dislikedUser, videoid]
    );
    return dislikedvideo;
  } catch (error) {
    throw error;
  }
}


async function userUnDisLikes(id){
  try {
    const {
      rows: [dislikedvideo],
    } = await client.query(
      `
              DELETE FROM users_dislikes
              WHERE id=$1;
            `,[id]
    );
    return dislikedvideo;
  } catch (error) {
    throw error;
  }
}

async function myDisLikes(videoid, dislikedUser){
  try {
    const { rows } = await client.query(
      `
              SELECT *, users_dislikes.id AS dislikeid
              FROM users_dislikes
              WHERE videoid=$1 AND dislikedUser=$2;
            `,[videoid, dislikedUser]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}




async function updateVideoViews(id) {
  try {
    const {
      rows: [uploads],
    } = await client.query(
      `
              UPDATE useruploads
              SET videoviewcount = videoviewcount + 1
              WHERE id=$1
              RETURNING *;
            `,[id]
    );
    return uploads;
  } catch (error) {
    throw error;
  }
}

async function videoLikesZero() {
  try {
    const { rows } = await client.query(
      `
              UPDATE useruploads
              SET videolikecount = 0
              RETURNING *;
            `,
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function videoDisLikesZero() {
  try {
    const { rows } = await client.query(
      `
              UPDATE useruploads
              SET videodislikecount = 0
              RETURNING *;
            `,
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function videoViewsZero() {
  try {
    const { rows } = await client.query(
      `
              UPDATE useruploads
              SET videoviewcount = 0
              RETURNING *;
            `,
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createFavs({userFaved, videoid, channel, channel_avi, video, thumbnail, title, channelid, videoviewcount}) {
  try {
    const {
      rows: [favs],
    } = await client.query(
      `
              INSERT INTO user_favorites(userFaved, videoid, channel, channel_avi, video, thumbnail, title, channelid, videoviewcount) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
              RETURNING *;
            `,
      [userFaved, videoid, channel, channel_avi, video, thumbnail, title, channelid, videoviewcount]
    );
    return favs;
  } catch (error) {
    throw error;
  }
}

async function deleteFavs(userFaved, videoid) {
  try {
    const {
      rows
    } = await client.query(
      `
              DELETE FROM user_favorites
              WHERE userFaved=$1 AND videoid=$2;
            `,
      [userFaved, videoid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserFavs(userid) {
  try {
    const { rows } = await client.query(
      `SELECT * 
       FROM user_favorites
       WHERE userFaved=$1;
      `,
      [userid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function createLaters({userListed, videoid, channel, channel_avi, video, thumbnail, title, channelid, videoviewcount, paidtoview}) {
  try {
    const {
      rows: [watchlater],
    } = await client.query(
      `
              INSERT INTO user_watchlater(userListed, videoid, channel, channel_avi, video, thumbnail, title, channelid, videoviewcount, paidtoview) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING *;
            `,
      [userListed, videoid, channel, channel_avi, video, thumbnail, title, channelid, videoviewcount, paidtoview]
    );
    return watchlater;
  } catch (error) {
    throw error;
  }
}

async function deleteLaters(userListed, videoid) {
  try {
    const {
      rows
    } = await client.query(
      `
              DELETE FROM user_watchlater
              WHERE userListed=$1 AND videoid=$2;
            `,
      [userListed, videoid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function removePurchasedLatersThreeDays(){

  try {
    const {
      rows
    } = await client.query(
      `
              DELETE FROM user_watchlater
              WHERE paidtoview='true' AND user_started_watching='true' AND watchlaterdt < DATE(NOW() - INTERVAL 3 DAY) ;
            `,
    );
    return rows;
  } catch (error) {
    throw error;
  }
}



async function getUserLaters(userListed) {
  try {
    const { rows } = await client.query(
      `SELECT * 
       FROM user_watchlater
       WHERE userListed=$1;
      `,[userListed]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updatePaidWatchStarted(id) {
  try {
    const { rows } = await client.query(
      `UPDATE user_watchlater
       SET user_started_watching='true', firstplay_date=CURRENT_DATE 
       WHERE id=$1;
      `,[id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}






async function createSubs({userSubed, channelID, channel, channel_avi }) {
  try {
    const {
      rows: [subs],
    } = await client.query(
      `
              INSERT INTO user_subscriptions(userSubed, channelID, channel, channel_avi) 
              VALUES($1, $2, $3, $4)
              RETURNING *;
            `,
      [userSubed, channelID, channel, channel_avi]
    );
    return subs;
  } catch (error) {
    throw error;
  }
}

async function removeSubs(userSubed, channelid) {
  try {
    const { rows } = await client.query(
      `
              DELETE FROM user_subscriptions WHERE userSubed=$1 AND channel=$2
              RETURNING *;
            `,
      [userSubed, channelid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserSubs(userSubed) {
  try {
    const { rows } = await client.query(
      `SELECT * 
       FROM user_subscriptions
       WHERE userSubed=$1;
      `,
      [userSubed]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserStatSubForChannel(userSubed, channelID) {
  try {
    const { rows } = await client.query(
      `SELECT * 
       FROM user_subscriptions
       WHERE userSubed=$1 AND channelID=$2;
      `,
      [userSubed, channelID]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function getUserSubsLimit(userSubed) {
  try {
    const { rows } = await client.query(
      `SELECT * 
       FROM user_subscriptions
       WHERE userSubed=$1
       ORDER BY random() limit 8;
      `,
      [userSubed]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserSubsUploads(userSubed) {
  try {
    const { rows } = await client.query(
      `SELECT *, useruploads.id AS videoid
       FROM user_subscriptions
       RIGHT JOIN useruploads ON user_subscriptions.channelid = useruploads.channelID
       WHERE userSubed=$1;
      `,
      [userSubed]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function allUserLikesZero() {
  try {
    const { rows } = await client.query(
      `DELETE 
       FROM users_likes;
      `,
    )
    
    await client.query(
      `DELETE 
       FROM users_dislikes;
      `,
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function allUserLikes() {
  try {
    const { rows } = await client.query(
      `SELECT *
       FROM users_likes;
      `,
    )
    
    return rows;
  } catch (error) {
    throw error;
  }
}


async function allUserDisLikes() {
  try {
    const { rows } = await client.query(
      `SELECT *
       FROM users_dislikes;
      `,
    )
    
    return rows;
  } catch (error) {
    throw error;
  }
}


async function getVideo(id) {
  
  try{
    const { rows } = await client.query(`
    
  SELECT *, useruploads.id AS videoid
  FROM useruploads 
  WHERE id=$1;
  `,
       [id]
  ); 
  return rows;  
  }catch(error){
   console.error("Could not get that video");
  }
  
}


//Movie Orders

async function createMovieOrders({videoid, channelid, videothumbnail, userid, videotitle, videoprice, vendor_email}) {
  try {
    const {
      rows: [order],
    } = await client.query(
      `
              INSERT INTO movierental_orders(videoid, channelid, videothumbnail, userid, videotitle, videoprice, vendor_email) 
              VALUES($1, $2, $3, $4, $5, $6, $7)
              RETURNING *;
            `,[videoid, channelid, videothumbnail, userid, videotitle, videoprice, vendor_email]
    )
    return order;
  } catch (error) {
    throw error;
  }
}

async function getMovieOrders(){
try{
    const { rows } = await client.query(`
    
  SELECT *, movierental_orders.id AS rentalId
  FROM movierental_orders
  RETURNING *;
  `,
    ) 
  return rows;  
  }catch(error){
   console.error("Could not get that video");
  }

}


async function updateUserCommentCount(id) {
  try {
    const { rows } = await client.query(
      `UPDATE useruploads
       SET videocommentcount= videocommentcount + 1
       WHERE id=$1;
      `,[id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function reduceUserCommentCount(id) {
  try {
    const { rows } = await client.query(
      `UPDATE useruploads
       SET videocommentcount= videocommentcount - 1
       WHERE id=$1;
      `,[id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function allCommentCountZero() {
  try {
    const { rows } = await client.query(
      `UPDATE useruploads
       SET videocommentcount=0;
      `,
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function activeVendorVideos(channelid){
  try {
    const { rows } = await client.query(
      `UPDATE useruploads
       SET vendoractive = 'true'
       WHERE channelid=$1;
      `, [channelid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function flaggedVideo(id, theReason){
  let { flagged_reason } = theReason;
  try {
    const { rows } = await client.query(
      `UPDATE useruploads
       SET flagged = 'true', flagged_reason=$2
       WHERE id=$1;
      `, [id, flagged_reason]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function flaggedComment(id, theReason){
  let { flagged_reason } = theReason;
  try {
    const { rows } = await client.query(
      `UPDATE uploadcomments
       SET flagged = 'true', flagged_reason=$2
       WHERE id=$1;
      `, [id, flagged_reason]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}


async function copyrightClaim({videoid, userid, requestor_name, owner, relationship, address, city_state_zip, country}){
try {
    const {
      rows: [flagged_upload],
    } = await client.query(
      `
              INSERT INTO upload_copyright_reports(videoid, userid, requestor_name, owner, relationship, address, city_state_zip, country) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING *;
            `,
      [videoid, userid, requestor_name, owner, relationship, address, city_state_zip, country]
    );
    return flagged_upload;
  } catch (error) {
    throw error;
  }
}


async function watchHistory({userid, videoid, channel, channel_avi, channelid, videofile, videothumbnail, videotitle, videoviewcount}){
try {
    const {
      rows: [history],
    } = await client.query(
      `
              INSERT INTO user_watch_history(userid, videoid, channel, channel_avi, channelid, videofile, videothumbnail, videotitle, videoviewcount) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9 )
              RETURNING *;
            `,
      [userid, videoid, channel, channel_avi, channelid, videofile, videothumbnail, videotitle, videoviewcount]
    );
    return history;
  } catch (error) {
    throw error;
  }
}

async function getHistory(userid){
try{
  const { rows } = await client.query(`  
  SELECT
    *
FROM (
    SELECT DISTINCT ON (videotitle) videotitle, videoid, channel, channel_avi, channelid, videofile, videothumbnail, videoviewcount, historydt
    FROM user_watch_history
    WHERE userid=$1
    ORDER BY videotitle, historyDT DESC
) s
ORDER BY historydt DESC
  `, [userid]
    ) 
  return rows;  
  }catch(error){
   console.error("Could not get history videos");
  }

}



module.exports = {
  client,
  createUploads,
  editUpload,
  deleteUpload,
  getAllUploads,
  getUploadByID,
  createComments,
  getVideoComments,
  updateUploadsPicture,
  updateCommentsPic,
  videoSearch,
  vlogSearch,
  movieSearch,
  showsSearch,
  animationSearch,
  videoLikes,
  createFavs,
  createSubs,
  createLaters,
  getUserSubs,
  getUserFavs,
  getUserLaters,
  getUserSubsUploads,
  videoLikesZero,  
  updateVideoViews,
  videoViewsZero,
  videoDisLikesZero,
  videoDisLikes,
  getUserSubsLimit,
  removeSubs,
  usersLikes,
  usersDisLikes,
  myLikes,
  myDisLikes,
  allUserLikesZero,
  allUserLikes,
  allUserDisLikes,
  getUserStatSubForChannel,
  getVideo,
  deleteLaters,
  deleteFavs,
  revokeLikes,
  revokeDisLikes,
  userUnLikes,
  userUnDisLikes,
  getLimitedUploads,
  editComment,
  deleteComment,
  getPayToViewContent,
  getFreeContent,
  createMovieOrders,
  getMovieOrders,
  updatePaidWatchStarted,  
  removePurchasedLatersThreeDays,
  reduceUserCommentCount,
  updateUserCommentCount,
  allCommentCountZero,
  activeVendorVideos,
  flaggedComment, 
  flaggedVideo,
  copyrightClaim,
  getTopUploads,
  watchHistory,
  getHistory
};
