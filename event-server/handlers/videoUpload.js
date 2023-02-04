const fs = require("fs");
const https = require("https");
const { spawn } = require("child_process");

const EventEmitterManagerService = require("../utils/event-service");
const VideoService = require("../utils/video-service");
const { formatCompletionTime } = require("../utils/index");

const PROGRESS_INTERVALS = new Set([25, 50, 75, 100]);

/**
 * Handles file upload and video transcription
 * @param {*} req Handles the request from the client
 * @param {*} res Handles the response to the client
 */
async function uploadAndTranscribeVideo(req, res) {
	const { videoURL, guid } = req.body;

	if (!videoURL) {
		res.status(400).json({ message: "No video URL provided!" });
		return;
	} else if (!guid) {
		res.status(400).json({ message: "No GUID provided!" });
		return;
	}

	try {
		const sseEmitter = EventEmitterManagerService.getEmitter(guid);
		const output = await VideoService.extractAudio(videoURL);

		// TODO: remove unused properties from object once we're done testing
		const audioFileObject = output.requested_downloads[0];
		const filename = audioFileObject._filename;
		const videoThumbnail = output.thumbnail;
		const audioFileSize = audioFileObject.filesize;

		audioFileObject.video = {
			id: output.id,
			title: output.fulltitle,
			original_url: videoURL,
		};

		let tempInputFilePath = "";
		let transcribedText = "";
		let completionTime = 0;
		let downloadProgress = 1;
		https.get(audioFileObject.url, (downloadResponse) => {
			tempInputFilePath = `./temp/${filename}`;

			const writer = fs.createWriteStream(tempInputFilePath);
			let totalDownloadTime = 0;
			const downloadStartTime = Date.now();
			console.log("Starting download...");
			downloadResponse.pipe(writer);

			downloadResponse
				.on("data", (chunk) => {
					downloadProgress += chunk.length;
					const progress = (downloadProgress / audioFileSize) * 100;

					sseEmitter.write(`event: ${guid}\n`);
					sseEmitter.write(
						`data: ${JSON.stringify({
							progress: progress,
						})}`
					);
					sseEmitter.write("\n\n");
					sseEmitter.flush();
					if (PROGRESS_INTERVALS.has(Math.floor(progress))) {
						console.log("Audio download progress: ", Math.round(progress));
					}
				})
				.on("end", () => {
					const downloadEndTime = Date.now();
					totalDownloadTime = downloadEndTime - downloadStartTime;
					console.log(
						`Finished downloading audio file in ${totalDownloadTime}ms`
					);

					const python = spawn("python", [
						"python/transcribe.py",
						tempInputFilePath,
					]);

					console.log("Starting transcription...");

					// transcription pipeline
					const transcriptionStartTime = Date.now();
					python.stdout
						.on("data", (chunk) => {
							sseEmitter.write(`event: ${guid}\n`);
							sseEmitter.write(`data: ${JSON.stringify({ progress: 75 })}`);
							sseEmitter.write("\n\n");
							sseEmitter.flush();
							console.log("Text", chunk.toString());

							transcribedText += chunk; // add to buffer
						})
						.on("end", () => {
							// send final progress update to client
							sseEmitter.write(`event: ${guid}\n`);
							sseEmitter.write(`data: ${JSON.stringify({ progress: 100 })}`);
							sseEmitter.write("\n\n");
							sseEmitter.flush();

							const transcriptionEndTime = Date.now();
							const totalTranscriptionTime =
								transcriptionEndTime - transcriptionStartTime;
							completionTime = totalDownloadTime + totalTranscriptionTime;

							console.log(
								`Transcription finished in ${totalTranscriptionTime}ms`
							);
						})
						.on("close", () => {
							const filenameNoExt = filename.substring(
								0,
								filename.lastIndexOf(".")
							);

							const formattedTime = formatCompletionTime(completionTime);

							res.status(200).json({
								result: "Video successfully transcribed!",
								filename: filenameNoExt,
								transcribedText: transcribedText.toString(),
								videoMetadata: audioFileObject,
								completionTime: formattedTime,
								videoThumbnail,
							});

							if (tempInputFilePath) {
								fs.unlink(tempInputFilePath, (err) => console.error(err));
							}
						})
						.on("error", (err) => {
							console.log(`TranscriptionError: ${err}`);
						});
				});
		});
	} catch (error) {
		console.error(error);
		res
			.status(500)
			.json({ message: "Encountered error while processing video!" });
	}
}

module.exports = {
	uploadAndTranscribeVideo,
};