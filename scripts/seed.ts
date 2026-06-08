import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/task-collab";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db!;

  // Clear existing data
  await db.dropDatabase();
  console.log("Database cleared");

  // Create users
  const passwordHash = await bcrypt.hash("demo123", 12);

  const users = await db.collection("users").insertMany([
    { name: "Admin User", email: "admin@example.com", passwordHash, role: "ADMIN", createdAt: new Date(), updatedAt: new Date() },
    { name: "Sarah Manager", email: "manager@example.com", passwordHash, role: "PROJECT_MANAGER", createdAt: new Date(), updatedAt: new Date() },
    { name: "John Developer", email: "john@example.com", passwordHash, role: "TEAM_MEMBER", createdAt: new Date(), updatedAt: new Date() },
    { name: "Jane Designer", email: "jane@example.com", passwordHash, role: "TEAM_MEMBER", createdAt: new Date(), updatedAt: new Date() },
    { name: "Demo User", email: "demo@example.com", passwordHash, role: "ADMIN", createdAt: new Date(), updatedAt: new Date() },
  ]);

  const userIds = Object.values(users.insertedIds);
  console.log(`Created ${userIds.length} users`);

  // Create projects
  const projects = await db.collection("projects").insertMany([
    {
      name: "Website Redesign",
      description: "Complete overhaul of the company website with modern design and improved UX",
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      createdBy: userIds[1],
      members: [userIds[0], userIds[1], userIds[2], userIds[3]],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Mobile App MVP",
      description: "Build a mobile application for iOS and Android with core features",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      createdBy: userIds[1],
      members: [userIds[1], userIds[2]],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Admin Dashboard",
      description: "Internal admin panel for managing users, content, and analytics",
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      createdBy: userIds[0],
      members: [userIds[0], userIds[2], userIds[3]],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "E-Commerce App",
      description: "Full-featured online store with payment integration",
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      status: "ON_HOLD",
      createdBy: userIds[0],
      members: [userIds[0], userIds[1], userIds[2], userIds[3]],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const projectIds = Object.values(projects.insertedIds);
  console.log(`Created ${projectIds.length} projects`);

  // Create tasks
  const tasks = await db.collection("tasks").insertMany([
    // Website Redesign tasks
    { projectId: projectIds[0], title: "Homepage Design", description: "Design new homepage layout", assigneeId: userIds[3], dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), priority: "HIGH", status: "COMPLETED", attachments: [], createdAt: new Date(), updatedAt: new Date() },
    { projectId: projectIds[0], title: "Setup API", description: "Configure REST API endpoints", assigneeId: userIds[2], dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), priority: "HIGH", status: "IN_PROGRESS", attachments: [], createdAt: new Date(), updatedAt: new Date() },
    { projectId: projectIds[0], title: "User Authentication", description: "Implement login/signup flow", assigneeId: userIds[2], dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), priority: "MEDIUM", status: "TODO", attachments: [], createdAt: new Date(), updatedAt: new Date() },
    { projectId: projectIds[0], title: "Responsive Design", description: "Make all pages mobile-friendly", assigneeId: userIds[3], dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), priority: "MEDIUM", status: "TODO", attachments: [], createdAt: new Date(), updatedAt: new Date() },
    { projectId: projectIds[0], title: "Performance Optimization", description: "Optimize load times and Core Web Vitals", assigneeId: userIds[2], dueDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000), priority: "LOW", status: "TODO", attachments: [], createdAt: new Date(), updatedAt: new Date() },

    // Mobile App tasks
    { projectId: projectIds[1], title: "App Architecture", description: "Design system architecture and tech stack", assigneeId: userIds[2], dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), priority: "HIGH", status: "COMPLETED", attachments: [], createdAt: new Date(), updatedAt: new Date() },
    { projectId: projectIds[1], title: "UI Kit Design", description: "Create reusable component library", assigneeId: userIds[3], dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), priority: "HIGH", status: "COMPLETED", attachments: [], createdAt: new Date(), updatedAt: new Date() },
    { projectId: projectIds[1], title: "Push Notifications", description: "Implement push notification service", assigneeId: userIds[2], dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), priority: "MEDIUM", status: "IN_PROGRESS", attachments: [], createdAt: new Date(), updatedAt: new Date() },
    { projectId: projectIds[1], title: "App Store Submission", description: "Prepare and submit to app stores", assigneeId: userIds[1], dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), priority: "LOW", status: "TODO", attachments: [], createdAt: new Date(), updatedAt: new Date() },

    // Admin Dashboard tasks
    { projectId: projectIds[2], title: "Dashboard Layout", description: "Create the main dashboard grid layout", assigneeId: userIds[2], dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), priority: "HIGH", status: "IN_PROGRESS", attachments: [], createdAt: new Date(), updatedAt: new Date() },
    { projectId: projectIds[2], title: "User Management", description: "Build CRUD for user accounts", assigneeId: userIds[2], dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), priority: "HIGH", status: "TODO", attachments: [], createdAt: new Date(), updatedAt: new Date() },
    { projectId: projectIds[2], title: "Analytics Charts", description: "Integrate chart library with real data", assigneeId: userIds[3], dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), priority: "MEDIUM", status: "TODO", attachments: [], createdAt: new Date(), updatedAt: new Date() },

    // Overdue task
    { projectId: projectIds[0], title: "SEO Audit", description: "Complete SEO review and fix issues", assigneeId: userIds[3], dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), priority: "HIGH", status: "IN_PROGRESS", attachments: [], createdAt: new Date(), updatedAt: new Date() },
  ]);

  console.log(`Created ${Object.keys(tasks.insertedIds).length} tasks`);

  // Create activities
  const activities = [
    { action: "PROJECT_CREATED", message: 'Project "E-Commerce App" created', userId: userIds[0], projectId: projectIds[3], createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    { action: "TASK_ASSIGNED", message: 'Task "Setup API" assigned to John', userId: userIds[1], projectId: projectIds[0], createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    { action: "TASK_STATUS_CHANGED", message: 'Task "Homepage Design" marked as Completed', userId: userIds[3], projectId: projectIds[0], createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    { action: "MEMBER_ADDED", message: 'Member added to "Dashboard Project"', userId: userIds[0], projectId: projectIds[2], createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
    { action: "TASK_CREATED", message: 'Task "Push Notifications" created', userId: userIds[1], projectId: projectIds[1], createdAt: new Date(Date.now() - 30 * 60 * 1000) },
  ];

  await db.collection("activities").insertMany(activities);
  console.log(`Created ${activities.length} activities`);

  // Create indexes
  await db.collection("tasks").createIndex({ projectId: 1, title: 1 }, { unique: true });
  await db.collection("tasks").createIndex({ projectId: 1, status: 1 });
  await db.collection("tasks").createIndex({ assigneeId: 1, status: 1 });
  await db.collection("tasks").createIndex({ dueDate: 1 });
  await db.collection("activities").createIndex({ createdAt: -1 });
  await db.collection("notifications").createIndex({ userId: 1, read: 1, createdAt: -1 });
  console.log("Indexes created");

  console.log("\n✓ Seed complete!");
  console.log("\nDemo accounts:");
  console.log("  Admin:           admin@example.com / demo123");
  console.log("  Project Manager: manager@example.com / demo123");
  console.log("  Team Member:     john@example.com / demo123");
  console.log("  Demo (Admin):    demo@example.com / demo123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
