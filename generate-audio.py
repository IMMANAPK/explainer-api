import asyncio
import edge_tts
import json
import sys
import os
import cloudinary
import cloudinary.uploader

# Cloudinary config
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET")
)

async def generate(text, voice):
    # Generate audio
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save("/tmp/voiceover.mp3")

    # Get duration
    import mutagen.mp3
    audio = mutagen.mp3.MP3("/tmp/voiceover.mp3")
    duration = audio.info.length

    # Upload to Cloudinary
    result = cloudinary.uploader.upload(
        "/tmp/voiceover.mp3",
        resource_type="video",
        folder="explainer-audio",
        overwrite=True,
        public_id="voiceover_" + voice.replace("-", "_")
    )

    audio_url = result["secure_url"]

    # Calculate word timestamps
    words = text.split()
    punctuation = [".", ",", "!", "?", ";", ":"]
    weights = [1.5 if any(p in w for p in punctuation) else 1.0 for w in words]
    total_weight = sum(weights)
    time_per_unit = duration / total_weight

    word_timings = []
    current_time = 0
    for word, weight in zip(words, weights):
        word_duration = time_per_unit * weight
        word_timings.append({
            "word": word,
            "start": round(current_time, 3),
            "end": round(current_time + word_duration, 3)
        })
        current_time += word_duration

    output = {
        "duration": duration,
        "audioUrl": audio_url,
        "words": word_timings
    }

    print(json.dumps(output))

# Read args
text = sys.argv[1]
voice = sys.argv[2]

asyncio.run(generate(text, voice))