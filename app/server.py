from flask import Flask, request, jsonify
from flask_cors import CORS
from bark.bark.api import generate_audio
from transformers import pipeline
from scipy.io.wavfile import write
import os
import numpy as np
import logging

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

def generate_lyrics(prompt):
  # Initialize text generation pipeline with GPT-NEO model
  generator = pipeline('text-generation', model='EleutherAI/gpt-neo-1.3B')
  # Generate lyrics based on the prompt
  response = generator(prompt, max_length=50, temperature=0.7, do_sample=True)
  # Extract generated text from response
  output = response[0]['generated_text'].replace("\n", " ")
  formatted_lyrics = f"♪ {output} ♪"
  return formatted_lyrics

# Music generation function
@app.route('/api/generate-music', methods=['POST'])
def generate_music():
  data = request.get_json()
  description = data.get('description', '')
  duration = data.get('duration', 10)
  lyrics = generate_lyrics(description)
  
  if not lyrics.strip():
    logging.warning("Received an empty lyrics.")
    return jsonify({
      'success': False,
      'message': 'Lyrics cannot be empty.'
    })

  try:
    # Generate audio
    logging.info(f"Lyrics generated: {description}")
    logging.info(f"Generating audio for description: '{description}' with duration {duration} seconds.")
    # audio_array = generate_audio(text=lyrics, text_temp=0.7, waveform_temp=0.7)
    audio_array = pipeline('text-to-audio', model='suno/bark-small')
    # Trim/pad audio to match duration
    sample_rate = 24000
    desired_samples = int(sample_rate * duration)
    if len(audio_array) > desired_samples:
      audio_array = audio_array[:desired_samples]
    elif len(audio_array) < desired_samples:
      padding = np.zeros(desired_samples - len(audio_array))
      audio_array = np.concatenate([audio_array, padding])

    # Save the audio in the static directory
    output_path = os.path.join('static', f'{description}.wav')
    os.makedirs('static', exist_ok=True) 
    write(output_path, sample_rate, audio_array)

    # Log the successful audio generation
    logging.info(f"Audio successfully generated and saved to {output_path}")

    # Return the URL for the generated audio
    return jsonify({
      'success': True,
      'file_url': f'http://localhost:5000/{output_path}',
      'message': 'Music generated successfully.'
    })
  
  except Exception as e:
    logging.error(f"Error during music generation: {e}")
    return jsonify({
      'success': False,
      'message': f"An error occurred: {str(e)}"
    }), 500


if __name__ == '__main__':
  # Create static directory if it doesn't exist
  os.makedirs('static', exist_ok=True)
  app.run(debug=True)
#define libraries
# from fastapi import FastAPI, Form
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from transformers import pipeline
# import replicate


# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Function to generate lyrics using Hugging Face's GPT-NEO model
# def generate_lyrics(prompt):
#     # Initialize text generation pipeline with GPT-NEO model
#     generator = pipeline('text-generation', model='EleutherAI/gpt-neo-1.3B')
#     # Generate lyrics based on the prompt
#     response = generator(prompt, max_length=50, temperature=0.7, do_sample=True)
#     # Extract generated text from response
#     output = response[0]['generated_text'].replace("\n", " ")
#     formatted_lyrics = f"♪ {output} ♪"
#     return formatted_lyrics

# @app.post("/generate-music")
# async def generate_music(prompt: str = Form(...), duration: int = Form(...)):
#   lyrics = generate_lyrics(prompt)
#   print(lyrics)
#   output = replicate.run(
#       "suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787",
#       input={
#           "prompt": lyrics,
#           "text_temp": 0.7,
#           "output_full": False,
#           "waveform_temp": 0.7,
#           "duration": duration,
#       }
#   )
#   print(output)
#   music_url = output['audio_out']
  
#   print(music_url)
#   return JSONResponse(content={"url": music_url})

# if __name__ == "__main__":
#   import uvicorn
#   uvicorn.run(app, host="127.0.0.1", port=8000)
