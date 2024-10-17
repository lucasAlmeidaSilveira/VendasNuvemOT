import multer from 'multer';
import path from 'path';
const nextConnect = require('next-connect'); // Alterado para CommonJS

// Configurando o Multer para salvar os arquivos em uma pasta temporária
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp', // Pasta temporária da Vercel
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Gera um nome único
    },
  }),
});

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Algo deu errado: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Método ${req.method} não permitido` });
  },
});

apiRoute.use(upload.single('file')); // 'file' é o campo do formulário de upload

apiRoute.post((req, res) => {
  // A URL do arquivo pode ser manipulada ou salva conforme necessário.
  const filePath = `/tmp/${req.file.filename}`;
  res.status(200).json({ url: filePath });
});

export const config = {
  api: {
    bodyParser: false, // Desabilitar bodyParser para o Multer lidar com multipart/form-data
  },
};

export default apiRoute;
