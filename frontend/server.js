const express = require('express');
const path = require('path');

const app = express();
const PORT = 5500;

// Servir todos los archivos estáticos de la carpeta frontend
app.use(express.static(__dirname));

// Servir index.html para cualquier ruta que no sea un archivo específico
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend corriendo en http://localhost:${PORT}`);
});
