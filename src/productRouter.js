const express = require('express');
const expressHandlebars = require('express-handlebars'); // Agregar Handlebars
const socketIo = require('socket.io'); // Agregar Socket.IO

module.exports = (productManager, io) => {
    const router = express.Router();

    // Endpoint para obtener la vista de productos en tiempo real
    router.get('/realtimeproducts', (req, res) => {
        const products = productManager.getProducts();
        res.render('realTimeProducts', { products });
    });

    // Endpoint para obtener todos los productos
    router.get('/', async (req, res) => {
        const limit = req.query.limit;
        try {
            const products = await productManager.getProducts(limit);
            res.json(products);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    // Endpoint para obtener un producto por su ID
    router.get('/:pid', async (req, res) => {
        const productId = parseInt(req.params.pid);
        try {
            const product = await productManager.getProductById(productId);
            res.json(product);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    // Endpoint para agregar un nuevo producto
    router.post('/', (req, res) => {
        try {
            const newProduct = req.body;
            productManager.addProduct(newProduct);
            io.emit('productsList', productManager.getProducts());
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Endpoint para actualizar un producto por su ID
    router.put('/:pid', (req, res) => {
        const productId = parseInt(req.params.pid);
        try {
            const updatedProduct = req.body;
            productManager.updateProduct(productId, updatedProduct);
            io.emit('productsList', productManager.getProducts());
            res.json(updatedProduct);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    // Endpoint para eliminar un producto por su ID
    router.delete('/:pid', (req, res) => {
        const productId = parseInt(req.params.pid);
        try {
            productManager.deleteProduct(productId);
            io.emit('productsList', productManager.getProducts());
            res.status(204).end();
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    });

    return router;
};
