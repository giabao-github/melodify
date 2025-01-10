from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from audiocraft.models import MusicGen
import os
import torchaudio

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"], 
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

save_path = "audio_output"
os.makedirs(save_path, exist_ok=True)
app.mount("/audio_output", StaticFiles(directory="audio_output"), name="audio_output")


class MusicRequest(BaseModel):
  description: str
  duration: int


@app.post("/generate")
async def generate_music(request: MusicRequest):
  try:
    model = MusicGen.get_pretrained("facebook/musicgen-small")
    model.set_generation_params(use_sampling=True, top_k=250, duration=request.duration)
    
    output = model.generate(
      descriptions=[request.description],
      progress=True,
      return_tokens=True
    )
    
    samples = output[0].squeeze()

    audio_file = os.path.join(save_path, "output.wav")
    # samples = samples.reshape(samples.shape[1], -1)
    torchaudio.save(audio_file, samples.unsqueeze(0), 32000)

    return {"audio_file": audio_file}

  except Exception as e:
    print("Error: ", e)
    raise HTTPException(status_code=500, detail=str(e)) from e
