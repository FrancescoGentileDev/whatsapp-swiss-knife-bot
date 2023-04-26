import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

function oggToMp3(base64Data: string, extension: string) : Promise<string> {
  // Decodifica il file in formato base64
  const oggData = Buffer.from(base64Data, 'base64');
  console.log("estensione audio ", extension)
  // Crea un nome di file univoco
  const filename = `audio_${Date.now()}.${extension}`;

  // Salva il file .ogg decodificato
  fs.writeFileSync(filename, oggData);

  // Crea un nome di file per il file .mp3 risultante
  const outputFilename = `audio_${Date.now()}.mp3`;

  // Usa ffmpeg per convertire il file .ogg in .mp3
  return new Promise((resolve, reject) => {
    ffmpeg(filename)
      .noVideo()
      .audioCodec('libmp3lame')
      .on('error', (err: any) => {
        // Gestisce eventuali errori
        fs.unlinkSync(filename);
        reject(err);
      })
      .on('end', () => {
        // Elimina il file .ogg originale
        fs.unlinkSync(filename);
        resolve(outputFilename);
      })
      .save(outputFilename);
  });
}



export { oggToMp3 };
