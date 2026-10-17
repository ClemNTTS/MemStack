"""Synthesize an original 120 BPM instrumental. Requires Python and NumPy.

No samples, recordings, external models or provider calls are used.
Usage: python scripts/enterprise-film/soundtrack.py OUTPUT.wav
"""

import math
from pathlib import Path
import sys
import wave

import numpy as np


RATE = 48000
DURATION = 48
audio = np.zeros((RATE * DURATION, 2), dtype=np.float64)


def frequency(midi):
  return 440 * 2 ** ((midi - 69) / 12)


def place(signal, start, gain=1, pan=0):
  offset = round(start * RATE)
  length = min(len(signal), len(audio) - offset)
  if offset < 0 or length <= 0:
    return
  angle = (pan + 1) * math.pi / 4
  audio[offset:offset + length, 0] += signal[:length] * gain * math.cos(angle)
  audio[offset:offset + length, 1] += signal[:length] * gain * math.sin(angle)


def pad(midi, length, phase):
  time = np.arange(round(RATE * length)) / RATE
  base = frequency(midi)
  envelope = np.minimum(time / 1.4, 1) * np.minimum((length - time) / 2.0, 1)
  tone = np.sin(2 * np.pi * base * time + phase)
  tone += .24 * np.sin(2 * np.pi * base * 2.001 * time + phase)
  tone += .12 * np.sin(2 * np.pi * base * .999 * time + .7)
  return tone * envelope * (.92 + .08 * np.sin(2 * np.pi * .12 * time))


def bell(midi, length=2.4):
  time = np.arange(round(RATE * length)) / RATE
  base = frequency(midi)
  envelope = (1 - np.exp(-time * 85)) * np.exp(-time * 2.2)
  return (np.sin(2 * np.pi * base * time) + .18 * np.sin(2 * np.pi * base * 2 * time) * np.exp(-time * 3)) * envelope


def bass(midi):
  time = np.arange(round(RATE * .38)) / RATE
  base = frequency(midi)
  envelope = (1 - np.exp(-time * 150)) * np.exp(-time * 8)
  return (np.sin(2 * np.pi * base * time) + .28 * np.sin(4 * np.pi * base * time)) * envelope


def kick():
  time = np.arange(round(RATE * .32)) / RATE
  phase = 2 * np.pi * (48 * time + 60 * .025 * (1 - np.exp(-time / .025)))
  return np.sin(phase) * np.exp(-time * 19) * (1 - np.exp(-time * 800))


rng = np.random.default_rng(20261017)


def percussion(length, decay, bright=False):
  time = np.arange(round(RATE * length)) / RATE
  noise = rng.normal(0, .45, len(time))
  noise = noise - np.convolve(noise, np.ones(15) / 15, mode='same')
  if bright:
    noise = np.diff(noise, prepend=0) * .5
  return noise * (1 - np.exp(-time * 1800)) * np.exp(-time * decay)


# Bright, open chords; a new arpeggio, pulsing bass and a light pop rhythm.
# There are no sampled instruments or borrowed melodies.
chords = [(36, 60, 64, 67), (43, 59, 62, 67), (45, 60, 64, 69), (41, 57, 60, 65)]
beat = 60 / 120
for index, start in enumerate(np.arange(0, DURATION, 8 * beat)):
  chord = chords[index % len(chords)]
  for voice, note in enumerate(chord):
    if voice:
      place(pad(note, 8 * beat + .8, voice * .61), start, .043, (voice - 1.5) / 3)
  for tick in range(8):
    at = start + tick * beat
    # Keep the practice section lighter, then lift back into the collective.
    energy = .72 if 23 <= at < 31 else 1
    place(kick(), at, .23 * energy)
    place(bass(chord[0] + (12 if tick % 4 == 3 else 0)), at + .02, .145 * energy)
    if tick % 2:
      place(percussion(.15, 28), at, .12 * energy, .1)
      place(bell(chord[2], .5), at, .035, -.2)
    for half in range(2):
      place(percussion(.075, 65, True), at + half * beat / 2, .045 * energy, -.4 if half else .4)
  for tick, voice in enumerate([1, 3, 2, 3, 1, 2, 3, 2]):
    at = start + (.5 + tick) * beat
    place(bell(chord[voice] + 12, 1.2), at, .105, -.3 if tick % 2 == 0 else .3)
    place(bell(chord[voice] + 12, 1.2), at + .1875, .017, .5 if tick % 2 == 0 else -.5)

# Short accents follow the visual scene changes without overpowering the text.
for index, at in enumerate([0, 5, 11, 17, 23, 31, 39, 43]):
  place(bell([72, 76, 79, 74][index % 4], 3), at, .055)

time = np.arange(len(audio)) / RATE
fade = np.minimum(time / .35, 1) * np.minimum((DURATION - time) / 1.7, 1)
audio *= fade[:, None]
audio = np.tanh(audio * 1.4)
peak = float(np.abs(audio).max())
audio *= .42 / max(peak, .42)
output = Path(sys.argv[1] if len(sys.argv) > 1 else '.npm-cache/enterprise-film/soundtrack.wav')
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), 'wb') as handle:
  handle.setnchannels(2)
  handle.setsampwidth(2)
  handle.setframerate(RATE)
  handle.writeframes((audio * 32767).astype('<i2').tobytes())
print(f'Original instrumental: {DURATION}s, stereo, {RATE}Hz -> {output}')
