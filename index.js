// Day 4 KT Task
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://libraryuser:nmibmvenilib@ibmday4task2.djsug2m.mongodb.net/libraryDB?appName=ibmday4task2")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Book Schema
const Book = mongoose.model("Book", {
  title: String,
  author: String,
  category: String,
  publishedYear: Number,
  availableCopies: Number
});

// INSERT book
app.post("/books", async (req, res) => {
  const book = await Book.create(req.body);
  res.json(book);
});

// READ all books
app.get("/books", async (req, res) => {
  res.json(await Book.find());
});

// READ by category
app.get("/books/category/:category", async (req, res) => {
  res.json(await Book.find({ category: req.params.category }));
});

// READ after 2015
app.get("/books/after/2015", async (req, res) => {
  res.json(await Book.find({ publishedYear: { $gt: 2015 } }));
});

// UPDATE copies
app.patch("/books/:id/copies", async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (book.availableCopies + req.body.value < 0)
    return res.status(400).json({ message: "Negative stock not allowed" });

  book.availableCopies += req.body.value;

  if (book.availableCopies === 0) {
    await book.deleteOne();
    return res.json({ message: "Book deleted as copies reached zero" });
  }

  await book.save();
  res.json(book);
});

// UPDATE category
app.patch("/books/:id/category", async (req, res) => {
  const book = await Book.findByIdAndUpdate(
    req.params.id,
    { category: req.body.category },
    { new: true }
  );
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
});

// DELETE book
app.delete("/books/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (book.availableCopies > 0)
    return res.status(400).json({ message: "Cannot delete book with available copies" });

  await book.deleteOne();
  res.json({ message: "Book deleted" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
