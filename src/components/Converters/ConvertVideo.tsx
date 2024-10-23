import React, { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '../Button';
import { Actions, BoxInput, Container, InputVideo, SelectFormat } from '../ConvertVideo/styles';
import { FaFileVideo } from 'react-icons/fa6';
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import { Oval } from 'react-loader-spinner';
import saveAs from 'file-saver';

export function ConvertVideo() {
  // const [video, setVideo] = useState<File | null>(null);
  // const [format, setFormat] = useState<'mp4' | 'webm'>('mp4');
  // const [isLoading, setIsLoading] = useState(false);
  // const [convertedVideo, setConvertedVideo] = useState<string | null>(null);
  // const [progress, setProgress] = useState<number>(0);
  // const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  // const ffmpeg = new FFmpeg();

  // // Carregar o FFmpeg na primeira renderização
  // useEffect(() => {
  //   const loadFFmpeg = async () => {
  //     await ffmpeg.load();
  //     setFfmpegLoaded(true);
  //   };
  //   loadFFmpeg();
  // }, [ffmpeg]);

  // const handleVideoChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files ? event.target.files[0] : null;
  //   setVideo(file);
  //   setConvertedVideo(null); // Limpa o vídeo convertido quando um novo vídeo é carregado
  // };

  // const converterVideo = async () => {
  //   if (video && ffmpegLoaded) {
  //     setIsLoading(true);
  //     setProgress(0);

  //     // Enviar o arquivo para o sistema de arquivos virtual do FFmpeg
  //     ffmpeg.writeFile('writeFile', video.name);

  //     // Configurar o comando de conversão
  //     const outputFilename = `output.${format}`;
  //     await ffmpeg.run('-i', video.name, outputFilename);

  //     // Ler o arquivo convertido
  //     const data = ffmpeg.FS('readFile', outputFilename);

  //     // Criar um link de download
  //     const url = URL.createObjectURL(new Blob([data.buffer], { type: `video/${format}` }));
  //     setConvertedVideo(url);

  //     setIsLoading(false);
  //   }
  // };

  // const downloadVideo = () => {
  //   if (convertedVideo) {
  //     saveAs(convertedVideo, `converted.${format}`);
  //   }
  // };

  return (
    <Container>
     <h3>Em construção</h3>
      {/* <SelectFormat value={format} onChange={(e) => setFormat(e.target.value as 'mp4' | 'webm')}>
        <option value="mp4">MP4</option>
        <option value="webm">WebM</option>
      </SelectFormat>
      <BoxInput>
        <InputVideo
          type='file'
          id='video'
          onChange={handleVideoChange}
          accept="video/*"
        />
        <label htmlFor='video'>
          <span>
            <FaFileVideo size={20} />
          </span>{' '}
          {video ? video.name : 'Selecione ou arraste o vídeo'}
        </label>
      </BoxInput>
      <Actions>
        <Button typeStyle={'simple'} type='button' onClick={converterVideo} disabled={isLoading || !ffmpegLoaded}>
          {isLoading ? (
            <>
              <Oval
                height={16}
                width={16}
                color="1874cd"
                visible={true}
                ariaLabel='oval-loading'
                strokeWidth={4}
                strokeWidthSecondary={4}
              />
              Convertendo...
            </>
          ) : (
            'Converter Vídeo'
          )}
        </Button>
        {convertedVideo && (
          <Button
            typeStyle={'confirm'}
            type='button'
            onClick={downloadVideo}
          >
            Baixar vídeo convertido
          </Button>
        )}
      </Actions> */}
    </Container>
  );
}
