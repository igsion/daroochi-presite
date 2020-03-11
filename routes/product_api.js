var express = require('express');
var router = express.Router();
const {Client} = require('pg');
const client = new Client({
    user: 'kaveh',
    host: 'localhost',
    database: 'daroochi',
    password: "bandangoshti",
    port: 5432,
});
var multer = require('multer');
var path = require('path');
const fs = require('fs');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
    }
});
var upload = multer({storage: storage});

try {
    client.connect();
    client.query("create table IF NOT exists Product  (\n" +
        "\tid SERIAL PRIMARY KEY,\n" +
        "\tCategory  VARCHAR(50),\n" +
        "\tGenre VARCHAR(50),\n" +
        "\tSubCategory VARCHAR(50),\n" +
        "\tName VARCHAR(50),\n" +
        "\tFA_Name VARCHAR(50),\n" +
        "\tBarcode VARCHAR(50),\n" +
        "\tImage VARCHAR(50),\n" +
        "\tCompany VARCHAR(50),\n" +
        "\tCountry VARCHAR(50),\n" +
        "\tDescription VARCHAR(50),\n" +
        "\tWarning  TEXT,\n" +
        "\tAmount INT,\n" +
        "\tColor VARCHAR(50),\n" +
        "\tAmountPerPack INT,\n" +
        "\tSize VARCHAR(50),\n" +
        "\tVolume VARCHAR(50),\n" +
        "\tShape VARCHAR(7),\n" +
        "\tPrice VARCHAR(50),\n" +
        "\tDiscount_Price VARCHAR(50),\n" +
        "\tRating  DECIMAL(2,1),\n" +
        "\tPoints INT,\n" +
        "\tQty INT\n" +
        ");" ,
        (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                console.log(res);
            }
        });
    // client.query("CREATE TABLE account(\n" +
    //     "   user_id serial PRIMARY KEY,\n" +
    //     "   username VARCHAR (50) UNIQUE NOT NULL,\n" +
    //     "   password VARCHAR (50) NOT NULL,\n" +
    //     "   email VARCHAR (355) UNIQUE NOT NULL,\n" +
    //     "   created_on TIMESTAMP NOT NULL,\n" +
    //     "   last_login TIMESTAMP\n" +
    //     ");\n" , (err , res) => {
    //     if(err){
    //         console.log(err.stack);
    //     }else{
    //         console.log(res);
    //     }
    // });
} catch (error) {
    console.log(error);
}

// Get Products
// router.get('/:search' , async (req , res) => {
//     try {
//         const products = await loadProductsCollection(req.params.search);
//         res.send(products);
//     }catch (error) {
//         res.send("Error happened during sending getting data " + error.stack);
//     }
// });

// Get All Products
router.get('/', async (req, res) => {
    try {
        var products = await loadAllProducts();
        res.header("Access-Control-Allow-Origin", "*");
        res.send(products);
    } catch (error) {
        res.send("Error happened during sending getting data " + error.stack);
    }
});

// Add an product
router.post('/', upload.single("image"), (req, res) => {
    var item = req.body;
    try {
        const text = 'INSERT INTO Product( Category , Genre, SubCategory, Name, FA_Name, Barcode,' +
            'Image, Company, Country, Description, Color, AmountPerPack, Size, Volume, Shape, Price , Warning, Qty) VALUES(' +
            '$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)';
        const values = [item.category, item.genre, item.subCategory, item.englishName, item.name, item.barcode,
            req.file.filename, item.brand, item.country, item.description, item.color,
            item.amountPerPack, item.size, item.volume, item.shape, item.price , item.warning , item.Qty];
        client.query(text, values, (err, response) => {
            if(err){
                console.log(err.stack);
            }else{
                res.send("Product stored");
                console.log(response);
            }
        })
    } catch (error) {
        res.send("Error happened " + error.stack.toString());
    }
});

// Delete an product
router.delete('/', (req, res) => {
    try {
        var text = 'DELETE FROM products WHERE id = $1';
        var value = [req.body];
        return client.query(text, value);
    } catch (error) {
        console.log(error.stack);
        return error;
    }
});

async function loadProductsCollection(searchedText) {
    try {
        var text = 'SELECT * FROM products WHERE to_tsvector(CategoryEng || \' \' || CategoryEng || \' \' || ' +
            'CategoryEng || \' \' || CategoryEng)';
        var value = [searchedText];
        await client.query(text, value, (err, res) => {
            return res;
        });
    } catch (error) {
        console.log(error.stack);
        return error;
    }
}

async function loadAllProducts() {
    console.log(1);
    try {
        console.log(2);
        var text = 'SELECT * FROM "product"';
        var res = await client.query(text, "");
        console.log(3);
        return res.rows;
    } catch (error) {
        console.log(error.stack);
        return error;
    }
}

module.exports = router;
