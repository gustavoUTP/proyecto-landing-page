const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3001; // puerto para el backend

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/formularioDB')

.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir esquema y modelo
const formularioSchema = new mongoose.Schema({
    nombre: String,
    correo: String,
    mensaje: String,
    fecha: { type: Date, default: Date.now }
});

const Formulario = mongoose.model('Formulario', formularioSchema);

// Endpoint para guardar datos
app.post('/api/formulario', async (req, res) => {
    try {
        console.log("Datos recibidos en el backend:", req.body); // 👈 Log útil

        const { nombre, correo, mensaje } = req.body;
        const nuevoRegistro = new Formulario({ nombre, correo, mensaje });

        await nuevoRegistro.save();

        res.status(201).json({ message: 'Formulario guardado con éxito' });
    } catch (error) {
        console.error('Error al guardar:', error);
        res.status(500).json({ message: 'Error al guardar en la base de datos' });
    }
});


// Endpoint para listar datos (opcional, por si luego quieres mostrar lo que se guardó)
app.get('/api/formulario', async (req, res) => {
    try {
        const registros = await Formulario.find().sort({ fecha: -1 });
        res.json(registros);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los registros' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

