const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://nnlk05-github-io-backend.vercel.app";

const endpoint = `${API_BASE_URL}/discord`;

async function sendMessage(name, content) {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, content }),
    });

    if (!response.ok) {
      console.error(`Failed to send message: Status ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Network or runtime error:", error);
    return false;
  }
}

document
  .querySelector(".contact-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const name = document.querySelector("#name").value;
      const message = document.querySelector("#message").value;

      const isSuccess = await sendMessage(name, message);

      if (isSuccess) {
        alert("Message sent!");
        document.querySelector(".contact-form").reset();
      } else {
        alert("Failed to send message. Check the console for details.");
      }
    } catch (err) {
      console.error("Error in submit listener:", err);
    }
  });
