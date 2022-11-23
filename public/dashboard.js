const FARI_API = "https://fari-testapi.herokuapp.com/api";
const myToken = localStorage.getItem("fariToken");

(function () {
  if (!myToken || myToken === null) {
    window.location.href = "public/login.html";
  }
})();

$(document).ready(function () {
  $(".slider").slick({
    arrows: false,
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  });
});

$(".fa-x").on("click", () => {
  $(".nav").css("display", "none");
});

$(".fa-bars").on("click", () => {
  $(".nav").css("display", "flex");
});

$(".btn-board").click(function () {
  let selected = $(this);
  selected.addClass("active").siblings().removeClass("active");
});

$(".fa-bars").click(function () {
  $(".mobile-menu-options").toggleClass("active");
});

$(".dropdown i").click(function () {
  $(".dashboard-options").toggleClass("active");
});

$("#logout").click(function () {
  localStorage.clear();
  window.location.href = "public/index.html";
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
    if (data.profile.length > 0) {
      localStorage.setItem("userID", data.profile[0].userid);
      localStorage.setItem("userUsername", data.profile[0].username);
      localStorage.setItem("userAvi", data.profile[0].profile_avatar);
      localStorage.setItem("userEmail", data.profile[0].email);
      localStorage.setItem("vendorID", data.profile[0].vendorid);
      localStorage.setItem("channelID", data.profile[0].channelid);
      localStorage.setItem("channelName", data.profile[0].channelname);
      localStorage.setItem("userStripeAcct", data.profile[0].stripe_acctid);
    } else if (data.profile.length === 0) {
      window.location.href = "public/login.html";
    }

    return data.profile;
  } catch (error) {
    response.status(400).send(error);
  }
}

function dashboardAvi(profile) {
  let unesUsername = _.unescape(profile[0].username);
  let profilePic = $(`
  <img src="${
    profile[0].profile_avatar
      ? profile[0].profile_avatar
      : "https://drotje36jteo8.cloudfront.net/noAvi.png"
  }" alt="userAvatar" />
  `);
  $(".greeting .userAvatar").append(profilePic);

  let profileName = $(`
  <h1>Hi, ${unesUsername}!</h1>
  `);
  $(".info .userHello").append(profileName);
}

function bootstrap() {
  getUserProfile().then(dashboardAvi);
}

bootstrap();
