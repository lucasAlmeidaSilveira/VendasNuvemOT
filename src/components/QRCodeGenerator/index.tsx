import { Container, QRImage, DownloadLink, ImageUploadLabel, ImagePreview, RemoveImageButton } from './styles';
import { Button } from '../Button';
import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Input } from '../Input';
import { IoMdDownload, IoMdClose } from 'react-icons/io';
import { MdImage } from 'react-icons/md';

export function QRCodeGenerator() {
  const [url, setUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setLogoImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateQRWithLogo = async (qrCanvas: HTMLCanvasElement, logoSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const ctx = qrCanvas.getContext('2d');
      if (!ctx) return resolve(qrCanvas.toDataURL());

      const logo = new Image();
      logo.crossOrigin = 'anonymous';
      logo.onload = () => {
        // Tamanho do logo (aproximadamente 20% do QR code)
        const logoSize = qrCanvas.width * 0.2;
        const x = (qrCanvas.width - logoSize) / 2;
        const y = (qrCanvas.height - logoSize) / 2;

        // Desenhar fundo branco atrás do logo
        const padding = 8;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2);

        // Desenhar o logo
        ctx.drawImage(logo, x, y, logoSize, logoSize);

        resolve(qrCanvas.toDataURL());
      };
      logo.src = logoSrc;
    });
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!url.trim()) return alert('Digite uma URL válida');

    e.preventDefault();

    try {
      const canvas = document.createElement('canvas');
      
      await QRCode.toCanvas(canvas, url, {
        errorCorrectionLevel: 'H',
        width: 512,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      let dataUrl: string;
      if (logoImage) {
        dataUrl = await generateQRWithLogo(canvas, logoImage);
      } else {
        dataUrl = canvas.toDataURL();
      }

      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Erro ao gerar QR:', err);
      alert('Erro ao gerar o QR Code');
    }
  };

  return (
    <Container onSubmit={handleGenerate}>
      <Input
        label='URL'
        placeholder='Cole aqui sua URL...'
        value={url}
        onChange={e => setUrl(e.target.value)}
      />

      <div style={{ width: '100%' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Logo (Opcional)
        </label>
        
        {logoImage ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <ImagePreview src={logoImage} alt='Logo preview' />
            <RemoveImageButton onClick={handleRemoveImage} type='button'>
              <IoMdClose size={20} />
            </RemoveImageButton>
          </div>
        ) : (
          <ImageUploadLabel>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <MdImage size={32} />
            <span>Clique para adicionar uma imagem</span>
          </ImageUploadLabel>
        )}
      </div>

      <Button typeStyle='confirm' type='submit' onClick={handleGenerate}>
        Gerar QR Code
      </Button>

      {qrDataUrl && (
        <DownloadLink href={qrDataUrl} download='qrcode.png'>
          <QRImage src={qrDataUrl} alt='QR Code' />
          <span>
            <IoMdDownload size={18} />
            Baixar QR Code
          </span>
        </DownloadLink>
      )}
    </Container>
  );
}
