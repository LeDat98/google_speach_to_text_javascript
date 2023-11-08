let mediaRecorder;
let audioChunks = [];

async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };
    mediaRecorder.onstop = sendAudioToServer;
    mediaRecorder.start();
}

function stopRecording() {
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
}

function sendAudioToServer() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append("audio", audioBlob);

    fetch("/transcribe", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("transcription").innerText = data.transcription;
    })
    .catch(error => {
        console.error("There was an error transcribing the audio:", error);
    });
}
