import { prisma } from "./lib/prisma";
import { app } from "./src/app";

const startServer = async () => {
  try {
    console.log("Connecting to database...");
    await prisma.$connect();

    // Verify DB connection is real
    await prisma.$queryRaw`SELECT 1`;


    console.log("✅ Real DB connection verified.");

    app.listen(process.env.PORT || 5000, () => {
      console.log(
        `🚀 Server running on http://localhost:${process.env.PORT || 5000}`
      );
    });
  } catch (error) {
    console.error("❌ Real DB connection FAILED:", error);
    process.exit(1);
  }
};

startServer();
