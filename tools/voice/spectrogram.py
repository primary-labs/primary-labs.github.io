#!/usr/bin/env python3
"""Primary Labs · spectrograms of clips as one PNG, for looking at a sound before listening.

    python spectrogram.py out.png clip1.mp3 clip2.wav ...

One row per clip, in the order given: 0-8 kHz from bottom to top, darker is louder, 1 second wide with
a light line every 100 ms. Needs only numpy and soundfile (no plotting library).

What to look for: a hiss lengthened by joining copies shows the same blotches repeating (heard as an
echo); a voiced sound that turns into plain hiss halfway (a v heard as f); seams where pieces meet; a
sound much shorter than its neighbours.
"""
import struct
import sys
import zlib

import numpy as np
import soundfile as sf


def rows(path, width_s=1.0, hop_s=0.004, height=150, top_hz=8000, range_db=70):
    x, sr = sf.read(path, dtype='float32')
    if x.ndim > 1:
        x = x.mean(axis=1)
    n, step = int(0.020 * sr), int(hop_s * sr)
    frames = np.array([x[i:i + n] * np.hanning(n) for i in range(0, max(1, len(x) - n), step)])
    power = np.abs(np.fft.rfft(frames, axis=1)) ** 2
    power = power[:, np.fft.rfftfreq(n, 1 / sr) <= top_hz]
    db = 10 * np.log10(power + 1e-12)
    img = 1 - np.clip((db - (db.max() - range_db)) / range_db, 0, 1).T[::-1]  # dark = loud, low at the bottom
    img = img[np.linspace(0, img.shape[0] - 1, height).astype(int)]
    out = np.ones((height, int(width_s / hop_s)))
    w = min(out.shape[1], img.shape[1])
    out[:, :w] = img[:, :w]
    tick = int(0.1 / hop_s)
    out[:, ::tick] = np.minimum(out[:, ::tick], 0.8)
    return (out * 255).astype(np.uint8)


def write_png(path, a):
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)
    h, w = a.shape
    raw = b''.join(b'\x00' + a[i].tobytes() for i in range(h))
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 0, 0, 0, 0))
                + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    out, files = sys.argv[1], sys.argv[2:]
    parts = []
    for f in files:
        r = rows(f)
        parts += [r, np.zeros((3, r.shape[1]), np.uint8)]
    write_png(out, np.vstack(parts[:-1]))
    print('Wrote %s: %d rows (%s)' % (out, len(files), ', '.join(files)))


if __name__ == '__main__':
    main()
