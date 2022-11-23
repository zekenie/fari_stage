const FARI_API = "https://fari-testapi.herokuapp.com/api";
let selected = $(this);
const myToken = localStorage.getItem("fariToken");
let count = 0;

let videoFlag = false;
let commentFlag = false;

(function () {
  $("#info").addClass("selected");
  $("#discover").addClass("selected");
  if (!myToken || myToken === null) {
    window.location.href = "/login";
  }
  setTimeout(function () {
    updateViews();
  }, 90000);
})();

$("#comments").click(() => {
  $(".feature-info").css("display", "none");
  $("#info").removeClass("selected");
  $(".comments").css("display", "block");
  $("#comments").addClass("selected");
});

$("#info").click(() => {
  $(".comments").css("display", "none");
  $("#comments").removeClass("selected");
  $(".feature-info").css("display", "block");
  $("#info").addClass("selected");
});

$(".show-more").click(function () {
  $(this).parent().find(".comment-card").css("height", "15rem");
});

$("#discover").click(() => {
  $("#discover").addClass("selected");
  $(".discover-videos").css("display", "block");

  $("#watchlist-videos").removeClass("selected");
  $(".later-videos").css("display", "none");

  $("#favorite-videos").removeClass("selected");
  $(".fav-videos").css("display", "none");

  recommendedVideos().then(renderRecVids);
});

$("#watchlist-videos").click(() => {
  $("#discover").removeClass("selected");
  $(".discover-videos").css("display", "none");

  $("#watchlist-videos").addClass("selected");
  $(".later-videos").css("display", "block");

  $("#favorite-videos").removeClass("selected");
  $(".fav-videos").css("display", "none");

  getWatchList().then(renderlaterVids);
});

$("#favorite-videos").click(() => {
  $("#discover").removeClass("selected");
  $(".discover-videos").css("display", "none");

  $("#watchlist-videos").removeClass("selected");
  $(".later-videos").css("display", "none");

  $("#favorite-videos").addClass("selected");
  $(".fav-videos").css("display", "block");
  getMyFavs().then(renderfavVids);
});

