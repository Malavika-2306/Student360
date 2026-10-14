
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.log("Error: GEMINI_API_KEY is missing in .env");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Say hello to Student360!"
        });

        console.log("Gemini connected successfully!");
        console.log(response.text);
    } catch (error) {
        console.error("Gemini error:", error.message);
    }
}

run();
