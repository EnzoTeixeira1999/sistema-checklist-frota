const pool = require('./db');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dyknjxasx',
  api_key: '395759612524981',
  api_secret: 'u-Al6DSOTlHqPLVM6UfkmmLGS5w'
});
const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Apenas imagens são permitidas!'), false);
    } else {
      cb(null, true);
    }
  }
});
const app = express();
app.use(cors());
app.use(express.json());

function gerarLetrasAleatorias(qtd) {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let resultado = "";

  for (let i = 0; i < qtd; i++) {
    resultado += letras.charAt(Math.floor(Math.random() * letras.length));
  }

  return resultado;
}

function gerarNumerosAleatorios(qtd) {
  let resultado = "";

  for (let i = 0; i < qtd; i++) {
    resultado += Math.floor(Math.random() * 10);
  }

  return resultado;
}

async function gerarMatriculaUnica(pool) {
  let matricula = "";
  let existe = true;

  while (existe) {
    matricula = `${gerarLetrasAleatorias(3)}${gerarNumerosAleatorios(6)}`;

    const result = await pool.query(
      "SELECT id FROM colaboradores WHERE matricula = $1",
      [matricula]
    );

    existe = result.rows.length > 0;
  }

  return matricula;
}

async function gerarRaUnico(pool) {
  let ra = "";
  let existe = true;

  while (existe) {
    ra = `RA${gerarNumerosAleatorios(8)}`;

    const result = await pool.query(
      "SELECT id FROM colaboradores WHERE ra = $1",
      [ra]
    );

    existe = result.rows.length > 0;
  }

  return ra;
}

app.get('/', (req, res) => {
  res.send('API rodando');
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no banco');
  }
});

app.post('/colaboradores', upload.single('foto'), async (req, res) => {
  const { nome_completo, email, cpf, sexo, data_entrada } = req.body;

  try {
    if (!nome_completo || !sexo || !data_entrada) {
      return res.status(400).json({ error: 'Preencha nome completo, sexo e data de entrada.' });
    }

    let foto_url = null;

    if (req.file) {
      const resultadoUpload = await cloudinary.uploader.upload(req.file.path);
      foto_url = resultadoUpload.secure_url;
    }

    const matricula = await gerarMatriculaUnica(pool);
    const ra = await gerarRaUnico(pool);

    const result = await pool.query(
      `INSERT INTO colaboradores (
        nome_completo,
        email,
        cpf,
        sexo,
        data_entrada,
        foto_url,
        matricula,
        ra,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PRE_CADASTRADO')
      RETURNING *`,
      [nome_completo, email || null, cpf || null, sexo, data_entrada, foto_url, matricula, ra]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar colaborador' });
  }
});

app.get('/colaboradores', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *
       FROM colaboradores
       ORDER BY id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar colaboradores' });
  }
});

app.delete('/colaboradores/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM colaboradores WHERE id = $1', [id]);
    res.json({ message: 'Colaborador excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir colaborador' });
  }
});

app.post('/registrar-colaborador', async (req, res) => {
  const { email, senha, matricula, ra } = req.body;

  try {
    if (!email || !senha || !matricula || !ra) {
      return res.status(400).json({ error: 'Preencha email, senha, matrícula e RA.' });
    }

    const colaboradorResult = await pool.query(
      `SELECT * FROM colaboradores
       WHERE matricula = $1 AND ra = $2`,
      [matricula.trim().toUpperCase(), ra.trim().toUpperCase()]
    );

    if (colaboradorResult.rows.length === 0) {
      return res.status(400).json({ error: 'Matrícula ou RA inválidos.' });
    }

    const colaborador = colaboradorResult.rows[0];

    if (colaborador.registro_concluido) {
      return res.status(400).json({ error: 'Este colaborador já concluiu o registro.' });
    }

    const emailExistente = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      [email]
    );

    if (emailExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const novoUsuario = await pool.query(
      `INSERT INTO users(nome, email, senha, tipo)
       VALUES($1, $2, $3, 'COLABORADOR')
       RETURNING *`,
      [colaborador.nome_completo, email, senhaCriptografada]
    );

    const usuarioCriado = novoUsuario.rows[0];

    await pool.query(
      `UPDATE colaboradores
       SET email = $1,
           usuario_id = $2,
           registro_concluido = TRUE,
           status = 'ATIVO'
       WHERE id = $3`,
      [email, usuarioCriado.id, colaborador.id]
    );

    res.json({
      message: 'Registro concluído com sucesso!',
      user: {
        id: usuarioCriado.id,
        nome: usuarioCriado.nome,
        email: usuarioCriado.email,
        tipo: usuarioCriado.tipo
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar colaborador.' });
  }
});

app.post('/users', async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  try {
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      'INSERT INTO users(nome, email, senha, tipo) VALUES($1, $2, $3, $4) RETURNING *',
      [nome, email, senhaCriptografada, tipo]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar usuário');
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Senha inválida' });
    }

    let matricula = null;
    let ra = null;

    if (user.tipo === "COLABORADOR") {
      const colaboradorResult = await pool.query(
        'SELECT matricula, ra FROM colaboradores WHERE usuario_id = $1',
        [user.id]
      );

      if (colaboradorResult.rows.length > 0) {
        matricula = colaboradorResult.rows[0].matricula;
        ra = colaboradorResult.rows[0].ra;
      }
    }

    const token = jwt.sign(
      { id: user.id, tipo: user.tipo },
      'segredo',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        matricula,
        ra
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no login' });
  }
});

app.post('/vehicles', async (req, res) => {
  const { placa, modelo } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO vehicles(placa, modelo) VALUES($1, $2) RETURNING *',
      [placa, modelo]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar veículo');
  }
});

app.post('/checklist', async (req, res) => {
  const {
    vehicle_id,
    km,
    respostas,
    responsavel,
    proprietario,
    tipo_carro,
    ano_carro,
    placa_informada
  } = req.body;

  try {
    if (!respostas || respostas.length === 0) {
      return res.status(400).send('Checklist incompleto');
    }

    if (!responsavel || !proprietario || !tipo_carro || !ano_carro || !km || !placa_informada) {
      return res.status(400).send('Preencha todos os campos obrigatórios');
    }

    const checklistResult = await pool.query(
      `INSERT INTO checklists (
        vehicle_id,
        km,
        status,
        responsavel,
        proprietario,
        tipo_carro,
        ano_carro,
        placa_informada
      )
      VALUES ($1, $2, 'PENDENTE', $3, $4, $5, $6, $7)
      RETURNING *`,
      [vehicle_id, km, responsavel, proprietario, tipo_carro, ano_carro, placa_informada]
    );

    const checklist = checklistResult.rows[0];

    for (let item of respostas) {
      await pool.query(
        `INSERT INTO checklist_answers (checklist_id, pergunta, resposta)
         VALUES ($1, $2, $3)`,
        [checklist.id, item.pergunta, item.resposta]
      );
    }

    res.json(checklist);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao criar checklist');
  }
});

app.delete('/checklists', async (req, res) => {
  try {
    await pool.query('DELETE FROM checklist_answers');
    await pool.query('DELETE FROM checklist_photos');
    await pool.query('DELETE FROM checklists');

    res.json({ message: 'Todos os checklists foram excluídos com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir todos os checklists' });
  }
});

app.put('/checklist/:id/validar', async (req, res) => {
  const { id } = req.params;
  const { status, observacao } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ error: 'Status é obrigatório.' });
    }

    if (status === "REPROVADO" && !observacao?.trim()) {
      return res.status(400).json({ error: 'Observação é obrigatória para reprovação.' });
    }

    const result = await pool.query(
      `UPDATE checklists
       SET status = $1, observacao = $2
       WHERE id = $3
       RETURNING *`,
      [status, observacao || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist não encontrado.' });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao validar checklist' });
  }
});

