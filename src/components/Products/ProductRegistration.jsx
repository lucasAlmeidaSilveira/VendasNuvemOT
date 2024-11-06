import React, { useState, useEffect } from 'react';
import {
  OToneFrameHorizontal,
  OToneFrameVertical,
  OToneFrameQuadrado,
  OTtwoFrameVertical,
  OTtwoFrameHorizontal,
  OTtwoFrameQuadrado,
  OTthreeFrameQuadrado,
  OTthreeFrameVertical,
  OTthreeFrameHorizontal,
  APoneFrameHorizontal,
  APoneFrameVertical,
  APoneFrameQuadrado,
  APtwoFrameVertical,
  APtwoFrameHorizontal,
  APtwoFrameQuadrado,
  APthreeFrameQuadrado,
  APthreeFrameVertical,
  APthreeFrameHorizontal,
} from '../../db/variants.js'; // Suas variantes
import { defaultCategories } from '../../db/categories.js'; // Suas categorias padrão
import { createProduct, fetchCategories } from '../../api/index.js';
import { useOrders } from '../../context/OrdersContext.jsx';
import { CustomSelect } from '../CustomSelect';
import { FaCirclePlus } from 'react-icons/fa6';
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Grid,
  styled,
} from '@mui/material';
import {
  ContainerProductRegistration,
  ContainerButton,
  ContainerButtonRow,
  ContainerForm,
  Label,
  TitlePage,
} from './styles.ts';
import { Button } from '../Button/index.jsx';
import { ConfirmationDialog } from './ConfirmationDialog.jsx';

// Mapeamento de variants para cada store
const variantsMappingOutlet = {
  oneHorizontal: OToneFrameHorizontal,
  oneVertical: OToneFrameVertical,
  oneQuadrado: OToneFrameQuadrado,
  twoVertical: OTtwoFrameVertical,
  twoHorizontal: OTtwoFrameHorizontal,
  twoQuadrado: OTtwoFrameQuadrado,
  threeQuadrado: OTthreeFrameQuadrado,
  threeVertical: OTthreeFrameVertical,
  threeHorizontal: OTthreeFrameHorizontal,
};

const variantsMappingArtepropria = {
  oneHorizontal: APoneFrameHorizontal,
  oneVertical: APoneFrameVertical,
  oneQuadrado: APoneFrameQuadrado,
  twoVertical: APtwoFrameVertical,
  twoHorizontal: APtwoFrameHorizontal,
  twoQuadrado: APtwoFrameQuadrado,
  threeQuadrado: APthreeFrameQuadrado,
  threeVertical: APthreeFrameVertical,
  threeHorizontal: APthreeFrameHorizontal,
};

// Função para fazer uma cópia profunda
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function convertFramesNumber(frames) {
  switch (frames) {
    case '1':
      return 'one';
    case '2':
      return 'two';
    case '3':
      return 'three';
    default:
      return '';
  }
}
const FormControlLabelCustom = styled(FormControlLabel)({
  '& .MuiFormControlLabel-label': {
    fontSize: '1.2rem',
  },
});

const TextFieldInput = styled(TextField)({
  fontFamily: "'Poppins', sans-serif",
  '& .MuiInputBase-input, & label': {
    fontSize: '1.4rem',
  },
  '& label, & .MuiInputBase-input': {
    fontFamily: "'Poppins', sans-serif",
  },
  '& .MuiInputBase-root': {
    borderRadius: '8px 8px 0 0',
    border: 'none',
    backgroundColor: 'var(--geralwhite)',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
  },
  '& .css-batk84-MuiInputBase-root-MuiFilledInput-root::before': {
    borderBottom: 'none',
  },
});

