const yesBtn = document.getElementById("confirm-logout");
const noBtn = document.getElementById("cancel-logout");

yesBtn.addEventListener("click", () => {
  localStorage.removeItem("access_token");
  window.location.href = "/index.html";
});

noBtn.addEventListener("click", () => {
  window.history.back();
});
