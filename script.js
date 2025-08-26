let selectedStyle = null;

function selectStyle(img) {
  document.querySelectorAll('.styles img').forEach(el => el.classList.remove('selected'));
  img.classList.add('selected');
  selectedStyle = img.src;
}

async function generateArt() {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) {
    alert("Please enter a name.");
    return;
  }
  if (!selectedStyle) {
    alert("Please select a style image.");
    return;
  }

  document.getElementById('result').innerHTML = "⏳ Generating...";

  // Fetch the selected style image and convert to base64
  const response = await fetch(selectedStyle);
  const blob = await response.blob();
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = async function() {
    const base64data = reader.result.split(',')[1];

    const prompt = `Create a vibrant artistic depiction of Lord Ganesha in the style of the reference image, beautifully integrating the name '${name}' into the design, with festive colors and ornate spiritual symbolism.`;

    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: prompt,
          size: "1024x1024",
          image: [base64data]
        })
      });

      const data = await res.json();
      if (data.data && data.data[0] && data.data[0].url) {
        document.getElementById('result').innerHTML = `<img src="${data.data[0].url}" alt="Generated Art">`;
      } else {
        document.getElementById('result').innerHTML = "❌ Error: " + JSON.stringify(data);
      }
    } catch (err) {
      document.getElementById('result').innerHTML = "⚠️ Request failed: " + err;
    }
  }
}
