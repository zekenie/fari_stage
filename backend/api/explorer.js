const express = require("express");
const explorerRouter = express.Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET, REDIS_URL } = process.env;
const { requireUser } = require("./utils");

const { check, validationResult } = require("express-validator");

const cors = require("cors");
explorerRouter.use(cors());

const {
  client,
  createUploads,
  editUpload,
  deleteUpload,
  getAllUploads,
  getUploadByID,
  createComments,
  getVideoComments,
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
  getUserById,
  updateChannelSubs,
  getUserSubsUploads,
  videoLikesZero,
  updateVideoViews,
  videoViewsZero,
  videoDisLikesZero,
  videoDisLikes,
  getUserSubsLimit,
  usersLikes,
  usersDisLikes,
  myLikes,
  myDisLikes,
  allUserLikesZero,
  allUserLikes,
  allUserDisLikes,
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
  getLiveChannels,
  getPayToViewContent,
  getFreeContent,
  createMovieOrders,
  getMovieOrders,
  updatePaidWatchStarted,
  reduceUserCommentCount,
  updateUserCommentCount,
  allCommentCountZero,
  flaggedComment,
  flaggedVideo,
  copyrightClaim,
  getTopUploads,
  watchHistory,
  getHistory,
} = require("../db");

explorerRouter.get("/", requireUser, async (req, res, next) => {
  try {
    const allContent = await getAllUploads();
    res.send({ uploads: allContent });
  } catch (error) {
    next({ name: "ErrorGettingUploads", message: "Could Not get the uploads" });
  }
});

module.exports = explorerRouter;
