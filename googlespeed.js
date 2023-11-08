const speech = require('@google-cloud/speech');
const recorder = require('node-record-lpcm16');

const client = new speech.SpeechClient({
   keyFilename: '/Users/leducdat/Development/googlespeed/norse-antenna-378303-152d4051d7dd.json'
});

const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'ja-JP';

const request = {
   config: {
       encoding: encoding,
       sampleRateHertz: sampleRateHertz,
       languageCode: languageCode,
   },
   interimResults: true, // Để nhận kết quả tạm thời
};

const recognizeStream = client
   .streamingRecognize(request)
   .on('error', console.error)
   .on('data', data => {
       console.log(
           `Transcription: ${data.results[0].alternatives[0].transcript}`
       );
   });

recorder
   .record({
       sampleRateHertz: sampleRateHertz,
       threshold: 0, 
       verbose: false,
       recordProgram: 'rec', 
       silence: '10.0',
   })
   .stream()
   .on('error', console.error)
   .pipe(recognizeStream);
