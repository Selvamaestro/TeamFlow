require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const Project = require("./src/models/Project");
const Client = require("./src/models/Client");
const User = require("./src/models/User");

async function seedProjects() {
  await connectDB();

  console.log("==================================================");
  console.log("             SEEDING / UPDATING PROJECTS          ");
  console.log("==================================================");

  // Fetch CEO / Manager user to set as manager creator
  const ceo = await User.findOne({ role: "ceo" });
  if (!ceo) {
    console.error("❌ CEO user not found. Run node seed.js first.");
    process.exit(1);
  }

  // Fetch clients
  const acmeClient = await Client.findOne({ company: "Acme" }) || await Client.findOne({});
  const abcdClient = await Client.findOne({ company: "ABCD" }) || acmeClient;
  const masteroClient = await Client.findOne({ company: "Masterominds" }) || acmeClient;

  // Sample projects data
  const projectsData = [
    {
      title: "Enterprise ERP Implementation",
      description: "Full-scale ERP rollout including finance, HR, supply chain modules, and custom data migration.",
      client: acmeClient ? acmeClient._id : null,
      status: "completed",
      startDate: new Date("2026-01-10"),
      endDate: new Date("2026-06-30"),
      dueDate: new Date("2026-06-30"),
      budget: 150000,
      revenue: 150000,
      expenses: 92000,
      paidAmount: 150000,
      pendingAmount: 0,
      paymentStatus: "Paid",
      manager: ceo._id,
    },
    {
      title: "Cloud Infrastructure Migration",
      description: "AWS cloud migration, Kubernetes containerization, and zero-downtime database cutover.",
      client: abcdClient ? abcdClient._id : acmeClient._id,
      status: "completed",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-05-15"),
      dueDate: new Date("2026-05-15"),
      budget: 85000,
      revenue: 85000,
      expenses: 48000,
      paidAmount: 85000,
      pendingAmount: 0,
      paymentStatus: "Paid",
      manager: ceo._id,
    },
    {
      title: "Mobile Banking Application",
      description: "iOS & Android mobile banking app with biometric authentication and real-time transaction alerts.",
      client: masteroClient ? masteroClient._id : acmeClient._id,
      status: "completed",
      startDate: new Date("2025-11-01"),
      endDate: new Date("2026-04-20"),
      dueDate: new Date("2026-04-20"),
      budget: 120000,
      revenue: 120000,
      expenses: 75000,
      paidAmount: 120000,
      pendingAmount: 0,
      paymentStatus: "Paid",
      manager: ceo._id,
    },
    {
      title: "AI Customer Analytics Platform",
      description: "Real-time analytics engine leveraging ML models for customer churn prediction and segment insights.",
      client: acmeClient ? acmeClient._id : null,
      status: "in_progress",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-10-31"),
      dueDate: new Date("2026-10-31"),
      budget: 95000,
      revenue: 95000,
      expenses: 42000,
      paidAmount: 50000,
      pendingAmount: 45000,
      paymentStatus: "Partial",
      manager: ceo._id,
    },
    {
      title: "E-Commerce Portal Revamp",
      description: "Next.js frontend revamp with headless Shopify integration and optimized checkout flow.",
      client: abcdClient ? abcdClient._id : acmeClient._id,
      status: "planning",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-12-15"),
      dueDate: new Date("2026-12-15"),
      budget: 60000,
      revenue: 60000,
      expenses: 12000,
      paidAmount: 0,
      pendingAmount: 60000,
      paymentStatus: "Pending",
      manager: ceo._id,
    },
    {
      title: "test project",
      description: "testing",
      client: acmeClient ? acmeClient._id : null,
      status: "planning",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-11-30"),
      dueDate: new Date("2026-11-30"),
      budget: 50000,
      revenue: 50000,
      expenses: 20000,
      paidAmount: 25000,
      pendingAmount: 25000,
      paymentStatus: "Partial",
      manager: ceo._id,
    },
    {
      title: "test 2",
      description: "test 2",
      client: abcdClient ? abcdClient._id : acmeClient._id,
      status: "planning",
      startDate: new Date("2026-07-15"),
      endDate: new Date("2026-12-01"),
      dueDate: new Date("2026-12-01"),
      budget: 50000,
      revenue: 50000,
      expenses: 18000,
      paidAmount: 10000,
      pendingAmount: 40000,
      paymentStatus: "Partial",
      manager: ceo._id,
    },
  ];

  for (const item of projectsData) {
    const existing = await Project.findOne({ title: item.title });
    if (existing) {
      console.log(`Updating existing project: "${item.title}"`);
      Object.assign(existing, item);
      await existing.save();
    } else {
      console.log(`Creating new project: "${item.title}" (${item.status})`);
      await Project.create(item);
    }
  }

  console.log("==================================================");
  console.log("       PROJECT SEEDING COMPLETE SUCCESSFULLY      ");
  console.log("==================================================");

  await mongoose.disconnect();
  process.exit(0);
}

seedProjects().catch((err) => {
  console.error("❌ Seeding projects failed:", err);
  process.exit(1);
});
