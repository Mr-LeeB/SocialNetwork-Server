const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose
      .connect(
        `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.ktjepad.mongodb.net/SocialNetwork`,
      )
      .then(() => {
        console.log('MongoDB connected');
      })
      .catch((err) => {
        console.log(err);
      });

    // await mongoose.connect('mongodb://127.0.0.1:27017/LoganZ');
    // console.log('MongoDB connected!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
