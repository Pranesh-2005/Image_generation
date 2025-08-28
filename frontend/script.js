import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const promptInput = document.getElementById("prompt-input");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const statusText = document.getElementById("status");
const resultImage = document.getElementById("result-image");
const imageContainer = document.getElementById("image-container");

let client;
let clientReady = false;
let currentImageUrl = "";

// Negative prompt for better human/living being quality
const NEGATIVE_PROMPT = "don't generate deformed, blurry, extra limbs, extra fingers, missing fingers, bad hands, bad eyes, mutated hands, mutated face, poorly drawn face, poorly drawn hands, disfigured, low quality, bad anatomy, wrong anatomy, ugly, distorted, watermark, text";

// Connect once
(async () => {
  try {
    client = await Client.connect("PraneshJs/ImageGeneration");
    clientReady = true;
    generateBtn.disabled = false;
  } catch (error) {
    statusText.textContent = "❌ Failed to connect to AI service.";
    generateBtn.disabled = true;
    console.error(error);
  }
})();

generateBtn.disabled = true; // Disable until client is ready

generateBtn.addEventListener("click", async () => {
  if (!clientReady) {
    statusText.textContent = "⏳ Connecting to AI service. Please wait...";
    return;
  }

  const userPrompt = promptInput.value.trim();
  if (!userPrompt) {
    statusText.textContent = "⚠️ Please enter a prompt!";
    return;
  }

  // Append negative prompt
  const prompt = `${userPrompt}\nNegative prompt: ${NEGATIVE_PROMPT}`;

  statusText.textContent = "⏳ Generating image...";
  generateBtn.disabled = true;
  resultImage.style.display = "none";
  imageContainer.style.display = "none";
  downloadBtn.style.display = "none";

  try {
    const result = await client.predict("/predict", { 
      prompt: prompt
    });

    // result.data is an array: [image_object]
    let imageObj = result.data[0];
    let imageUrl = "";

    if (typeof imageObj === "object" && imageObj !== null) {
      imageUrl = imageObj.url || imageObj.path || imageObj.src || "";
    } else if (typeof imageObj === "string") {
      imageUrl = imageObj;
    }

    if (typeof imageUrl === "string" && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://"))) {
      resultImage.src = imageUrl;
      resultImage.style.display = "block";
      imageContainer.style.display = "block";
      downloadBtn.style.display = "inline-block";
      currentImageUrl = imageUrl;
      statusText.textContent = "✅ Image generated!";
    } else if (typeof imageUrl === "string" && imageUrl.toLowerCase().includes("error")) {
      statusText.textContent = "❌ Backend error: Could not generate image. Please try again later.";
      imageContainer.style.display = "none";
      downloadBtn.style.display = "none";
      currentImageUrl = "";
    } else {
      statusText.textContent = "❌ Failed to get a valid image URL.";
      imageContainer.style.display = "none";
      downloadBtn.style.display = "none";
      currentImageUrl = "";
    }
  } catch (err) {
    console.error(err);
    statusText.textContent = "❌ Error generating image. Please try again.";
    imageContainer.style.display = "none";
    downloadBtn.style.display = "none";
    currentImageUrl = "";
  } finally {
    generateBtn.disabled = false;
  }
});

downloadBtn.addEventListener("click", async () => {
  if (!currentImageUrl) return;
  try {
    const response = await fetch(currentImageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "generated-image.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    statusText.textContent = "❌ Failed to download image.";
    console.error(err);
  }
});