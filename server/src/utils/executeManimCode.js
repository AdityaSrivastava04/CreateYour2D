import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = promisify(exec);

async function executeManimCode(filePath) {
  const videoDir = path.dirname(filePath);
  const mediaDir = path.join(videoDir, 'media');

  if (fs.existsSync(mediaDir)) {
    fs.rmSync(mediaDir, { recursive: true, force: true });
    console.log('Cleaned up existing media directory');
  }

  console.log('Executing Manim code...');
  console.log('File path:', filePath);
  console.log('Media directory:', mediaDir);

  try {
    const { stdout, stderr } = await execPromise(
      `manim -ql "${filePath}" video --media_dir "${mediaDir}"`,
      { 
        cwd: videoDir,
        maxBuffer: 1024 * 1024 * 10
      }
    );

    console.log('Manim output:', stdout);
    if (stderr) console.error('Manim stderr:', stderr);

    const videoOutputDir = path.join(mediaDir, 'videos', 'video', '480p15');
    
    console.log('\n=== Searching for generated video ===');
    console.log('Looking in directory:', videoOutputDir);
    
    if (!fs.existsSync(videoOutputDir)) {
      throw new Error(`Video output directory not found: ${videoOutputDir}`);
    }

    const files = fs.readdirSync(videoOutputDir);
    console.log('All files in directory:', files);
    
    const mp4Files = files.filter(f => f.endsWith('.mp4'));
    console.log('MP4 files found:', mp4Files);

    if (mp4Files.length === 0) {
      throw new Error('No MP4 files generated. Files found: ' + files.join(', '));
    }

    const filesWithStats = mp4Files.map(f => {
      const fullPath = path.join(videoOutputDir, f);
      const stats = fs.statSync(fullPath);
      return {
        name: f,
        path: fullPath,
        size: stats.size,
        mtime: stats.mtime
      };
    });

    filesWithStats.sort((a, b) => {
      if (b.size !== a.size) return b.size - a.size;
      return b.mtime - a.mtime;
    });

    console.log('\nMP4 files with details:');
    filesWithStats.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.name}`);
      console.log(`     Size: ${(f.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`     Modified: ${f.mtime.toISOString()}`);
    });

    const selectedVideo = filesWithStats[0];
    console.log(`\n✓ Selected video: ${selectedVideo.name}`);
    console.log(`  Path: ${selectedVideo.path}`);
    console.log(`  Size: ${(selectedVideo.size / 1024 / 1024).toFixed(2)} MB`);

    return {
      success: true,
      videoPath: selectedVideo.path,
      videoFile: selectedVideo.name,
      videoSize: selectedVideo.size,
      stdout: stdout,
      stderr: stderr
    };

  } catch (error) {
    let errorMessage = error.message;
    
    if (error.stderr) {
      const traceback = error.stderr;
      const errorMatch = traceback.match(/(TypeError|AttributeError|NameError|ValueError|ImportError):[^\n]+/);
      if (errorMatch) {
        errorMessage = errorMatch[0];
      }
    }

    console.error('Manim execution error:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      fullError: error.stderr || error.message,
      stdout: error.stdout || ''
    };
  }
}

export { executeManimCode };