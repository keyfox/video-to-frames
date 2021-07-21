const { createFFmpeg, fetchFile } = FFmpeg;
document.addEventListener("DOMContentLoaded", async () => {
  const logsDisplay = document.getElementById("logsDisplay");
  const progressDisplay = document.getElementById("progressDisplay");

  function logger({ type, message, overwrite }) {
    if (type === "info") {
      // don't care
      return;
    }
    const { childNodes } = logsDisplay;
    let dst;
    if (overwrite && childNodes.length >= 1) {
      dst = logsDisplay.lastChild;
    } else {
      if (childNodes.length === 40) {
        dst = logsDisplay.removeChild(logsDisplay.firstChild);
      } else {
        dst = document.createElement("div");
      }
    }
    dst.innerText = message;
    dst.className = type;
    if (!overwrite) {
      logsDisplay.appendChild(dst);
    }
  }

  function keyfoxLog(message, overwrite) {
    logger({ type: "keyfox", message, overwrite });
  }

  keyfoxLog("Initializing...");

  const ffmpeg = createFFmpeg({
    log: true,
    logger,
    progress: ({ ratio }) => {
      progressDisplay.value = ratio;
    },
  });

  keyfoxLog("Loading ffmpeg...");
  await ffmpeg.load();
  keyfoxLog("ffmpeg Ready");

  keyfoxLog("Select source file, configure, and hit [Do it] to start.");

  document.getElementById("doItButton").addEventListener("click", async () => {
    const file = document.getElementById("sourceFileInput").files[0];
    if (!file) {
      alert("File not selected.");
      return;
    }

    document.getElementById("console").disabled = true;

    const fpsConf = [];
    const fpsInput = document.getElementById("fpsInput").value;
    if (fpsInput !== 0) {
      fpsConf.push("-r", fpsInput);
    }

    keyfoxLog("Reading source...");
    const src = await new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = function () {
        resolve(new Uint8Array(fileReader.result));
      };
      fileReader.readAsArrayBuffer(file);
    });
    ffmpeg.FS("writeFile", file.name, src);

    ffmpeg.FS("mkdir", "/frames");
    keyfoxLog("Extracting frames from the video...");
    await ffmpeg.run("-i", file.name, ...fpsConf, "/frames/%08d.png");

    ffmpeg.FS("unlink", file.name);

    const frameFiles = ffmpeg
      .FS("readdir", "/frames")
      .filter((e) => e.endsWith(".png"));
    keyfoxLog(`Packing ${frameFiles.length} frame(s) into ZIP...`);
    const zip = new JSZip();
    const dstDir = zip.folder("frames_" + file.name);
    frameFiles.forEach((e, i, arr) => {
      const fullPath = "/frames/" + e;
      dstDir.file(e, ffmpeg.FS("readFile", fullPath));
      ffmpeg.FS("unlink", fullPath);
    });

    // zip を生成
    zip
      .generateAsync(
        { type: "blob", compression: "STORE" },
        ({ percent, currentFile }) => {
          keyfoxLog(
            `Generating a zip, hold on... (${percent.toFixed(2)}%)`,
            true
          );
        }
      )
      .then((blob) => {
        // ダウンロードリンクを 生成
        let dlLink = document.createElement("a");

        // blob から URL を生成
        const dataUrl = URL.createObjectURL(blob);
        dlLink.href = dataUrl;
        dlLink.download = `frames_${file.name}.zip`;

        // 設置/クリック/削除
        document.body.insertAdjacentElement("beforeEnd", dlLink);
        dlLink.click();
        dlLink.remove();

        keyfoxLog("Download will start soon.");
        keyfoxLog("To process another video, please reload this page.");
      });
  });
});
