const FARI_API = "https://fari-stage.herokuapp.com/api";
const myToken = localStorage.getItem("fariToken");

(function () {
  if (!myToken || myToken === null) {
    window.location.href = "login";
  }
})();

function onFetchStart() {
  $("#loading").addClass("active");
}

function onFetchEnd() {
  $("#loading").removeClass("active");
}

$(".menu-btns .btn").click(function () {
  let selected = $(this);
  selected.addClass("selected").siblings().removeClass("selected");
});

$("#videos").click(() => {
  $(".user-uploads").css("display", "flex");
  $(".paytoview").css("display", "none");
  $(".about").css("display", "none");
  $(".message").css("display", "none");
});

$("#paidcontent").click(() => {
  $(".user-uploads").css("display", "none");
  $(".paytoview").css("display", "flex");
  $(".about").css("display", "none");
  $(".message").css("display", "none");
});

$("#message").click(() => {
  $(".user-uploads").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".message").css("display", "block");
  $(".about").css("display", "none");
});

$("#about").click(() => {
  $(".user-uploads").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".about").css("display", "flex");
  $(".message").css("display", "none");
});

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
      window.location.href = "login";
    }
    return data.profile;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function getVideoData() {
  let id = localStorage.getItem("videoID");
  try {
    const response = await fetch(`${FARI_API}/explorer/getVideo/${id}`, {
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

async function getChannelProfile() {
  let channelid = localStorage.getItem("visitingChannelID");
  try {
    const response = await fetch(`${FARI_API}/users/channel/${channelid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    return data.channel;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function getLoggedInUser() {
  try {
    const response = await fetch(`${FARI_API}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    return data.user;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderChannelSlider(channel) {
  let viewsCounted = channel[0].subscriber_count;
  let subsToString = viewsCounted.toString();
  if (channel[0].subscriber_count > 1_000_000) {
    subsToString = (channel[0].subscriber_count / 1_000_000).toFixed(1) + "m";
  } else if (channel[0].subscriber_count > 1_000) {
    subsToString = (channel[0].subscriber_count / 1_000).toFixed(1) + "k";
  }

  let uneslocation = _.unescape(channel[0].location);
  let unesUsername = _.unescape(channel[0].channelname);

  let channelCard = $(`
          
    <div class="avatar">
      <img loading="lazy" id="avatar" src="${
        channel[0].profile_avatar
          ? channel[0].profile_avatar
          : "https://drotje36jteo8.cloudfront.net/noAvi.png"
      }" alt="avatar"/>
    </div>
    <div class="user-info">
      <h1 id="username">${unesUsername}</h1>
      <h3 id="subscriber-count"> ${
        subsToString ? subsToString : "0"
      } Subscribers</h3>
      <h5 id="location"><i class="fa-solid fa-location-dot"></i> ${
        uneslocation ? uneslocation : "Earth"
      }</h5>
      <button id="subscribe">SUBSCRIBE</button>
      </div>
      
`).data("channel", channel);
  $(".profile-info .top-info").append(channelCard);

  $(channelCard).on("click", "#subscribe", function (event) {
    event.preventDefault();
    toSubOrNot();
  });

  let channelBanner = $(`
<img src="${
    channel[0].profile_poster
      ? channel[0].profile_poster
      : "https://drotje36jteo8.cloudfront.net/wp7707348-white-blank-wallpapers.jpg"
  }" alt="poster" />
`).data("channel", channel);
  $("header .banner").append(channelBanner);

  return channelCard;
}

function renderBio(channel) {
  let unesBio = _.unescape(channel[0].bio);
  let channelBio = $(`
    <div class="form">
     <span class="textarea" contenteditable="false" role="textbox" id="bio" name="title">${
       unesBio ? unesBio : ""
     }</span>
     </div>     
`).data("channel", channel);
  $(".about").append(channelBio);
  return channelBio;
}

async function channelPost() {
  let channelid = localStorage.getItem("visitingChannelID");
  try {
    const response = await fetch(
      `${FARI_API}/users/myprofile/post/${channelid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.channelUploads.length > 0) {
      $(".user-uploads").empty();
      $(".noUploads").css("display", "none");
    } else {
      $(".noUploads").css("display", "block");
    }
    return data.channelUploads;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderPost(channelUploads, index) {
  let payVideos = [];
  let freeVideos = [];

  for (let index = 0; index < channelUploads.length; index++) {
    if (
      channelUploads[index].paid_content === "free" ||
      channelUploads[index].paid_content === null
    ) {
      freeVideos.push(channelUploads[index]);
    } else if (channelUploads[index].paid_content === "pay") {
      payVideos.push(channelUploads[index]);
    }
  }

  freeVideos.forEach(function (channelUploads) {
    let viewsCounted = channelUploads.videoviewcount;
    let viewsString = viewsCounted.toString();
    if (channelUploads.videoviewcount > 1_000_000) {
      viewsString =
        (channelUploads.videoviewcount / 1_000_000).toFixed(1) + "m";
    } else if (channelUploads.videoviewcount > 1_000) {
      viewsString = (channelUploads.videoviewcount / 1_000).toFixed(1) + "k";
    }

    let unesTitle = _.unescape(channelUploads.videotitle);
    let unesUsername = _.unescape(channelUploads.channelname);

    let freeUpload = $(`
<div class="card">
              <video class="feature" src="${
                channelUploads.videofile
              }" poster="${channelUploads.videothumbnail}" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="channel" aria-label="View user channel"><img loading="lazy" id="channelAvi" src="${
                      channelUploads.profile_avatar
                        ? channelUploads.profile_avatar
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="channel">${unesUsername}</a></li>
                      <li id="videoViews">${
                        viewsString ? viewsString + " " + "Views" : "No Views"
                      }</li>
                    </ul>
                  </div>
                  <div class="card-options">
                    <i class="fa-solid fa-ellipsis"></i>
                    <ul class="options">
                      <li id="add"><i class="fa-solid fa-circle-plus"></i>Add to Watchlist</li>
                    </ul>
                  </div>
                </div>
                <div class="card-mid">
                  <a href="theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
                </div>
                <div class="card-bottom">
                  <h6>${unesTitle}</h6>
                </div>
              </div>
            </div>
    
   `).data("channelUploads", channelUploads);
    $(".user-uploads").append(freeUpload);

    $(document).ready(function () {
      $(freeUpload).hover(
        function () {
          $(this).find(".feature").get(0).play();
        },
        function () {
          $(this).find(".feature").get(0).pause();
        }
      );

      $(freeUpload).on("click", ".fa-ellipsis", function () {
        $(this).parent().find(".options").toggleClass("active");
      });

      $(freeUpload).on("click", "#add", async function () {
        let mySubs = $(this).closest(".card").data("channelUploads");
        let id = mySubs.videoid;
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
          $(this)
            .closest(".options")
            .text("Added to Watchlist")
            .css("color", "#B2022F")
            .css("font-size", "17px")
            .css("font-weight", "bold")
            .css("font-family", "Teko")
            .css("text-align", "center");
          laterVideo();
          return data;
        } catch (error) {
          response.status(400).send(error);
        }
      });

      $(freeUpload).on("click", ".fa-play", async function () {
        let videoUpload = $(this).closest(".card").data("channelUploads");
        let id = videoUpload.videoid;
        localStorage.setItem("videoID", id);
        try {
          const response = await fetch(`${FARI_API}/explorer/play/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${myToken}`,
            },
          });
          const data = await response.json();
        } catch (error) {
          response.status(400).send(error);
        }
      });
      return freeUpload;
    });
  });

  payVideos.forEach(function (channelUploads) {
    let viewsCounted = channelUploads.videoviewcount;
    let viewsString = viewsCounted.toString();
    if (channelUploads.videoviewcount > 1_000_000) {
      viewsString =
        (channelUploads.videoviewcount / 1_000_000).toFixed(1) + "m";
    } else if (channelUploads.videoviewcount > 1_000) {
      viewsString = (channelUploads.videoviewcount / 1_000).toFixed(1) + "k";
    }

    let unesTitle = _.unescape(channelUploads.videotitle);
    let unesUsername = _.unescape(channelUploads.channelname);

    let paidUpload = $(` 
<div class="card paid-content">
              <video class="feature" src="${
                channelUploads.videofile
              }" poster="${channelUploads.videothumbnail}" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info"><img loading="lazy" id="channelAvi" src="${
                    channelUploads.channelavi
                      ? channelUploads.channelavi
                      : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                  }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="channel">${unesUsername}</a></li>
                      <li id="videoViews">${
                        viewsString ? viewsString + " " + "Views" : "No Views"
                      }</li>
                    </ul>
                  </div>
                </div>
                <div class="card-mid">
                  <button class="purchase" id="stripe-btn" title="Stripe Checkout.">Purchase Now</button>
                </div>
                <div class="card-bottom">
                  <h6>${unesTitle}</h6>
                </div>
              </div>
            </div> 
  `).data("channelUploads", channelUploads);
    $(".paytoview").append(paidUpload);

    $(paidUpload).on("click", ".purchase", function () {
      let channelView = $(this).closest(".card").data("channelUploads");
      let stripeID = channelView.stripe_acctid;
      let vendore = channelView.vendor_email;
      localStorage.setItem("vendorEmail", vendore);
      localStorage.setItem("productStripeAccount", stripeID);
      onFetchStart();
      let videoArr = [];
      let videoView = $(this).closest(".card").data("channelUploads");
      let id = videoView.videoid;
      localStorage.setItem("videoID", id);

      let price = videoView.rental_price;
      localStorage.setItem("ticketPrice", price);

      let purchasingFilm = {
        videoid: videoView.videoid,
        name: videoView.videotitle,
        image: videoView.videothumbnail,
        vendor: videoView.channelname,
        quantity: 1,
        price: videoView.rental_price,
        total: videoView.rental_price,
      };

      videoArr.push(purchasingFilm);
      localStorage.setItem("videoPurchase", JSON.stringify(videoArr));
      let gettingYou = JSON.parse(localStorage.getItem("videoPurchase"));

      checkoutSessionStripe();
      $(window).scrollTop(0);
    });
    return paidUpload;
  });

  return channelUploads;
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
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

// function newSuber() {
//   var btn = document.getElementById("subscribe");
//   if (btn.value === "SUBSCRIBE") {
//     btn.value = "";
//     btn.value = "SUBSCRIBED";
//     btn.innerHTML = "SUBSCRIBED";
//     btn.style.color = "#B2022F";
//   } else {
//     btn.value = "";
//     btn.value = "SUBSCRIBE";
//     btn.innerHTML = "SUBSCRIBE";
//     btn.style.color = "#fdfbf9";
//   }
// }

async function subscribe() {
  var getChannel = await getChannelProfile();
  var userid = localStorage.getItem("userID");
  var channelid = getChannel[0].channelid;
  var channel_avi = getChannel[0].profile_avatar;
  var channel = getChannel[0].channelname;

  try {
    const subscribedChannel = {
      userid: userid,
      channelID: channelid,
      channelname: channel,
      channelavi: channel_avi,
    };
    var channelname = getChannel[0].channelname;
    const response = await fetch(`${FARI_API}/users/subscribe/${channelname}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(subscribedChannel),
    });
    const data = await response.json();
  } catch (error) {
    console.log(error)
    response.status(400).send(error);
  }
}

//User Subed Status to Channel

async function checkSubStatus() {
  var userid = localStorage.getItem("userID");
  var getChannel = await getChannelProfile();
  var channelid = getChannel[0].channelid;

  try {
    const response = await fetch(
      `${FARI_API}/users/substatus/${userid}/${channelid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.subedChannel.length > 0) {
      $("#subscribe").text("");
      $("#subscribe").text("SUBSCRIBED").css("color", "#B2022F");
    }
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

//UnSubscribe

async function unsubscribe() {
  var getChannel = await getChannelProfile();
  console.log(getChannel)
  var channelname = getChannel[0].channelid;
  var userid = localStorage.getItem("userID");
  try {
    const response = await fetch(
      `${FARI_API}/users/unsubscribe/${userid}/${channelid}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
  } catch (error) {
    console.log(error)
    response.status(400).send(error);
  }
}

//Toggle BETWEEN SUB AND UNSUB

async function toSubOrNot() {
  var userid = localStorage.getItem("userID");
  var getChannel = await getChannelProfile();
  var channelid = getChannel[0].channelid;
  try {
    const response = await fetch(
      `${FARI_API}/users/substatus/${userid}/${channelid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.subedChannel.length > 0) {
      $("#subscribe").text("");
      $("#subscribe").text("SUBSCRIBE").css("color", "#fdfbf9");
      unsubscribe();
    } else if (data.subedChannel.length === 0) {
      $("#subscribe").text("");
      $("#subscribe").text("SUBSCRIBED").css("color", "#B2022F");
      subscribe();
    }
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function laterVideo() {
  var getFeature = await getVideoData();
  var userid = localStorage.getItem("userID");
  var vidID = getFeature[0].videoid;
  var channelname = getFeature[0].channelname;
  var channel_avi = getFeature[0].channelavi;
  var video = getFeature[0].videofile;
  var posFile = getFeature[0].videothumbnail;
  var vidTitle = getFeature[0].videotitle;
  var channelID = getFeature[0].channelid;
  var views = getFeature[0].videoviewcount;

  const laterBody = {
    userid: userid,
    videoid: vidID,
    channelname: channelname,
    channelavi: channel_avi,
    video: video,
    thumbnail: posFile,
    title: vidTitle,
    channelid: channelID,
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
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function checkoutSessionStripe() {
  const purchaseItems = JSON.parse(localStorage.getItem("videoPurchase"));
  const stripe_acct = localStorage.getItem("productStripeAccount");
  const vendoremail = localStorage.getItem("vendorEmail");
  fetch(`${FARI_API}/explorer/stripe-checkout/rental`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${myToken}`,
    },
    body: JSON.stringify({ items: purchaseItems, stripe_acct, vendoremail }),
  })
    .then((res) => {
      if (res.ok) return res.json();
      return res.json().then((json) => Promise.reject(json));
    })
    .then(({ url }) => {
      window.location = url;
    })
    .catch((error) => {
      console.log(error);
    });
}

async function newMessage() {
  var channelInfo = await getChannelProfile();
  var senderID = localStorage.getItem("userID");
  var channelid = localStorage.getItem("visitingChannelID");
  var senderName = localStorage.getItem("userUsername");
  var senderPic = localStorage.getItem("userAvi");
  var receiverID = channelInfo[0].userid;
  var receiverName = channelInfo[0].channelname;
  var receiverPic = channelInfo[0].profile_avatar;
  var message = _.escape($("#message-channel").val());

  const channelMessage = {
    senderid: senderID,
    sender_channelid: channelid,
    sendername: senderName,
    senderpic: senderPic,
    receiverid: receiverID,
    receivername: receiverName,
    receiverpic: receiverPic,
    note_message: message,
  };

  try {
    const response = await fetch(`${FARI_API}/inbox/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(channelMessage),
    });
    const data = await response.json();
    $("#message-channel").val("");
    $(".message .sent").text("Message sent!").css("color", "#fdfbf9");
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

function bootstrap() {
  getUserProfile();
  getChannelProfile().then(renderChannelSlider);
  getChannelProfile().then(renderBio);
  channelPost().then(renderPost);
  checkSubStatus();
}

bootstrap();
