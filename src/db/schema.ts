import { pgTable, uuid, text, timestamp, boolean, varchar, pgEnum, integer, decimal } from "drizzle-orm/pg-core";

// Enums
export const projectStatusEnum = pgEnum("project_status", ["DRAFT", "PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]);
export const projectHealthEnum = pgEnum("project_health", ["STABLE", "AT_RISK", "CRITICAL", "ON_TRACK"]);
export const taskStatusEnum = pgEnum("task_status", ["DRAFT", "ASSIGNED", "IN_PROGRESS", "BLOCKED", "REVIEW", "COMPLETED", "ARCHIVED"]);
export const issueStatusEnum = pgEnum("issue_status", ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]);
export const riskStatusEnum = pgEnum("risk_status", ["IDENTIFIED", "ASSESSED", "MITIGATED", "ACCEPTED", "CLOSED"]);
export const priorityEnum = pgEnum("priority", ["LOW", "MEDIUM", "HIGH", "URGENT"]);

// Projects Table (Root Aggregate)
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("DRAFT").notNull(),
  health: projectHealthEnum("health").default("ON_TRACK").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  managerId: varchar("manager_id", { length: 255 }), // User ID from Firebase
  clientName: varchar("client_name", { length: 255 }),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 12, scale: 2 }).default("0"),
  healthScore: integer("health_score").default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Tasks Table
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("DRAFT").notNull(),
  priority: priorityEnum("priority").default("MEDIUM").notNull(),
  assigneeId: varchar("assignee_id", { length: 255 }),
  dueDate: timestamp("due_date"),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }).default("0"),
  completionPercentage: integer("completion_percentage").default(0),
  parentId: uuid("parent_id"), // For WBS / Subtasks
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Issues & Risks Table
export const risksAndIssues = pgTable("risks_and_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'ISSUE' or 'RISK'
  status: varchar("status", { length: 50 }).notNull(), // Polymorphic based on type
  priority: priorityEnum("priority").default("MEDIUM").notNull(),
  ownerId: varchar("owner_id", { length: 255 }),
  mitigationPlan: text("mitigation_plan"),
  impact: text("impact"),
  probability: integer("probability"), // 1-100 for Risks
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Deliverables & Documents
export const deliverables = pgTable("deliverables", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).default("PENDING").notNull(),
  dueDate: timestamp("due_date"),
  fileUrl: text("file_url"),
  version: varchar("version", { length: 50 }).default("1.0.0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit Log
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id),
  userId: varchar("user_id", { length: 255 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat Messages
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id).notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
