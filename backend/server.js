const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sequelize = new Sequelize('products_db', 'bert6', '123', {
    host: '192.168.214.2',
    dialect: 'postgres',
});

const Inventory = sequelize.define('inventory', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    date_added: {
        type: DataTypes.DATE,
        allowNull: false,
    },
});

sequelize.sync(); // Tabloyu oluşturmak için

app.post('/addProduct', async (req, res) => {
    const { name, quantity, price } = req.body;
    const date_added = new Date();

    try {
        const newProduct = await Inventory.create({ name, quantity, price, date_added });
        res.json({ success: true, newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.get('/getInventory', async (req, res) => {
    try {
        const inventory = await Inventory.findAll();
        res.json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/updateProduct/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, quantity, price } = req.body;

    try {
        const updatedProduct = await Inventory.update(
            { name, quantity, price },
            { where: { id: productId } }
        );
        res.json({ success: true, updatedProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

const deleteProduct = async (id) => {
    try {
        await axios.delete(`http://localhost:3001/deleteProduct/${id}`);
        fetchInventory();
    } catch (error) {
        console.error(error.response.data);
        alert('Ürün silinirken bir hata oluştu.');
    }
};

app.delete('/deleteProduct/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const deletedProduct = await Inventory.destroy({
            where: {
                id: productId
            }
        });

        if (deletedProduct) {
            res.json({ success: true, message: 'Product deleted successfully' });
        } else {
            res.status(404).json({ success: false, error: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
