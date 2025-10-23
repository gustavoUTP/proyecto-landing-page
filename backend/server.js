const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
    origin: 'https://mi-landing-page.netlify.app', // reemplaza con tu URL de Netlify
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// ===== Conexión a MongoDB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));
// ===== MODELOS =====

// --- Modelo de cursos ---
const cursoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  titulo: { type: String, required: true },
  descripcion: { type: String, required: true },
  nivel: { type: String, enum: ['Básico', 'Intermedio', 'Avanzado'], required: true },
  estado: { type: String, enum: ['pendiente', 'en progreso', 'completado'], default: 'pendiente' },
  imagen: { type: String }
});
const Curso = mongoose.model('Curso', cursoSchema);

// --- Modelo de usuario ---
const formularioSchema = new mongoose.Schema({
  nombre: { type: String },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['user', 'admin'], default: 'user' },
  fecha: { type: Date, default: Date.now },
  cursos: [{
    id: String,
    titulo: String,
    descripcion: String,
    nivel: String,
    estado: { type: String, enum: ['pendiente', 'en progreso', 'completado'], default: 'pendiente' },
    imagen: String
  }]
});
const Usuario = mongoose.model('Usuario', formularioSchema);

// --- Modelo de suscripción ---
const suscripcionSchema = new mongoose.Schema({
  codigo: { type: String, unique: true },
  nombreApellido: { type: String, required: true },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
  plan: { type: String, enum: ['basico', 'intermedio', 'premium'], required: true },
  precio: { type: Number, required: true },
  fechaRegistro: { type: Date, default: Date.now }
});
const Suscripcion = mongoose.model('Suscripcion', suscripcionSchema);


// ===== ENDPOINTS =====

// --- Registro de usuario con cursos base ---
app.post('/api/registro', async (req, res) => {
  try {
    console.log("📩 Datos de registro recibidos:", req.body);
    const { nombre, correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }

    // Obtener cursos base
    const cursosBase = await Curso.find();
    const cursosAsignados = cursosBase.map(c => ({
      id: c.id,
      titulo: c.titulo,
      descripcion: c.descripcion,
      nivel: c.nivel,
      estado: 'pendiente',
      imagen: c.imagen
    }));

    // Crear nuevo usuario con cursos incluidos
    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      password,
      rol: 'user',
      cursos: cursosAsignados
    });

    await nuevoUsuario.save();
    res.status(201).json({ message: 'Usuario registrado con éxito', usuario: nuevoUsuario });

  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al guardar el usuario' });
  }
});

// --- Endpoint de login ---
app.post('/api/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: 'Correo y contraseña requeridos' });
    }

    const usuario = await Usuario.findOne({ correo, password });

    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    res.json({
      message: 'Inicio de sesión exitoso',
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// --- Guardar suscripción ---
app.post('/api/suscripciones', async (req, res) => {
  try {
    const { nombreApellido, correo, telefono, plan, precio } = req.body;
    if (!nombreApellido || !correo || !telefono || !plan || !precio) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const ultimaSuscripcion = await Suscripcion.findOne().sort({ codigo: -1 });
    let nuevoCodigo = "S0001";

    if (ultimaSuscripcion && ultimaSuscripcion.codigo) {
      const numero = parseInt(ultimaSuscripcion.codigo.substring(1)) + 1;
      nuevoCodigo = "S" + numero.toString().padStart(4, '0');
    }

    const nuevaSuscripcion = new Suscripcion({
      codigo: nuevoCodigo,
      nombreApellido,
      correo,
      telefono,
      plan,
      precio
    });

    await nuevaSuscripcion.save();
    res.status(201).json({ message: 'Suscripción registrada con éxito', codigo: nuevoCodigo });

  } catch (error) {
    console.error('Error al registrar suscripción:', error);
    res.status(500).json({ message: 'Error al guardar la suscripción' });
  }
});

// --- Obtener todas las suscripciones ---
app.get('/api/suscripciones', async (req, res) => {
  try {
    const suscripciones = await Suscripcion.find().sort({ fechaRegistro: -1 });
    res.json(suscripciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las suscripciones' });
  }
});

// --- Obtener todos los cursos (para admin o testing) ---
app.get('/api/cursos', async (req, res) => {
  try {
    const cursos = await Curso.find();
    res.json(cursos);
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    res.status(500).json({ message: 'Error al obtener los cursos' });
  }
});

// --- Obtener cursos del usuario ---
app.get('/api/usuario/:correo/cursos', async (req, res) => {
  try {
    const { correo } = req.params;
    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(usuario.cursos);
  } catch (error) {
    console.error('Error al obtener cursos del usuario:', error);
    res.status(500).json({ message: 'Error al obtener cursos del usuario' });
  }
});

// --- Actualizar estado de un curso del usuario ---
app.put('/api/usuario/:correo/curso/:id', async (req, res) => {
  try {
    const { correo, id } = req.params;
    const { estado } = req.body;

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    const curso = usuario.cursos.find(c => c.id === id);
    if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });

    curso.estado = estado;
    await usuario.save();

    res.json({ message: 'Estado del curso actualizado', curso });
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({ message: 'Error al actualizar curso' });
  }
});

// --- Obtener datos del administrador ---
app.get('/api/admin/datos', async (req, res) => {
  try {
    // Busca el primer usuario con rol 'admin'
    const admin = await Usuario.findOne({ rol: 'admin' }).select('-password');
    if (!admin) return res.status(404).json({ error: 'Administrador no encontrado' });

    res.json(admin);
  } catch (err) {
    console.error('❌ Error al obtener datos del admin:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ===== Iniciar servidor =====
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
