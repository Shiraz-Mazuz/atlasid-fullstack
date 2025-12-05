
const knex = require('knex');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
});

async function initDb() {
  const exists = await db.schema.hasTable('users');
  if (!exists) {
    console.log('Creating users table...');
    await db.schema.createTable('users', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.enu('role', ['admin', 'user']).notNullable().defaultTo('user');
      table.timestamps(true, true); 
    });

    console.log('Seeding admin user...');
    const hash = await bcrypt.hash('admin123', 10);
    await db('users').insert({
      name: 'Admin',
      email: 'admin@atlasid.com',
      password_hash: hash,
      role: 'admin',
    });
    console.log('Admin user created: admin@atlasid.com / admin123');
  }
}

module.exports = { db, initDb };
