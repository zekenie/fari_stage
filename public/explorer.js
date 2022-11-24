const FARI_API = "https://fari-stage.herokuapp.com/api";
const CLOUD_FRONT = "https://drotje36jteo8.cloudfront.net";
const myToken = localStorage.getItem("fariToken");

(function () {
  $("#discover").addClass("selected");
  $(".main-content #title").text("Discover");
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

$("#main-view-x").on("click", () => {
  $(".nav").css("display", "none");
});

$("#main-view-bars").on("click", () => {
  $(".nav").css("display", "flex");
});

$(".btn-board").click(function () {
  let selected = $(this);
  selected.addClass("active").siblings().removeClass("active");
});

$("#mobile-view-bars").click(function () {
  $(".mobile-menu-options").toggleClass("active");
});

$("#mobile-view-x").click(function () {
  $(".mobile-menu-options").removeClass("active");
});

$("#logout").click(function () {
  localStorage.clear();
  window.location.href = "index";
});

$(".menu .content-sort li").click(function () {
  let selected = $(this);
  selected.addClass("selected").siblings().removeClass("selected");
  $(".category .content-sort li").removeClass("selected");
});

$(".category .content-sort li").click(function () {
  let selected = $(this);
  selected.addClass("selected").siblings().removeClass("selected");
  $(".menu .content-sort li").removeClass("selected");
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

async function getChannel() {
  let channelName = localStorage.getItem("channelname");
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

//Discover

async function getFreeMedia() {
  try {
    const response = await fetch(`${FARI_API}/explorer/discover`, {
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

function renderFreeContent(uploads) {
  let viewsCounted = uploads.videoviewcount;
  let viewsString = viewsCounted.toString();
  if (uploads.videoviewcount > 1_000_000) {
    viewsString = (uploads.videoviewcount / 1_000_000).toFixed(1) + "m";
  } else if (uploads.videoviewcount > 1_000) {
    viewsString = (uploads.videoviewcount / 1_000).toFixed(1) + "k";
  }
  let unesTitle = _.unescape(uploads.videotitle);
  let unesUsername = _.unescape(uploads.channelname);
  let videos = $(`    
<div class="card" data-tilt data-tilt-axis="x" data-tilt-speed="400" data-tilt-glare="true">
              <video class="feature" src="${uploads.videofile}" poster="${
    uploads.videothumbnail
  }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel"><img id="channelAvi" loading="lazy" src="${
                      uploads.channelavi
                        ? uploads.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel">${unesUsername}</a></li>
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
                  <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
                </div>
                <div class="card-bottom">
                  <h6>${unesTitle}</h6>
                </div>
              </div>
            </div>
    
   `).data("uploads", uploads);

  $(".discover").append(videos);
  $(videos).on("click", ".fa-ellipsis", function () {
    $(this).parent().find(".options").toggleClass("active");
  });

  $(document).ready(function () {
    $(videos).hover(
      function () {
        $(this).find(".feature").get(0).play();
      },
      function () {
        $(this).find(".feature").get(0).pause();
      }
    );
    $(videos).on("click", "#add", async function () {
      let mySubs = $(this).closest(".card").data("uploads");
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

    $(videos).on("click", "#channelName", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(videos).on("click", "#channelAvi", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(videos).on("click", ".fa-play", async function () {
      let videoUpload = $(this).closest(".card").data("uploads");
      let id = videoUpload.videoid;
      localStorage.setItem("videoID", id);
      //      updateViews();
      try {
        const response = await fetch(`${FARI_API}/explorer`, {
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
  });

  return videos;
}

function renderMedia(videoList) {
  $(".discover").empty();
  videoList.forEach(function (uploads) {
    $(".discover").append(renderFreeContent(uploads));
  });
}

$("#discover").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Discover");
  $(".searched").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".history").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".discover").css("display", "flex");
  $(".right-pane").css("display", "block");
  $(".channels-subbed").css("display", "none");
  $(".channels-live").css("display", "none");
  $(".popular.channels").css("display", "block");
  $(".popular.uploads").css("display", "block");
  $(".right-pane2").css("display", "none");
  getFreeMedia().then(renderMedia);
  $(window).scrollTop(0);
});

//Pay to View

async function getPaidMedia() {
  try {
    const response = await fetch(`${FARI_API}/explorer/paytoview`, {
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

function renderPayMedia(uploads) {
  let viewsCounted = uploads.videoviewcount;
  let viewsString = viewsCounted.toString();
  if (uploads.videoviewcount > 1_000_000) {
    viewsString = (uploads.videoviewcount / 1_000_000).toFixed(1) + "m";
  } else if (uploads.videoviewcount > 1_000) {
    viewsString = (uploads.videoviewcount / 1_000).toFixed(1) + "k";
  }

  let unesTitle = _.unescape(uploads.videotitle);
  let unesUsername = _.unescape(uploads.channelname);
  let paidVids = $(`
 <div class="card paid-content" data-tilt data-tilt-axis="x" data-tilt-speed="400" data-tilt-glare="true">
              <video class="feature" src="${uploads.videofile}" poster="${
    uploads.videothumbnail
  }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel"><img loading="lazy" id="channelAvi" src="${
                      uploads.channelavi
                        ? uploads.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel">${unesUsername}</a></li>
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
  `).data("uploads", uploads);
  $(".paytoview").append(paidVids);

  $(document).ready(function () {
    $(paidVids).hover(
      function () {
        $(this).find(".feature").get(0).play();
      },
      function () {
        $(this).find(".feature").get(0).pause();
      }
    );

    $(paidVids).on("click", "#channelName", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(paidVids).on("click", "#channelAvi", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(paidVids).on("click", ".purchase", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let stripeID = channelView.stripe_acctid;
      let vendore = channelView.vendor_email;
      localStorage.setItem("vendorEmail", vendore);
      localStorage.setItem("productStripeAccount", stripeID);
      onFetchStart();
      let videoArr = [];
      let videoView = $(this).closest(".card").data("uploads");
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

      let ticketBuy = $(`
        <div class="ticketForm">
     <div class="film">
       <div class="movie-poster">
         <img src="${uploads.videothumbnail}"/>
       </div>
       <div class="movie-info">
         <h1>${uploads.videotitle}</h1>
         <h1>$${uploads.rental_price}</h1>
       </div>
     </div>
   </div>
      
       `).data("videoView", videoView);
      checkoutSessionStripe();
      $(".ticket-purchase").addClass("active");
      $(window).scrollTop(0);
    });

    $(paidVids).on("click", ".fa-play", async function () {
      let videoUpload = $(this).closest(".card").data("uploads");
      let id = videoUpload.videoid;
      localStorage.setItem("videoID", id);
      //      updateViews();
      try {
        const response = await fetch(`${FARI_API}/explorer`, {
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
  });
}

function renderPaidMedia(paidVideoList) {
  $(".paytoview").empty();
  paidVideoList.forEach(function (uploads) {
    $(".paytoview").append(renderPayMedia(uploads));
  });
}

$("#paytoview").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Pay to View");
  $(".searched").css("display", "none");
  $(".paytoview").css("display", "flex");
  $(".watchlist").css("display", "none");
  $(".history").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".discover").css("display", "none");
  $(".right-pane").css("display", "block");
  $(".channels-subbed").css("display", "none");
  $(".channels-live").css("display", "none");
  $(".popular.channels").css("display", "block");
  $(".popular.uploads").css("display", "block");
  $(".right-pane2").css("display", "none");
  getPaidMedia().then(renderPaidMedia);
  $(window).scrollTop(0);
});

//Subscriptions

async function getMySubUploads() {
  var userid = localStorage.getItem("userID");
  try {
    const response = await fetch(
      `${FARI_API}/explorer/subs/uploads/${userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.subscriptionUploads.length > 0) {
      $(".subscriptions").empty();
      $(".newUserMessage-subs message").css("display", "none");
    } else {
      $(".newUserMessage-subs message").css("display", "block");
    }
    return data.subscriptionUploads;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderSubsVids(subscriptionUploads) {
  let paySubVideos = [];
  let freeSubVideos = [];

  for (let index = 0; index < subscriptionUploads.length; index++) {
    if (
      subscriptionUploads[index].paid_content === "free" ||
      subscriptionUploads[index].paid_content === null ||
      subscriptionUploads[index].content_type === "vlog" ||
      subscriptionUploads[index].content_type === "other"
    ) {
      freeSubVideos.push(subscriptionUploads[index]);
    } else if (
      (subscriptionUploads[index].paid_content === "pay" &&
        subscriptionUploads[index].content_type === "film") ||
      (subscriptionUploads[index].paid_content === "pay" &&
        subscriptionUploads[index].content_type === "shows")
    ) {
      paySubVideos.push(subscriptionUploads[index]);
    }
  }

  freeSubVideos.forEach(function (subscriptionUploads) {
    let viewsCounted = subscriptionUploads.videoviewcount;
    let viewsString = viewsCounted.toString();
    if (subscriptionUploads.videoviewcount > 1_000_000) {
      viewsString =
        (subscriptionUploads.videoviewcount / 1_000_000).toFixed(1) + "m";
    } else if (subscriptionUploads.videoviewcount > 1_000) {
      viewsString =
        (subscriptionUploads.videoviewcount / 1_000).toFixed(1) + "k";
    }

    let unesTitle = _.unescape(subscriptionUploads.videotitle);
    let unesUsername = _.unescape(subscriptionUploads.channelname);
    let mySubVideos = $(`
<div class="card">
              <video src="${subscriptionUploads.videofile}" poster="${
      subscriptionUploads.videothumbnail
    }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel" aria-label="View user channel"><img loading="lazy" id="channelAvi" src="${
                      subscriptionUploads.channelavi
                        ? subscriptionUploads.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar"/></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel">${unesUsername}</a></li>
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
                  <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
                </div>
                <div class="card-bottom">
                  <h6>${unesTitle}</h6>
                </div>
              </div>
            </div>
`).data("subscriptionUploads", subscriptionUploads);
    $(".subscriptions").append(mySubVideos);

    $(mySubVideos).on("click", ".fa-ellipsis", function () {
      $(this).parent().find(".options").toggleClass("active");
    });

    $(mySubVideos).on("click", "#channelName", function () {
      let channelView = $(this).closest(".card").data("subscriptionUploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(mySubVideos).on("click", "#channelAvi", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(mySubVideos).on("click", "#add", async function () {
      let mySubs = $(this).closest(".card").data("subscriptionUploads");
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

    $(mySubVideos).on("click", ".fa-play", async function () {
      let mySubs = $(this).closest(".card").data("subscriptionUploads");
      let id = mySubs.videoid;
      localStorage.setItem("videoID", id);
      //    updateViews();
      try {
        const response = await fetch(`${FARI_API}/explorer`, {
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
  });

  paySubVideos.forEach(function (subscriptionUploads) {
    let viewsCounted = subscriptionUploads.videoviewcount;
    let viewsString = viewsCounted.toString();
    if (subscriptionUploads.videoviewcount > 1_000_000) {
      viewsString =
        (subscriptionUploads.videoviewcount / 1_000_000).toFixed(1) + "m";
    } else if (subscriptionUploads.videoviewcount > 1_000) {
      viewsString =
        (subscriptionUploads.videoviewcount / 1_000).toFixed(1) + "k";
    }

    let unesTitle = _.unescape(subscriptionUploads.videotitle);
    let unesUsername = _.unescape(subscriptionUploads.channelname);

    let mySubVideos = $(`
<div class="card paid-content" data-tilt data-tilt-axis="x" data-tilt-speed="400" data-tilt-glare="true">
              <video class="feature" src="${
                subscriptionUploads.videofile
              }" poster="${
      subscriptionUploads.videothumbnail
    }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel" aria-label="View user channel"><img loading="lazy" id="channelAvi" src="${
                      subscriptionUploads.channelavi
                        ? subscriptionUploads.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel">${unesUsername}</a></li>
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
  `).data("subscriptionUploads", subscriptionUploads);
    $(".subscriptions").append(mySubVideos);

    $(mySubVideos).on("click", "#channelName", function () {
      let channelView = $(this).closest(".card").data("subscriptionUploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(mySubVideos).on("click", "#channelAvi", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(mySubVideos).on("click", ".purchase", function () {
      let channelView = $(this).closest(".card").data("subscriptionUploads");
      let stripeID = channelView.stripe_acctid;
      let vendore = channelView.vendor_email;
      localStorage.setItem("vendorEmail", vendore);
      localStorage.setItem("productStripeAccount", stripeID);

      onFetchStart();
      let videoArr = [];
      let videoView = $(this).closest(".card").data("subscriptionUploads");
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

      let ticketBuy = $(`
        <div class="ticketForm">
     <div class="film">
       <div class="movie-poster">
         <img loading="lazy" src="${subscriptionUploads.videothumbnail}"/>
       </div>
       <div class="movie-info">
         <h1>${subscriptionUploads.videotitle}</h1>
        <h1>${subscriptionUploads.rental_price}</h1>
       </div>
     </div>
   </div>
      
       `).data("videoView", videoView);
      checkoutSessionStripe();
      $(".ticket-purchase").addClass("active");
      $(window).scrollTop(0);
    });

    $(document).ready(function () {
      $(mySubVideos).hover(
        function () {
          $(this).find(".feature").get(0).play();
        },
        function () {
          $(this).find(".feature").get(0).pause();
        }
      );
      $(mySubVideos).on("click", ".fa-circle-plus", async function () {
        let mySubs = $(this).closest(".card").data("subscriptionUploads");
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
          return data.uploads;
        } catch (error) {
          response.status(400).send(error);
        }
      });

      return mySubVideos;
    });
  });
}

// async function updateViews(){
//   let id = localStorage.getItem('videoID');
//   try {
//   const response = await fetch(`${FARI_API}/explorer/update/viewcount/${id}`,{
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${myToken}`
//       },

// })
//     const data = await response.json();
//     return data;
// }catch(error){
// console.error('Oops could not like that video', error)
// }
// };

$("#subscriptions").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Subscriptions");
  $(".searched").css("display", "none");
  $(".discover").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".history").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "flex");
  $(".right-pane").css("display", "block");
  $(".channels-subbed").css("display", "block");
  $(".channels-live").css("display", "block");
  $(".popular.channels").css("display", "none");
  $(".popular.uploads").css("display", "none");
  $(".right-pane2").css("display", "none");
  getMySubUploads().then(renderSubsVids);
  getRecentlySubsUploads().then(renderRecentSubsThatHaveUploaded);
  $(window).scrollTop(0);
});

//Favorites

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
      $(".favorites").empty();
      $(".newUserMessage-favs message").css("display", "none");
    } else {
      $(".newUserMessage-favs message").css("display", "block");
    }
    return data.myFavVids;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderFavs(myFavVids) {
  let viewsCounted = myFavVids.videoviewcount;
  let viewsString = viewsCounted.toString();
  if (myFavVids.videoviewcount > 1_000_000) {
    viewsString = (myFavVids.videoviewcount / 1_000_000).toFixed(1) + "m";
  } else if (myFavVids.videoviewcount > 1_000) {
    viewsString = (myFavVids.videoviewcount / 1_000).toFixed(1) + "k";
  }
  let unesTitle = _.unescape(myFavVids.videotitle);
  let unesUsername = _.unescape(myFavVids.channelname);

  let myFavs = $(`
<div class="card" data-tilt data-tilt-axis="x" data-tilt-speed="400" data-tilt-glare="true">
              <video src="${myFavVids.videofile}" poster="${
    myFavVids.videothumbnail
  }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel" aria-label="View user channel"><img loading="lazy" id="channelAvi" src="${
                      myFavVids.channelavi
                        ? myFavVids.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel">${unesUsername}</a></li>
                      <li id="videoViews">${
                        viewsString ? viewsString + " " + "Views" : "No Views"
                      }</li>
                    </ul>
                  </div>
                  <div class="card-options">
                    <i class="fa-solid fa-ellipsis"></i>
                    <ul class="options">
                      <li id="delete"><i class="fa-solid fa-trash"></i>Delete</li>
                    </ul>
                  </div>
                </div>
                <div class="card-mid">
                  <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
                </div>
                <div class="card-bottom">
                  <h6>${unesTitle}</h6>
                </div>
              </div>
            </div> 
`).data("myFavVids", myFavVids);
  $(".favorites").append(myFavs);

  $(myFavs).on("click", ".fa-ellipsis", function () {
    $(this).parent().find(".options").toggleClass("active");
  });

  $(myFavs).on("click", "#channelName", function () {
    let channelView = $(this).closest(".card").data("myFavVids");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });

  $(myFavs).on("click", "#channelAvi", function () {
    let channelView = $(this).closest(".card").data("uploads");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });

  $(myFavs).on("click", "#delete", function () {
    let myFaved = $(this).closest(".card").data("myFavVids");
    let id = myFaved.videoid;
    localStorage.setItem("videoID", id);
    deleteFav();
    $(this).closest(".card").remove();
  });

  $(myFavs).on("click", ".fa-play", async function () {
    let myFaved = $(this).closest(".card").data("myFavVids");
    let id = myFaved.videoid;
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
    } catch (error) {
      response.status(400).send(error);
    }
  });
  return myFavs;
}

function renderFavsList(favsList) {
  favsList.forEach(function (myFavVids) {
    $(".favorites").append(renderFavs(myFavVids));
  });
}

$("#favorites").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Favorites");
  $(".searched").css("display", "none");
  $(".discover").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".history").css("display", "none");
  $(".favorites").css("display", "flex");
  $(".subscriptions").css("display", "none");
  $(".right-pane").css("display", "block");
  $(".channels-subbed").css("display", "block");
  $(".channels-live").css("display", "block");
  $(".popular.channels").css("display", "none");
  $(".popular.uploads").css("display", "none");
  $(".right-pane2").css("display", "none");
  getMyFavs().then(renderFavsList);
  getRecentlySubsUploads().then(renderRecentSubsThatHaveUploaded);
  $(window).scrollTop(0);
});

//Watchlist

async function getWatchList() {
  var userid = localStorage.getItem("userID");
  try {
    const response = await fetch(`${FARI_API}/explorer/watchlater/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    if (data.myWatchList.length > 0) {
      $(".watchlist").empty();
      $(".newUserMessage-watchlater message").css("display", "none");
    } else {
      $(".newUserMessage-watchlater message").css("display", "block");
    }
    return data.myWatchList;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderWatchLaters(myWatchList) {
  let paidWatchlistVideos = [];
  let freeWatchlistVideos = [];

  for (let index = 0; index < myWatchList.length; index++) {
    if (myWatchList[index].paidtoview === false) {
      freeWatchlistVideos.push(myWatchList[index]);
    } else if (myWatchList[index].paidtoview === true) {
      paidWatchlistVideos.push(myWatchList[index]);
    }
  }
  freeWatchlistVideos.forEach(function (myWatchList) {
    let viewsCounted = myWatchList.videoviewcount;
    let viewsString = viewsCounted.toString();
    if (myWatchList.videoviewcount > 1_000_000) {
      viewsString = (myWatchList.videoviewcount / 1_000_000).toFixed(1) + "m";
    } else if (myWatchList.videoviewcount > 1_000) {
      viewsString = (myWatchList.videoviewcount / 1_000).toFixed(1) + "k";
    }

    let unesTitle = _.unescape(myWatchList.videotitle);
    let unesUsername = _.unescape(myWatchList.channelname);

    let myLater = $(`
<div class="card" data-tilt data-tilt-axis="x" data-tilt-speed="400" data-tilt-glare="true">
              <video src="${myWatchList.videofile}" poster="${
      myWatchList.videothumbnail
    }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel" aria-label="View user channel"><img loading="lazy" id="channelAvi" src="${
                      myWatchList.channelavi
                        ? myWatchList.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel">${unesUsername}</a></li>
                      <li id="videoViews">${
                        viewsString ? viewsString + " " + "Views" : "No Views"
                      }</li>
                    </ul>
                  </div>
                  <div class="card-options">
                    <i class="fa-solid fa-ellipsis"></i>
                    <ul class="options">
                      <li id="delete"><i class="fa fa-trash" aria-hidden="true"></i>Delete</li>
                    </ul>
                  </div>
                </div>
                <div class="card-mid">
                  <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
                </div>
                <div class="card-bottom">
                  <h6>${unesTitle}</h6>
                </div>
              </div>
            </div> 
`).data("myWatchList", myWatchList);
    $(".watchlist").append(myLater);

    $(myLater).on("click", ".fa-ellipsis", function () {
      $(this).parent().find(".options").toggleClass("active");
    });

    $(myLater).on("click", "#channelName", function () {
      let channelView = $(this).closest(".card").data("myWatchList");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(myLater).on("click", "#channelAvi", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(myLater).on("click", "#delete", function () {
      let watchLater = $(this).closest(".card").data("myWatchList");
      let id = watchLater.videoid;
      localStorage.setItem("videoID", id);
      deleteWatchLater();
      $(this).closest(".card").remove();
    });

    $(myLater).on("click", ".fa-play", async function () {
      let watchLater = $(this).closest(".card").data("myWatchList");
      let id = watchLater.videoid;
      localStorage.setItem("videoID", id);
      //    updateViews();
      try {
        const response = await fetch(`${FARI_API}/explorer`, {
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
  });

  paidWatchlistVideos.forEach(function (myWatchList) {
    let viewsCounted = myWatchList.videoviewcount;
    let viewsString = viewsCounted.toString();
    if (myWatchList.videoviewcount > 1_000_000) {
      viewsString = (myWatchList.videoviewcount / 1_000_000).toFixed(1) + "m";
    } else if (myWatchList.videoviewcount > 1_000) {
      viewsString = (myWatchList.videoviewcount / 1_000).toFixed(1) + "k";
    }

    let unesTitle = _.unescape(myWatchList.videotitle);
    let unesUsername = _.unescape(myWatchList.channelname);

    let myLater = $(`
<div class="card" data-tilt data-tilt-axis="x" data-tilt-speed="400" data-tilt-glare="true">
              <video src="${myWatchList.videofile}" poster="${
      myWatchList.videothumbnail
    }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel" aria-label="View user channel"><img loading="lazy" id="channelAvi" src="${
                      myWatchList.channelavi
                        ? myWatchList.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel">${unesUsername}</a></li>
                      <li id="videoViews">${
                        viewsString ? viewsString + " " + "Views" : "No Views"
                      }</li>
                    </ul>
                  </div>
                  <div class="card-options"></div>
                </div>
                <div class="card-mid">
                  <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
                </div>
                <div class="card-bottom">
                  <h6>${unesTitle}</h6>
                </div>
              </div>
            </div> 
`).data("myWatchList", myWatchList);
    $(".watchlist").prepend(myLater);

    $(myLater).on("click", "#channelName", function () {
      let channelView = $(this).closest(".card").data("myWatchList");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(myLater).on("click", "#channelAvi", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(myLater).on("click", ".fa-play", async function () {
      let watchLater = $(this).closest(".card").data("myWatchList");
      let id = watchLater.videoid;
      let purchased = watchLater.id;
      localStorage.setItem("purchasedWatched", purchased);
      localStorage.setItem("videoID", id);
      //     updateViews();
      userWatchedFlag();
      try {
        const response = await fetch(`${FARI_API}/explorer`, {
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

    return myLater;
  });
}

$("#watchlist").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Watchlist");
  $(".searched").css("display", "none");
  $(".discover").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "flex");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".history").css("display", "none");
  $(".right-pane").css("display", "block");
  $(".channels-subbed").css("display", "block");
  $(".channels-live").css("display", "block");
  $(".popular.channels").css("display", "none");
  $(".popular.uploads").css("display", "none");
  $(".right-pane2").css("display", "none");
  getWatchList().then(renderWatchLaters);
  getRecentlySubsUploads().then(renderRecentSubsThatHaveUploaded);
  $(window).scrollTop(0);
});

//Watch History

async function getHistory() {
  var userid = localStorage.getItem("userID");
  try {
    const response = await fetch(`${FARI_API}/explorer/gethistory/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    if (data.history.length > 0) {
      $(".history").empty();
      $(".newUserMessage-history message").css("display", "none");
    } else {
      $(".newUserMessage-history message").css("display", "block");
    }
    return data.history;
	  console.log(data)
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderHistory(history) {
  let viewsCounted = history.videoviewcount;
  let viewsString = viewsCounted.toString();
  if (history.videoviewcount > 1_000_000) {
    viewsString = (history.videoviewcount / 1_000_000).toFixed(1) + "m";
  } else if (history.videoviewcount > 1_000) {
    viewsString = (history.videoviewcount / 1_000).toFixed(1) + "k";
  }

  let unesTitle = _.unescape(history.videotitle);
  let unesUsername = _.unescape(history.channelname);

  let myHistory = $(`
<div class="card" data-tilt data-tilt-axis="x" data-tilt-speed="400" data-tilt-glare="true">
              <video src="${history.videofile}" poster="${
    history.videothumbnail
  }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel" aria-label="View user channel"><img loading="lazy" id="channelAvi" src="${
                      history.channelavi
                        ? history.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel">${unesUsername}</a></li>
                      <li id="videoViews">${
                        viewsString ? viewsString + " " + "Views" : "No Views"
                      }</li>
                    </ul>
                  </div>
                  
                </div>
                <div class="card-mid">
                  <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
                </div>
                <div class="card-bottom">
                  <h6>${unesTitle}</h6>
                </div>
              </div>
            </div> 
`).data("history", history);
  $(".history").append(myHistory);

  $(myHistory).on("click", ".fa-ellipsis", function () {
    $(this).parent().find(".options").toggleClass("active");
  });

  $(myHistory).on("click", "#channelName", function () {
    let channelView = $(this).closest(".card").data("history");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });

  $(myHistory).on("click", "#channelAvi", function () {
    let channelView = $(this).closest(".card").data("history");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });

  $(myHistory).on("click", "#delete", function () {
    let myFaved = $(this).closest(".card").data("history");
    let id = myFaved.videoid;
    localStorage.setItem("videoID", id);
    $(this).closest(".card").remove();
  });

  $(myHistory).on("click", ".fa-play", async function () {
    let myFaved = $(this).closest(".card").data("history");
    let id = myFaved.videoid;
    localStorage.setItem("videoID", id);
    //     updateViews();
    try {
      const response = await fetch(`${FARI_API}/explorer`, {
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
  return myHistory;
}

function renderHistoryList(historyList) {
  historyList.forEach(function (history) {
    $(".history").append(renderHistory(history));
  });
}

$("#history").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Watch History");
  $(".searched").css("display", "none");
  $(".discover").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".favorites").css("display", "none");
  $(".history").css("display", "flex");
  $(".subscriptions").css("display", "none");
  $(".right-pane").css("display", "block");
  $(".channels-subbed").css("display", "block");
  $(".channels-live").css("display", "block");
  $(".popular.channels").css("display", "none");
  $(".popular.uploads").css("display", "none");
  $(".right-pane2").css("display", "none");
  getHistory().then(renderHistoryList);
  $(window).scrollTop(0);
});

//SideMenu Buttons

async function getMovies() {
  try {
    const response = await fetch(`${FARI_API}/explorer/search/movies`, {
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

$("#movies").click(function (event) {
  event.preventDefault();
  $(".discover").empty();
  $(".main-content #title").empty();
  $(".main-content #title").text("Movies & Films");
  $(".searched").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".discover").css("display", "flex");
  getMovies().then(renderFilteredResults);
  $(window).scrollTop(0);
});

async function getShows() {
  try {
    const response = await fetch(`${FARI_API}/explorer/search/shows`, {
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

$("#shows").click(function (event) {
  event.preventDefault();
  $(".discover").empty();
  $(".main-content #title").empty();
  $(".main-content #title").text("Shows & Webseries");
  $(".searched").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".discover").css("display", "flex");
  getShows().then(renderFilteredResults);

  $(window).scrollTop(0);
});

async function getAnimations() {
  try {
    const response = await fetch(`${FARI_API}/explorer/search/animations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    $(".discover").empty();
    return data.videos;
  } catch (error) {
    response.status(400).send(error);
  }
}

$("#animations").click(function (event) {
  event.preventDefault();
  $(".discover").empty();
  $(".main-content #title").empty();
  $(".main-content #title").text("Animations");
  $(".searched").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".discover").css("display", "flex");
  getAnimations().then(renderFilteredResults);
  $(window).scrollTop(0);
});

async function getVlogs() {
  try {
    const response = await fetch(`${FARI_API}/explorer/search/vlogs`, {
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

$("#vlogs").click(function (event) {
  event.preventDefault();
  $(".discover").empty();
  $(".main-content #title").empty();
  $(".main-content #title").text("Vlogs");
  $(".searched").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".discover").css("display", "flex");
  getVlogs().then(renderFilteredResults);
  $(window).scrollTop(0);
});

function renderFilteredResults(resultsList) {
  resultsList.forEach(function (videos) {
    $(".discover").append(renderFilteredContent(videos));
  });
}

function renderFilteredContent(videos) {
  let viewsCounted = videos.videoviewcount;
  let viewsString = viewsCounted.toString();
  if (videos.videoviewcount > 1_000_000) {
    viewsString = (videos.videoviewcount / 1_000_000).toFixed(1) + "m";
  } else if (videos.videoviewcount > 1_000) {
    viewsString = (videos.videoviewcount / 1_000).toFixed(1) + "k";
  }

  let unesTitle = _.unescape(videos.videotitle);
  let unesUsername = _.unescape(videos.channelname);

  let video = $(`
<div class="card">
              <video class="feature" src="${videos.videofile}" poster="${
    videos.videothumbnail
  }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel" aria-label="View user channel"><img loading="lazy" id="channelAvi" src="${
                      videos.channelavi
                        ? videos.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel">${unesUsername}</a></li>
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
                  <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
                </div>
                <div class="card-bottom">
                  <h6>${unesTitle}</h6>
                </div>
              </div>
            </div>  
    
   `).data("videos", videos);
  $(".discover").append(video);

  $(video).on("click", ".fa-ellipsis", function () {
    $(this).parent().find(".options").toggleClass("active");
  });

  $(video).on("click", "#channelName", function () {
    let channelView = $(this).closest(".card").data("videos");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });

  $(videos).on("click", "#channelAvi", function () {
    let channelView = $(this).closest(".card").data("uploads");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });

  $(document).ready(function () {
    $(video).hover(
      function () {
        $(this).find(".feature").get(0).play();
      },
      function () {
        $(this).find(".feature").get(0).pause();
      }
    );
    $(video).on("click", "#add", async function () {
      let mySubs = $(this).closest(".card").data("videos");
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

    $(video).on("click", ".fa-play", async function () {
      let videoSearched = $(this).closest(".card").data("videos");
      let id = videoSearched.id;
      localStorage.setItem("videoID", id);
      //    updateViews();
      try {
        const response = await fetch(`${FARI_API}/explorer`, {
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
  });
  return video;
}

//Search

async function getChannelSearchResults() {
  let username = _.escape($("#searchfield").val());
  try {
    const response = await fetch(
      `${FARI_API}/users/myprofile/channel/${username}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.profile.length === 0) {
      $(".channel-search").css("display", "none");
    } else {
      $(".channel-search").css("display", "flex");
    }
    return data.profile;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderChannelSearched(profile) {
  $(".channel-search").empty();
  let unesUsername = _.unescape(profile[0].channelname);
  let channelSearched = $(`
              <div class="channel-card">
                <img loading="lazy" src="${
                  profile[0].profile_avatar
                    ? profile[0].profile_avatar
                    : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                }" alt="channel-avi" id="channel-search-avi" />
                <h4 id="profile"><a href="/channel" aria-label="View user channel">${unesUsername}</a></h4>
              </div>
`).data("profile", profile);
  $(".channel-search").append(channelSearched);

  $(channelSearched).on("click", "#profile", async function () {
    let channelView = $(this).closest(".channel-card").data("profile");
    let id = channelView[0].channelid;
    localStorage.setItem("visitingChannelID", id);
  });
}

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
    if (data.videos.length > 0) {
      $(".searched-content-results").empty();
      $(".noSearch-results message").css("display", "none");
    } else {
      $(".noSearch-results message").css("display", "block");
    }
    return data.videos;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderVideoSearchResults(videos) {
  let payVideos = [];
  let freeVideos = [];

  for (let index = 0; index < videos.length; index++) {
    if (
      videos[index].paid_content === "free" ||
      videos[index].paid_content === null ||
      videos[index].content_type === "vlog" ||
      videos[index].content_type === "other"
    ) {
      freeVideos.push(videos[index]);
    } else if (
      (videos[index].paid_content === "pay" &&
        videos[index].content_type === "film") ||
      (videos[index].paid_content === "pay" &&
        videos[index].content_type === "shows")
    ) {
      payVideos.push(videos[index]);
    }
  }
  freeVideos.forEach(function (videos) {
    let viewsCounted = videos.videoviewcount;
    let viewsString = viewsCounted.toString();
    if (videos.videoviewcount > 1_000_000) {
      viewsString = (videos.videoviewcount / 1_000_000).toFixed(1) + "m";
    } else if (videos.videoviewcount > 1_000) {
      viewsString = (videos.videoviewcount / 1_000).toFixed(1) + "k";
    }

    let unesTitle = _.unescape(videos.videotitle);
    let unesUsername = _.unescape(videos.channelname);

    let video = $(`
<div class="card" data-tilt data-tilt-axis="x" data-tilt-speed="400" data-tilt-glare="true">
              <video class="feature" src="${videos.videofile}" poster="${
      videos.videothumbnail
    }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel" aria-label="View user channel"><img loading="lazy" id="channelAvi" src="${
                      videos.channelavi
                        ? videos.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel">${unesUsername}</a></li>
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
                  <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
                </div>
                <div class="card-bottom">
                  <h6>${unesTitle}</h6>
                </div>
              </div>
            </div>
    
   `).data("videos", videos);
    $(".searched-content-results").append(video);

    $(video).on("click", ".fa-ellipsis", function () {
      $(this).parent().find(".options").toggleClass("active");
    });

    $(video).on("click", "#channelName", function () {
      let channelView = $(this).closest(".card").data("videos");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(videos).on("click", "#channelAvi", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(document).ready(function () {
      $(video).hover(
        function () {
          $(this).find(".feature").get(0).play();
        },
        function () {
          $(this).find(".feature").get(0).pause();
        }
      );
      $(video).on("click", "#add", async function () {
        let mySubs = $(this).closest(".card").data("videos");
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
          return data.uploads;
        } catch (error) {
          response.status(400).send(error);
        }
      });

      $(video).on("click", ".fa-play", async function () {
        let videoSearched = $(this).closest(".card").data("videos");
        let id = videoSearched.id;
        localStorage.setItem("videoID", id);
        //    updateViews();
        try {
          const response = await fetch(`${FARI_API}/explorer`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${myToken}`,
            },
          });
          const data = await response.json();
          updateViews();
        } catch (error) {
          response.status(400).send(error);
        }
      });
    });
  });

  payVideos.forEach(function (videos) {
    let viewsCounted = videos.videoviewcount;
    let viewsString = viewsCounted.toString();
    if (videos.videoviewcount > 1_000_000) {
      viewsString = (videos.videoviewcount / 1_000_000).toFixed(1) + "m";
    } else if (videos.videoviewcount > 1_000) {
      viewsString = (videos.videoviewcount / 1_000).toFixed(1) + "k";
    }

    let unesTitle = _.unescape(videos.videotitle);
    let unesUsername = _.unescape(videos.channelname);

    let video = $(`
<div class="card paid-content" data-tilt data-tilt-axis="x" data-tilt-speed="400" data-tilt-glare="true">
              <video class="feature" src="${videos.videofile}" poster="${
      videos.videothumbnail
    }" preload="none" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="/channel" aria-label="View user channel"><img loading="lazy" id="channelAvi" src="${
                      videos.channelavi
                        ? videos.channelavi
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="/channel" aria-label="View user channel">${unesUsername}</a></li>
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
  `).data("videos", videos);
    $(".searched-content-results").append(video);

    $(video).on("click", "#channelName", function () {
      let channelView = $(this).closest(".card").data("videos");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(videos).on("click", "#channelAvi", function () {
      let channelView = $(this).closest(".card").data("uploads");
      let id = channelView.channelid;
      localStorage.setItem("visitingChannelID", id);
    });

    $(video).on("click", ".purchase", function () {
      let channelView = $(this).closest(".card").data("videos");
      let stripeID = channelView.stripe_acctid;
      let vendore = channelView.vendor_email;
      localStorage.setItem("vendorEmail", vendore);
      localStorage.setItem("productStripeAccount", stripeID);
      onFetchStart();
      let videoArr = [];
      let videoView = $(this).closest(".card").data("videos");
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

      let ticketBuy = $(`
        <div class="ticketForm">
     <div class="film">
       <div class="movie-poster">
         <img src="${videos.videothumbnail}"/>
       </div>
       <div class="movie-info">
         <h1>${videos.videotitle}</h1>
        <h1>${videos.rental_price}</h1>
       </div>
     </div>
   </div>
      
       `).data("videoView", videoView);
      checkoutSessionStripe();
      $(".ticket-purchase").addClass("active");
      $(window).scrollTop(0);
    });

    $(document).ready(function () {
      $(video).hover(
        function () {
          $(this).find(".feature").get(0).play();
        },
        function () {
          $(this).find(".feature").get(0).pause();
        }
      );
      $(video).on("click", "#add", async function () {
        let mySubs = $(this).closest(".card").data("videos");
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
          return data.uploads;
        } catch (error) {
          response.status(400).send(error);
        }
      });
    });
    return videos;
  });
}

$("#searchfield").keyup(function (event) {
  event.preventDefault();
  if (event.which === 13) {
    $(".searched").css("display", "block");
    $(".paytoview").css("display", "none");
    $(".watchlist").css("display", "none");
    $(".favorites").css("display", "none");
    $(".subscriptions").css("display", "none");
    $(".discover").css("display", "none");
    getEnteredSearch().then(renderVideoSearchResults);
    getChannelSearchResults().then(renderChannelSearched);
    $(window).scrollTop(0);
  }
});

$("#searchfield").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Search");
  $(".searched").css("display", "block");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".discover").css("display", "none");
  $(window).scrollTop(0);
});

//Suggested Channels TOP Channels

async function getChannels() {
  try {
    const response = await fetch(`${FARI_API}/users/channels`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    return data.allChannels;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderChannels(allChannels) {
  let unesUsername = _.unescape(allChannels.channelname);
  let channel = $(`
            <div class="top-channel-card">
              <img loading="lazy" src="${
                allChannels.profile_avatar
                  ? allChannels.profile_avatar
                  : "https://drotje36jteo8.cloudfront.net/noAvi.png"
              }" alt="avatar" />
              <h5 id="channelID"><a href="/channel" aria-label="View user channel">${unesUsername}</a></h5>
            </div>
    
   `).data("allChannels", allChannels);
  $(".popular.channels .table").append(channel);

  $(channel).on("click", "#channelID", async function () {
    let channelView = $(this).closest(".top-channel-card").data("allChannels");
    let id = channelView.id;
    localStorage.setItem("visitingChannelID", id);
  });
  return channel;
}

function renderSuggestedChannels(channelList) {
  $(".popular.channels .table").empty();
  channelList.forEach(function (channel) {
    $(".popular.channels .table").append(renderChannels(channel));
  });
}

// Top Videos

async function getPopularMedia() {
  try {
    const response = await fetch(`${FARI_API}/explorer/popular-uploads`, {
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

function renderTopUploads(uploads) {
  let unesTitle = _.unescape(uploads.videotitle);
  let unesUsername = _.unescape(uploads.channelname);
  let popularVideo = $(`	
          <div class="pop-card">
            <div class="upload">
              <video src="${uploads.videofile}" poster="${uploads.videothumbnail}" preload="none"></video>
              <div class="upload-overlay">
                <a href="/theater" aria-label="Play video"><i class="fa-solid fa-play"></i></a>
              </div>
              <div class="upload-info">
                <a href="/channel" aria-label="View user channel">
                  <h6 id="channelNameLink">${unesUsername}<h6>
                </a>
                <h5>${unesTitle}</h5>
              </div>
            </div>
          </div>    
   `).data("uploads", uploads);
  $(".popular.uploads .grid").append(popularVideo);

  $(popularVideo).on("click", "#channelNameLink", async function () {
    let channelView = $(this).closest(".pop-card").data("uploads");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });
  $(popularVideo).on("click", ".fa-play", async function () {
    let videoUpload = $(this).closest(".pop-card").data("uploads");
    let id = videoUpload.videoid;
    localStorage.setItem("videoID", id);
    updateViews();
    try {
      const response = await fetch(`${FARI_API}/explorer`, {
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
  return popularVideo;
}

function renderPopularVideos(popularList) {
  $(".popular.uploads .grid").empty();
  popularList.forEach(function (uploads) {
    $(".popular.uploads .grid").append(renderTopUploads(uploads));
  });
}

//Personal Right Pane

//Render Subscriptions

async function getRecentlySubsUploads() {
  var userid = localStorage.getItem("userID");
  try {
    const response = await fetch(
      `${FARI_API}/explorer/recentuploads/subs/${userid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    return data.mysubscriptions;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderRecentUploadsChannels(mysubscriptions) {
  let unesUsername = _.unescape(mysubscriptions.channel);
  let recentchannel = $(`	
	       <div class="top-channel-card">
              <img loading="lazy" src="${
                mysubscriptions.channelavi
                  ? mysubscriptions.channelavi
                  : "https://drotje36jteo8.cloudfront.net/noAvi.png"
              }" alt="avatar" />
              <h5 id="channelLink"><a href=/channel" aria-label="View user channel">${unesUsername}</a></h5>
            </div>
    
   `).data("mysubscriptions", mysubscriptions);
  $(".channels-subbed .table").append(recentchannel);

  $(recentchannel).on("click", "#channelLink", async function () {
    let channelView = $(this)
      .closest(".top-channel-card")
      .data("mysubscriptions");
    let id = channelView.channelid;
    localStorage.setItem("visitingChannelID", id);
  });
  return recentchannel;
}

function renderRecentSubsThatHaveUploaded(recentList) {
  $(".channels-subbed .table").empty();
  recentList.forEach(function (recentchannel) {
    $(".channels-subbed .table").append(
      renderRecentUploadsChannels(recentchannel)
    );
  });
}

//RenderLiveChannels

async function getLiveChannels() {
  let userid = localStorage.getItem("userID");
  try {
    const response = await fetch(`${FARI_API}/users/livechannels/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    return data.live;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderLiveChannels(live) {
  let livechannel = $(`
                  <div class="top-channel-card">
              <img loading="lazy" src="${
                live.profile_avatar
                  ? live.profile_avatar
                  : "https://drotje36jteo8.cloudfront.net/noAvi.png"
              }" alt="avatar" />
              <h5 id="liveLink"><a href="#" style="color:#fdfbf9; text-decoration:none;" aria-label="View live stream">Join</a></h5>
            </div>
    
    
   `).data("live", live);
  $(".channels-live .table").append(livechannel);

  $(livechannel).on("click", "#liveLink", async function () {
    let channelView = $(this).closest(".top-channel-card").data("live");
    let id = channelView.id;
    localStorage.setItem("vistingChannelID", id);
  });
  return livechannel;
}

function renderLives(livechannelList) {
  $(".channels-live .table").empty();
  livechannelList.forEach(function (channel) {
    $(".channels-live .table").append(renderLiveChannels(channel));
  });
}

// Watchlater Additional Actions

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

async function laterVideo() {
  var getFeature = await getVideoData();
  console.log(getFeature)
  var userid = localStorage.getItem("userID");
  var vidID = getFeature[0].videoid;
  var channelname = getFeature[0].channelname;
  var channelavi = getFeature[0].channelavi;
  var video = getFeature[0].videofile;
  var posFile = getFeature[0].videothumbnail;
  var vidTitle = getFeature[0].videotitle;
  var channelID = getFeature[0].channelid;
  var views = getFeature[0].videoviewcount;

  const laterBody = {
    userid: userid,
    videoid: vidID,
    channelname: channelname,
    channelavi: channelavi,
    videofile: video,
    videothumbnail: posFile,
    videotitle: vidTitle,
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

async function laterVideoPurchased() {
  var getFeature = await getVideoData();

  var userid = localStorage.getItem("userID");
  var vidID = getFeature[0].videoid;
  var channelname = getFeature[0].channelname;
  var channelavi = getFeature[0].channelavi;
  var video = getFeature[0].videofile;
  var posFile = getFeature[0].videothumbnail;
  var vidTitle = getFeature[0].videotitle;
  var channelID = getFeature[0].channelid;
  var views = getFeature[0].videoviewcount;

  const laterBody = {
    userid: userid,
    videoid: vidID,
    channelname: channelname,
    channelavi: channelavi,
    videofile: video,
    videothumbnail: posFile,
    videotitle: vidTitle,
    channelid: channelID,
    videoviewcount: views,
    paidtoview: true,
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

async function userWatchedFlag() {
  let id = localStorage.getItem("purchasedWatched");
  try {
    const response = await fetch(`${FARI_API}/explorer/userwatched/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

//Delete Favs and WatchLaters

async function deleteFav() {
  var userid = localStorage.getItem("userID");
  let videoid = localStorage.getItem("videoID");

  try {
    const response = await fetch(
      `${FARI_API}/explorer/delete/favs/${userid}/${videoid}`,
      {
        method: "DELETE",
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

async function deleteWatchLater() {
  var userid = localStorage.getItem("userID");
  let videoid = localStorage.getItem("videoID");
  try {
    const response = await fetch(
      `${FARI_API}/explorer/delete/watchlater/${userid}/${videoid}`,
      {
        method: "DELETE",
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

async function createRentalOrder() {
  var getFeature = await getVideoData();

  var vidID = getFeature[0].videoid;
  var posFile = getFeature[0].videothumbnail;
  var channelID = getFeature[0].channelid;
  var userPurchased = localStorage.getItem("userID");
  var purchasePrice = getFeature[0].rental_price;
  var purchaseTitle = getFeature[0].videotitle;
  var vendor_email = getFeature[0].vendor_email;

  localStorage.setItem("vendorEmail", vendor_email);

  const rentalBody = {
    videoid: vidID,
    channelid: channelID,
    videothumbnail: posFile,
    userid: userPurchased,
    videotitle: purchaseTitle,
    videoprice: purchasePrice,
    vendor_email: vendor_email,
  };

  try {
    const response = await fetch(`${FARI_API}/explorer/movieorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(rentalBody),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function moviePurchaseEmail() {
  let email = localStorage.getItem("vendorEmail");
  try {
    const response = await fetch(
      `${FARI_API}/mailer/newsale/movierental/${email}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

//Stripe Checkout

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

function bootstrap() {
  getFreeMedia().then(renderMedia);
  getChannels().then(renderSuggestedChannels);
  getLiveChannels().then(renderLives);
  getPopularMedia().then(renderPopularVideos);
}

bootstrap();

// Responsive Design

$("header #mobile-view-bars").click(function (event) {
  $(".mobile-nav").toggleClass("active");
});

$(".mobile-nav #mobile-view-x").click(function (event) {
  $(".mobile-nav").removeClass("active");
});

$("#discover-mobile").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Discover");
  $(".searched").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".history").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".discover").css("display", "flex");
  getFreeMedia().then(renderMedia);
  $(".mobile-nav").removeClass("active");
  $(window).scrollTop(0);
});

$("#paytoview-mobile").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Pay to View");
  $(".searched").css("display", "none");
  $(".paytoview").css("display", "flex");
  $(".watchlist").css("display", "none");
  $(".history").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".discover").css("display", "none");
  getPaidMedia().then(renderPaidMedia);
  $(".mobile-nav").removeClass("active");
  $(window).scrollTop(0);
});

$("#subscriptions-mobile").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Subscriptions");
  $(".searched").css("display", "none");
  $(".discover").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".history").css("display", "none");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "flex");
  $(".mobile-nav").removeClass("active");
  getMySubUploads().then(renderSubsVids);
  getRecentlySubsUploads().then(renderRecentSubsThatHaveUploaded);
  $(window).scrollTop(0);
});

$("#favorites-mobile").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Favorites");
  $(".searched").css("display", "none");
  $(".discover").css("display", "none");
  $(".history").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".favorites").css("display", "flex");
  $(".subscriptions").css("display", "none");
  $(".mobile-nav").removeClass("active");
  getMyFavs().then(renderFavsList);
  getRecentlySubsUploads().then(renderRecentSubsThatHaveUploaded);
  $(window).scrollTop(0);
});

$("#watchlist-mobile").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Watchlist");
  $(".searched").css("display", "none");
  $(".discover").css("display", "none");
  $(".history").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "flex");
  $(".favorites").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".mobile-nav").removeClass("active");
  getWatchList().then(renderWatchLaters);
  getRecentlySubsUploads().then(renderRecentSubsThatHaveUploaded);
  $(window).scrollTop(0);
});

$("#history-mobile").click(function (event) {
  event.preventDefault();
  $(".main-content #title").empty();
  $(".main-content #title").text("Watch History");
  $(".searched").css("display", "none");
  $(".discover").css("display", "none");
  $(".paytoview").css("display", "none");
  $(".watchlist").css("display", "none");
  $(".favorites").css("display", "none");
  $(".history").css("display", "flex");
  $(".subscriptions").css("display", "none");
  $(".mobile-nav").removeClass("active");
  getHistory().then(renderHistoryList);
  $(window).scrollTop(0);
});
