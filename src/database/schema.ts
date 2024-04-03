import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const usersTable = sqliteTable('users', {
  id: integer('id').notNull().primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

const todosTable = sqliteTable('todos', {
  id: integer('id').notNull().primaryKey(),
  userId: integer('userId')
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  todo: text('todo').notNull(),
  createdAt: text('createdAt').notNull().$defaultFn(new Date().toUTCString),
  updatedAt: text('updatedAt').notNull().$defaultFn(new Date().toUTCString),
  finishedAt: text('finishedAt'),
});

export { usersTable, todosTable };
