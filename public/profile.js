const FARI_API = "https://fari-stage.herokuapp.com/api";
const CLOUD_FRONT = "https://drotje36jteo8.cloudfront.net";
const myToken = localStorage.getItem("fariToken");

(function () {
  $("#videos").addClass("selected");
  if (!myToken || myToken === null) {
    window.location.href = "/login";
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

$("#logout").click(function () {
  localStorage.clear();
  window.location.href = "index";
});

$(".bio .fa-pen").click(function () {
  $("#bio").attr("contenteditable", "true");
  $("#bio").addClass("editMode");

  let saveEdit = `
   <div class="editSaveCancel" contenteditable="false">
  <button class="editsSave" id="save">Save</button>
  <button class="editsSave" id="cancel">Cancel</button>
  </div>`;

  $(".bio").append(saveEdit);

  $("#cancel").on("click", async function () {
    $("#bio").removeClass("editMode");
    $("#bio").attr("contenteditable", "false");
    $(".editSaveCancel").remove();
  });

  $("#save").on("click", async function () {
    const channelBio = _.escape($("span#bio").text());
    let id = localStorage.getItem("userID");
    try {
      const updateBio = {
        bio: channelBio,
      };

      const response = await fetch(`${FARI_API}/users/addbio/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
        body: JSON.stringify(updateBio),
      });
      const data = await response.json();
      $("#bio").removeClass("editMode");
      $("#bio").attr("contenteditable", "false");
      $(".editSaveCancel").remove();
    } catch (error) {
      response.status(400).send(error);
    }
  });
});

$(".location .fa-pen").click(function () {
  $("#location").attr("contenteditable", "true");
  $("#location").addClass("editMode");
  let saveEdit = `
   <div class="editSaveCancel" contenteditable="false">
  <button class="editsSave" id="save">Save</button>
  <button class="editsSave" id="cancel">Cancel</button>
  </div>`;

  $(".location").append(saveEdit);

  $("#cancel").on("click", async function () {
    $("#location").removeClass("editMode");
    $("#location").attr("contenteditable", "false");
    $(".editSaveCancel").remove();
  });

  $("#save").on("click", async function () {
    const userLocation = _.escape($("span#location").text());
    let id = localStorage.getItem("userID");
    try {
      const updateBio = {
        location: userLocation,
      };

      const response = await fetch(`${FARI_API}/users/addlocation/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
        body: JSON.stringify(updateBio),
      });
      const data = await response.json();
      $("#location").removeClass("editMode");
      $("#location").attr("contenteditable", "false");
      $(".editSaveCancel").remove();
    } catch (error) {
      response.status(400).send(error);
    }
  });
});

$(".content-sort li").click(function () {
  let selected = $(this);
  selected.addClass("selected").siblings().removeClass("selected");
});

$("#videos").click(() => {
  $(".settings").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".analytics").css("display", "none");
  $(".newUpload").css("display", "none");
  $(".user-uploads").css("display", "flex");
  channelPost().then(renderPostList);
});

$("#upload").click(() => {
  $(".settings").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".analytics").css("display", "none");
  $(".newUpload").css("display", "flex");
  $(".user-uploads").css("display", "none");
});

$("#settings").click(() => {
  $(".settings").css("display", "flex");
  $(".subscriptions").css("display", "none");
  $(".analytics").css("display", "none");
  $(".newUpload").css("display", "none");
  $(".user-uploads").css("display", "none");
});

$("#subs").click(() => {
  $(".settings").css("display", "none");
  $(".subscriptions").css("display", "flex");
  $(".analytics").css("display", "none");
  $(".newUpload").css("display", "none");
  $(".user-uploads").css("display", "none");
});

