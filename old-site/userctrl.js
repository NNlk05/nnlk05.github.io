const loginLink = document.querySelector(".login a");
const isLoggedIn = Boolean(localStorage.getItem("access_token"));

if (isLoggedIn) {
  loginLink.textContent = "Logout";
  loginLink.href = "/logout.html";
} else {
  loginLink.textContent = "Login";
}
