const speech = require('@google-cloud/speech');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const client = new speech.SpeechClient({
   keyFilename: '/Users/leducdat/Development/googlespeed/norse-antenna-378303-152d4051d7dd.json'
});

const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'ja-JP';
app.use(bodyParser.json());
app.use(express.static('public')); 
app.use(bodyParser.raw({ type: 'audio/wav', limit: '10mb' }));
app.post('/transcribe', async (req, res) => {
    const audio = req.body;

    const request = {
        audio: {
            content: audio.toString('base64')
        },
        config: {
            encoding: encoding,
            sampleRateHertz: sampleRateHertz,
            languageCode: languageCode,
        },
    };
    try {
        const [response] = await client.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        res.json({ transcription });
    } catch (error) {
        console.error("Error transcribing audio:", error);
        res.status(500).send("Error transcribing audio.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

