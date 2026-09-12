const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://nnlk05-github-io-backend.vercel.app";

function downloadStringAsFile(content, fileName, contentType = "text/plain") {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

document.getElementById("upload").addEventListener("click", async () => {
  const fileInput = document.getElementById("file");
  fileInput.click();

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const content = await file.text();
        document.getElementById("text-input").value = content;
      } catch (err) {
        console.error("Error reading file:", err);
      }
    }
  };
});

document.getElementById("download").addEventListener("click", () => {
  const text = document.getElementById("text-input").value;
  const filename = document.getElementById("file-name").value;
  downloadStringAsFile(text, filename);
});

class BrowserStorageFile {
  constructor(name, data) {
    this.name = name;
    this.data = data;
  }

  save(data) {
    if (data) {
      this.data = data;
    }
    localStorage.setItem(this.name, this.data);
  }

  static load(name) {
    try {
      const data = localStorage.getItem(name);
      return data;
    } catch {
      return null;
    }
  }
}

document.getElementById("save").addEventListener("click", () => {
  const filename = document.getElementById("file-name").value;
  const text = document.getElementById("text-input").value;
  const file = new BrowserStorageFile(filename, text);
  file.save();
});

document.getElementById("load").addEventListener("click", () => {
  const filename = document.getElementById("file-name").value;
  const text = BrowserStorageFile.load(filename);
  document.getElementById("text-input").value = text;
});

document.getElementById("save-cloud").addEventListener("click", async () => {
  const filename = document.getElementById("file-name").value.trim();
  const text = document.getElementById("text-input").value;
  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("Please log in to save files to your cloud storage.");
    return;
  }

  if (!filename) {
    alert("Please enter a file name before saving to the cloud.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: filename,
        content: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    alert("Document saved to cloud successfully!");
  } catch (err) {
    console.error("Cloud save error:", err);
    alert("Failed to save document to cloud.");
  }
});

document.getElementById("load-cloud").addEventListener("click", async () => {
  const filename = document.getElementById("file-name").value.trim();
  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("Please log in to load files from your cloud storage.");
    return;
  }

  if (!filename) {
    alert("Please enter a file name to load from the cloud.");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/documents/${encodeURIComponent(filename)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status === 404) {
      alert("Document not found in cloud storage.");
      return;
    } else if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    document.getElementById("text-input").value = data.content;
    alert("Document loaded from cloud successfully!");
  } catch (err) {
    console.error("Cloud load error:", err);
    alert("Failed to load document from cloud.");
  }
});
