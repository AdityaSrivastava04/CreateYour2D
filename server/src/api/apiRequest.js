import fs from 'fs';
import { GoogleGenAI } from "@google/genai";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});

async function generateManimCodeREST(userPrompt, errorContext = null, attempt = 1) {
  let systemPrompt = `You are a Manim (Mathematical Animation Engine) expert. Generate Python code using the Manim library based on the user's description.

IMPORTANT REQUIREMENTS:
1. The class name MUST be exactly "video" (lowercase)
2. Use "from manim import *" for imports
3. The class must inherit from Scene
4. Include the construct method with the animation logic
5. Only output valid Python code, no explanations or markdown
6. Do not include any text before or after the code
7. Do not wrap code in markdown code blocks
8. Use Manim Community v0.19.0 syntax
9. For Code objects, use file_name parameter instead of code parameter
10. Avoid deprecated syntax and parameters
11. Use Text() or MathTex() for displaying code snippets, not Code() class

`;

  if (errorContext) {
    systemPrompt += `
⚠️ PREVIOUS ATTEMPT FAILED WITH ERROR:
${errorContext}

Please analyze the error and generate CORRECTED code. Common fixes:
- Replace Code(code="...") with Text("...") or MathTex("...")
- Use proper Manim v0.19.0 syntax
- Avoid deprecated methods and parameters
- Check class inheritance and method signatures

`;
  }

  systemPrompt += `User's request: ${userPrompt}

Generate only the ${errorContext ? 'CORRECTED' : ''} Python code:`;

  try {
    console.log(`\nGenerating code (Attempt ${attempt})...`);
    
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });

    let code = response.candidates[0].content.parts[0].text;
    
    code = code.replace(/```python\n?/g, '').replace(/```\n?/g, '').trim();
    code = code.replace(/class\s+\w+\s*\(/g, 'class video(');

    const videoDir = path.join(__dirname, '..', 'video');
    if (!fs.existsSync(videoDir)) {
      fs.mkdirSync(videoDir, { recursive: true });
    }

    const filePath = path.join(videoDir, 'video.py');
    fs.writeFileSync(filePath, code, 'utf8');

    console.log(`Code generated and saved (Attempt ${attempt})`);

    return {
      filePath,
      attempt,
      code
    };
  } catch (error) {
    console.error('Error generating Manim code:', error);
    throw error;
  }
}

export { generateManimCodeREST };