const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3001; 


app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/formularioDB')

.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir esquema y modelo
const formularioSchema = new mongoose.Schema({
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fecha: { type: Date, default: Date.now }
});

const Usuario = mongoose.model('Usuario', formularioSchema);

// Endpoint para registrar usuarios
app.post('/api/registro', async (req, res) => {
    try {
        console.log("Datos de registro recibidos:", req.body);

        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
        }

        // Guardar en MongoDB
        const nuevoUsuario = new Usuario({ correo, password });
        await nuevoUsuario.save();

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al guardar el usuario' });
    }
});


// Endpoint para listar usuarios registrados
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find().sort({ fecha: -1 });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

