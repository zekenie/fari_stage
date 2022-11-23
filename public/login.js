const FARI_API = "https://fari-testapi.herokuapp.com/api";
const FARI_API2 = "https://fari-testapi.herokuapp.com";
let TOKEN;

(function () {
  $("#login").addClass("selected");
  let setUser = localStorage.getItem("fariToken");
  if (setUser) {
    window.location.href = "public/dashboard.html";
  }
})();

$("#login").on("click", () => {
  $(".message").empty();
  $(".password_reset-form").css("display", "none");
  $(".register-form").css("display", "none");
  $("#register").removeClass("selected");
  $(".login-form").css("display", "flex");
  $("#login").addClass("selected");
});

$("#register").on("click", () => {
  $(".message").empty();
  $(".password_reset-form").css("display", "none");
  $(".login-form").css("display", "none");
  $("#login").removeClass("selected");
  $(".register-form").css("display", "flex");
  $("#register").addClass("selected");
});

$("#password-reset").on("click", () => {
  $(".message").empty();
  $(".login-form").css("display", "none");
  $("#login").removeClass("selected");
  $(".register-form").css("display", "none");
  $("#register").removeClass("selected");
  $(".password_reset-form").css("display", "flex");
});

$(".login-form").on("submit", async (event) => {
  event.preventDefault();
  const username = _.escape($("#username").val());
  const password = _.escape($("#password").val());
  const user = {
    username,
    password,
  };
  try {
    const response = await fetch(`${FARI_API}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      mode: "cors",
      body: JSON.stringify(user),
    });
    const data = await response.json();
    if (data.error) {
      $(".message")
        .text(data.message)
        .css("color", "#B2022F")
        .css("letter-spacing", ".05rem");
    } else if (data.success) {
      $(".message")
        .text(data.message)
        .css("color", "#100a1c")
        .css("letter-spacing", ".05rem");
      window.location.href = "public/dashboard.html";
      localStorage.setItem("fariToken", data.token);
    }
  } catch (error) {
    response.status(400).send(error);
    $(".message").text("Invalid Username or Password");
    setTimeout(() => {
      $("#username").val("");
      $("#password").val("");
      $(".message").text("");
    }, 3000);
  }
});

$(".register-form").on("submit", async (event) => {
  event.preventDefault();
  const userName = _.escape($("#reg-user").val());
  const userEmail = _.escape($("#reg-email").val());
  const userPassword = _.escape($("#reg-pass").val());
  const userConPassword = _.escape($("#reg-conpass").val());
  const location = _.escape($("#reg-location").val());
  if (userName.length < 3) {
    $(".message").empty();
    $(".message")
      .text("Username must be at least 3 characters.")
      .css("color", "#B2022F")
      .css("letter-spacing", ".05rem");
  }
  if (userPassword != userConPassword) {
    event.preventDefault();
    $(".message").empty();
    $(".message")
      .text("Your password and confirmed password don't match.")
      .css("color", "#B2022F")
      .css("letter-spacing", ".05rem");
    return false;
  }
  if (userName === "" || userEmail === "") {
    $(".message").empty();
    $(".message")
      .text("All fields are required.")
      .css("color", "#B2022F")
      .css("letter-spacing", ".05rem");
    return false;
  }
  const user = {
    username: userName,
    email: userEmail,
    password: userPassword,
    confirmpassword: userConPassword,
    location: location,
  };
  try {
    const response = await fetch(`${FARI_API}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const data = await response.json();
    if (data.error) {
      $(".message")
        .text(data.message)
        .css("letter-spacing", ".05rem")
        .css("color", "#B2022F");
    } else if (data.success) {
      WelcomeEmail();
      $(".message")
        .text(data.message)
        .css("color", "#100a1c")
        .css("letter-spacing", ".05rem");
      localStorage.setItem("fariToken", data.token);
    }
  } catch (error) {
    response.status(400).send(error);
    $(".message").text("Oops! Something went wrong, please try again!");
    setTimeout(() => {
      $("#reg-user").val("");
      $("#reg-email").val("");
      $("#reg-pass").val("");
      $("#reg-conpass").val("");
      $("#reg-location").val("");
      $(".message").text("");
    }, 3000);
  }
});

$(".password_reset-form").on("submit", async (event) => {
  event.preventDefault();
  let email = _.escape($("#reset-request").val());
  try {
    const response = await fetch(`${FARI_API}/mailer/forgotpassword/${email}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.error) {
      $(".message")
        .text(data.message)
        .css("color", "#B2022F")
        .css("letter-spacing", ".05rem");
    } else if (data.success) {
      $(".message")
        .text(data.message)
        .css("color", "#100a1c")
        .css("letter-spacing", ".05rem");
      localStorage.setItem("tempToken", data.token);
    }
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
});
//Welcome Email

async function WelcomeEmail() {
  const email = _.escape($("#reg-email").val());
  try {
    const response = await fetch(`${FARI_API}/mailer/welcome/${email}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    response.status(400).send(error);
  }
}

let passwordToggle = document.getElementById("toggle");
let passwordEntry = document.getElementById("reg-pass");

passwordToggle.onclick = function () {
  if (passwordEntry.type === "password") {
    passwordToggle.classList.add("show");
    passwordEntry.setAttribute("type", "text");
  } else if (passwordEntry.type === "text") {
    passwordToggle.classList.remove("show");
    passwordEntry.setAttribute("type", "password");
  }
};

let passwordToggle2 = document.getElementById("toggle-login");
let passwordEntry2 = document.getElementById("password");

passwordToggle2.onclick = function () {
  if (passwordEntry2.type === "password") {
    passwordToggle2.classList.add("show");
    passwordEntry2.setAttribute("type", "text");
  } else if (passwordEntry2.type === "text") {
    passwordToggle2.classList.remove("show");
    passwordEntry2.setAttribute("type", "password");
  }
};

let confirmToggle = document.getElementById("toggle2");
let confirmPasswordEntry = document.getElementById("reg-conpass");

confirmToggle.onclick = function () {
  if (confirmPasswordEntry.type === "password") {
    confirmToggle.classList.add("show");
    confirmPasswordEntry.setAttribute("type", "text");
  } else if (confirmPasswordEntry.type === "text") {
    confirmToggle.classList.remove("show");
    confirmPasswordEntry.setAttribute("type", "password");
  }
};

$("#reg-pass").on("click", function () {
  $(".messages ul").css("display", "block");
});

$("#reg-pass").on("focus", function () {
  $(".messages ul").css("display", "block");
});

$("#reg-conpass").on("click", function () {
  $(".messages ul").css("display", "none");
});

$("#reg-user").on("click", function () {
  $(".messages ul").css("display", "none");
});

$("#reg-email").on("click", function () {
  $(".messages ul").css("display", "none");
});

$("#reg-conpass").on("focus", function () {
  $(".messages ul").css("display", "none");
});

$("#reg-location").on("focus", function () {
  $(".messages ul").css("display", "none");
});

$("#reg-pass").on("keyup", function () {
  const value = $("#reg-pass").val();
  const length = new RegExp("(?=.{8,})");
  const lower = new RegExp("(?=.*[a-z])");
  const upper = new RegExp("(?=.*[A-Z])");
  const number = new RegExp("(?=.*[0-9])");
  const special = new RegExp("(?=.*[!@#$%^&*])");

  if (length.test(value)) {
    $("#character-length").addClass("pass");
  } else {
    $("#character-length").removeClass("pass");
  }
  if (upper.test(value)) {
    $("#uppercase-letter").addClass("pass");
  } else {
    $("#uppercase-letter").removeClass("pass");
  }
  if (lower.test(value)) {
    $("#lowercase-letter").addClass("pass");
  } else {
    $("#lowercase-letter").removeClass("pass");
  }
  if (number.test(value)) {
    $("#one-number").addClass("pass");
  } else {
    $("#one-number").removeClass("pass");
  }

  if (special.test(value)) {
    $("#special-character").addClass("pass");
  } else {
    $("#special-character").removeClass("pass");
  }
});
