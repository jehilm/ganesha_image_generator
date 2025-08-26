
async function generateImage() {
  const name = document.getElementById("nameInput").value;
  if (!name) {
    alert("Please enter a name!");
    return;
  }

  const apiKey = "PtWg9sOAMXIziHJpEPeU_w"; // Your Stable Horde API key
  const prompt = `Artistic colorful illustration of Lord Ganesha with a calligraphy style name integrated beautifully into the design. Bright vibrant gradients, spiritual, elegant, modern. The name is: ${name}`;

  const requestBody = {
    prompt: prompt,
    params: {
      sampler_name: "k_euler",
      width: 512,
      height: 768,
      steps: 30
    }
  };

  const response = await fetch("https://stablehorde.net/api/v2/generate/async", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": apiKey
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();
  const jobId = data.id;

  // Poll until result is ready
  let result;
  while (true) {
    const check = await fetch(`https://stablehorde.net/api/v2/generate/status/${jobId}`);
    const status = await check.json();
    if (status.done) {
      result = status.generations[0].img;
      break;
    }
    await new Promise(r => setTimeout(r, 5000));
  }

  document.getElementById("outputImage").src = result;
}
