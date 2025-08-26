let selectedStyle = null;
// We'll store a description of the style, not the image data
let selectedStyleDescription = '';

function selectStyle(img) {
  document.querySelectorAll('.styles img').forEach(el => el.classList.remove('selected'));
  img.classList.add('selected');
  selectedStyle = img.src;
  
  // Set a detailed description for the prompt based on which image was clicked
  if (img.src.includes('style1.png')) {
    selectedStyleDescription = 'in a beautiful watercolor painting style, with soft edges, vibrant blues and oranges, and a gentle, divine feel';
  } else if (img.src.includes('style2.png')) {
    selectedStyleDescription = 'in a modern, vibrant digital illustration style with smooth gradients, glowing neon-like outlines, and deep, rich colors on a black background';
  } else if (img.src.includes('style3.png')) {
    selectedStyleDescription = 'in a clean digital art style with bold, flowing lines, warm color gradients, and a strong, elegant composition on a dark background';
  }
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

  // Create a detailed prompt for gpt-image-1
  const prompt = `Create a high-quality, artistic depiction of Lord Ganesha ${selectedStyleDescription}. The name '${name}' should be beautifully and clearly integrated into the artwork itself, becoming part of the central design. The overall image should have festive colors and ornate, spiritual symbolism.`;

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1", // Correctly using your desired model
        prompt: prompt,
        size: "1024x1024",
        quality: "hd" // Requesting high quality, which gpt-image-1 excels at
        // 'image' parameter is removed to fix the error
      })
    });

    const data = await res.json();
    if (data.data && data.data[0] && data.data[0].url) {
      document.getElementById('result').innerHTML = `<img src="${data.data[0].url}" alt="Generated Art">`;
    } else {
      const errorMessage = data.error ? data.error.message : JSON.stringify(data);
      document.getElementById('result').innerHTML = `❌ Error: ${errorMessage}`;
    }
  } catch (err) {
    document.getElementById('result').innerHTML = "⚠️ Request failed: " + err;
  }
}
