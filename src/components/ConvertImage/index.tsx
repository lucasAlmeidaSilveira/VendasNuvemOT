import React, { useState } from 'react';
import { ChangeEvent } from 'react';
import { Button } from "../Button";

export function ConvertImage() {
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemConvertida, setImagemConvertida] = useState<string | null>(null);
 

  const handleImagemChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImagem(event.target.files[0]);
    }
  };

  const converterImagem = () => {
    if (imagem) {
      setImagemConvertida(null)
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
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setImagemConvertida(url);
            }
          }, 'image/webp');
        };
        img.src = imagemBase64;
      };
      reader.readAsDataURL(imagem);
    }
  };

  const downloadImagem = () => {
    if (imagemConvertida) {
      const link = document.createElement('a');
      link.href = imagemConvertida;
      link.download = 'imagem_convertida.webp';
      link.click();
    }
  };

  return (
    <div>
      <h3>Conversor de Imagem</h3>
      <div>
        <label htmlFor="imagem">
          Imagem:
        </label>
        <input
          type="file"
          id="imagem"
          onChange={handleImagemChange}
        />
        <Button
          typeStyle={'simple'}
          type='button'
          children={'Converter Imagem'}
          onClick={converterImagem}
        />
        {imagemConvertida && (
          <div>
            <Button
              typeStyle={'confirm'}
              type='button'
              children={'Baixar Imagem'}
              onClick={downloadImagem}
            />
          </div>
        )}
      </div>
    </div>
  );
};