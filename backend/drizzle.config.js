import { defineConfig } from 'drizzle-kit';
import 'dotenv/config'; // Loads your DATABASE_URL from .env

export default defineConfig({
    out: './drizzle',         // Where migration SQL files will be saved
    schema: './src/db/schema.js', // Where you will define your tables
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});
