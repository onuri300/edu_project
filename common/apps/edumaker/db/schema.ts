// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text,index,integer,blob,primaryKey,uniqueIndex} from 'drizzle-orm/sqlite-core';
export const courses=sqliteTable('courses',{id:text('id').primaryKey(),owner:text('owner').notNull(),topic:text('topic').notNull(),payload:text('payload').notNull(),updated:text('updated').notNull()},t=>[index('idx_courses_owner_updated').on(t.owner,t.updated)]);
export const canvaConnections=sqliteTable('canva_connections',{owner:text('owner').primaryKey(),tokens:text('tokens').notNull(),updated:text('updated').notNull()});
export const canvaJobs=sqliteTable('canva_jobs',{id:text('id').primaryKey(),owner:text('owner').notNull(),courseId:text('course_id').notNull(),created:text('created').notNull()},t=>[index('idx_canva_jobs_owner_course').on(t.owner,t.courseId)]);
export const journalCategories=sqliteTable('journal_categories',{id:text('id').primaryKey(),owner:text('owner').notNull(),title:text('title').notNull(),payload:text('payload').notNull(),updated:text('updated').notNull()},t=>[index('idx_journal_categories_owner').on(t.owner,t.updated)]);
export const categoryImages=sqliteTable('category_images',{categoryId:text('category_id').notNull(),slot:integer('slot').notNull(),owner:text('owner').notNull(),mime:text('mime').notNull(),data:blob('data',{mode:'buffer'}).notNull(),caption:text('caption').notNull(),updated:text('updated').notNull()},t=>[primaryKey({columns:[t.categoryId,t.slot]})]);
export const canvaLinks=sqliteTable('canva_links',{id:text('id').primaryKey(),owner:text('owner').notNull(),title:text('title').notNull(),date:text('date').notNull(),url:text('url').notNull(),categoryId:text('category_id').notNull().default(''),created:text('created').notNull()},t=>[index('idx_canva_links_owner_date').on(t.owner,t.date)]);

export const canvaLinkCategories=sqliteTable('canva_link_categories',{id:text('id').primaryKey(),owner:text('owner').notNull(),title:text('title').notNull()},t=>[uniqueIndex('idx_canva_link_category_owner_title').on(t.owner,t.title)]);
