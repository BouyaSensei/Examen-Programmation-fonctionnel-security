const request = require('supertest');
const app = require('../index');

describe('UserController', () => {
    const userCredentials = {name: 'testuser', password: 'testpassword'};

    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/register')
                .send(userCredentials);

            expect(res.statusCode).toEqual(200);
            expect(res.text).toEqual('Utilisateur enregistré avec succès');
        });
    });

    describe('POST /login', () => {
        it('should login a user successfully', async () => {
            const res = await request(app)
                .post('/login')
                .send(userCredentials);

            expect(res.statusCode).toEqual(200);
            expect(res.text).toEqual('Connexion réussie');
        });
    });
});

describe('ProductController', () => {
    const productDetails = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 200,
        category: 'Updated Category'
    };
    const productId = 19;

    describe('GET /product/:id', () => {
        it('should retrieve a product by id', async () => {
            const res = await request(app).get(`/product/${productId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('ID');
        });
    });

    describe('PUT /products/:id', () => {
        it('should update a product successfully', async () => {
            const res = await request(app)
                .put(`/products/${productId}`)
                .send(productDetails);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Produit modifié avec succès');
        });
    });

    describe('GET /products', () => {
        it('should retrieve all products', async () => {
            const res = await request(app).get('/products');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('POST /products', () => {
        it('should add a new product successfully', async () => {
            const res = await request(app)
                .post('/products')
                .send({
                    product_name: 'Test Product',
                    product_description: 'Test Description',
                    price: 100,
                    category: 'Test Category',
                    image: 'test.jpg'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.text).toEqual('Produit ajouté avec succès');
        });
    });

    describe('DELETE /products/:id', () => {
        it('should delete a product successfully', async () => {
            const res = await request(app).delete(`/products/${productId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Produit supprimé avec succès');
        });
    });

    describe('GET /getProductName', () => {
        it('should retrieve a product name by ID', async () => {
            const res = await request(app)
                .get('/getProductName')
                .send({product_id: productId});

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('libelle');
        });
    });

    describe('POST /getLibelle', () => {
        it('should retrieve a product libelle by ID', async () => {
            const res = await request(app)
                .post('/getLibelle')
                .send({product_id: productId});

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('libelle');
        });
    });
});

describe('CartController', () => {
    const cartDetails = {user_id: 1, product_id: 1, quantity: 1, prix: 100};

    describe('POST /addToCart', () => {
        it('should add a product to the cart successfully', async () => {
            const res = await request(app)
                .post('/addToCart')
                .send(cartDetails);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('message', 'Produit ajouté au panier avec succès');
        });
    });

    describe('GET /getCart', () => {
        it('should retrieve the cart content for a user', async () => {
            const res = await request(app)
                .get('/getCart')
                .query({username: 'testuser'});

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /stats', () => {
        it('should retrieve product statistics', async () => {
            const res = await request(app).get('/stats');
            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            if (res.body.length > 0) {
                expect(res.body[0]).toHaveProperty('Catégorie');
                expect(res.body[0]).toHaveProperty('Nombre');
            }
        });
    });
});
