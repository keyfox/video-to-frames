# Video To Frames

Browser-based video frames extractor.

**DISCLAIMER:**
This tool is created just for my personal use.
Feel free to use (with caution).

## Usage

1. Go to [the main page](https://keyfox.github.io/video-to-frames/).
1. Select the video file.
1. Set the FPS, how many frames should be extracted in a second, between 0 and 60.
   (0 indicates to use the video's original FPS)
3. Hit [Do it] button and hold on. The frames will be packed into a zip archive.
4. Your browser will start downloading the zip file (If it doesn't, disable pop-up blocker).

## Acknowledgement

- [FFMPEG.WASM](https://ffmpegwasm.github.io/) (MIT License)
  - It lets me convert the video file on browser!
- [JSZip](https://stuk.github.io/jszip/) (MIT License or GPLv3)
  - It lets me pack many files into an archive!

## License

MIT