app.delete('/checklist/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM checklist_answers WHERE checklist_id = $1', [id]);
    await pool.query('DELETE FROM checklist_photos WHERE checklist_id = $1', [id]);
    await pool.query('DELETE FROM checklists WHERE id = $1', [id]);

    res.json({ message: 'Checklist excluído com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir checklist' });
  }
});

app.get('/checklists/:status', async (req, res) => {
  const { status } = req.params;

  const result = await pool.query(
    'SELECT * FROM checklists WHERE status = $1',
    [status]
  );

  res.json(result.rows);
});

app.post('/checklist/:id/photo', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const { tipo } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    if (!tipo) {
      return res.status(400).json({ error: 'Tipo da foto não enviado' });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    const dbRes = await pool.query(
      `INSERT INTO checklist_photos (checklist_id, url, tipo)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, result.secure_url, tipo]
    );

    res.json({
      url: result.secure_url,
      dbEntry: dbRes.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar foto do checklist' });
  }
});

app.get('/checklists', async (req, res) => {
  try {
    const checklistsRes = await pool.query(`
      SELECT c.*, v.placa, v.modelo
      FROM checklists c
      JOIN vehicles v ON c.vehicle_id = v.id
      ORDER BY c.id DESC
    `);

    const checklists = checklistsRes.rows;

    for (let checklist of checklists) {
      const photosRes = await pool.query(
        'SELECT url, tipo FROM checklist_photos WHERE checklist_id = $1',
        [checklist.id]
      );

      const answersRes = await pool.query(
        'SELECT pergunta, resposta FROM checklist_answers WHERE checklist_id = $1',
        [checklist.id]
      );

      checklist.fotos = photosRes.rows;
      checklist.respostas = answersRes.rows;
    }

    res.json(checklists);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar checklists' });
  }
});

app.get('/checklist/:id/photos', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM checklist_photos WHERE checklist_id = $1 ORDER BY id DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar fotos do checklist' });
  }
});

app.delete('/checklist/photo/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT url FROM checklist_photos WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Foto não encontrada' });

    const url = rows[0].url;
    const segments = url.split('/');
    const fileName = segments[segments.length - 1].split('.')[0];
    const folder = segments[segments.length - 2];
    const public_id = `${folder}/${fileName}`;

    await cloudinary.uploader.destroy(public_id);
    await pool.query('DELETE FROM checklist_photos WHERE id = $1', [id]);

    res.json({ message: 'Foto do checklist deletada com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar foto do checklist' });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Upload para o Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Salvar URL no PostgreSQL
    const query = 'INSERT INTO images (url) VALUES ($1) RETURNING *';
    const values = [result.secure_url];
    const dbRes = await pool.query(query, values);

    // Retornar JSON com URL e dados do banco
    res.json({ url: result.secure_url, dbEntry: dbRes.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no upload ou banco de dados' });
  }
});

app.get('/images', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM images ORDER BY uploaded_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar imagens' });
  }
});

app.delete('/images/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar a URL no banco
    const { rows } = await pool.query('SELECT url FROM images WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Imagem não encontrada' });

    const url = rows[0].url;

    // Extrair public_id do Cloudinary
    const segments = url.split('/');
    const fileName = segments[segments.length - 1].split('.')[0]; // sem extensão
    const folder = segments[segments.length - 2]; // se usar pasta
    const public_id = `${folder}/${fileName}`;

    await cloudinary.uploader.destroy(public_id);

    // Deletar do banco
    await pool.query('DELETE FROM images WHERE id = $1', [id]);

    res.json({ message: 'Imagem deletada com sucesso' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar imagem' });
  }
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
})

