let selectedStyle = null;

function selectStyle(img) {
  document.querySelectorAll('.styles img').forEach(el => el.classList.remove('selected'));
  img.classList.add('selected');
  selectedStyle = img.src;
}

async function generateArt() {
  const name = document.getElementById('nameInput').value.trim();
  const resultDiv = document.getElementById('result');

  if (!name) {
    alert("Please enter a name.");
    return;
  }
  if (!selectedStyle) {
    alert("Please select a style image.");
    return;
  }

  resultDiv.innerHTML = "⏳ Generating...";

  try {
    const imageResponse = await fetch(selectedStyle);
    const imageBlob = await imageResponse.blob();

    const prompt = `Following the artistic style, color palette, and composition of the provided image, create a new depiction of Lord Ganesha that beautifully integrates the name '${name}' into the artwork.`;

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('image', imageBlob, 'style.png');

    const serverResponse = await fetch("/api/generate", {
      method: "POST",
      body: formData
    });

    const data = await serverResponse.json();

    if (!serverResponse.ok) {
      // If the server returned an error (like 4xx or 5xx)
      // The error message from our backend will be in data.error
      const errorMessage = data.error?.message || JSON.stringify(data);
      throw new Error(errorMessage);
    }
    
    // Check for the b64_json from a successful response
    if (data.data && data.data[0] && data.data[0].b64_json) {
      const imageData = data.data[0].b64_json;
      resultDiv.innerHTML = `<img src="data:image/png;base64,${imageData}" alt="Generated Art">`;
    } else {
      // This case would be an unexpected success response from OpenAI
      throw new Error("Received an unexpected response from the server.");
    }

  } catch (err) {
    console.error('Request Failed:', err);
    resultDiv.innerHTML = `⚠️ Error: ${err.message}`;
  }
}
