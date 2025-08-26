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
      // Update this fetch call to your Vercel API endpoint
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1", // It's better to use a more modern model
          prompt: prompt,
          size: "1024x1024",
          // The image parameter is not supported in the way you are using it.
          // Instead, we will pass the base64 data and handle it on the backend.
          image: base64data
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
