from google.cloud import speech
from pydub import AudioSegment
import io
import os

# Cài đặt biến môi trường cho Google credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = '/home/leducdat/Deployment/googlespeach/norse-antenna-378303-152d4051d7dd.json'

# Chuyển đổi MP3 sang FLAC
audio = AudioSegment.from_wav("/home/leducdat/Deployment/googlespeach/record_out.wav")
audio.export("converted_audio.flac", format="flac")

# Khởi tạo client
client = speech.SpeechClient()

# Load file âm thanh đã chuyển đổi
with io.open("converted_audio.flac", "rb") as audio_file:
    content = audio_file.read()

audio = speech.RecognitionAudio(content=content)

config = speech.RecognitionConfig(
    encoding=speech.RecognitionConfig.AudioEncoding.FLAC,
    sample_rate_hertz=48000,  # Cần thay đổi tùy thuộc vào file âm thanh của bạn
    language_code="ja-JP"  # Mã ngôn ngữ cho tiếng Nhật
)

# Thực hiện nhận dạng giọng nói
response = client.recognize(config=config, audio=audio)

# In kết quả
for result in response.results:
    print("Transcript: {}".format(result.alternatives[0].transcript))