export function ProductRegistration() {
  const { store } = useOrders();
  const [nameArt, setNameArt] = useState('');
  const [imageUrls, setImageUrls] = useState(['', '', '']); // Os dois primeiros para imagens de ambiente
  const [categoryNames, setCategoryNames] = useState([]);
  const [skuNumber, setSkuNumber] = useState('');
  const [format, setFormat] = useState('');
  const [framesNumber, setFramesNumber] = useState('');
  const [visible, setVisible] = useState(false);
  const [unit, setUnit] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const categories = await fetchCategories(store);
      setCategories(categories);
    };
    fetchData();
  }, [store]);

  useEffect(() => {
    // Atualizar imageUrls com base em framesNumber
    const initialUrls = ['', '', ''];
    let count = 0;
    if (framesNumber === '1') {
      count = 1;
    } else if (framesNumber === '2') {
      count = 3;
    } else if (framesNumber === '3') {
      count = 4;
    }
    setImageUrls([...initialUrls, ...Array(count).fill('')]);
  }, [framesNumber]);

  const handleCategoryChange = event => {
    const value = event.target.value;
    setCategoryNames(
      categoryNames.includes(value)
        ? categoryNames.filter(category => category !== value)
        : [...categoryNames, value],
    );
  };

  const handleImageUrlChange = (index, value) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = value;
    setImageUrls(updatedUrls);
  };

  const addImageUrlField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleFormatChange = event => {
    setFormat(event.target.value);
  };
  
  const handleFramesNumberChange = event => {
    setFramesNumber(event.target.value)
  }

  const resetInputs = () => {
    setNameArt('');
    setImageUrls(['', '', '']);
    setCategoryNames([]);
    setSkuNumber('');
    setFormat('');
    setFramesNumber('');
  };

  const handleSubmit = event => {
    event.preventDefault();
    setOpen(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    
    try {
      const productData = handleProductCreation();
      const response = await createProduct(store, productData);

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          resetInputs();
          setLoading(false);
          setOpen(false);
          setSuccess(false);
        }, 1000);
      } 
      
    } catch (error) {
      setLoading(false);
    }

  };

  const handleClose = () => {
    setOpen(false);
  };

  const getVariantKey = () => {
    const key = `${convertFramesNumber(framesNumber)}${
      format.charAt(0).toUpperCase() + format.slice(1).toLowerCase()
    }`
    return key;
  };

  const findCategoryId = categoryName => {
    const categoryEntry = categories.find(
      category => category.name === categoryName,
    );
    return categoryEntry ? categoryEntry.id : null;
  };

  const handleProductCreation = () => {
    const framesNum = convertFramesNumber(framesNumber);
    const plural = framesNum === 'one' ? 'Tela' : 'Telas';
    const productName = `Quadro Decorativo ${framesNumber} ${plural} ${categoryNames[0]} ${nameArt}`;

      // Imagens padrão para cada loja
  const defaultImagesOutlet = [
    { src: 'https://acdn.mitiendanube.com/stores/003/889/735/products/canvas_zgquje-7992c817448a11f9f617140659149535-480-0.webp', position: 8 },
    { src: 'https://acdn.mitiendanube.com/stores/003/889/735/products/sem_vidro_yodpsx-ae6f6fe0cdfdb3674b17140659278662-480-0.webp', position: 9 },
    { src: 'https://acdn.mitiendanube.com/stores/003/889/735/products/com_vidro_fvastx-dd79b1c16e294709d917140659214570-480-0.webp', position: 10 },
    { src: 'https://acdn.mitiendanube.com/stores/003/889/735/products/canaleta_txfhis-a6eb00c1451545947d17140659084033-480-0.webp', position: 11 }
  ];

  const defaultImagesArtepropria = [
    { src: 'https://acdn.mitiendanube.com/stores/001/146/504/products/acabamentos-canvas_sprxkb-8fa81b8457a896518217073382756360-640-0.webp', position: 8 },
    { src: 'https://acdn.mitiendanube.com/stores/001/146/504/products/acabamentos-quadro_com_vidro_qoysbu-0012313385157d6fc017073382822078-640-0.webp', position: 9 },
    { src: 'https://acdn.mitiendanube.com/stores/001/146/504/products/acabamentos-canvas_com_canaleta_fbasky-1e75aa0bf55dfe19b317073382889011-640-0.webp', position: 10 },
    { src: 'https://acdn.mitiendanube.com/stores/001/146/504/products/acabamentos-metacrilato_bmoucm-08401e65cd641c718617073382956305-640-0.webp', position: 11 },
    { src: 'https://acdn.mitiendanube.com/stores/001/146/504/products/acabamentos-impressc3a3o_lpiyfi-68d8054ea930d2748c17073383028046-640-0.webp', position: 12 }
  ];

    const body = {
      name: { pt: nameArt },
      attributes: [
        'Selecione o tamanho',
        'Selecione o acabamento',
        'Selecione a cor da moldura',
      ],
      variants: [],
      categories: store === 'outlet' ? [21612799] : [23591533],
      images: [...imageUrls
        .filter(url => url)
        .map((src, index) => ({ src, position: index + 1 })),
        ...( !unit ? (store === 'outlet' ? defaultImagesOutlet : defaultImagesArtepropria) : [])
      ],
      tags: skuNumber,
      published: visible,
      free_shipping: false,
      seo_title: productName,
      brand: store === 'outlet' ? 'Outlet dos Quadros' : 'Arte Própria',
    };

    categoryNames.forEach(categoryName => {
      const categoryId = findCategoryId(categoryName);
      if (categoryId) {
        body.categories.push(categoryId);
      }
    });

    const defaultCategoryKey = getVariantKey();
    const defaultCategoryId = defaultCategories[defaultCategoryKey];
    if (defaultCategoryId && store === 'outlet') {
      body.categories.push(defaultCategoryId);
    }

    // Montar as variants conforme a store
    const variantsMapping = store === 'outlet' ? variantsMappingOutlet : variantsMappingArtepropria;
    const prefix = store === 'outlet' ? 'OT|' : 'AP';
    const skuNumbers = skuNumber.replace(/,/g, '_');
    body.variants = deepCopy(variantsMapping[getVariantKey()]) || [];

    body.variants.forEach(variant => {
      variant.sku = `${prefix}${skuNumbers}${variant.sku}`;
    });

    return body;
  };

  // Divide categories into columns com max 10 categories cada
  const columns = [];
  for (let i = 0; i < categories.length; i += 10) {
    columns.push(categories.slice(i, i + 10));
  }

  const renderImageFields = () => {
    const count = framesNumber === '1' ? 1 : framesNumber === '2' ? 3 : framesNumber === '3' ? 4 : 0;
  
    return imageUrls.slice(2, 2 + count).map((url, index) => (
      <TextFieldInput
        variant='filled'
        key={index + 2}
        size='small'
        label={`URL da Imagem ${index + 3}`}
        type='text'
        value={url}
        onChange={e => handleImageUrlChange(index + 2, e.target.value)}
        {...(!unit && { required: true })}
      />
    ));
  };

  return (
    <ContainerProductRegistration>
      <TitlePage>Cadastro de Quadro</TitlePage>
      <ContainerForm onSubmit={handleSubmit}>
        <ContainerButtonRow>
          <ContainerButton>
            <TextFieldInput
              variant='filled'
              label='Nome da arte'
              size='small'
              required
              onChange={e => setNameArt(e.target.value)}
              value={nameArt}
            />
            <span>Preencha apenas o nome da arte</span>
          </ContainerButton>
          <ContainerButton className='codImage'>
            <TextFieldInput
              variant='filled'
              type='text'
              label='Cod. Imagem'
              size='small'
              value={skuNumber}
              onChange={e => setSkuNumber(e.target.value)}
              required
            />
            {store === 'outlet' ? (
              <span>Preencha apenas o código da imagem.</span>
            ) : (
              <span>
                Preencha apenas o código da imagem, se houver mais de uma,
                separar por vírgula.
              </span>
            )}
          </ContainerButton>
        </ContainerButtonRow>
        <ContainerButtonRow>
          <CustomSelect
            label={'Formato:'}
            onChange={handleFormatChange}
            options={[
              { value: '', label: 'Selecione' },
              { value: 'Vertical', label: 'Vertical' },
              { value: 'Horizontal', label: 'Horizontal' },
              { value: 'Quadrado', label: 'Quadrado' },
            ]}
            value={format}
          />
          <CustomSelect
            label={'Quantidade de Telas:'}
            onChange={handleFramesNumberChange}
            options={[
              { value: '', label: 'Selecione' },
              { value: '1', label: '1 Tela' },
              { value: '2', label: '2 Telas' },
              { value: '3', label: '3 Telas' },
            ]}
            value={framesNumber}
          />
          <CustomSelect
            label={'Visível:'}
            onChange={e => setVisible(e.target.value)}
            options={[
              { value: false, label: 'Não' },
              { value: true, label: 'Sim' },
            ]}
            value={visible}
          />
          <CustomSelect
            label={'Imagem unitária:'}
            onChange={e => setUnit(e.target.value)}
            options={[
              { value: false, label: 'Não' },
              { value: true, label: 'Sim' },
            ]}
            value={unit}
          />
        </ContainerButtonRow>
        <ContainerButton>
          <Label>Imagens de Ambiente:</Label>
          <a href='https://postimages.org/' target='_blank'>
            <span>Clique aqui para gerar as URLs</span>
          </a>
          {!unit && (
            imageUrls.slice(0, 2).map((url, index) => (
              <>
                <TextFieldInput
                  variant='filled'
                  key={index}
                  label={`URL da Imagem ${index + 1}`}
                  size='small'
                  required={index === 0 ? true : false}
                  onChange={e => handleImageUrlChange(index, e.target.value)}
                  value={url}
                />
                {index === 0 && <span>Imagem principal</span>}
              </>
            ))
          )}
        </ContainerButton>
        <ContainerButton>
          <Label>Imagens de Still:</Label>
          {renderImageFields()}

          {framesNumber > 1 && <span>As imagens Still devem conter uma de cada imagem, e outra com todas as artes da composição.</span>}
        </ContainerButton>
        <ContainerButton>
          <Label>Categorias:</Label>
          <Grid container spacing={0}>
            {columns.map((column, columnIndex) => (
              <Grid item xs={12} sm={6} md={2} key={columnIndex}>
                <FormGroup>
                  {column.map(category => (
                    <FormControlLabelCustom
                      key={category.id}
                      control={<Checkbox />}
                      label={category.name}
                      value={category.name}
                      checked={categoryNames.includes(category.name)}
                      onChange={handleCategoryChange}
                    />
                  ))}
                </FormGroup>
              </Grid>
            ))}
          </Grid>
        </ContainerButton>

        <ContainerButtonRow>
          <Button typeStyle={'simple'} onClick={resetInputs} type='button'>
            Limpar campos
          </Button>
          <Button typeStyle={'confirm'} type='submit'>
            Cadastrar
          </Button>
        </ContainerButtonRow>
      </ContainerForm>

      <ConfirmationDialog
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        loading={loading}
        success={success}
        action={'Cadastrar'}
      />
    </ContainerProductRegistration>
  );
}
