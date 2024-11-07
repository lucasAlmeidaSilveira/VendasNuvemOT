import React, { useState, ChangeEvent, DragEvent } from 'react';
import { Button } from '../Button';
import { Actions, BoxInput, Container, InputImage } from './styles';
import { FaFile } from 'react-icons/fa6';
import JSZip from 'jszip'; // Importa JSZip para criar o arquivo zip
import saveAs from 'file-saver'; // Importa file-saver para salvar o arquivo zip
import { Oval } from "react-loader-spinner";
import heic2any from 'heic2any'; // Importa a biblioteca heic2any para converter imagens HEIC

export function ConvertImage() {
  const [imagens, setImagens] = useState<File[]>([]); // Estado para múltiplas imagens
  const [imagensConvertidas, setImagensConvertidas] = useState<string[]>([]); // URLs das imagens convertidas
  const [nomesArquivosConvertidos, setNomesArquivosConvertidos] = useState<string[]>([]); // Nomes dos arquivos convertidos
  const [isDragging, setIsDragging] = useState(false); // Estado para o arraste
  const [isLoading, setIsLoading] = useState(false); // Estado de loading

  const handleImagemChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setImagensConvertidas([]);
    const files = event.target.files ? Array.from(event.target.files) : [];
    setIsLoading(true);
    
    // Converte arquivos HEIC para JPEG, se necessário
    const convertedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type === 'image/heic' || file.name.toLocaleLowerCase().endsWith('.heic')) {
          try {
            const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg' });
            // Assegura que o retorno é um único Blob
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            return new File([blob], file.name.replace(/\.heic$/, '.jpeg'), { type: 'image/jpeg' });
          } catch (error) {
            console.error('Erro ao converter HEIC:', error);
          }
        }
        return file;
      })
      );
      
    setIsLoading(false);
    setImagens(convertedFiles);
  };

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    setImagensConvertidas([]);
    setIsDragging(false);

    const files = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];

    // Converte arquivos HEIC para JPEG, se necessário
    const convertedFiles = await Promise.all(
      files.map(async (file) => {
        if (file.type === 'image/heic' || file.name.endsWith('.heic')) {
          try {
            const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg' });
            // Assegura que o retorno é um único Blob
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            return new File([blob], file.name.replace(/\.heic$/, '.jpeg'), { type: 'image/jpeg' });
          } catch (error) {
            console.error('Erro ao converter HEIC:', error);
          }
        }
        return file;
      })
    );

    setImagens(convertedFiles);
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const converterImagens = () => {
    if (imagens.length > 0) {
      setIsLoading(true);
      const novasImagensConvertidas: string[] = [];
      const novosNomesArquivosConvertidos: string[] = [];

      imagens.forEach((imagem, index) => {
        const reader = new FileReader();
        reader.onload = () => {
          const imagemBase64 = reader.result as string;
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                novasImagensConvertidas.push(url);

                const nomeConvertido = imagem.name.replace(/\.[^/.]+$/, '') + '.webp';
                novosNomesArquivosConvertidos.push(nomeConvertido);

                // Quando todas as imagens forem convertidas, atualiza o estado
                if (novasImagensConvertidas.length === imagens.length) {
                  setImagensConvertidas(novasImagensConvertidas);
                  setNomesArquivosConvertidos(novosNomesArquivosConvertidos);
                  setIsLoading(false);
                }
              }
            }, 'image/webp');
          };
          img.src = imagemBase64;
        };
        reader.readAsDataURL(imagem);
      });
    }
  };

  const downloadImagens = async () => {
    if (imagensConvertidas.length === 1) {
      const url = imagensConvertidas[0];
      const nomeArquivo = nomesArquivosConvertidos[0];
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, nomeArquivo);
    } else if (imagensConvertidas.length > 1) {
      const zip = new JSZip();

      for (let i = 0; i < imagensConvertidas.length; i++) {
        const url = imagensConvertidas[i];
        const nomeArquivo = nomesArquivosConvertidos[i];
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(nomeArquivo, blob);
      }

      zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, 'imagens_convertidas.zip');
      });
    }
  };

  return (
    <Container>
      <BoxInput
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={isDragging ? 'isDragging' : ''}
      >
        <InputImage
          type='file'
          id='imagem'
          onChange={handleImagemChange}
          multiple
        />
        <label htmlFor='imagem'>
          {!isLoading ? (
            <>
              <span>
                <FaFile size={20} />
              </span>
              {imagens.length > 0
                ? imagens.length > 1
                  ? `${imagens.length} imagens selecionadas`
                  : imagens[0].name
                : 'Selecione ou arraste as imagens'}
            </>
          ) : (
            <>
              <Oval
                height={16}
                width={16}
                color="#1874cd"
                visible={true}
                ariaLabel="oval-loading"
                strokeWidth={4}
                strokeWidthSecondary={4}
              />
                Carregando imagens...
            </>
          )}
        </label>
      </BoxInput>
      <Actions>
        {!isLoading ? (
          <Button typeStyle={'simple'} type='button' onClick={converterImagens}>
            Converter Imagens
          </Button>
        ) : (
          <Button typeStyle={'simple'} type='button' onClick={converterImagens}>
            <Oval
              height={16}
              width={16}
              color="#1874cd"
              visible={true}
              ariaLabel='oval-loading'
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </Button>
        )}
        {imagensConvertidas.length > 0 && (
          <div>
            <Button
              typeStyle={'confirm'}
              type='button'
              onClick={downloadImagens}
            >
              Baixar imagens ({imagensConvertidas.length})
            </Button>
          </div>
        )}
      </Actions>
    </Container>
  );
}
