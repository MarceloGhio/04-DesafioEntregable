const express = require('express');
const expressHandlebars = require('express-handlebars'); // Agregar Handlebars
const http = require('http'); // Agregar HTTP para websockets
const socketIo = require('socket.io'); // Agregar Socket.IO

const ProductManager = require('./ProductManager');
const CartManager = require('./CartManager');
const app = express();
const server = http.createServer(app); // Crear el servidor HTTP
const io = socketIo(server); // Crear una instancia de Socket.IO
const port = 8088;

// Configurar Handlebars
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Agregar una ruta de inicio en app.js
app.get('/', (req, res) => {
    res.send('¡Bienvenido a la aplicación de gestión de productos y carritos!');
});

// Crear una instancia de ProductManager y CartManager
const productManager = new ProductManager('./products.json');
const cartManager = new CartManager('./carts.json');

// Configurar middleware para manejar JSON
app.use(express.json());

// Rutas de productos
const productRouter = require('./productRouter')(productManager, io); // Agregar 'io' para websockets
app.use('/api/products', productRouter);

// Rutas de carritos
const cartRouter = require('./cartRouter')(cartManager, io); // Agregar 'io' para websockets
app.use('/api/carts', cartRouter);

// Enviar la lista de productos a través de websockets
io.on('connection', (socket) => {
    console.log('Cliente conectado');
    socket.on('requestProducts', () => {
        socket.emit('productsList', productManager.getProducts());
    });
});

// Iniciar el servidor
server.listen(port, () => {
    console.log(`Servidor Express corriendo en el puerto ${port}`);
});