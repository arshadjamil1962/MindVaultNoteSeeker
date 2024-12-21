import express from "express";
import sqlite3 from "sqlite3";
import cors from "cors";

// Initialize Express app
const app = express();
const PORT = 3009;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const dbPath = "./Database/MindVaultNoteSeeker.db";
const db = new sqlite3.Database(dbPath,
  sqlite3.OPEN_READWRITE, // Open database in read-write mode
  (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
    } else {
      console.log("Connected to SQLite database MindVaultNoteSeeker.db.");
    }
  });

///////////////////////////////////////////////////////////////////
// API endpoint to fetch data (updated to include cross-references)
app.get("/api/getData", async (req, res) => {
  const data = { keywords: [], tags: [], crossReferences: [] };

  // Fetch keywords
  db.all("SELECT keyword_Description FROM NoteKeywords", [], (err, rows) => {
    if (err) {
      console.error("Error fetching keywords:", err.message);
      return res.status(500).send("Error fetching keywords.");
    }
    data.keywords = rows.map((row) => row.keyword_Description);

    // Fetch tags
    db.all("SELECT tag_Description FROM NoteTags", [], (err, rows) => {
      if (err) {
        console.error("Error fetching tags:", err.message);
        return res.status(500).send("Error fetching tags.");
      }
      data.tags = rows.map((row) => row.tag_Description);

      // Fetch cross-references
      db.all("SELECT note_Id, note_Title FROM MindVaultNotes", [], (err, rows) => {
        if (err) {
          console.error("Error fetching cross-references:", err.message);
          return res.status(500).send("Error fetching cross-references.");
        }
        data.crossReferences = rows;
        // Send the response
        res.json(data);
      });
    });
  });
});

