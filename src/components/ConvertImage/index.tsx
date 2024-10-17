import React, { useState, ChangeEvent, DragEvent } from 'react';
import { Button } from '../Button';
import { Actions, BoxInput, Container, InputImage } from './styles';
import { FaFile } from 'react-icons/fa6';
import { Oval } from "react-loader-spinner";

export function ConvertImage() {
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemConvertida, setImagemConvertida] = useState<string | null>(null);
  const [nomeArquivoConvertido, setNomeArquivoConvertido] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false); // Novo estado para controlar o "dragging"
  const [isLoading, setIsLoading] = useState(false); // Novo estado para controle de loading

  const handleImagemChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImagemConvertida(null);
    if (event.target.files) {
      setImagem(event.target.files[0]);
    }
  };
  
  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setImagemConvertida(null);
    setIsDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setImagem(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(true); // Quando o arquivo é arrastado sobre a área
  };

  const handleDragLeave = () => {
    setIsDragging(false); // Quando o arquivo sai da área
  };

  const converterImagem = () => {
    if (imagem) {
      setIsLoading(true); // Inicia o estado de loading
      setImagemConvertida(null);
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
              setImagemConvertida(url);

              // Define o nome do arquivo original com a nova extensão .webp
              const nomeConvertido =
                imagem.name.replace(/\.[^/.]+$/, '') + '.webp';
              setNomeArquivoConvertido(nomeConvertido);
              setIsLoading(false); // Finaliza o loading após a conversão
            }
          }, 'image/webp');
        };
        img.src = imagemBase64;
      };
      reader.readAsDataURL(imagem);
    }
  };

  const downloadImagem = () => {
    if (imagemConvertida && nomeArquivoConvertido) {
      const link = document.createElement('a');
      link.href = imagemConvertida;
      link.download = nomeArquivoConvertido;
      link.click();
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
        <InputImage type='file' id='imagem' onChange={handleImagemChange} />
        <label htmlFor='imagem'>
          <span>
            <FaFile size={20} />
          </span>{' '}
          {imagem ? imagem.name : 'Selecione uma imagem ou arraste aqui'}
        </label>
      </BoxInput>
      <Actions>
        {!imagemConvertida && isLoading ? (
          <Button typeStyle={'simple'} type='button' onClick={converterImagem}>
            <Oval
              height={16}
              width={16}
              color="var(--geralwhite)"
              visible={true}
              ariaLabel='oval-loading'
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </Button>
        ) : !imagemConvertida ? (
          <Button typeStyle={'simple'} type='button' onClick={converterImagem}>
            Converter Imagem
          </Button>
        ) : (
          <Button typeStyle={'confirm'} type='button' onClick={downloadImagem}>
            Baixar Imagem
          </Button>
        )}
      </Actions>
    </Container>
  );
}
