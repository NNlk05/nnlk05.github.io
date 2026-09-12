const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://nnlk05-github-io-backend.vercel.app";

const endpoint = `${API_BASE_URL}/auth/signup`;

async function register(username, password) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (response.ok) {
      window.location.href = "/login";
      return true;
    } else {
      const errorData = await response.json();
      alert(errorData.detail || "Registration failed");
      return false;
    }
  } catch (error) {
    console.error("Network or runtime error:", error);
    alert("Could not connect to the authentication server.");
    return false;
  }
}

document
  .querySelector(".register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const username = document.querySelector("#username").value;
      const password = document.querySelector("#password").value;

      await register(username, password);
    } catch (err) {
      console.error("Error in submit listener:", err);
    }
  });
