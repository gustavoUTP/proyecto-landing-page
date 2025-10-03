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

// modelo de usuario (login)    
const formularioSchema = new mongoose.Schema({
    nombre: {type: String},
    correo: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol:{ type: String, enum: ['user', 'admin'], default: 'user'},
    fecha: { type: Date, default: Date.now }
});

const Usuario = mongoose.model('Usuario', formularioSchema);

// modelo de suscripciones
const suscripcionSchema = new mongoose.Schema({
    codigo: {type:String, unique: true},
    nombreApellido: {type: String, required: true},
    correo:{type: String, required: true},
    telefono:{type:String, required: true},
    plan:{type: String, enum: ['basico', 'intermedio', 'premium'],required:true},
    fechaRegistro:{type:Date, default: Date.now}
})
const Suscripcion = mongoose.model('Suscripcion',suscripcionSchema);

// Endpoint para registrar usuarios
app.post('/api/registro', async (req, res) => {
    try {
        console.log("Datos de registro recibidos:", req.body);

        const { nombre, correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
        }

        // Guardar en MongoDB
        const nuevoUsuario = new Usuario({ nombre, correo, password, rol: 'user' });
        await nuevoUsuario.save();

        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error al guardar el usuario' });
    }
});

//Endpoint Guardar suscripcion
app.post('/api/suscripciones', async (req, res) => {
    try {
        console.log("Datos de Subscripcion recibidos:", req.body);

        const { nombreApellido, correo, telefono, plan } = req.body;
        if (!nombreApellido || !correo || !telefono || !plan) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }

        // Obtener la última suscripción para generar el código
        const ultimaSuscripcion = await Suscripcion.findOne().sort({ fechaRegistro: -1 });
        let nuevoCodigo = "S0001";

        if (ultimaSuscripcion && ultimaSuscripcion.codigo) {
            // Extraer número del código anterior
            const numero = parseInt(ultimaSuscripcion.codigo.substring(1)) + 1;
            nuevoCodigo = "S" + numero.toString().padStart(4, '0');
        }

        const nuevaSuscripcion = new Suscripcion({
            codigo: nuevoCodigo,
            nombreApellido,
            correo,
            telefono,
            plan
        });

        await nuevaSuscripcion.save();
        res.status(201).json({ message: 'Suscripción registrada con éxito', codigo: nuevoCodigo });

    } catch (error) {
        console.error('Error al registrar suscripción:', error);
        res.status(500).json({ message: 'Error al guardar la suscripción' });
    }
});

// Endpoint para listar usuarios registrados
app.get('/api/suscripciones', async (req, res) => {
    try {
        const suscripciones = await Suscripcion.find().sort({ fechaRegistro: -1 });
        res.json(suscripciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las suscripciones' });
    }
})

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

// Endpoint de Login
app.post('/api/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({ message: 'Correo y contraseña requeridos' });
        }

        // Buscar usuario por correo y password
        const usuario = await Usuario.findOne({ correo, password });

        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Si es correcto, devolvemos su info básica
        res.json({
            message: 'Inicio de sesión exitoso',
            nombre: usuario.nombre,
            rol: usuario.rol
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});
