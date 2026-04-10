/**
 * Get system statistics.
 * Input:  {}
 * Output: { stats: { dogs, users, follows, adoptions, updates } }
 */
import "dotenv/config";
import prisma from "../lib/prisma";

async function main() {
  const [
    totalDogs,
    availableDogs,
    adoptedDogs,
    totalUsers,
    totalFollows,
    pendingAdoptions,
    approvedAdoptions,
    totalUpdates,
  ] = await Promise.all([
    prisma.dog.count(),
    prisma.dog.count({ where: { status: "AVAILABLE" } }),
    prisma.dog.count({ where: { status: "ADOPTED" } }),
    prisma.user.count(),
    prisma.follow.count(),
    prisma.adoption.count({ where: { status: "pending" } }),
    prisma.adoption.count({ where: { status: "approved" } }),
    prisma.dogUpdate.count(),
  ]);

  console.log(
    JSON.stringify({
      stats: {
        dogs: { total: totalDogs, available: availableDogs, adopted: adoptedDogs },
        users: { total: totalUsers },
        follows: { total: totalFollows },
        adoptions: { pending: pendingAdoptions, approved: approvedAdoptions },
        updates: { total: totalUpdates },
      },
    })
  );
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});
