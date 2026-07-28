// One-off migration: copies each project's existing single `progress` value
// into the new `progressBreakdown.{frontend,backend,database}` fields, so
// existing projects don't suddenly show 0% after the upgrade.
//
// Run once after deploying the new Project schema:
//   node migrate-progress-breakdown.js
require("dotenv").config();
const connectDB = require("./src/config/db");
const Project = require("./src/models/Project");

async function migrate() {
  await connectDB();

  console.log("==================================================");
  console.log("        MIGRATING PROJECT PROGRESS BREAKDOWN      ");
  console.log("==================================================");

  const projects = await Project.find({});
  let updated = 0;

  for (const project of projects) {
    const alreadyMigrated =
      project.progressBreakdown &&
      (project.progressBreakdown.frontend || project.progressBreakdown.backend || project.progressBreakdown.database);

    if (alreadyMigrated) continue;

    const value = project.progress || 0;
    project.progressBreakdown = { frontend: value, backend: value, database: value };
    await project.save();
    updated += 1;
    console.log(`  -> "${project.title}": seeded breakdown at ${value}% each`);
  }

  console.log(`\nDone. Migrated ${updated}/${projects.length} project(s).`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