async function getChannel() {
  try {
    const response = await fetch(
      `${FARI_API}/users/getChannel/${channelName}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    return data.channels;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function getUserProfile() {
  try {
    const response = await fetch(`${FARI_API}/users/myprofile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    if (data.profile.length === 0) {
      window.location.href = "/login";
    }
    return data.profile;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function playVideo() {
  try {
    const id = localStorage.getItem("videoID");
    const response = await fetch(`${FARI_API}/explorer/play/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    if (data.video.length === 0) {
      window.location.href = "/explorer";
    }
    return data.video;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderVideo(video) {
  let featurePresentation = $(`
 <div class="feature-presentation">
              <video class="feature" id="mainevent" 
	      src="${video.videofile}" 
	      poster="${
          video.videothumbnail
            ? video.videothumbnail
            : "https://drotje36jteo8.cloudfront.net/no_longer_available.png"
        }" 
	      preload="auto" 
	      autoplay>
              </video>                         
              <div class="controls-overlay">
                <div class="video-status">
                  <h1 id="status"></h1>
		    <div class="buffer">
                       <div class="buffer-ring"></div>
		       <h1>BUFFERING...</h1>
                       </div>
                </div>
                <div class="video-controls">
                  <div class="control-btns">
                    <ul id="btns">
                      <li class="icon"><i class="fa-solid fa-play"></i></li>
                      <li class="icon"><i class="fa-solid fa-pause"></i></li>
                      <li class="icon"><i class="fa-solid fa-volume-high"></i><input id="volume-range"type="range" min="0" max="10" step="1" value="5" /></li>
                      <li class="icon"><i class="fa-solid fa-expand"></i></li>
                    
                    </ul>
                    
                    <div class="time-stamp">
                      <h3 class="current">00:00:00</h3> <h3>/</h3> <h3 class="duration">00:00:00</h3>
                    </div>
                  </div>
                  <div class="progress-bar">
                    <div class="bar-fill"></div>
                  </div>
                </div>
              </div>
            </div>
`).data("video", video);
  $(".main-content").prepend(featurePresentation);

  const videoPlayer = document.querySelector(".video-player");
  const vid = document.querySelector(".feature");
  const progress = document.querySelector(".progress-bar");
  const currentTime = $(".current");
  const totalTime = $(".duration");

  $(featurePresentation).on("click", ".fa-play", function () {
    $(".video-status #status").css("display", "block");
    $(".video-status #status").empty();
    $(".video-status #status").text("PLAYING");
    $(".feature").get(0).play();
    $(".main-content .controls-overlay").addClass("inactive");
    $(".buffer").css("dipslay", "none");
  });

  $(featurePresentation).on("click", ".fa-pause", function () {
    $(".video-status #status").empty();
    $(".video-status #status").text("PAUSED");
    $(".video-status #status").css("display", "block");
    $(".feature").get(0).pause();
    $(".main-content .controls-overlay").removeClass("inactive");
    $(".buffer").css("dipslay", "none");
  });

  $(featurePresentation).on("click", ".feature", function () {
    if ($(".feature").get(0).play()) {
      $(".feature").get(0).pause();
      //   $(".icon .fa-pause").addClass("active-icon").siblings().removeClass("active");
    } else if ($(".feature").get(0).pause()) {
      $(".feature").get(0).play();
      //   $(".icon .fa-play").addClass("active-icon").siblings().removeClass("active");
    }
  });

  $(featurePresentation).on("click", ".fa-expand", function () {
    $(".feature").get(0).requestFullscreen();
  });

  $(featurePresentation).on("click", ".fa-volume-high", function () {
    $("#volume-range").toggle();
    $(".control-btns input").toggleClass("active");
  });

  $(featurePresentation).on("mousemove", "#volume-range", function (event) {
    vid.volume = event.target.value;
  });

  function timeStamp() {
    let currentHours = Math.floor(vid.currentTime / 3600);
    let currentMinutes = Math.floor((vid.currentTime % 3600) / 60);
    let currentSeconds = Math.floor((vid.currentTime % 3600) % 60);

    let durationHours = Math.floor(vid.duration / 3600);
    let durationMinutes = Math.floor((vid.duration % 3600) / 60);
    let durationSeconds = Math.floor(vid.duration % 60);

    currentTime.text(
      `${currentHours ? currentHours + ":" : " "}${
        currentMinutes < 10 ? "0" + currentMinutes : currentMinutes
      }:${currentSeconds < 10 ? "0" + currentSeconds : currentSeconds}`
    );

    totalTime.text(
      `${durationHours ? durationHours + ":" : " "}${
        durationMinutes < 10 ? "0" + durationMinutes : durationMinutes
      }:${durationSeconds < 10 ? "0" + durationSeconds : durationSeconds}`
    );
  }

  vid.addEventListener("timeupdate", timeStamp);

  vid.addEventListener("timeupdate", function () {
    const percentage = (vid.currentTime / vid.duration) * 100;
    $(".bar-fill").css("width", ` ${percentage}%`);
  });

  vid.addEventListener("waiting", function (event) {
    $(".video-status #status").empty();
    $(".video-status #status").css("display", "none");
    $(".buffer").css("display", "flex");
    $(".main-content .controls-overlay").removeClass("inactive");
    $(".fa-pause").css("pointer-events", "none");
    $(".fa-play").css("pointer-events", "none");
  });

  vid.addEventListener("canplaythrough", function (event) {
    $(".buffer").css("display", "none");
    $(".video-status #status").empty();
    $(".video-status #status").text("PLAYING");
    $(".video-status #status").css("display", "block");
    $(".main-content .controls-overlay").addClass("inactive");
    $(".fa-pause").css("pointer-events", "auto");
    $(".fa-play").css("pointer-events", "auto");
  });

  document.addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode == 37) {
      vid.currentTime -= 10;
    } else if (event.keyCode == 39) {
      vid.currentTime += 10;
    } else if (event.keyCode == 32 && vid.paused) {
      $(".video-status #status").empty();
      $(".video-status #status").text("PLAYING");
      vid.play();
      $(".main-content .controls-overlay").addClass("inactive");
    } else if (event.keyCode == 32 && !vid.paused) {
      $(".video-status #status").empty();
      $(".video-status #status").text("PAUSED");
      vid.pause();
      $(".main-content .controls-overlay").removeClass("inactive");
    }
  });

  progress.addEventListener("click", function (event) {
    const progressTime = (event.offsetX / progress.offsetWidth) * vid.duration;
    vid.currentTime = progressTime;
  });

  return featurePresentation;
}

//Video Info

function renderVideoInfo(video) {
  $(".feature-info").empty();
  $(".interactions").empty();
  let freePresentations = [];
  let paidPresentations = [];

  for (let index = 0; index < video.length; index++) {
    if (
      video[index].paid_content === "free" ||
      video[index].paid_content === null ||
      video[index].content_type === "vlog" ||
      video[index].content_type === "other"
    ) {
      freePresentations.push(video[index]);
    } else if (
      video[index].paid_content === "pay" &&
      video[index].content_type === "film"
    ) {
      paidPresentations.push(video[index]);
    }
  }

  freePresentations.forEach(function (video) {
    let viewsCounted = video.videoviewcount;
    let viewsString = viewsCounted.toString();
    if (video.videoviewcount > 1_000_000) {
      viewsString = (video.videoviewcount / 1_000_000).toFixed(1) + "m";
    } else if (video.videoviewcount > 1_000) {
      viewsString = (video.videoviewcount / 1_000).toFixed(1) + "k";
    }

    let likesCounted = video.videolikecount;
    let likesString = likesCounted.toString();
    if (video.videolikecount > 1_000_000) {
      likesString = (video.videolikecount / 1_000_000).toFixed(1) + "m";
    } else if (video.videolikecount > 1_000) {
      likesString = (video.videolikecount / 1_000).toFixed(1) + "k";
    }

    let dislikesCounted = video.videodislikecount;
    let dislikesString = dislikesCounted.toString();
    if (video.videodislikecount > 1_000_000) {
      dislikesString = (video.videodislikecount / 1_000_000).toFixed(1) + "m";
    } else if (video.videodislikecount > 1_000) {
      dislikesString = (video.videodislikecount / 1_000).toFixed(1) + "k";
    }

    let unesDescription = _.unescape(video.videodescription);
    let unesTitle = _.unescape(video.videotitle);

    let featurePresentationInfo = $(` 
               <div class="author">
              <img src="${
                video.profile_avatar
                  ? video.profile_avatar
                  : "https://drotje36jteo8.cloudfront.net/noAvi.png"
              }" alt="avatar"/>
                <h3><a href="/channel-profile" style="color:#fdfbf9; text-decoration:none;">${
                  video.channelname
                }</a></h3>
              </div>
              <div class="titles">
              <h2>${unesTitle}</h2>
              <h4>${viewsString ? viewsString : "No Views"} Views</h4>
              <h3>${unesDescription ? unesDescription : ""}</h3>
              </div>
`).data("video", video);

    $(".feature-info").append(featurePresentationInfo);

    $(featurePresentationInfo).on("click", "h3", function (event) {
      let channelView = $(this).closest(".author").data("video");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    let videoData = $(`
                <li id="like">${
                  likesString ? likesString : "0"
                }<i class="fa-solid fa-thumbs-up"></i></li>
                <li id="dislike">${
                  dislikesString ? dislikesString : "0"
                } <i class="fa-solid fa-thumbs-down"></i> </li>
                <li id="favorite"><i class="fa-solid fa-heart"></i></li>
                <li id="watchlist"><i class="fa-solid fa-clock"></i> </li>
                <li id="flag"><i class="fa-solid fa-flag"></i></li>
  `).data("video", video);
    $(".options .interactions").append(videoData);

    $(videoData).on("click", ".fa-thumbs-up", async function () {
      likeStatus();
    });

    $(videoData).on("click", ".fa-thumbs-down", async function () {
      dislikeStatus();
    });

    $(videoData).on("click", ".fa-heart", async function () {
      favVideo();
    });

    $(videoData).on("click", ".fa-clock", async function () {
      laterVideo();
    });

    $(videoData).on("click", ".fa-flag", async function () {
      videoFlag = true;
      $(".legalities").addClass("active");
      $(".content").addClass("inactive");
    });

    return featurePresentationInfo;
  });

  paidPresentations.forEach(function (video) {
    let viewsCounted = video.videoviewcount;
    let viewsString = viewsCounted.toString();
    if (video.videoviewcount > 1_000_000) {
      viewsString = (video.videoviewcount / 1_000_000).toFixed(1) + "m";
    } else if (video.videoviewcount > 1_000) {
      viewsString = (video.videoviewcount / 1_000).toFixed(1) + "k";
    }

    let likesCounted = video.videolikecount;
    let likesString = likesCounted.toString();
    if (video.videolikecount > 1_000_000) {
      likesString = (video.videolikecount / 1_000_000).toFixed(1) + "m";
    } else if (video.videolikecount > 1_000) {
      likesString = (video.videolikecount / 1_000).toFixed(1) + "k";
    }

    let dislikesCounted = video.videodislikecount;
    let dislikesString = dislikesCounted.toString();
    if (video.videodislikecount > 1_000_000) {
      dislikesString = (video.videodislikecount / 1_000_000).toFixed(1) + "m";
    } else if (video.videodislikecount > 1_000) {
      dislikesString = (video.videodislikecount / 1_000).toFixed(1) + "k";
    }

    let featurePresentationInfo = $(` 
               <div class="author">
              <img src="${
                video.profile_avatar
                  ? video.profile_avatar
                  : "https://drotje36jteo8.cloudfront.net/noAvi.png"
              }" alt="avatar"/>
                <h3><a href="/channel-profile" style="color:#fdfbf9; text-decoration:none;">${
                  video.channelname
                }</a></h3>
              </div>
              <div class="titles">
              <h2>${video.videotitle}</h2>
              <h4>${viewsString ? viewsString : "No Views"} Views</h4>
              <h3>${video.videodescription ? video.videodescription : ""}</h3>
              </div>
`).data("video", video);

    $(".feature-info").append(featurePresentationInfo);

    $(featurePresentationInfo).on("click", "h3", function (event) {
      let channelView = $(this).closest(".author").data("video");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    let videoData = $(`
                <li id="like">${
                  likesString ? likesString : "0"
                }<i class="fa-solid fa-thumbs-up"></i></li>
                <li id="dislike">${
                  dislikesString ? dislikesString : "0"
                } <i class="fa-solid fa-thumbs-down"></i></li>
                <li id="flag"><i class="fa-solid fa-flag"></i></li>
  `).data("video", video);
    $(".options .interactions").append(videoData);

    $(videoData).on("click", ".fa-thumbs-up", async function () {
      likeStatus();
    });

    $(videoData).on("click", ".fa-thumbs-down", async function () {
      dislikeStatus();
    });

    $(videoData).on("click", ".fa-flag", async function () {
      videoFlag = true;
      $(".legalities").addClass("active");
      $(".content").addClass("inactive");
    });

    return featurePresentationInfo;
  });
}

async function likeVideo() {
  let id = localStorage.getItem("videoID");
  var userlike = localStorage.getItem("userID");
  try {
    const likingUser = {
      userid: userlike,
      videoid: id,
    };
    const response = await fetch(`${FARI_API}/explorer/youlikeme/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(likingUser),
    });
    const data = await response.json();
    playVideo().then(renderVideoInfo).then(checkUserLikes);
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function dislikeVideo() {
  let id = localStorage.getItem("videoID");
  var userdislike = localStorage.getItem("userID");
  try {
    const dislkingUser = {
      userid: userdislike,
      videoid: id,
    };

    const response = await fetch(`${FARI_API}/explorer/youdislikeme/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(dislkingUser),
    });
    const data = await response.json();
    playVideo().then(renderVideoInfo).then(checkUserDisLikes);
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderFeature(feat) {
  $(".main-content .feature-presentaion").empty();
  feat.forEach(function (video) {
    $(".main-content .feature-presentaion").append(renderVideo(video));
  });
}

async function favVideo() {
  var profile = await getUserProfile();
  var getFeature = await playVideo();

  var favedUser = profile[0].userid;
  var vidID = getFeature[0].videoid;
  var channelname = getFeature[0].channelname;
  var channel_avi = getFeature[0].channelpic;
  var video = getFeature[0].videofile;
  var posFile = getFeature[0].videothumbnail;
  var vidTitle = getFeature[0].videotitle;
  var channelident = getFeature[0].channelid;
  let views = getFeature[0].videoviewcount;

  const favedBody = {
    userFaved: favedUser,
    videoid: vidID,
    channelname: channelname,
    channelavi: channel_avi,
    videofile: video,
    videothumbnail: posFile,
    videotitle: vidTitle,
    channelid: channelident,
    videoviewcount: views,
  };

  try {
    const response = await fetch(`${FARI_API}/explorer/youfavedme`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(favedBody),
    });
    const data = await response.json();
    $(".newUserMessage").empty();
    $(".fa-heart").attr("id", "faved");
    setTimeout(function () {
      $(".alert").css("display", "block");
      $(".alert h1").empty();
      $(".alert h1").text("Video has been added to your favorites");
    }, 4000);
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function updateViews() {
  let id = localStorage.getItem("videoID");
  try {
    const response = await fetch(
      `${FARI_API}/explorer/update/viewcount/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    playVideo().then(renderVideoInfo);
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function laterVideo() {
  var profile = await getUserProfile();
  var getFeature = await playVideo();

  var userListed = profile[0].userid;
  var vidID = getFeature[0].videoid;
  var channelname = getFeature[0].channelname;
  var channel_avi = getFeature[0].channelpic;
  var video = getFeature[0].videofile;
  var posFile = getFeature[0].videothumbnail;
  var vidTitle = getFeature[0].videotitle;
  var channelident = getFeature[0].channelid;
  let views = getFeature[0].videoviewcount;

  const laterBody = {
    userListed: userListed,
    videoid: vidID,
    channelname: channelname,
    channelavi: channel_avi,
    videofile: video,
    videothumbnail: posFile,
    videotitle: vidTitle,
    channelid: channelident,
    videoviewcount: views,
    paidtoview: false,
  };

  try {
    const response = await fetch(`${FARI_API}/explorer/watchlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(laterBody),
    });
    const data = await response.json();
    $(".newUserMessage").empty();
    $(".fa-clock").attr("id", "faved");
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

//Discover/Recommended Videos

async function recommendedVideos() {
  try {
    const response = await fetch(`${FARI_API}/explorer/recommended`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    return data.uploads;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderRecomVideos(uploads) {
  let unesChannel = _.unescape(uploads.channel_name);
  let unesTitle = _.unescape(uploads.videotitle);
  let recVids = $(`   
      <div class="card">
            <div class="upload">
              <video poster="${uploads.videothumbnail}" src ="${uploads.videofile}" preload="none"></video>
              <div class="upload-overlay">
                <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
              </div>
              <div class="upload-info">
                  <h6><a href="/channel-profile" style="color:#a9a9b0; text-decoration:none;" aria-label="View user channel">${unesChannel}</a><h6>
                <h5>${unesTitle}</h5>
              </div>
            </div>
`).data("uploads", uploads);
  $(".discover-videos").append(recVids);

  $(recVids).on("click", "h6", function () {
    let channelView = $(this).closest(".card").data("uploads");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });

  $(recVids).on("click", ".fa-play", async function (event) {
    event.preventDefault();
    $(".feature-info").empty();
    $(".feature-presentation").empty();
    let videoUpload = $(this).closest(".card").data("uploads");
    let id = videoUpload.videoid;
    localStorage.setItem("videoID", id);

    try {
      const response = await fetch(`${FARI_API}/explorer`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      });
      const data = await response.json();
      window.location.href = "/theater";
    } catch (error) {
      response.status(400).send(error);
    }
  });

  return recVids;
}

function renderRecVids(recVid) {
  $(".discover-videos").empty();
  recVid.forEach(function (uploads) {
    $(".discover-videos").append(renderRecomVideos(uploads));
  });
}
//Favorite Videos

async function getMyFavs() {
  var userid = localStorage.getItem("userID");
  try {
    const response = await fetch(`${FARI_API}/explorer/myfavs/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    if (data.myFavVids.length > 0) {
      $(".fav-videos").empty();
      $(".newUserMessage-favs message").css("display", "none");
    } else {
      $(".newUserMessage-favs message").css("display", "block");
    }
    return data.myFavVids;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function renderFavVideos(myFavVids) {
  let unesChannel = _.unescape(myFavVids.channel);
  let unesTitle = _.unescape(myFavVids.title);
  let favVids = $(`   
      <div class="card">
            <div class="upload">
              <video poster="${myFavVids.thumbnail}" src ="${myFavVids.video}" preload="none"></video>
              <div class="upload-overlay">
                <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
              </div>
              <div class="upload-info">
                  <h6><a href="/channel-profile" style="color:#a9a9b0; text-decoration:none;" aria-label="View user channel">${unesChannel}</a><h6>
                <h5>${unesTitle}</h5>
              </div>
            </div>
`).data("myFavVids", myFavVids);
  $(".fav-videos").append(favVids);

  $(favVids).on("click", "h6", function () {
    let channelView = $(this).closest(".card").data("myFavVids");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });

  $(favVids).on("click", ".fa-play", async function (event) {
    event.preventDefault();
    $(".feature-info").empty();
    $(".feature-presentation").empty();
    let videoUpload = $(this).closest(".card").data("myFavVids");
    let id = videoUpload.videoid;
    localStorage.setItem("videoID", id);

    try {
      const response = await fetch(`${FARI_API}/explorer`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      });
      const data = await response.json();
      window.location.href = "/theater";
    } catch (error) {
      response.status(400).send(error);
    }
  });

  return favVids;
}

function renderfavVids(favVid) {
  favVid.forEach(function (myFavVids) {
    $(".fav-videos").append(renderFavVideos(myFavVids));
  });
}

//Watchlist Videos

async function getWatchList() {
  var userListed = localStorage.getItem("userID");
  try {
    const response = await fetch(
      `${FARI_API}/explorer/watchlater/${userListed}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.myWatchList.length > 0) {
      $(".later-videos").empty();
      $(".newUserMessage-watchlater message").css("display", "none");
    } else {
      $(".newUserMessage-watchlater message").css("display", "block");
    }
    return data.myWatchList;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function renderLaterVideos(myWatchList) {
  let unesChannel = _.unescape(myWatchList.channel);
  let unesTitle = _.unescape(myWatchList.title);
  let laterVids = $(`   
      <div class="card">
            <div class="upload">
              <video poster="${myWatchList.thumbnail}" src ="${myWatchList.video}" preload="none"></video>
              <div class="upload-overlay">
                <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
              </div>
              <div class="upload-info">
                  <h6><a href="/channel-profile" style="color:#a9a9b0; text-decoration:none;" aria-label="View user channel">${unesChannel}</a><h6>
                <h5>${unesTitle}</h5>
              </div>
            </div>
`).data("myWatchList", myWatchList);
  $(".later-videos").append(laterVids);

  $(laterVids).on("click", "h6", function () {
    let channelView = $(this).closest(".card").data("myWatchList");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });

  $(laterVids).on("click", ".fa-play", async function (event) {
    event.preventDefault();
    $(".feature-info").empty();
    $(".feature-presentation").empty();
    let videoUpload = $(this).closest(".card").data("myWatchList");
    let id = videoUpload.videoid;
    localStorage.setItem("videoID", id);

    try {
      const response = await fetch(`${FARI_API}/explorer`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      });
      const data = await response.json();
      window.location.href = "/theater";
    } catch (error) {
      response.status(400).send(error);
    }
  });

  return laterVids;
}

function renderlaterVids(laterVid) {
  laterVid.forEach(function (myWatchList) {
    $(".later-videos").append(renderLaterVideos(myWatchList));
  });
}
//Comments

$("#comment").keyup(function (event) {
  if (event.keyCode == 32) {
    event.preventDefault();
    return false;
  }

  let text = _.escape($("#comment").val());
  return text;
});

$("#send-comment").on("click", async function newComment(event) {
  event.preventDefault();
  let comRemark = _.escape($("#comment").val());
  var profile = await getUserProfile();
  var username = localStorage.getItem("userUsername");
  var userid = localStorage.getItem("userID");
  var userPic = localStorage.getItem("userAvi");
  var postId = localStorage.getItem("videoID");

  const userRemark = {
    videoid: postId,
    commentorid: userid,
    commentorname: username,
    commentorpic: userPic,
    user_comment: comRemark,
  };
  try {
    const response = await fetch(`${FARI_API}/explorer/comment/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(userRemark),
    });
    const data = await response.json();
    $("#comment").val("");
    updateCommentCount();
    videoComments().then(renderCommentSection);
    return data.comment;
  } catch (error) {
    response.status(400).send(error);
  }
});

async function videoComments() {
  let videoid = localStorage.getItem("videoID");
  try {
    const response = await fetch(`${FARI_API}/explorer/comments/${videoid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    return data.comments;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderCommentSection(comments, index) {
  $(".usersComments").empty();
  let myRemarks = [];
  let otherRemarks = [];
  let myComments = localStorage.getItem("userID");
  for (let index = 0; index < comments.length; index++) {
    if (comments[index].commentorid == myComments) {
      myRemarks.push(comments[index]);
    } else if (comments[index].commentorid !== myComments) {
      otherRemarks.push(comments[index]);
    }
  }

  myRemarks.forEach(function (comments) {
    let unesComment = _.unescape(comments.user_comment);
    let commentsActive = $(`     
            <div class="my comment-card">
                   <div class="comment-options">
    <ul>
      <li id="edit"><i class="fa-solid fa-pencil"></i>Edit</li>
      <li id="delete"><i class="fa-solid fa-xmark"></i>Delete</li>
    </ul>
</div>
              <div class="comment-content">
              <img loading="lazy" src="${
                comments.commentorpic
                  ? comments.commentorpic
                  : "https://drotje36jteo8.cloudfront.net/noAvi.png"
              }" alt="avatar"/>
                <div class="commenter-info">
                  <h5 class="user"><a href="/channel-profile" style="color:#a9a9b0; text-decoration:none;">${
                    comments.commentorname
                  }</a></h5>
              <p id="user-comment">${unesComment}</p>
              </div>
              </div>
              <div class="show-more">
                <i class="fa-solid fa-ellipsis"></i>
              </div>
            </div>
          
        </div>
`).data("comments", comments);
    $(".usersComments").append(commentsActive);

    $(commentsActive).on("click", ".user", function () {
      let channelView = $(this).closest(".comment-card").data("comments");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(commentsActive).keyup(function (event) {
      if (event.keyCode == 32) {
        event.preventDefault();
        return false;
      }

      let com = _.escape($("#comment").text());
      return com;
    });

    $(commentsActive).on("click", ".fa-ellipsis", function () {
      $(this)
        .closest(".comment-card")
        .find(".comment-options")
        .toggleClass("active");
    });

    $(commentsActive).on("click", "#delete", async function () {
      let commentDel = $(this).closest(".comment-card").data("comments");
      let id = commentDel.commentid;
      try {
        const response = await fetch(
          `${FARI_API}/explorer/comment/delete/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${myToken}`,
            },
          }
        );
        reduceCommentCount();
        $(this).closest(".comment-card").remove();
      } catch (error) {
        response.status(400).send(error);
      }
    });

    $(commentsActive).on("click", "#edit", async function () {
      let commentEdit = $(this).closest(".comment-card").data("comments");
      let id = commentEdit.commentid;
      $(".comment-options").removeClass("active");
      $(this)
        .closest(".comment-card")
        .find("#user-comment")
        .attr("contenteditable", "true");
      $(this)
        .closest(".comment-card")
        .find("#user-comment")
        .addClass("editMode");

      let saveEdit = `
   <div class="editSaveCancel" contenteditable="false">
  <button class="editsSave" id="save">Save</button>
  <button class="editsSave" id="cancel">Cancel</button>
  </div>`;

      $(this).closest(".comment-card").append(saveEdit);

      $(commentsActive).on("click", "#cancel", async function () {
        $(this)
          .closest(".comment-card")
          .find("#user-comment")
          .removeClass("editMode");
        $(this)
          .closest(".comment-card")
          .find("#user-comment")
          .attr("contenteditable", "false");
        $(".editSaveCancel").remove();

        videoComments().then(renderCommentSection);
      });

      $(commentsActive).on("click", "#save", async function () {
        const updatecomRemark = _.escape(
          $(this).closest(".comment-card").find("#user-comment").text()
        );
        try {
          const updateRemark = {
            user_comment: updatecomRemark,
          };

          const response = await fetch(
            `${FARI_API}/explorer/comment/edit/${id}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${myToken}`,
              },
              body: JSON.stringify(updateRemark),
            }
          );
          const data = await response.json();
          $(this)
            .closest(".comment-card")
            .find("#user-comment")
            .removeClass("editMode");
          $(this)
            .closest(".comment-card")
            .find("#user-comment")
            .attr("contenteditable", "false");
          $(".editSaveCancel").remove();
          videoComments().then(renderCommentSection);
        } catch (error) {
          response.status(400).send(error);
        }
      });
    });
  });

  otherRemarks.forEach(function (comments) {
    let unesComment = _.unescape(comments.user_comment);
    let otherComments = $(`        
        <div class="comment-card">
              <div class="comment-content">
              <img loading="lazy" src="${
                comments.commentorpic
                  ? comments.commentorpic
                  : "https://drotje36jteo8.cloudfront.net/noAvi.png"
              }" alt="avatar"/>
                <div class="commenter-info">
                  <h5 class="user"><a href="/channel-profile" style="color:#a9a9b0; text-decoration:none;">${
                    comments.commentorname
                  }</a></h5>
              <h4>${unesComment}</h4>
                </div>
              </div>
                <div class="show-more">
                <i class="fa-solid fa-circle-exclamation"></i>
              </div>
            </div>
`).data("comments", comments);
    $(".usersComments").append(otherComments);

    $(otherComments).on("click", ".user", function () {
      let channelView = $(this).closest(".comment-card").data("comments");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(otherComments).on("click", ".user", function () {
      let channelView = $(this).closest(".comment-card").data("comments");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(otherComments).on("click", ".fa-circle-exclamation", function () {
      commentFlag = true;
      let commentView = $(this).closest(".comment-card").data("comments");
      localStorage.setItem("commentID", commentView.commentid);
      $(".legalities").addClass("active");
      $(".content").addClass("inactive");
    });
  });
}

async function updateCommentCount() {
  let id = localStorage.getItem("videoID");

  try {
    const response = await fetch(
      `${FARI_API}/explorer/updatecommentcount/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    CommentCount().then(renderCommentCount);
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function reduceCommentCount() {
  let id = localStorage.getItem("videoID");

  try {
    const response = await fetch(
      `${FARI_API}/explorer/reducecommentcount/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    CommentCount().then(renderCommentCount);
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function CommentCount() {
  let videoid = localStorage.getItem("videoID");

  try {
    const response = await fetch(
      `${FARI_API}/analytics/commentscount/${videoid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.total.length === 0) {
      localStorage.setItem("commentCount", "0");
    } else {
      localStorage.setItem("commentCount", data.total[0].count);
    }
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderCommentCount(total) {
  $("#comment-count").empty();
  let viewsCounted = localStorage.getItem("commentCount");
  let viewsString = viewsCounted.toString();
  if (viewsCounted > 1_000_000) {
    viewsString = (viewsCounted / 1_000_000).toFixed(1) + "m";
  } else if (viewsCounted > 1_000) {
    viewsString = (viewsCounted / 1_000).toFixed(1) + "k";
  }

  let count = localStorage.getItem("commentCount");
  let comCount = $(`
<h3> Comments (${viewsString ? viewsString : "0"}) </h3>
`).data("total", total);

  $("#comment-count").prepend(comCount);
}

//Check Users Likes

async function checkUserLikes() {
  let videoid = localStorage.getItem("videoID");
  var userid = localStorage.getItem("userID");
  try {
    const response = await fetch(
      `${FARI_API}/explorer/mylikes/${videoid}/${userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.iLike.length > 0) {
      $(".fa-thumbs-up").attr("id", "faved");
      localStorage.setItem("likeID", data.iLike[0].likeid);
    }
    return data.iLike;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function compareLikes() {
  let videoid = localStorage.getItem("videoID");
  var userid = localStorage.getItem("userID");
  try {
    const response = await fetch(
      `${FARI_API}/explorer/mylikes/${videoid}/${userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.iLike.length > 0) {
      revokeLike();
    }
    return data.iLike;
  } catch (error) {
    console.error("Oops could not determine if you like that video", error);
  }
}

async function checkUserDisLikes() {
  let videoid = localStorage.getItem("videoID");
  var userid = localStorage.getItem("userID");

  try {
    const response = await fetch(
      `${FARI_API}/explorer/mydislikes/${videoid}/${userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.idisLike.length > 0) {
      $(".fa-thumbs-down").attr("id", "faved");
      localStorage.setItem("disLikeID", data.idisLike[0].dislikeid);
    }
    return data.idisLike;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function compareDisLikes() {
  let videoid = localStorage.getItem("videoID");
  var userid = localStorage.getItem("userID");

  try {
    const response = await fetch(
      `${FARI_API}/explorer/mydislikes/${videoid}/${userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.idisLike.length > 0) {
      revokeDisLike();
    }
    return data.idisLike;
  } catch (error) {
    response.status(400).send(error);
  }
}

//Revoke Likes

async function likeStatus() {
  let videoid = localStorage.getItem("videoID");
  var userid = localStorage.getItem("userID");

  try {
    const response = await fetch(
      `${FARI_API}/explorer/mylikes/${videoid}/${userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.iLike.length > 0) {
      revokeLike();
    } else if (data.iLike.length === 0) {
      likeVideo();
      compareDisLikes();
    }
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function revokeLike() {
  let videoid = localStorage.getItem("videoID");
  let id = localStorage.getItem("likeID");

  try {
    const response = await fetch(
      `${FARI_API}/explorer/youlikeme/revoke/${id}/${videoid}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    $(".fa-thumbs-up").removeAttr("id");
    playVideo().then(renderVideoInfo);
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function dislikeStatus() {
  let videoid = localStorage.getItem("videoID");
  var userid = localStorage.getItem("userID");

  try {
    const response = await fetch(
      `${FARI_API}/explorer/mydislikes/${videoid}/${userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.idisLike.length > 0) {
      revokeDisLike();
    } else if (data.idisLike.length === 0) {
      dislikeVideo();
      compareLikes();
    }
    return data.idisLike;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function revokeDisLike() {
  let videoid = localStorage.getItem("videoID");
  let id = localStorage.getItem("disLikeID");

  try {
    const response = await fetch(
      `${FARI_API}/explorer/youdislikeme/revoke/${id}/${videoid}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    $(".fa-thumbs-down").removeAttr("id");
    playVideo().then(renderVideoInfo);
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

//Search

$("#searchfield").click(function (event) {
  event.preventDefault();
  getSearchResults().then(renderSearchResults);
  $(window).scrollTop(0);
});

async function getSearchResults() {
  let videotags = _.escape($("#searchfield").val());
  try {
    const response = await fetch(
      `${FARI_API}/explorer/video/search/${videotags}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    return data.videos;
  } catch (error) {
    response.status(400).send(error);
  }
}

$("#searchfield").keyup(function (event) {
  event.preventDefault();
  if (event.keyCode == 32) {
    event.preventDefault();
    return false;
  } else if (event.keyCode === 13) {
    getEnteredSearch().then(renderSearchResults);
    $(window).scrollTop(0);
  }
});

async function getEnteredSearch() {
  let query = _.escape($("#searchfield").val());
  try {
    const response = await fetch(`${FARI_API}/explorer/video/search/${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    return data.videos;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderSearchedContent(videos) {
  let unesChannel = _.unescape(videos.channel_name);
  let unesTitle = _.unescape(videos.videotitle);
  let searchvideo = $(`     
      <div class="card">
            <div class="upload">
              <video ${videos.videothumbnail}" src ="${videos.videofile}" preload="none"></video>
              <div class="upload-overlay">
                <a href="/theater"><i class="fa-solid fa-play"></i></a>
              </div>
              <div class="upload-info">
                <a href="/channel-profile">
                  <h6><a href="/channel-profile" style="color:#fdfbf9; text-decoration:none;">${unesChannel}</a><h6>
                </a>
                <h5>${unesTitle}</h5>
              </div>
            </div>
          </div>
`).data("videos", videos);
  $(".discover-videos").append(searchvideo);

  $(searchvideo).on("click", "h6", function () {
    let channelView = $(this).closest(".card").data("videos");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });

  $(searchvideo).on("click", ".fa-play", async function (event) {
    event.preventDefault();
    let videoSearc = $(this).closest(".card").data("videos");
    let id = videoSearc.videoid;
    localStorage.setItem("videoID", id);
    try {
      const response = await fetch(`${FARI_API}/explorer`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      });
      const data = await response.json();
      window.location.reload();
      return data;
    } catch (error) {
      response.status(400).send(error);
    }
  });
  return video;
}

function renderSearchResults(searchVid) {
  $(".discover-videos").empty();
  searchVid.forEach(function (videos) {
    $(".discover-videos").append(renderRecomVideos(videos));
  });
}

//Flag

async function flagComment() {
  let id = localStorage.getItem("commentID");
  let reason = $('input[name="flag"]:checked').val();
  let reasonFlagged = {
    flagged_reason: reason,
  };

  try {
    const response = await fetch(`${FARI_API}/explorer/flag-comment/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(reasonFlagged),
    });
    const data = await response.json();
    $(this).parent().find(".fa-flag").css("color", "#BF2022");
    localStorage.removeItem("commentID");
    $(".legalities").removeClass("active");
    $(".content").removeClass("inactive");
    commentFlag = false;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function flagVideo() {
  let id = localStorage.getItem("videoID");
  let reason = $('input[name="flag"]:checked').val();
  let reasonFlagged = {
    flagged_reason: reason,
  };
  try {
    const response = await fetch(`${FARI_API}/explorer/flag-video/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(reasonFlagged),
    });
    const data = await response.json();
    if (reason === "Stolen Content/Copyright Violation") {
      copyRightClaim();
    }
    $(".fa-flag").css("color", "#BF2022");
    $(".legalities").removeClass("active");
    $(".content").removeClass("inactive");
    videoFlag = false;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function copyRightClaim() {
  let requestor_name = _.escape($("#submittee-name").val());
  let copyrightOwner = _.escape($("#submittee-owner").val());
  let relationship = _.escape($("#submittee-relationship").val());
  let copyrightAddress = _.escape($("#submittee-address").val());
  let city_state_zip = _.escape($("#submittee-city").val());
  let copyrightCountry = _.escape($("#submittee-country").val());
  let user = JSON.parse(localStorage.getItem("userID"));
  let videoid = JSON.parse(localStorage.getItem("videoID"));

  let copyrightPlaintiff = {
    videoid: videoid,
    userid: user,
    requestor_name: requestor_name,
    owner: copyrightOwner,
    relationship: relationship,
    address: copyrightAddress,
    city_state_zip: city_state_zip,
    country: copyrightCountry,
  };

  try {
    const response = await fetch(`${FARI_API}/explorer/copyright-issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(copyrightPlaintiff),
    });
    const data = await response.json();
    $(".fa-flag").css("color", "#BF2022");
    $(".legalities").removeClass("active");
    $(".content").removeClass("inactive");
    videoFlag = false;
  } catch (error) {
    response.status(400).send(error);
  }
}

$(".report").on("click", function (event) {
  event.preventDefault();
  if (videoFlag === true) {
    flagVideo();
  } else if (commentFlag === true) {
    flagComment();
  }
});

$("#exit").click(function () {
  $(".legalities").removeClass("active");
  $(".content").removeClass("inactive");
});

$(".copyright #exit").click(function () {
  $(".legalities").removeClass("active");
  $(".content").removeClass("inactive");
});

$("#copyright").click(() => {
  $(".copyright-form").addClass("active");
  $(".flag-reasons #exit").css("display", "none");
});

$("#harrasment").click(() => {
  $(".copyright-form").removeClass("active");
  $(".flag-reasons #exit").css("display", "initial");
});

$("#sexual").click(() => {
  $(".copyright-form").removeClass("active");
  $(".flag-reasons #exit").css("display", "initial");
});

$("#Voilence").click(() => {
  $(".copyright-form").removeClass("active");
  $(".flag-reasons #exit").css("display", "initial");
});

$("#Spam").click(() => {
  $(".copyright-form").removeClass("active");
  $(".flag-reasons #exit").css("display", "initial");
});

$("#hate").click(() => {
  $(".copyright-form").removeClass("active");
  $(".flag-reasons #exit").css("display", "initial");
});

//Watch History

async function watchHistory() {
  var getFeature = await playVideo();
  if (
    getFeature[0].paid_content === "free" ||
    getFeature[0].paid_content === null ||
    getFeature[0].content_type === "vlog" ||
    getFeature[0].content_type === "other"
  ) {
    var userListed = localStorage.getItem("userID");
    var vidID = getFeature[0].videoid;
    var channelname = getFeature[0].channelname;
    var channel_avi = getFeature[0].profile_avatar;
    var video = getFeature[0].videofile;
    var posFile = getFeature[0].videothumbnail;
    var vidTitle = getFeature[0].videotitle;
    var channelID = getFeature[0].channelid;
    var views = getFeature[0].videoviewcount;

    const historyVideo = {
      userid: userListed,
      videoid: vidID,
      channelname: channelname,
      channelavi: channel_avi,
      videofile: video,
      videothumbnail: posFile,
      videotitle: vidTitle,
      channelid: channelID,
      videoviewcount: views,
    };

    try {
      const response = await fetch(`${FARI_API}/explorer/watchhistory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
        body: JSON.stringify(historyVideo),
      });
      const data = await response.json();
      return data.upload;
    } catch (error) {
      response.status(400).send(error);
    }
  }
}

function bootstrap() {
  playVideo().then(renderFeature);
  playVideo().then(renderVideoInfo);
  recommendedVideos().then(renderRecVids);
  getMyFavs().then(renderfavVids);
  getWatchList().then(renderlaterVids);
  checkUserDisLikes();
  checkUserLikes();
  videoComments().then(renderCommentSection);
  CommentCount().then(renderCommentCount);
  watchHistory();
}

bootstrap();

//Reponsive Design

$("header .fa-bars").click(function (event) {
  $(".mobile-nav").toggleClass("active");
});

$(".mobile-nav .fa-x").click(function (event) {
  $(".mobile-nav").removeClass("active");
});
