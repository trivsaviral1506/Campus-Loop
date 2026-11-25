const mongoose = require('mongoose');
const dotenv = require('dotenv');
const crypto = require('crypto');
const User = require('./models/User');
const Item = require('./models/Item');
const BorrowRequest = require('./models/BorrowRequest');
const Notification = require('./models/Notification');
const Message = require('./models/Message');
const Review = require('./models/Review');
const { SAFE_PICKUP_ZONES } = require('./config/pickupZones');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusloop';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB for seeding: ${mongoUri}`);

    // Clear existing development collections
    await User.deleteMany({});
    await Item.deleteMany({});
    await BorrowRequest.deleteMany({});
    await Notification.deleteMany({});
    await Message.deleteMany({});
    await Review.deleteMany({});

    console.log('Cleared existing data.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Campus Administrator',
      email: 'admin@campus.edu',
      password: 'password123',
      college: 'Apex Institute of Technology',
      department: 'Campus Administration',
      year: 'Staff',
      role: 'admin'
    });

    const studentA = await User.create({
      name: 'Alex Rivera',
      email: 'alex@campus.edu',
      password: 'password123',
      college: 'Apex Institute of Technology',
      department: 'Computer Science',
      year: '3'
    });

    const studentB = await User.create({
      name: 'Priya Sharma',
      email: 'priya@campus.edu',
      password: 'password123',
      college: 'Apex Institute of Technology',
      department: 'Electronics Engineering',
      year: '2'
    });

    const studentC = await User.create({
      name: 'Liam Chen',
      email: 'liam@campus.edu',
      password: 'password123',
      college: 'Apex Institute of Technology',
      department: 'Mechanical Engineering',
      year: '4'
    });

    console.log('Users seeded.');

    // 2. Create Items
    const item1 = await Item.create({
      owner: studentA._id,
      name: 'Arduino Uno Ultimate Starter Kit',
      description: 'Complete development kit with breadboard, jumpers, LEDs, ultrasonic and temperature sensors.',
      category: 'electronics',
      condition: 'new',
      isAvailable: false, // will be attached to an accepted loan
      deposit: 300,
      imageUrl: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80',
      pickupLocation: SAFE_PICKUP_ZONES[2] // Makerspace West Wing
    });

    const item2 = await Item.create({
      owner: studentB._id,
      name: 'Calculus: Early Transcendentals (9th Edition)',
      description: 'James Stewart 9th Edition. High-contrast diagrams, essential for Math 101/102. No highlights.',
      category: 'books',
      condition: 'good',
      isAvailable: true,
      deposit: 150,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      pickupLocation: SAFE_PICKUP_ZONES[0] // Central Library Front Desk
    });

    const item3 = await Item.create({
      owner: studentC._id,
      name: 'TI-84 Plus CE Graphing Calculator',
      description: 'Full color backlit screen. Comes with rechargeable battery and USB-C charging cable.',
      category: 'electronics',
      condition: 'good',
      isAvailable: true,
      deposit: 450,
      imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80',
      pickupLocation: SAFE_PICKUP_ZONES[0] // Central Library Front Desk
    });

    const item4 = await Item.create({
      owner: studentA._id,
      name: 'Wilson Pro Staff Precision Tennis Racket',
      description: 'Strung at 55 lbs tension with grip tape. Includes carrying case and 3 pressurized balls.',
      category: 'sports',
      condition: 'good',
      isAvailable: true,
      deposit: 200,
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&auto=format&fit=crop&q=80',
      pickupLocation: SAFE_PICKUP_ZONES[7] // Sports Complex Reception
    });

    const item5 = await Item.create({
      owner: studentB._id,
      name: 'Digital Multimeter with Precision Test Leads',
      description: 'Auto-ranging True RMS DMM, measures AC/DC voltage, current, resistance, continuity and capacitance.',
      category: 'lab',
      condition: 'new',
      isAvailable: true,
      deposit: 120,
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      pickupLocation: SAFE_PICKUP_ZONES[6] // Engineering Hall Floor 2
    });

    console.log('Items seeded.');

    // 3. Create Borrow Requests with Tokens & PINs
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Request 1: Accepted request (studentB borrowing item1 from studentA)
    const req1 = await BorrowRequest.create({
      borrower: studentB._id,
      owner: studentA._id,
      item: item1._id,
      startDate: today,
      endDate: nextWeek,
      status: 'accepted',
      handoverToken: crypto.randomBytes(16).toString('hex'),
      handoverPin: '482910'
    });

    // Request 2: Pending request (studentC requesting item2 from studentB)
    const req2 = await BorrowRequest.create({
      borrower: studentC._id,
      owner: studentB._id,
      item: item2._id,
      startDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      endDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
      status: 'pending'
    });

    // Request 3: Completed/Returned request (studentA borrowed item3 from studentC last month)
    const pastStart = new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
    const req3 = await BorrowRequest.create({
      borrower: studentA._id,
      owner: studentC._id,
      item: item3._id,
      startDate: pastStart,
      endDate: pastEnd,
      status: 'returned',
      handoverVerifiedAt: pastStart,
      returnedAt: pastEnd
    });

    // 4. Create Reviews for the completed request
    await Review.create({
      request: req3._id,
      item: item3._id,
      reviewer: studentA._id,
      reviewee: studentC._id,
      targetType: 'borrower_to_owner',
      rating: 5,
      comment: 'Liam was super punctual and the TI-84 calculator was fully charged. Saved my calculus midterm!'
    });

    await Review.create({
      request: req3._id,
      item: item3._id,
      reviewer: studentC._id,
      reviewee: studentA._id,
      targetType: 'owner_to_borrower',
      rating: 5,
      comment: 'Alex returned the device in perfect condition on time. Highly recommended borrower!'
    });

    // 5. Create Initial Notifications
    await Notification.create({
      user: studentA._id,
      sender: studentB._id,
      type: 'request_created',
      title: 'New Borrow Request',
      message: 'Priya Sharma requested to borrow your Arduino Starter Kit.',
      link: '/lent'
    });

    await Notification.create({
      user: studentB._id,
      sender: studentA._id,
      type: 'request_accepted',
      title: 'Request Accepted! 🎉',
      message: 'Alex accepted your request for the Arduino Starter Kit. Your 6-digit PIN is 482910.',
      link: '/borrowed'
    });

    // 6. Create Initial Message
    await Message.create({
      request: req1._id,
      sender: studentB._id,
      recipient: studentA._id,
      content: 'Hey Alex! I can meet you at the Makerspace desk at 3 PM today for pickup. Does that work?'
    });

    await Message.create({
      request: req1._id,
      sender: studentA._id,
      recipient: studentB._id,
      content: 'Hey Priya, 3 PM at the Makerspace sounds great. See you there!'
    });

    console.log(`
==================================================
CAMPUSLOOP SEED DATA COMPLETED SUCCESSFULLY!
==================================================
Demo User Accounts (Password for all: password123):
1. Admin:   admin@campus.edu  (Full Admin Dashboard access)
2. Student: alex@campus.edu   (Owner of Arduino Kit & Tennis Racket)
3. Student: priya@campus.edu  (Borrower with accepted request & PIN: 482910)
4. Student: liam@campus.edu   (Owner of TI-84 Calculator)

Safe Pickup Zones Configured: ${SAFE_PICKUP_ZONES.length}
Items Seeded: 5
Borrow Requests Seeded: 3 (1 accepted, 1 pending, 1 returned)
Reviews Seeded: 2
==================================================
`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

