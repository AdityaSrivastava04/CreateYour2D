import fs from 'fs'; 
import path from 'path';
import { generateManimCodeREST } from "../api/apiRequest.js";
import { ApiError } from "../utils/apiErrorResponse.js";
import { ApiResponse } from "../utils/apiSendResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { executeManimCode } from "../utils/executeManimCode.js";

const generateVideoControllerBase64 = asyncHandler(async (req, res) => {
  const { userPrompt } = req.body;

  if (!userPrompt) {
    throw new ApiError(400, "User Prompt is required", []); 
  }

  const maxAttempts = 3;
  let lastError = null;
  let videoPath = null;
  let successfulAttempt = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`\n=== Attempt ${attempt}/${maxAttempts} ===`);
      
      const { filePath, code } = await generateManimCodeREST(
        userPrompt, 
        lastError, 
        attempt
      );
      
      console.log(`Generated code saved to: ${filePath}`);
      
      const result = await executeManimCode(filePath);
      
      if (result.success) {
        console.log(`\n✓ Video generated successfully on attempt ${attempt}!`);
        videoPath = result.videoPath;
        successfulAttempt = attempt;
        break; 
      }
      
      lastError = result.error;
      console.log(`\n✗ Attempt ${attempt} failed with error: ${lastError}`);
      
      if (attempt < maxAttempts) {
        console.log(`Retrying with error feedback...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`Error in attempt ${attempt}:`, error.message);
      lastError = error.message;
      
      if (attempt === maxAttempts) {
        throw new ApiError(
          500, 
          `Failed to generate video after ${maxAttempts} attempts. Last error: ${lastError}`,
          []
        );
      }
    }
  }

  if (!videoPath) {
    throw new ApiError(
      500, 
      `Failed to generate video after ${maxAttempts} attempts. Last error: ${lastError}`,
      []
    );
  }

  console.log(`\n=== Processing Video File ===`);
  console.log(`Video path: ${videoPath}`);

  if (!fs.existsSync(videoPath)) {
    console.error(`❌ File does not exist: ${videoPath}`);
    throw new ApiError(500, `Video file not found: ${videoPath}`, []);
  }

  const stats = fs.statSync(videoPath);
  console.log(`File size: ${stats.size} bytes (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);

  if (stats.size === 0) {
    console.error('❌ File is empty (0 bytes)');
    throw new ApiError(500, "Generated video file is empty", []);
  }

  console.log('Reading file...');
  let videoBuffer;
  
  try {
    videoBuffer = fs.readFileSync(videoPath);
    console.log(`✓ Buffer read successfully: ${videoBuffer.length} bytes`);
  } catch (readError) {
    console.error('❌ Error reading file:', readError);
    throw new ApiError(500, `Failed to read video file: ${readError.message}`, []);
  }

  if (!videoBuffer || videoBuffer.length === 0) {
    console.error('❌ Buffer is empty after reading');
    throw new ApiError(500, "Video buffer is empty after reading file", []);
  }

  console.log('Converting to base64...');
  let base64Video;
  
  try {
    base64Video = videoBuffer.toString('base64');
    console.log(`✓ Base64 conversion successful`);
    console.log(`  Base64 length: ${base64Video.length} characters`);
    console.log(`  First 50 chars: ${base64Video.substring(0, 50)}...`);
    console.log(`  Last 50 chars: ...${base64Video.substring(base64Video.length - 50)}`);
  } catch (base64Error) {
    console.error('❌ Error converting to base64:', base64Error);
    throw new ApiError(500, `Failed to convert video to base64: ${base64Error.message}`, []);
  }

  if (!base64Video || base64Video.length === 0) {
    console.error('❌ Base64 string is empty');
    throw new ApiError(500, "Base64 conversion resulted in empty string", []);
  }

  const dataUri = `data:video/mp4;base64,${base64Video}`;
  console.log(`✓ Data URI created`);
  console.log(`  Total URI length: ${dataUri.length} characters`);
  console.log(`  Estimated size: ${(dataUri.length / 1024 / 1024).toFixed(2)} MB`);

  console.log(`\n✓ Video processing complete!\n`);

  return res.status(200).json(new ApiResponse(
    200,
    {
      video: dataUri,
      attempts: successfulAttempt,
      message: successfulAttempt > 1 
        ? `Video generated successfully after ${successfulAttempt} attempts` 
        : 'Video generated successfully',
      fileSize: stats.size,
      base64Length: base64Video.length
    },
    'Video generated successfully' 
  ));
});

const testVideoRead = asyncHandler(async (req, res) => {
  const testPath = 'E:\\CreateYour2D\\frontend\\server\\src\\video\\media\\videos\\video\\480p15\\video.mp4';
  
  console.log(`Testing video read from: ${testPath}`);
  
  if (!fs.existsSync(testPath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  const stats = fs.statSync(testPath);
  console.log(`File size: ${stats.size} bytes`);
  
  const buffer = fs.readFileSync(testPath);
  console.log(`Buffer size: ${buffer.length} bytes`);
  
  const base64 = buffer.toString('base64');
  console.log(`Base64 length: ${base64.length}`);
  console.log(`First 100 chars: ${base64.substring(0, 100)}`);
  
  return res.json({
    video: `data:video/mp4;base64,${base64}`,
    fileSize: stats.size,
    bufferSize: buffer.length,
    base64Length: base64.length
  });
});

export { generateVideoControllerBase64, testVideoRead };