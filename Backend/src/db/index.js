const { Pool } = require('pg');
require('dotenv').config();

/* pool gestion de conexiones a postgre*/
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

/*recibe un query string y un array de valores*/
const query = (text, params) => {
    return pool.query(text, params);
};

module.exports = {
    query,
    pool, 
};