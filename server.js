
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ratingsDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas and models
const ratingSchema = new mongoose.Schema({
    service: String,
    rating: Number,
    user: String
});

const commentSchema = new mongoose.Schema({
    service: String,
    comment: String,
    user: String,
    likes: [String],
    replies: [{ user: String, reply: String }]
});

const Rating = mongoose.model('Rating', ratingSchema);
const Comment = mongoose.model('Comment', commentSchema);

// Routes
app.post('/ratings', async (req, res) => {
    const { service, rating, user } = req.body;
    await Rating.create({ service, rating, user });
    res.send('Rating submitted');
});

app.get('/ratings', async (req, res) => {
    const ratings = await Rating.aggregate([
        { $group: { _id: "$service", avgRating: { $avg: "$rating" } } }
    ]);
    res.json(ratings);
});

app.post('/comments', async (req, res) => {
    const { service, comment, user } = req.body;
    await Comment.create({ service, comment, user, likes: [], replies: [] });
    res.send('Comment submitted');
});

app.get('/comments', async (req, res) => {
    const comments = await Comment.find();
    res.json(comments);
});

app.post('/like-comment', async (req, res) => {
    const { commentId, user } = req.body;
    const comment = await Comment.findById(commentId);
    if (!comment.likes.includes(user)) {
        comment.likes.push(user);
        await comment.save();
    }
    res.send('Comment liked');
});

app.post('/reply-comment', async (req, res) => {
    const { commentId, user, reply } = req.body;
    const comment = await Comment.findById(commentId);
    comment.replies.push({ user, reply });
    await comment.save();
    res.send('Reply added');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
