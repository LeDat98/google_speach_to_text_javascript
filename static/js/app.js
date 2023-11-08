let mediaRecorder;
let audioChunks = [];

const startButton = document.getElementById("startRecord");
const stopButton = document.getElementById("stopRecord");
const resultText = document.getElementById("resultText");
let apiResponseTextArea;

window.onload = function() {
    apiResponseTextArea = document.getElementById("apiResponse");
};

const SPEECH_API_URL = 'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyBYhlS5IWvCqKDDiATXo8u6jWLzArj9kXU';

function arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

startButton.onclick = function() {
    const mediaConstraints = { audio: true };

    navigator.mediaDevices.getUserMedia(mediaConstraints).then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            
            // Log size and type of the audioBlob
            console.log("Audio Blob - Size:", audioBlob.size, ", Type:", audioBlob.type);
            
            // Provide the audio for playback
            document.getElementById("audioPlayback").src = URL.createObjectURL(audioBlob);

            const transcription = await transcribeAudio(audioBlob);
            resultText.value = transcription;
        };

        mediaRecorder.start();
        startButton.disabled = true;
        stopButton.disabled = false;
    }).catch(error => {
        console.error("Error accessing the microphone:", error);
    });
};


stopButton.onclick = function() {
    mediaRecorder.stop();
    startButton.disabled = false;
    stopButton.disabled = true;
};

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

    // Log the requestData before sending it
    console.log("Sending request data:", JSON.stringify(requestData));

    const response = await fetch(SPEECH_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    });

    const data = await response.json();

    // Log the full response from the API
    console.log("Received response:", data);
    // Update the textarea with the API response
    apiResponseTextArea.value = JSON.stringify(data, null, 2);

    return data.results ? data.results[0].alternatives[0].transcript : 'Không nhận diện được nội dung từ âm thanh.';

}
