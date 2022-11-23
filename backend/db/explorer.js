const client = require("./client");

async function createUploads({
  channelID,
  channelname,
  channelavi,
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
  vendor_email,
  stripe_acctid,
}) {
  try {
    const {
      rows: [uploads],
    } = await client.query(
      `
              INSERT INTO channel_uploads(channelID, channelname, channelavi, videoFile, videoKey, videoThumbnail, thumbnailKey, videoTitle, videoDescription, videoTags, content_type, paid_content, rental_price, vendor_email, stripe_acctid) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
              RETURNING *;
            `,
      [
        channelID,
        channelname,
        channelavi,
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
        vendor_email,
        stripe_acctid,
      ]
    );
    return uploads;
  } catch (error) {
    throw error;
  }
}

async function editUpload(id, updateInfo) {
  const { videoTitle, videoDescription, videoTags } = updateInfo;
  try {
    const { rows } = await client.query(
      `
              UPDATE channel_uploads
              SET videoTitle=$2, videoDescription=$3, videoTags=$4
              WHERE id=$1
              RETURNING *;
            `,
      [id, videoTitle, videoDescription, videoTags]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function deleteUpload(id) {
  try {
    const {
      rows: [upload],
    } = await client.query(
      `
              DELETE FROM channel_uploads
              WHERE id=$1
              RETURNING *;
            `,
      [id]
    );
    return upload;
  } catch (error) {
    throw error;
  }
}

async function getAllUploads() {
  const { rows } = await client.query(`
  SELECT *, channel_uploads.id AS videoID
  FROM channel_uploads
  ORDER BY random();
  `);

  return rows;
}

async function getFreeContent() {
  const { rows } = await client.query(`
  SELECT *, channel_uploads.id AS videoID
  FROM channel_uploads
  WHERE paid_content='free' OR paid_content IS NULL
  ORDER BY random() limit 1000;
  `);

  return rows;
}

async function getPayToViewContent() {
  const { rows } = await client.query(`
  SELECT *, channel_uploads.id AS videoID
  FROM channel_uploads
  WHERE content_type='film' AND paid_content='pay' OR content_type='shows' AND paid_content='pay'
  ORDER BY random() limit 1000;
  `);

  return rows;
}

async function getLimitedUploads() {
  const { rows } = await client.query(`
  SELECT *, channel_uploads.id AS videoID
  FROM channel_uploads
  WHERE paid_content='free' OR paid_content IS NULL OR content_type='vlog' OR content_type='other' OR content_type IS NULL
  ORDER BY random() limit 200;
  `);

  return rows;
}

async function getTopUploads() {
  const { rows } = await client.query(`
  SELECT *, channel_uploads.id AS videoID
  FROM channel_uploads
  WHERE paid_content='free' OR paid_content IS NULL OR content_type='vlog' OR content_type='other' OR content_type IS NULL
  ORDER BY random() limit 10;
  `);

  return rows;
}

async function getUploadByID(id) {
  try {
    const { rows } = await client.query(
      `
    
  SELECT *, channel_uploads.id AS videoID, user_channel.channelname, user_channel.profile_avatar
  FROM channel_uploads 
  RIGHT JOIN user_channel ON channel_uploads.channelid = user_channel.id
  WHERE channel_uploads.id=$1;
  `,
      [id]
    );
    return rows;
  } catch (error) {
    console.error("Could not get that video");
  }
}

async function createComments({
  videoID,
  commentorID,
  commentorName,
  commentorPic,
  user_comment,
}) {
  try {
    const {
      rows: [comment],
    } = await client.query(
      `
              INSERT INTO upload_comments(videoID, commentorID, commentorName, commentorPic, user_comment) 
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
              UPDATE upload_comments
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
              FROM upload_comments
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
  try {
    const { rows } = await client.query(
      `
    
  SELECT *, upload_comments.id AS commentid, user_channel.id AS channelid
  FROM upload_comments
  RIGHT JOIN user_channel ON upload_comments.commentorname = user_channel.channelname
  WHERE videoID=$1;
  `,
      [videoid]
    );
    return rows;
  } catch (error) {
    console.error("Could not get that video");
  }
}

async function updateUploadsPicture(channelname, pic) {
  const { channelavi } = pic;
  try {
    const { rows } = await client.query(
      `
              UPDATE channel_uploads
              SET channelavi=$2
              WHERE channelname=$1
              RETURNING *;
            `,
      [channelname, channelavi]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateCommentsPic(commentorName, pic) {
  const { commentorpic } = pic;
  try {
    const { rows } = await client.query(
      `
              UPDATE upload_comments
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
              SELECT *, channel_uploads.id AS videoid
              FROM channel_uploads
              WHERE videotags ILIKE N'%${query}%' OR videotitle ILIKE N'%${query}%' OR channelname ILIKE N'%${query}%'
              ORDER BY random();
            `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function animationSearch() {
  try {
    const { rows } = await client.query(
      `
              SELECT *, channel_uploads.id AS videoid
              FROM channel_uploads
              WHERE videotags ILIKE any (array['%Animation%','%Animiations%', '%Animated%']) AND paid_content='free' OR videotags ILIKE any (array['%Animation%','%Animations%', '%Animated%']) AND paid_content IS NULL
              ORDER BY random() limit 1000;
            `
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
              SELECT *, channel_uploads.id AS videoid
              FROM channel_uploads
              WHERE videotags ILIKE any (array['%Movie%', '%ShortFilm%', '%Films%', '%FullMovie%']) AND paid_content='free' OR videotags ILIKE any (array['%Movie%', '%ShortFilm%', '%Films%', '%FullMovie%']) AND paid_content IS NULL
              ORDER BY random() limit 1000;
            `
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
              SELECT *, channel_uploads.id AS videoid
              FROM channel_uploads
              WHERE videotags ILIKE any (array['%Series%','%Sitcom%', '%Webseries%']) AND paid_content='free' OR videotags ILIKE any (array['%Series%','%Sitcom%', '%Webseries%']) AND paid_content IS NULL
              ORDER BY random() limit 1000;
            `
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
              SELECT *, channel_uploads.id AS videoid
              FROM channel_uploads
              WHERE videotags ILIKE any (array['%Vlog%','%Vlogs%']) AND paid_content='free' OR videotags ILIKE any (array['%Vlog%','%Vlogs%']) AND paid_content IS NULL
              ORDER BY random() limit 1000;
            `
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
              UPDATE channel_uploads
              SET videolikecount = videolikecount + 1
              WHERE id=$1
              RETURNING *;
            `,
      [id]
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
              UPDATE channel_uploads
              SET videolikecount = videolikecount - 1
              WHERE id=$1
              RETURNING *;
            `,
      [videoid]
    );
    return uploads;
  } catch (error) {
    throw error;
  }
}

async function usersLikes({ userid, videoid }) {
  try {
    const {
      rows: [likedvideo],
    } = await client.query(
      `
              INSERT INTO user_video_likes(userid, videoid)
              VALUES($1, $2)
              RETURNING *;
            `,
      [userid, videoid]
    );
    return likedvideo;
  } catch (error) {
    throw error;
  }
}

async function userUnLikes(id) {
  try {
    const {
      rows: [likedvideo],
    } = await client.query(
      `
              DELETE FROM user_video_likes
              WHERE id=$1;
            `,
      [id]
    );
    return likedvideo;
  } catch (error) {
    throw error;
  }
}

async function myLikes(videoid, userid) {
  try {
    const { rows } = await client.query(
      `
              SELECT *, user_video_likes.id AS likeid
              FROM user_video_likes
              WHERE videoid=$1 AND userid=$2 ;
            `,
      [videoid, userid]
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
              UPDATE channel_uploads
              SET videodislikecount = videodislikecount + 1
              WHERE id=$1
              RETURNING *;
            `,
      [id]
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
              UPDATE channel_uploads
              SET videodislikecount = videodislikecount - 1
              WHERE id=$1
              RETURNING *;
            `,
      [videoid]
    );
    return uploads;
  } catch (error) {
    throw error;
  }
}

async function usersDisLikes({ userid, videoid }) {
  try {
    const {
      rows: [dislikedvideo],
    } = await client.query(
      `
              INSERT INTO user_video_dislikes(userid, videoid)
              VALUES($1, $2)
              RETURNING *;
            `,
      [userid, videoid]
    );
    return dislikedvideo;
  } catch (error) {
    throw error;
  }
}

async function userUnDisLikes(id) {
  try {
    const {
      rows: [dislikedvideo],
    } = await client.query(
      `
              DELETE FROM user_video_dislikes
              WHERE id=$1;
            `,
      [id]
    );
    return dislikedvideo;
  } catch (error) {
    throw error;
  }
}

async function myDisLikes(videoid, userid) {
  try {
    const { rows } = await client.query(
      `
              SELECT *, user_video_dislikes.id AS dislikeid
              FROM user_video_dislikes
              WHERE videoid=$1 AND userid=$2;
            `,
      [videoid, userid]
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
              UPDATE channel_uploads
              SET videoviewcount = videoviewcount + 1
              WHERE id=$1
              RETURNING *;
            `,
      [id]
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
              UPDATE channel_uploads
              SET videolikecount = 0
              RETURNING *;
            `
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
              UPDATE channel_uploads
              SET videodislikecount = 0
              RETURNING *;
            `
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
              UPDATE channel_uploads
              SET videoviewcount = 0
              RETURNING *;
            `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createFavs({
  userid,
  videoid,
  channelname,
  channelavi,
  video,
  thumbnail,
  title,
  channelid,
  videoviewcount,
}) {
  try {
    const {
      rows: [favs],
    } = await client.query(
      `
              INSERT INTO user_favorites(userid, videoid, channelname, channelavi, video, thumbnail, title, channelid, videoviewcount) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
              RETURNING *;
            `,
      [
        userid,
        videoid,
        channelname,
        channelavi,
        video,
        thumbnail,
        title,
        channelid,
        videoviewcount,
      ]
    );
    return favs;
  } catch (error) {
    throw error;
  }
}

async function deleteFavs(userid, videoid) {
  try {
    const { rows } = await client.query(
      `
              DELETE FROM user_favorites
              WHERE userid=$1 AND videoid=$2;
            `,
      [userid, videoid]
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
       WHERE userid=$1;
      `,
      [userid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createLaters({
  userid,
  videoid,
  channelname,
  channelavi,
  video,
  thumbnail,
  title,
  channelid,
  videoviewcount,
  paidtoview,
}) {
  try {
    const {
      rows: [watchlater],
    } = await client.query(
      `
              INSERT INTO user_watchlist(userid, videoid, channelname, channelavi, video, thumbnail, title, channelid, videoviewcount, paidtoview) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING *;
            `,
      [
        userid,
        videoid,
        channelname,
        channelavi,
        video,
        thumbnail,
        title,
        channelid,
        videoviewcount,
        paidtoview,
      ]
    );
    return watchlater;
  } catch (error) {
    throw error;
  }
}

async function deleteLaters(userid, videoid) {
  try {
    const { rows } = await client.query(
      `
              DELETE FROM user_watchlist
              WHERE userid=$1 AND videoid=$2;
            `,
      [userid, videoid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function removePurchasedLatersThreeDays() {
  try {
    const { rows } = await client.query(
      `
              DELETE FROM user_watchlist
              WHERE paidtoview='true' AND user_started_watching='true' AND watchlaterdt < DATE(NOW() - INTERVAL 3 DAY) ;
            `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserLaters(userid) {
  try {
    const { rows } = await client.query(
      `SELECT * 
       FROM user_watchlist
       WHERE userid=$1;
      `,
      [userid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function updatePaidWatchStarted(id) {
  try {
    const { rows } = await client.query(
      `UPDATE user_watchlist
       SET user_started_watching='true', first_viewingDT=CURRENT_DATE 
       WHERE id=$1;
      `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function createSubs({ userid, channelID, channelname, channelavi }) {
  try {
    const {
      rows: [subs],
    } = await client.query(
      `
              INSERT INTO user_subscriptions(userid, channelID, channelname, channelavi) 
              VALUES($1, $2, $3, $4)
              RETURNING *;
            `,
      [userid, channelID, channelname, channelavi]
    );
    return subs;
  } catch (error) {
    throw error;
  }
}

async function removeSubs(userid, channelid) {
  try {
    const { rows } = await client.query(
      `
              DELETE FROM user_subscriptions WHERE userid=$1 AND channelid=$2
              RETURNING *;
            `,
      [userid, channelid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserSubs(userid) {
  try {
    const { rows } = await client.query(
      `SELECT * 
       FROM user_subscriptions
       WHERE userid=$1;
      `,
      [userid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserStatSubForChannel(userid, channelID) {
  try {
    const { rows } = await client.query(
      `SELECT * 
       FROM user_subscriptions
       WHERE userid=$1 AND channelID=$2;
      `,
      [userid, channelID]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserSubsLimit(userid) {
  try {
    const { rows } = await client.query(
      `SELECT * 
       FROM user_subscriptions
       WHERE userid=$1
       ORDER BY random() limit 8;
      `,
      [userSubed]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserSubsUploads(userid) {
  try {
    const { rows } = await client.query(
      `SELECT *, channel_uploads.id AS videoid
       FROM user_subscriptions
       RIGHT JOIN channel_uploads ON user_subscriptions.channelid = channel_uploads.channelID
       WHERE userid=$1;
      `,
      [userid]
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
       FROM user_video_likes;
      `
    );

    await client.query(
      `DELETE 
       FROM user_video_dislikes;
      `
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
       FROM user_video_likes;
      `
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function allUserDisLikes() {
  try {
    const { rows } = await client.query(
      `SELECT *
       FROM user_video_dislikes;
      `
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getVideo(id) {
  try {
    const { rows } = await client.query(
      `
    
  SELECT *, channel_uploads.id AS videoid
  FROM channel_uploads 
  WHERE id=$1;
  `,
      [id]
    );
    return rows;
  } catch (error) {
    console.error("Could not get that video");
  }
}

//Movie Orders

async function createMovieOrders({
  videoid,
  channelid,
  videothumbnail,
  userid,
  videotitle,
  videoprice,
  vendor_email,
}) {
  try {
    const {
      rows: [order],
    } = await client.query(
      `
              INSERT INTO customer_movie_orders(videoid, channelid, videothumbnail, userid, videotitle, videoprice, vendor_email) 
              VALUES($1, $2, $3, $4, $5, $6, $7)
              RETURNING *;
            `,
      [
        videoid,
        channelid,
        videothumbnail,
        userid,
        videotitle,
        videoprice,
        vendor_email,
      ]
    );
    return order;
  } catch (error) {
    throw error;
  }
}

async function getMovieOrders() {
  try {
    const { rows } = await client.query(`
    
  SELECT *, customer_movie_orders.id AS rentalId
  FROM customer_movie_orders
  RETURNING *;
  `);
    return rows;
  } catch (error) {
    console.error("Could not get that video");
  }
}

async function updateUserCommentCount(id) {
  try {
    const { rows } = await client.query(
      `UPDATE channel_uploads
       SET videocommentcount= videocommentcount + 1
       WHERE id=$1;
      `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function reduceUserCommentCount(id) {
  try {
    const { rows } = await client.query(
      `UPDATE channel_uploads
       SET videocommentcount= videocommentcount - 1
       WHERE id=$1;
      `,
      [id]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function allCommentCountZero() {
  try {
    const { rows } = await client.query(
      `UPDATE channel_uploads
       SET videocommentcount=0;
      `
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function activeVendorVideos(channelid) {
  try {
    const { rows } = await client.query(
      `UPDATE channel_uploads
       SET vendoractive = 'true'
       WHERE channelid=$1;
      `,
      [channelid]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function flaggedVideo(id, theReason) {
  let { flagged_reason } = theReason;
  try {
    const { rows } = await client.query(
      `UPDATE channel_uploads
       SET flagged_content = 'true', flagged_reason=$2
       WHERE id=$1;
      `,
      [id, flagged_reason]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function flaggedComment(id, theReason) {
  let { flagged_reason } = theReason;
  try {
    const { rows } = await client.query(
      `UPDATE upload_comments
       SET flagged_comment = 'true', flagged_reason=$2
       WHERE id=$1;
      `,
      [id, flagged_reason]
    );
    return rows;
  } catch (error) {
    throw error;
  }
}

async function copyrightClaim({
  videoid,
  userid,
  requestor_name,
  owner,
  relationship,
  address,
  city_state_zip,
  country,
}) {
  try {
    const {
      rows: [flagged_upload],
    } = await client.query(
      `
              INSERT INTO upload_copyright_reports(videoid, userid, requestor_name, owner, relationship, address, city_state_zip, country) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8)
              RETURNING *;
            `,
      [
        videoid,
        userid,
        requestor_name,
        owner,
        relationship,
        address,
        city_state_zip,
        country,
      ]
    );
    return flagged_upload;
  } catch (error) {
    throw error;
  }
}

async function watchHistory({
  userid,
  videoid,
  channelname,
  channelavi,
  channelid,
  videofile,
  videothumbnail,
  videotitle,
  videoviewcount,
}) {
  try {
    const {
      rows: [history],
    } = await client.query(
      `
              INSERT INTO user_watch_history(userid, videoid, channelname, channelavi, channelid, videofile, videothumbnail, videotitle, videoviewcount) 
              VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9 )
              RETURNING *;
            `,
      [
        userid,
        videoid,
        channelname,
        channelavi,
        channelid,
        videofile,
        videothumbnail,
        videotitle,
        videoviewcount,
      ]
    );
    return history;
  } catch (error) {
    throw error;
  }
}

async function getHistory(userid) {
  try {
    const { rows } = await client.query(
      `  
  SELECT
    *
FROM (
    SELECT DISTINCT ON (videotitle) videotitle, videoid, channelname, channelavi, channelid, videofile, videothumbnail, videoviewcount, historydt
    FROM user_watch_history
    WHERE userid=$1
    ORDER BY videotitle, historyDT DESC
) s
ORDER BY historydt DESC
  `,
      [userid]
    );
    return rows;
  } catch (error) {
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
  getHistory,
};