///////////////////////////////////////////////////////////////////
// Save API Endpoint
app.post("/api/saveNote", (req, res) => {
  const {
    noteSource,
    noteDateTime,
    noteAbstract,
    noteTitle,
    notePriority,
    noteTags,
    noteKeywords,
    noteCrossReferences,
  } = req.body;

  const note_DateTime = new Date(noteDateTime);  // Convert to Date object
  const formattedDateTime = note_DateTime.toISOString().slice(0, 19).replace('T', ' ');

  // Prepare SQL for the Notes table
  const noteQuery = `
    INSERT INTO MindVaultNotes (
      note_DateTime, note_Source, note_Abstract, note_Title, 
      note_Priority, note_Tags, note_Keywords, note_CrossReference
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const noteValues = [
    formattedDateTime,
    noteSource,
    noteAbstract,
    noteTitle,
    notePriority,
    noteTags.join(", "),
    noteKeywords.join(", "),
    noteCrossReferences.join(", "),
  ];

  // Execute Notes Insertion
  db.run(noteQuery, noteValues, function (err) {
    if (err) {
      console.error("Error inserting note data:", err.message);
      return res.status(500).send("Error saving note to database.");
    }

    // Note saved successfully
    const noteId = this.lastID;

    // Check and update Tags
    const tagQuery = "SELECT tag_Description FROM NoteTags";
    db.all(tagQuery, [], (tagErr, existingTags) => {
      if (tagErr) {
        console.error("Error fetching existing tags:", tagErr.message);
        return res.status(500).send("Error updating tags.");
      }

      const existingTagSet = new Set(existingTags.map((row) => row.tag_Description));
      const newTags = noteTags.filter((tag) => !existingTagSet.has(tag));
      if (newTags.length > 0) {
        const insertTagQuery = "INSERT INTO NoteTags (tag_Description) VALUES (?)";
        newTags.forEach((newTag) => {
          db.run(insertTagQuery, [newTag], (insertTagErr) => {
            if (insertTagErr) {
              console.error("Error inserting new tag:", insertTagErr.message);
            }
          });
        });
      }
    });

    // Check and update Keywords
    const keywordQuery = "SELECT keyword_Description FROM NoteKeywords";
    db.all(keywordQuery, [], (keywordErr, existingKeywords) => {
      if (keywordErr) {
        console.error("Error fetching existing keywords:", keywordErr.message);
        return res.status(500).send("Error updating keywords.");
      }

      const existingKeywordSet = new Set(existingKeywords.map((row) => row.keyword_Description));
      const newKeywords = noteKeywords.filter((keyword) => !existingKeywordSet.has(keyword));

      if (newKeywords.length > 0) {
        const insertKeywordQuery = "INSERT INTO NoteKeywords (keyword_Description) VALUES (?)";
        newKeywords.forEach((newKeyword) => {
          db.run(insertKeywordQuery, [newKeyword], (insertKeywordErr) => {
            if (insertKeywordErr) {
              console.error("Error inserting new keyword:", insertKeywordErr.message);
            }
          });
        });
      }
    });

    // Send success response
    console.log(`Note saved with note_Id: ${this.lastID}`);
    res.status(200).json({
      status: "success",
      message: `Note saved successfully with note_Id: ${this.lastID}`,
      note_Id: this.lastID,
    });
  });
});

///////////////////////////////////////////////////////////////////
// API endpoint to fetch filtered master data
app.get("/api/getFilteredMasterData", (req, res) => {
  const {
    filterTitle = "",
    filterAbstract = "",
    filterDateFrom = "",
    filterDateTo = "",
    filterTags = "",
    filterKeywords = "",
    filterPriority = "",
    limit = 5, // Default number of records per page
    offset = 0, // Default starting record
  } = req.query;

  // Parse date filters and add time range
  const filterDate_From = filterDateFrom
    ? `${filterDateFrom} 00:00:00`
    : null;
  const filterDate_To = filterDateTo
    ? `${filterDateTo} 23:59:59`
    : null;

  let query = "SELECT * FROM MindVaultNotes WHERE 1=1";
  let filterOptions = '';
  const params = [];

  if (filterTitle) {
    filterOptions += " AND note_Title LIKE ?";
    params.push(`%${filterTitle}%`);
  }
  if (filterAbstract) {
    filterOptions += " AND note_Abstract LIKE ?";
    params.push(`%${filterAbstract}%`);
  }
  // Apply date range filter if provided
  if (filterDate_From && filterDate_To) {
    filterOptions += " AND note_DateTime BETWEEN ? AND ?";
    params.push(filterDate_From, filterDate_To);
  } else if (filterDate_From) {
    filterOptions += " AND note_DateTime >= ?";
    params.push(filterDate_From);
  } else if (filterDate_To) {
    filterOptions += " AND note_DateTime <= ?";
    params.push(filterDate_To);
  }
  if (filterTags) {
    filterOptions += " AND note_Tags LIKE ?";
    params.push(`%${filterTags}%`);
  }
  if (filterKeywords) {
    filterOptions += " AND note_Keywords LIKE ?";
    params.push(`%${filterKeywords}%`);
  }
  if (filterPriority) {
    filterOptions += " AND note_Priority LIKE ?";
    params.push(`%${filterPriority}%`);
  }

  // Add LIMIT and OFFSET for pagination
  query = query + filterOptions + " ORDER BY note_DateTime DESC LIMIT ? OFFSET ?";

  params.push(Number(limit), Number(offset));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Error fetching filtered data:", err.message);
      return res.status(500).json({ error: "Failed to fetch data." });
    }

    // Fetch the total count of records for pagination
    const countQuery = "SELECT COUNT(*) AS totalRecords FROM MindVaultNotes WHERE 1=1" + filterOptions;
    const countQueryParams = params;
    countQueryParams.splice(countQueryParams.length - 2, 2); // Remove limit and offs

    db.get(countQuery, countQueryParams, (countErr, countRow) => {
      if (countErr) {
        console.error("Error fetching total records:", countErr.message);
        return res.status(500).json({ error: "Failed to fetch total count." });
      }

      res.json({
        data: rows,
        totalRecords: countRow.totalRecords,
      });
    });
  });
});

///////////////////////////////////////////////////////////////////
// API endpoint to fetch notes information for Cross References
app.post("/api/getDetailedCrossReferences", (req, res) => {
  const { noteIds } = req.body; // Expecting an array of note_Id

  if (!Array.isArray(noteIds) || noteIds.length === 0) {
    return res.status(400).json({ error: "Invalid or empty noteIds array" });
  }

  // Construct a parameterized query
  const placeholders = noteIds.map(() => "?").join(",");
  const query = `SELECT * FROM MindVaultNotes WHERE note_Id IN (${placeholders})`;

  db.all(query, noteIds, (err, rows) => {
    if (err) {
      console.error("Error fetching cross-referenced notes:", err.message);
      return res.status(500).send("Error fetching cross-referenced notes.");
    }
    res.json(rows);
  });
});

///////////////////////////////////////////////////////////////////
// Delete API Endpoint
app.post("/api/deleteNote", (req, res) => {
  const { note_Id } = req.body;
  console.log(`Deleting note_Id: ${note_Id}`);
  // Delete query
  const deleteQuery = "DELETE FROM MindVaultNotes WHERE note_Id = ?";
  db.run(deleteQuery, [note_Id], function (err) {
    if (err) {
      console.error("Error deleting note:", err.message);
      return res.status(500).json({ message: "Failed to delete the note." });
    }

    if (this.changes === 0) {
      // No record found with the given ID
      return res.status(404).json({ message: "Note not found." });
    }

    // Successful deletion
    console.log(`Note Deleted with note_Id: ${note_Id}`);
    res.status(200).json({
      message: `Note Deleted successfully with note_Id: ${note_Id}`,
    });
  });

});

///////////////////////////////////////////////////////////////////
// Health check API
app.get("/api/health", (req, res) => {
  const query = "SELECT 1 FROM NoteKeywords LIMIT 1"; // Basic query to test DB availability
  db.get(query, [], (err) => {
    if (err) {
      console.error("Database health check failed:", err.message);
      return res.status(500).json({ status: "unhealthy" });
    }
    res.json({ status: "healthy" });
  });
});

///////////////////////////////////////////////////////////////////
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
