import { prisma } from "../lib/prisma";


async function main() {
  console.log("Seeding database...");

  // 0) Clean up existing data
  console.log("Cleaning up existing data...");
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleanup complete.");

  // 1) Create ADMIN user
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      phone: "9999999999",
      email: "admin@example.com",
      password_hash: "hashedpassword123",
      role: "admin",
    },
  });

  // 2) Create some MEMBERS
  const members = await prisma.user.createMany({
    data: [
      { name: "Rohan Patil", phone: "9000000001", password_hash: "pass1" },
      { name: "Sita Kulkarni", phone: "9000000002", password_hash: "pass2" },
      { name: "Amit Joshi", phone: "9000000003", password_hash: "pass3" },
      { name: "Vikas Sharma", phone: "9000000004", password_hash: "pass4" },
    ],
  });

  const users = await prisma.user.findMany();

  // 3) Create a Group
  const group = await prisma.group.create({
    data: {
      group_name: "Monthly Gold Chit",
      group_code: "GOLD100",
      chit_value: 100000,
      total_members: 4,
      monthly_contribution: 2500,
      start_date: new Date(),
      status: "active",
    },
  });

  // 4) Add group members
  const groupMembers = [];
  for (const user of users.filter((u) => u.role === "member")) {
    const gm = await prisma.groupMember.create({
      data: {
        user_id: user.id,
        group_id: group.id,
        join_date: new Date(),
        nominee_name: "Nominee " + user.name,
        nominee_phone: "9876543210",
      },
    });
    groupMembers.push(gm);
  }

  // 5) Create Cycle (Month 1)
  const cycle = await prisma.cycle.create({
    data: {
      group_id: group.id,
      cycle_number: 1,
      cycle_month_year: "Nov-2025",
      auction_status: "pending",
      total_collection_expected: 10000,
      total_collection_received: 0,
    },
  });

  // 6) Create Contributions for each member
  for (const gm of groupMembers) {
    await prisma.contribution.create({
      data: {
        group_id: group.id,
        user_id: gm.user_id,
        cycle_id: cycle.id,
        group_member_id: gm.id,
        amount_payable: 2500,
        payment_status: "pending",
        is_partial: false,
      },
    });
  }

  // 7) Create Auction + Bids
  const auction = await prisma.auction.create({
    data: {
      group_id: group.id,
      cycle_id: cycle.id,
      auction_date: new Date(),
      auction_type: "bidding",
      status: "pending",
    },
  });

  // Add Bids
  const bidUsers = users.filter((u) => u.role === "member");

  const bids = [];
  let bidAmt = 1000;
  for (const user of bidUsers) {
    bids.push(
      await prisma.bid.create({
        data: {
          auction_id: auction.id,
          user_id: user.id,
          bid_amount: bidAmt,
        },
      })
    );
    bidAmt += 500;
  }

  // Pick winner from highest bid
  const highestBid = bids[bids.length - 1];

  // 8) Update Auction with winner
  await prisma.auction.update({
    where: { id: auction.id },
    data: {
      winner_user_id: highestBid.user_id,
      winning_bid_amount: highestBid.bid_amount,
      winner_payout_amount: 90000, // dummy
      dividend_per_member: 500, // dummy
      status: "complete",
    },
  });

  console.log("Dummy data seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    return prisma.$disconnect();
  });
