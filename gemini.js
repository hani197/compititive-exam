require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  // Use the correct model name for 1.5 Flash
  const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });
  
  try {
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    console.log("Response:", text);
  } catch (error) {
    console.error("Error:", error.message);
    if (error.message.includes("404")) {
        console.log("Tip: Check if 'gemini-1.5-flash' is available in your region or try 'gemini-pro'.");
    }
  }
}

test();
