const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Message = require("./models/Message");

dotenv.config();

const seedUsers = [
  {
    username: "rohit",
    email: "rohit@example.com",
    password: "password123",
  },
  {
    username: "soham",
    email: "soham@example.com",
    password: "password123",
  },
  {
    username: "arnav",
    email: "arnav@example.com",
    password: "password123",
  },
];

const seedConversation = (usersByName) => [
  {
    sender: usersByName.rohit._id,
    receiver: usersByName.soham._id,
    text: "Hey Soham, did you try the chat app yet?",
    createdAt: new Date("2026-01-01T09:00:00.000Z"),
    updatedAt: new Date("2026-01-01T09:00:00.000Z"),
  },
  {
    sender: usersByName.soham._id,
    receiver: usersByName.rohit._id,
    text: "Yes, real-time messages are working nicely.",
    createdAt: new Date("2026-01-01T09:01:00.000Z"),
    updatedAt: new Date("2026-01-01T09:01:00.000Z"),
  },
  {
    sender: usersByName.arnav._id,
    receiver: usersByName.rohit._id,
    text: "Hi Rohit, sending a sample seeded message.",
    createdAt: new Date("2026-01-01T09:02:00.000Z"),
    updatedAt: new Date("2026-01-01T09:02:00.000Z"),
  },
  {
    sender: usersByName.rohit._id,
    receiver: usersByName.arnav._id,
    text: "Got it. This should show up in our message history.",
    createdAt: new Date("2026-01-01T09:03:00.000Z"),
    updatedAt: new Date("2026-01-01T09:03:00.000Z"),
  },
  {
    sender: usersByName.soham._id,
    receiver: usersByName.arnav._id,
    text: "Welcome to the seeded chat room.",
    createdAt: new Date("2026-01-01T09:04:00.000Z"),
    updatedAt: new Date("2026-01-01T09:04:00.000Z"),
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    const seedEmails = seedUsers.map((user) => user.email);
    const seedUsernames = seedUsers.map((user) => user.username);

    await User.deleteMany({
      $or: [{ email: { $in: seedEmails } }, { username: { $in: seedUsernames } }],
    });

    const createdUsers = await User.create(seedUsers);
    const usersByName = createdUsers.reduce((lookup, user) => {
      lookup[user.username] = user;
      return lookup;
    }, {});

    await Message.deleteMany({
      $or: [
        { sender: { $in: createdUsers.map((user) => user._id) } },
        { receiver: { $in: createdUsers.map((user) => user._id) } },
      ],
    });

    await Message.create(seedConversation(usersByName));

    console.log("Seed complete.");
    console.log("Created users:");
    seedUsers.forEach((user) => {
      console.log(`- ${user.email} / ${user.password}`);
    });
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();
