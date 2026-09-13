import { pgTable, integer, varchar, text, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';

// 1. Users Table
export const users = pgTable('users', {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    name: varchar('name', { length: 100 }).notNull(),
    title: varchar('title', { length: 100 }),
    level: integer('level').default(1),
    xp: integer('xp').default(0),
    coins: integer('coins').default(0),
});

export const quests = pgTable('quests', {
    id: varchar('id', { length: 255 }).primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    category: varchar('category', { length: 100 }),
    stat: varchar('stat', { length: 100 }),
    duration: varchar('duration', { length: 50 }),
    difficulty: varchar('difficulty', { length: 50 }),
    rarity: varchar('rarity', { length: 50 }),
    xp: integer('xp'),
    completed: boolean('completed').default(false),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    scheduledDate: varchar('scheduled_date', { length: 50 }),
    isEveryday: boolean('is_everyday').default(false),
});


// 2. Items Table
export const items = pgTable('items', {
    id: varchar('id', { length: 20 }).primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    itemType: varchar('item_type', { length: 50 }).notNull(),
    rarity: varchar('rarity', { length: 20 }).notNull(),
    icon: varchar('icon', { length: 10 }),
    stats: varchar('stats', { length: 100 }),
    sellPrice: integer('sell_price').default(0),
});

export const userInventories = pgTable('user_inventories', {
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
    itemId: varchar('item_id', { length: 20 }).references(() => items.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').default(1).notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => [
    primaryKey({ columns: [table.userId, table.itemId] })
]);