$("#analytics").click(() => {
  $(".settings").css("display", "none");
  $(".subscriptions").css("display", "none");
  $(".analytics").css("display", "flex");
  $(".newUpload").css("display", "none");
  $(".user-uploads").css("display", "none");
  totalEarningsRentals().then(totalEarningsMarketplace).then(totalEarnings);
  totalRentedSold().then(totalShopSold).then(totalSold);
  totalViews().then(renderViews);
  totalLikes().then(renderLikes);
  totalDislikes().then(renderdisLikes);
  totalComments().then(renderComments);
  totalSubscribers().then(renderSubs);
  rentalSoldCount()
    .then(rentalCount)
    .then(rentalSoldCountByVideoID)
    .then(renderrentalSoldCount);
  marketSoldCount()
    .then(productCount)
    .then(getItemPurchaseTotal)
    .then(renderMarketSoldCount);
});

$("#logout").click(function () {
  localStorage.clear();
  window.location.href = "login";
});

//Defaults

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

async function userChannel() {
  try {
    var username = localStorage.getItem("userUsername");
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
    return data.profile;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderUserInfo(profile) {
  let viewsCounted = profile[0].subscriber_count;
  let subsToString = viewsCounted.toString();
  if (profile[0].subscriber_count > 1_000_000) {
    subsToString = (profile[0].subscriber_count / 1_000_000).toFixed(1) + "m";
  } else if (profile[0].subscriber_count > 1_000) {
    subsToString = (profile[0].subscriber_count / 1_000).toFixed(1) + "k";
  }
  let unesName = _.unescape(profile[0].username);
  let channelInfo = $(`
    
          <div class="channel-poster">
            <img id="profile-poster" src="${
              profile[0].profile_poster
                ? profile[0].profile_poster
                : "https://drotje36jteo8.cloudfront.net/wp7707348-white-blank-wallpapers.jpg"
            }" alt="poster" />
          </div>
          <div class="channel-details">
             <img id="avatar" src="${
               profile[0].profile_avatar
                 ? profile[0].profile_avatar
                 : "https://drotje36jteo8.cloudfront.net/noAvi.png"
             }" alt="avatar"/> 
            <div class="subs">
            <h4>${subsToString ? subsToString : "0"} Subscribers</h4>
            </div>
          </div>
          <div class="channel-name">
            <h2>${unesName}</h2>
          </div>
    
`).data("profile", profile);
  $(".user-info-card").append(channelInfo);
  return channelInfo;
}

//Videos

async function channelPost() {
  try {
    var channelid = localStorage.getItem("channelID");
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

function renderPost(channelUploads) {
  let viewsCounted = channelUploads.videoviewcount;
  let viewsString = viewsCounted.toString();
  if (channelUploads.videoviewcount > 1_000_000) {
    viewsString = (channelUploads.videoviewcount / 1_000_000).toFixed(1) + "m";
  } else if (channelUploads.videoviewcount > 1_000) {
    viewsString = (channelUploads.videoviewcount / 1_000).toFixed(1) + "k";
  }

  let unesTitle = _.unescape(channelUploads.videotitle);

  let upload = $(`
<div class="card">
              <video class="feature" src="${
                channelUploads.videofile
              }" poster="${channelUploads.videothumbnail}" muted></video>
              <div class="card-overlay">
                <div class="card-top">
                  <div class="video-info">
                    <a href="#"><img loading="lazy" id="channelAvi" src="${
                      channelUploads.profile_avatar
                        ? channelUploads.profile_avatar
                        : "https://drotje36jteo8.cloudfront.net/noAvi.png"
                    }" alt="channelAvatar" /></a>
                    <ul id="v">
                      <li id="channelName"><a href="#">${
                        channelUploads.channelname
                      }</a></li>
                      <li id="videoViews">${
                        viewsString ? viewsString + " " + "Views" : "No Views"
                      }</li>
                    </ul>
                  </div>
                  <div class="card-options">
                    <i class="fa-solid fa-ellipsis"></i>
                    <div class="options">
		     <ul>
      <li id="edit"><i class="fa-solid fa-pencil"></i>Edit</li>
      <li id="delete"><i class="fa-solid fa-xmark"></i>Delete</li>
    </ul>
                    </div>
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
    
   `).data("channelUploads", channelUploads);
  $(".user-uploads").append(upload);

  $(document).ready(function () {
    $(upload).hover(
      function () {
        $(this).find(".feature").get(0).play();
      },
      function () {
        $(this).find(".feature").get(0).pause();
      }
    );

    $(upload).on("click", ".fa-ellipsis", function () {
      $(this).parent().find(".options").toggleClass("active");
    });

    $(upload).on("click", "#edit", async function () {
      $("span#title-edit").empty();
      $("span#description-edit").empty();
      $("span#tags-edit").empty();
      $(".editUpload").toggleClass("active");

      let videoEdit = $(this).closest(".card").data("channelUploads");
      let editid = videoEdit.videoid;
      localStorage.setItem("editID", editid);
      let unesvideoTitle = _.unescape(videoEdit.videotitle);
      let unesvideoDescription = _.unescape(unesvideoTitle);
      let unesvideoTags = _.unescape(videoEdit.videotags);
      $("span#title-edit").append(videoEdit.videotitle);
      $("span#description-edit").append(unesvideoDescription);
      $("span#tags-edit").append(unesvideoTags);
      $(window).scrollTop(0);
    });

    $(upload).on("click", "#delete", async function () {
      let videoDel = $(this).closest(".card").data("channelUploads");
      let id = videoDel.videoid;
      let videokey = videoDel.videokey;
      let thumbnailKey = videoDel.thumbnailkey;
      try {
        const response = await fetch(
          `${FARI_API}/explorer/upload/delete/${id}/${videokey}/${thumbnailKey}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${myToken}`,
            },
          }
        );
        $(this).closest(".card").remove();
      } catch (error) {
        response.status(400).send(error);
      }
    });

    $(upload).on("click", ".fa-play", async function () {
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
        console.log(error);
        response.status(400).send(error);
      }
    });
  });
  return upload;
}

$("#saveEdit").click(async function () {
  let id = localStorage.getItem("editID");
  const edittitle = _.escape($("span#title-edit").text());
  const editdescription = _.escape($("span#description-edit").text());
  const edittags = _.escape($("span#tags-edit").text());
  const updatedUpload = {
    videotitle: edittitle,
    videodescription: editdescription,
    videotags: edittags,
  };
  try {
    const response = await fetch(`${FARI_API}/explorer/upload/edit/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
      body: JSON.stringify(updatedUpload),
    });
    const data = await response.json();
    $(".editUpload").removeClass("active");
    channelPost().then(renderPostList);
    return data;
  } catch (error) {
    console.log(error);
    response.status(400).send(error);
  }
});

$(".editUpload .fa-xmark").click(() => {
  $(".editUpload").removeClass("active");
});

function renderPostList(postList) {
  postList.forEach(function (uploads) {
    $(".user-uploads").append(renderPost(uploads));
  });
}

//Subscriptions

async function getUserChannelSubscriptions() {
  var userid = localStorage.getItem("userID");
  try {
    const response = await fetch(`${FARI_API}/explorer/mysubs/${userid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    if (data.mysubscriptions.length > 0) {
      $(".popular.subscribedTo .table").empty();
      $(".newUserMessage").css("display", "none");
    } else {
      $(".newUserMessage").css("display", "block");
    }
    return data.mysubscriptions;
  } catch (error) {
    response.status(400).send(error);
  }
}

function rendersubChannels(mysubscriptions) {
  let unesChannel = _.unescape(mysubscriptions.channelname);
  let subedChannels = $(`
    <div class="top-channel-card">
       <img src="${
         mysubscriptions.channelavi
           ? mysubscriptions.channelavi
           : "https://drotje36jteo8.cloudfront.net/noAvi.png"
       }" alt="avatar" />
        <h5 id="channelID"><a href="/channel">${unesChannel}</a></h5>
    </div>
    
   `).data("mysubscriptions", mysubscriptions);
  $(".popular.subscribedTo .table").append(subedChannels);

  $(subedChannels).on("click", "#channelID", async function () {
    let channel = $(this).closest(".top-channel-card").data("mysubscriptions");
    let id = channel.channelid;
    localStorage.setItem("visitingChannelID", id);
  });
  return subedChannels;
}

function renderSubsTable(subsList) {
  subsList.forEach(function (subedChannels) {
    $(".popular.subscribedTo .table").append(rendersubChannels(subedChannels));
  });
}

//Analytics

async function totalViews() {
  let channelid = localStorage.getItem("channelID");

  try {
    const response = await fetch(
      `${FARI_API}/analytics/viewstotal/${channelid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderViews(total) {
  $(".totalViews").empty();
  let viewsCounted = total[0].totalviews;
  let viewsString = viewsCounted.toString();
  if (total[0].totalviews > 1_000_000) {
    viewsString = (total[0].totalviews / 1_000_000).toFixed(1) + "m";
  } else if (total[0].totalviews > 1_000) {
    viewsString = (total[0].totalviews / 1_000).toFixed(1) + "k";
  }
  $(".views").empty();
  let viewsTotal = $(`
  <h2>Total Views: ${viewsString ? viewsString : "0"}</h2>
  <img src="https://img.icons8.com/external-prettycons-flat-prettycons/94/000000/external-view-essentials-prettycons-flat-prettycons.png" alt="eye-icon"/>
  `);
  $(".totalViews").append(viewsTotal);
}

async function totalEarningsRentals() {
  let channelid = localStorage.getItem("channelID");
  try {
    const response = await fetch(
      `${FARI_API}/analytics/rentaltotals/${channelid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    localStorage.setItem("channelEarnings", data.total[0].earningstotal);
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function totalEarningsMarketplace() {
  let vendorid = localStorage.getItem("vendorID");
  try {
    const response = await fetch(
      `${FARI_API}/analytics/markettotals/${vendorid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    localStorage.setItem("marketPlaceEarnings", data.total[0].earningstotal);
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

function totalEarnings() {
  $(".totalEarnings").empty();
  let shopEarnings = localStorage.getItem("marketPlaceEarnings");
  let rentalEarnings = localStorage.getItem("channelEarnings");

  let totalChannelEarnings =
    parseFloat(shopEarnings) + parseFloat(rentalEarnings);

  let allEarningsTotal = totalChannelEarnings.toFixed(2);

  let estimatedEarnings = $(`
<h2>Total Earnings: $${allEarningsTotal ? allEarningsTotal : "0.00"}</h2> 
<img src="https://img.icons8.com/officel/80/000000/money-bag.png" alt="moneybag"/>
`);
  $(".totalEarnings").append(estimatedEarnings);
}

async function totalLikes() {
  let channelid = localStorage.getItem("channelID");

  try {
    const response = await fetch(
      `${FARI_API}/analytics/likestotal/${channelid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderLikes(total) {
  $(".likes").empty();
  let viewsCounted = total[0].totallikes;
  let viewsString = viewsCounted.toString();
  if (total[0].totallikes > 1_000_000) {
    viewsString = (total[0].totallikes / 1_000_000).toFixed(1) + "m";
  } else if (total[0].totallikes > 1_000) {
    viewsString = (total[0].totallikes / 1_000).toFixed(1) + "k";
  }

  let likesTotal = $(`
<h4>Total Likes: ${viewsString ? viewsString : "0"}</h4> 
<img src="https://img.icons8.com/stickers/100/000000/facebook-like.png" alt="thumbs up"/>
`);

  $(".likes").append(likesTotal);
}

async function totalDislikes() {
  let channelid = localStorage.getItem("channelID");

  try {
    const response = await fetch(
      `${FARI_API}/analytics/dislikestotal/${channelid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderdisLikes(total) {
  $(".dislikes").empty();

  let viewsCounted = total[0].totaldislikes;
  let viewsString = viewsCounted.toString();
  if (total[0].totaldislikes > 1_000_000) {
    viewsString = (total[0].totaldislikes / 1_000_000).toFixed(1) + "m";
  } else if (total[0].totaldislikes > 1_000) {
    viewsString = (total[0].totaldislikes / 1_000).toFixed(1) + "k";
  }

  let dislikesTotal = $(`
<h4>Total Dislikes: ${viewsString ? viewsString : "0"}</h4> 
<img src="https://img.icons8.com/stickers/100/000000/thumbs-down.png" alt="thumbs down"/>
`);

  $(".dislikes").append(dislikesTotal);
}

async function totalComments() {
  let channelid = localStorage.getItem("channelID");

  try {
    const response = await fetch(
      `${FARI_API}/analytics/commentstotal/${channelid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderComments(total) {
  $(".comments").empty();
  let viewsCounted = total[0].count;
  let viewsString = viewsCounted.toString();
  if (total[0].count > 1_000_000) {
    viewsString = (total[0].count / 1_000_000).toFixed(1) + "m";
  } else if (total[0].count > 1_000) {
    viewsString = (total[0].count / 1_000).toFixed(1) + "k";
  }
  let totalComments = $(`
<h4>Total Comments: ${viewsString}</h4> 
<img src="https://img.icons8.com/external-flaticons-flat-flat-icons/64/000000/external-comment-customer-feedback-flaticons-flat-flat-icons.png" alt="comment"/>
`);
  $(".comments").append(totalComments);
}

async function totalSubscribers() {
  let id = localStorage.getItem("channelID");

  try {
    const response = await fetch(
      `${FARI_API}/analytics/totalsubscribers/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

function renderSubs(total) {
  $(".subscribers-analytics").empty();

  let viewsCounted = total[0].subscriber_count;
  let viewsString = viewsCounted.toString();
  if (total[0].subscriber_count > 1_000_000) {
    viewsString = (total[0].subscriber_count / 1_000_000).toFixed(1) + "m";
  } else if (total[0].subscriber_count > 1_000) {
    viewsString = (total[0].subscriber_count / 1_000).toFixed(1) + "k";
  }

  let totalSubers = $(`
 <h4>Total Subscribers: ${viewsString}</h4> 
 <img src="https://img.icons8.com/external-parzival-1997-outline-color-parzival-1997/64/000000/external-subscriber-digital-asset-and-intangible-product-parzival-1997-outline-color-parzival-1997.png" alt="network"/>
 `);

  $(".subscribers-analytics").append(totalSubers);
}

async function totalRentedSold() {
  let channelid = localStorage.getItem("channelID");

  try {
    const response = await fetch(
      `${FARI_API}/analytics/rentedtotal/${channelid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    localStorage.setItem("rentalsSold", data.total[0].count);
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function totalShopSold() {
  let vendorid = localStorage.getItem("vendorID");

  try {
    const response = await fetch(
      `${FARI_API}/analytics/soldproductstotal/${vendorid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    localStorage.setItem("productsSold", data.total[0].count);
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

function totalSold() {
  $(".productsSolds").empty();
  let productsSold = localStorage.getItem("productsSold");
  let rentalsSold = localStorage.getItem("rentalsSold");
  let totalThingsSold = parseInt(productsSold) + parseInt(rentalsSold);
  let allSells = totalThingsSold;

  let viewsString = allSells.toString();
  if (allSells > 1_000_000) {
    viewsString = (allSells / 1_000_000).toFixed(1) + "m";
  } else if (allSells > 1_000) {
    viewsString = (allSells / 1_000).toFixed(1) + "k";
  }

  let soldTotal = $(`
<h4>Total Orders: ${viewsString ? viewsString : "0"}</h4>
<img src="https://img.icons8.com/emoji/48/000000/package-.png" alt="package"/>
`);
  $(".productsSolds").append(soldTotal);
}

//Rentals
async function rentalSoldCount() {
  let channelid = localStorage.getItem("channelID");

  try {
    const response = await fetch(
      `${FARI_API}/analytics/rentedcounts/${channelid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.total.length > 0) {
      $(".videos .graph tbody").empty();
      $(".noData.Rentals").css("display", "none");
    } else {
      $(".videos .graph table").css("display", "none");
      $(".noData.Rentals").css("display", "block");
    }
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

function rentalCount(total) {
  arr3 = total;
  let videos = [];
  for (let i = 0; i < arr3.length; i++) {
    videos.push(arr3[i].id);
  }

  let videoIDs = [...new Set(videos)];
  localStorage.setItem("videoIDs", JSON.stringify(videoIDs));
}

async function rentalSoldCountByVideoID() {
  let myVideoItems = [];
  let videoids = JSON.parse(localStorage.getItem("videoIDs"));

  videoids.forEach(async function (videoid) {
    try {
      const response = await fetch(
        `${FARI_API}/analytics/rental-sells/${videoid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${myToken}`,
          },
        }
      );
      const data = await response.json();
      myVideoItems.push(data.pricing);
      return data.pricing;
    } catch (error) {
      response.status(400).send(error);
    } finally {
      localStorage.setItem("videoPrices", JSON.stringify(myVideoItems));
    }
  });
}

function renderrentalSoldCount(pricing) {
  let videoPricing = JSON.parse(localStorage.getItem("videoPrices"));

  videoPricing.forEach(function (total) {
    let rentalSold = $(`	  
	      
	<tr>
        <td id="product"><img src="${total.videothumbnail}" alt="product-img"/>${total.videotitle}</td>
        <td></td>
        <td>${total.count}</td>
        <td>$${total.videoordertotal}</td>
        <td></td>
        <td></td>
        
        </tr>
 `).data("pricing", pricing);
    $(".videos .graph tbody").append(rentalSold);
  });
}

function renderrentalsList(rentList) {
  rentList.forEach(function (total) {
    $(".videos .graph tbody").append(renderrentalSoldCount(total));
  });
}

//Marketplace

async function marketSoldCount() {
  let vendorid = localStorage.getItem("vendorID");

  try {
    const response = await fetch(
      `${FARI_API}/analytics/marketsellcounts/${vendorid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${myToken}`,
        },
      }
    );
    const data = await response.json();
    if (data.total.length > 0) {
      $(".shop .graph tbody").empty();
      $(".noData.Marketplace").css("display", "none");
    } else {
      $(".shop .graph table").css("display", "none");
      $(".noData.Marketplace").css("display", "block");
    }
    return data.total;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function productCount(total) {
  arr = total;
  let productids = [];
  for (let i = 0; i < arr.length; i++) {
    productids.push(arr[i].id);
  }

  let prodIDs = [...new Set(productids)];
  localStorage.setItem("productIDs", JSON.stringify(prodIDs));
}

async function getItemPurchaseTotal() {
  let myItems = [];
  let ids = JSON.parse(localStorage.getItem("productIDs"));
  ids.forEach(async function (productid) {
    try {
      const response = await fetch(
        `${FARI_API}/analytics/product-sells/${productid}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${myToken}`,
          },
        }
      );
      const data = await response.json();
      myItems.push(data.pricing);
      return data.pricing;
    } catch (error) {
      response.status(400).send(error);
    } finally {
      localStorage.setItem("orderPrices", JSON.stringify(myItems));
    }
  });
}

async function renderMarketSoldCount(pricing) {
  let productPricing = JSON.parse(localStorage.getItem("orderPrices"));
  productPricing.forEach(function (total) {
    let marketSells = $(`
	 <tr>
        <td id="product"><img src="${total.prod_img}" alt="product-img"/>${total.product_name}</td>
        <td></td>
        <td>${total.count}</td>
        <td>$${total.itemsordertotal}</td>
        <td></td>
        <td></td>
        
        </tr>
 `).data("pricing", pricing);
    $(".shop .graph tbody").append(marketSells);

    return marketSells;
  });
}

function rendermarketList(marketList) {
  marketList.forEach(function (total) {
    $(".shop .graph tbody").append(renderMarketSoldCount(total));
  });
}

//Settings

function showPreviewPoster(event) {
  if (event.target.files.length > 0) {
    var src = URL.createObjectURL(event.target.files[0]);
    var preview = document.getElementById("poster-photo");
    preview.src = src;
    preview.style.display = "block";
  }
}

$("#submitPoster").click(async function (event) {
  event.preventDefault();
  let slider1 = _.escape($(".poster-photo").val());
  try {
    var channelname = localStorage.getItem("channelName");
    const formData = new FormData(
      document.getElementById("profilePosterUpdate")
    );

    const response = await fetch(
      `${FARI_API}/users/myprofile/update/posters/${channelname}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${myToken}`,
        },
        body: formData,
      }
    );
    const data = await response.json();
    $(".user-info-card").empty();
    $("#poster-photo").attr(
      "src",
      "https://img.icons8.com/ios-filled/50/000000/upload-to-cloud--v1.png"
    );
    userChannel().then(renderUserInfo);
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
});

function showPreviewAvi(event) {
  if (event.target.files.length > 0) {
    var src = URL.createObjectURL(event.target.files[0]);
    var preview = document.getElementById("avatar-photo");
    preview.src = src;
    preview.style.display = "block";
  }
}

$("#submitAvatar").click(async function (event) {
  event.preventDefault();
  let avatar = _.escape($(".avatar-preview").val());
  try {
    var channelname = localStorage.getItem("channelName");
    const formData = new FormData(document.getElementById("profileAviUpdate"));

    const response = await fetch(
      `${FARI_API}/users/myprofile/update/avatar/${channelname}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${myToken}`,
        },
        body: formData,
      }
    );
    const data = await response.json();
    $(".user-info-card").empty();
    $("#avatar-photo").attr(
      "src",
      "https://img.icons8.com/ios-filled/50/000000/upload-to-cloud--v1.png"
    );
    userChannel().then(renderUserInfo);
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
});

// New Upload

$("#film").click(function () {
  $(".paid-content").css("display", "flex");
  $("#rentalprice").css("display", "none");
  $(".message").css("display", "block");
});

$("#shows").click(function () {
  $(".paid-content").css("display", "flex");
  $("#rentalprice").css("display", "none");
  $(".message").css("display", "block");
});

$("#rent").click(function () {
  $("#rentalprice").css("display", "block");
  $(".message").css("display", "block");
});

$("#free").click(function () {
  $("#rentalprice").css("display", "none");
  $("#rentalprice").val("0.00");
  $(".message").css("display", "none");
});

$("#vlog").click(function () {
  $(".paid-content").css("display", "none");
  $("#rentalprice").val("0.00");
  $(".message").css("display", "none");
});

$("#other").click(function () {
  $(".paid-content").css("display", "none");
  $("#rentalprice").val("0.00");
  $(".message").css("display", "none");
});

const videoSelector = document.querySelector("#vidFile");
let reader = {};
let file = {};
let slice_size = 1000 * 1024;

videoSelector.addEventListener("change", (event) => {
  event.preventDefault();
  reader = new FileReader();
  file = document.querySelector("#vidFile").files[0];
  upload_file(0);
});

function upload_file(start) {
  let next_slice = start + slice_size + 1;
  let blob = file.slice(start, next_slice);
  let url = URL.createObjectURL(file);
  reader.onloadend = function (event) {
    $("#video-file").attr("src", url);
    $("#video-file").load();
  };

  reader.readAsDataURL(blob);
}

function setPoster(event) {
  if (event.target.files.length > 0) {
    var addPoster = URL.createObjectURL(event.target.files[0]);
    document.getElementById("video-poster").setAttribute("poster", addPoster);
  }
}

$(".newUpload form").on("submit", async function submitUpload(event) {
  event.preventDefault();

  const title = _.escape($("span#title").text());
  const description = _.escape($("span#description").text());
  const tags = _.escape($("span#tags").text());
  const rentalprice = _.escape($("#rentalprice").val());
  const contenttype = $('input[name="content_type"]:checked').val();
  const paidOrFree = $('input[name="paid_content"]:checked').val();
  const poster = _.escape($("#video-poster").attr("poster"));
  const vid = _.escape($("#video-file").attr("src"));

  try {
    var profile = await getUserProfile();
    var channelname = profile[0].channelname;
    var profile_avatar = profile[0].profile_avatar
      ? profile[0].profile_avatar
      : "https://drotje36jteo8.cloudfront.net/noAvi.png";
    var channelid = profile[0].channelid;
    var vendor_email = profile[0].email;
    var stripe_acct = profile[0].stripe_acctid;

    const formData = new FormData(document.getElementById("newUpload"));
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("channelid", channelid);
    formData.append("channelname", channelname);
    formData.append("channelavi", profile_avatar);
    formData.append("vendor_email", vendor_email);
    formData.append("stripe_acctid", stripe_acct);
    onFetchStart();
    const response = await fetch(`${FARI_API}/explorer/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${myToken}`,
      },
      body: formData,
    });
    const data = await response.json();
  } catch (error) {
    response.status(400).send(error);
  } finally {
    onFetchEnd();
    $("span#title").text("");
    $("span#description").text("");
    $("span#tags").text("");
    $("#video-file").attr("src", "");
    $("#video-poster").attr("poster", "");
  }
});

async function vendorVerificationCheck() {
  let id = localStorage.getItem("vendorID");
  try {
    const response = await fetch(`${FARI_API}/users/vendor-verified/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    if (data.vendor[0].registered === true) {
      $("#rent").attr("disabled", false);
    } else {
      $("#rent").attr("disabled", true);
    }
    return data.vendor;
  } catch (error) {
    response.status(400).send(error);
  }
}

//Message Board

async function getMessages() {
  let id = localStorage.getItem("userID");
  try {
    const response = await fetch(`${FARI_API}/inbox/unread/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    console.log(data);
    return data.notes;
  } catch (error) {
    response.status(400).send(error);
  }
}

async function renderMessages(notes) {
  let unesMessage = _.unescape(notes.note_message);
  let unesChannel = _.unescape(notes.sendername);
  let note = $(`
<div class="note">
<div class="channel-avi">
<a href="/channel"><img loading="lazy" src="${notes.senderpic}" alt="sender pic" /></a>
<h3 id="channel"><a href="#">${unesChannel}</a></h3>
</div>
<h4>${unesMessage}</h4>
<button id="read" title="Mark as Read">Mark as Read</button>
</div>
`).data("notes", notes);
  $(".messages .table").append(note);

  $(note).on("click", "#read", async function () {
    let thisNote = $(this).closest(".note").data("notes");
    let id = thisNote.id;
    localStorage.setItem("noteID", id);
    markAsRead().then(getMessages).then(rendermessageList);
  });
}

function rendermessageList(messageList) {
  $(".messages .table").empty();
  messageList.forEach(function (notes) {
    $(".messages .table").append(renderMessages(notes));
  });
}

async function markAsRead() {
  let id = localStorage.getItem("noteID");
  try {
    const response = await fetch(`${FARI_API}/inbox/markasread/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${myToken}`,
      },
    });
    const data = await response.json();
    return data.messages;
  } catch (error) {
    response.status(400).send(error);
  }
}

function bootstrap() {
  getUserProfile();
  vendorVerificationCheck();
  userChannel().then(renderUserInfo);
  channelPost().then(renderPostList);
  getUserChannelSubscriptions().then(renderSubsTable);
  getMessages().then(rendermessageList);
  totalEarningsRentals().then(totalEarningsMarketplace).then(totalEarnings);
  // totalRentedSold().then(totalShopSold).then(totalSold);
  totalViews().then(renderViews);
  totalLikes().then(renderLikes);
  totalDislikes().then(renderdisLikes);
  totalComments().then(renderComments);
  totalSubscribers().then(renderSubs);
  rentalSoldCount()
    .then(rentalCount)
    .then(rentalSoldCountByVideoID)
    .then(renderrentalSoldCount);
  // marketSoldCount()
  //   .then(productCount)
  //   .then(getItemPurchaseTotal)
  //   .then(renderMarketSoldCount);
}

bootstrap();
