// Bitrate of an MP3's first MPEG audio frame, in kbps (MPEG-1, 2 and 2.5, Layer III), as in the
// other labs' tests.
'use strict';
const fs = require('fs');

module.exports = function mp3Kbps(file) {
  const b = fs.readFileSync(file);
  let i = 0;
  if (b.toString('latin1', 0, 3) === 'ID3') i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  for (; i < b.length - 3; i++) {
    if (b[i] !== 0xff || (b[i + 1] & 0xe0) !== 0xe0) continue;
    const version = (b[i + 1] >> 3) & 3; // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
    const layer = (b[i + 1] >> 1) & 3; // 1 = Layer III
    const index = b[i + 2] >> 4;
    if (version === 1 || layer !== 1 || index === 0 || index === 15) continue;
    const table = version === 3
      ? [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
      : [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
    return table[index];
  }
  return null;
};
