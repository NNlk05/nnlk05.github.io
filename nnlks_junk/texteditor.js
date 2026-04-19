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
