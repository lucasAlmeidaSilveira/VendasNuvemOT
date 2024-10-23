import React, { useState, ChangeEvent, DragEvent } from 'react';
import { Button } from '../Button';
import { Actions, BoxInput, Container, InputImage } from './styles';
import { FaFile } from 'react-icons/fa6';
import JSZip from 'jszip'; // Importa JSZip para criar o arquivo zip
import saveAs from 'file-saver'; // Importa file-saver para salvar o arquivo zip
import { Oval } from "react-loader-spinner";

export function ConvertImage() {
  const [imagens, setImagens] = useState<File[]>([]); // Estado para múltiplas imagens
  const [imagensConvertidas, setImagensConvertidas] = useState<string[]>([]); // URLs das imagens convertidas
  const [nomesArquivosConvertidos, setNomesArquivosConvertidos] = useState<string[]>([]); // Nomes dos arquivos convertidos
  const [isDragging, setIsDragging] = useState(false); // Estado para o arraste
  const [isLoading, setIsLoading] = useState(false); // Estado de loading

  const handleImagemChange = (event: ChangeEvent<HTMLInputElement>) => {
    setImagensConvertidas([]); // Limpa as imagens convertidas
    const files = event.target.files ? Array.from(event.target.files) : [];
    setImagens(files); // Armazena as imagens selecionadas
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setImagensConvertidas([]); // Limpa as imagens convertidas
    setIsDragging(false);
    
    const files = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
    setImagens(files); // Armazena as imagens arrastadas
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
      // Se houver apenas uma imagem, faz o download direto dela
      const url = imagensConvertidas[0];
      const nomeArquivo = nomesArquivosConvertidos[0];
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, nomeArquivo); // Salva a imagem diretamente
    } else if (imagensConvertidas.length > 1) {
      const zip = new JSZip(); // Cria um novo arquivo zip
  
      // Adiciona cada imagem convertida ao zip
      for (let i = 0; i < imagensConvertidas.length; i++) {
        const url = imagensConvertidas[i];
        const nomeArquivo = nomesArquivosConvertidos[i];
  
        // Faz o download dos blobs das imagens
        const response = await fetch(url);
        const blob = await response.blob();
  
        // Adiciona a imagem ao zip
        zip.file(nomeArquivo, blob);
      }
  
      // Gera o arquivo zip e faz o download
      zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, 'imagens_convertidas.zip'); // Salva o arquivo zip com FileSaver.js
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
          multiple // Permite seleção de múltiplos arquivos
        />
        <label htmlFor='imagem'>
          <span>
            <FaFile size={20} />
          </span>{' '}
          {imagens.length > 0 ? (
            imagens.length > 1 ? (`${imagens.length} imagens selecionadas`) : (imagens[0].name)
          ) : 'Selecione ou arraste as imagens'}
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
              onClick={downloadImagens} // Faz o download das imagens zipadas
            >
              Baixar imagens ({imagensConvertidas.length})
            </Button>
          </div>
        )}
      </Actions>
    </Container>
  );
}
