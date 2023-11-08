let mediaRecorder;
let audioChunks = [];
let isRecording = false;

const toggleButton = document.getElementById("toggleRecord");
const microIcon = document.getElementById("microIcon");
const resultText = document.getElementById("resultText");
// const audioPlayback = document.getElementById("audioPlayback");
let apiResponseTextArea;

const SPEECH_API_URL = 'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyBYhlS5IWvCqKDDiATXo8u6jWLzArj9kXU';

window.onload = function() {
    apiResponseTextArea = document.getElementById("apiResponse");
    audioPlayback = document.getElementById("audioPlayback");
};

toggleButton.onclick = function() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
};

function startRecording() {
    const mediaConstraints = { audio: true };
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };
        mediaRecorder.onstop = uploadAndTranscribe;
        mediaRecorder.start();
        microIcon.src = "/static/js/on-air.png";
    }).catch(error => {
        console.error("Error accessing the microphone:", error);
    });
    isRecording = true;
}

function stopRecording() {
    mediaRecorder.stop();
    microIcon.src = "/static/js/mute.png";
    isRecording = false;
}

async function uploadAndTranscribe() {
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    console.log("Audio Blob - Size:", audioBlob.size, ", Type:", audioBlob.type);
    audioPlayback.src = URL.createObjectURL(audioBlob);
    const transcription = await transcribeAudio(audioBlob);
    resultText.value = transcription;
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

async function transcribeAudio(audioBlob) {
    const audioData = await audioBlob.arrayBuffer();
    const audioBase64 = arrayBufferToBase64(audioData);

    const requestData = {
        config: {
            encoding: 'WEBM_OPUS',
            languageCode: 'ja-JP',
        },
        audio: {
            content: audioBase64
        }
    };

    console.log("Sending request data:", JSON.stringify(requestData));

    const response = await fetch(SPEECH_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    });

    const data = await response.json();
    console.log("Received response:", data);
    apiResponseTextArea.value = JSON.stringify(data, null, 2);

    return data.results ? data.results[0].alternatives[0].transcript : 'Không nhận diện được nội dung từ âm thanh.';
}
