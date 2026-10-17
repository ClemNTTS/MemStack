"""Render the French narration locally with Kokoro ONNX, without an API.

See docs/video/README.md for model sources and attribution.
Models and optional Python packages stay in the ignored project cache.
"""

import json
import os
from pathlib import Path
import sys
import textwrap

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / '.npm-cache/enterprise-film'
sys.path.insert(0, str(WORK / 'voice-deps'))
os.environ.setdefault('HF_HOME', str(WORK / 'hf-cache'))

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from misaki.espeak import EspeakG2P


def main():
  segments = json.loads((ROOT / 'docs/video/ENTERPRISE_FILM_NARRATION.json').read_text(encoding='utf-8'))
  kokoro = Kokoro(str(WORK / 'voice-model/kokoro-v1.0.onnx'), str(WORK / 'voice-model/voices-v1.0.bin'))
  g2p = EspeakG2P(language='fr-fr')
  rate = 24000
  # This official ONNX export declares speed as float32. The Python wrapper's
  # newer-export branch casts it to int32, so use the declared model contract.
  def synthesize(phonemes, speed):
    tokens = kokoro.tokenizer.tokenize(phonemes)
    if len(tokens) > 510:
      raise RuntimeError('Narration phrase exceeds the model context.')
    style = kokoro.get_voice_style('ff_siwis')[len(tokens)]
    samples = kokoro.sess.run(None, {
      'input_ids': np.array([[0, *tokens, 0]], dtype=np.int64),
      'style': np.asarray(style, dtype=np.float32),
      'speed': np.array([speed], dtype=np.float32),
    })[0].reshape(-1).copy()
    audible = np.flatnonzero(np.abs(samples) > .0001)
    if not len(audible):
      raise RuntimeError('Empty voice segment.')
    return samples[max(0, audible[0] - 600):min(len(samples), audible[-1] + 1200)], rate

  narration = np.zeros(rate * 48, dtype=np.float32)
  measurements = []
  for index, segment in enumerate(segments):
    text = segment['text'].replace('Memstack', 'Mèm stack').replace('l’IA', 'l’intelligence artificielle')
    phonemes = g2p(text)
    speed = 1.0
    samples, sample_rate = synthesize(phonemes, speed)
    start = segment['start'] + .2
    latest_end = min(segment['end'] - .3, 46.5)
    maximum = latest_end - start
    for _ in range(3):
      if len(samples) / sample_rate <= maximum:
        break
      speed = min(1.25, (len(samples) / sample_rate) / maximum * 1.01)
      if _:
        speed = min(1.25, speed * 1.03)
      samples, sample_rate = synthesize(phonemes, speed)
    if sample_rate != rate or len(samples) / rate > maximum + .02:
      raise RuntimeError(f'Segment {index + 1} exceeds its scene; shorten the text instead of truncating speech.')
    # Very short fades avoid clicks while preserving consonants.
    ramp = min(round(.008 * rate), len(samples) // 2)
    samples[:ramp] *= np.linspace(0, 1, ramp)
    samples[-ramp:] *= np.linspace(1, 0, ramp)
    offset = round(start * rate)
    narration[offset:offset + len(samples)] += samples
    sf.write(WORK / f'narration-{index + 1}.wav', samples, rate)
    actual_end = start + len(samples) / rate
    measurements.append({ 'scene': index + 1, 'start': start, 'end': actual_end, 'speed': speed, 'text': segment['text'] })
    print(f'Scene {index + 1}: {len(samples) / rate:.2f}s, speed {speed:.3f}', flush=True)
  peak = np.max(np.abs(narration))
  if peak > 0:
    narration *= .72 / peak
  sf.write(WORK / 'narration.wav', narration, rate)
  (WORK / 'narration-timings.json').write_text(json.dumps(measurements, ensure_ascii=False, indent=2), encoding='utf-8')
  def timestamp(seconds):
    milliseconds = round(seconds * 1000)
    return f'{milliseconds // 3600000:02}:{milliseconds // 60000 % 60:02}:{milliseconds // 1000 % 60:02}.{milliseconds % 1000:03}'
  cues = ['WEBVTT\n']
  for item in measurements:
    cues.append(f"{timestamp(item['start'])} --> {timestamp(item['end'])}\n" + '\n'.join(textwrap.wrap(item['text'], width=46, break_long_words=False)))
  (ROOT / 'public/enterprise/video/memstack-entreprise.fr.vtt').write_text('\n\n'.join(cues) + '\n', encoding='utf-8')
  print('French neural narration ready: 48s aligned timeline', flush=True)


if __name__ == '__main__':
  main()
