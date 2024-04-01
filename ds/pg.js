import express from "express";
import data from "./data.js";

const app = express();

// Route to handle pagination
app.get("/data", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page number
  const pageSize = parseInt(req.query.pageSize) || 2; // Number of records per page (default: 4)
  const offset = (page - 1) * pageSize; // Calculate offset
  const paginatedData = data.slice(offset, offset + pageSize); // Fetch subset of data for current page

  // Calculate total number of pages
  const totalPages = Math.ceil(data.length / pageSize);

  // Return paginated data along with pagination metadata
  res.json({
    currentPage: page,
    totalPages: totalPages,
    pageSize: pageSize,
    totalRecords: data.length,
    data: paginatedData,
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
