require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ DATABASE CONNECTION
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB Error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server is working");
});

// ✅ LOGIN ROUTE (IMPORTANT)
app.post("/login", (req, res) => {
  const { email } = req.body;

  console.log("📩 Login request:", email);

  if (!email || !email.endsWith("@kl.his.edu.my")) {
    return res.status(400).json({ message: "Use school email only" });
  }

  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.json({
      message: "Login success",
      user: results[0],
    });
  });
});

// ✅ START SERVER (ONLY ONCE)
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ✅ SEND OTP ROUTE
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

app.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email || !email.endsWith("@kl.his.edu.my")) {
        return res.status(400).json({ error: "Use school email only" });
    }

    // Check user exists
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (results.length === 0) return res.status(404).json({ error: "Email not registered" });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        db.query(
            "INSERT INTO otp_codes (email, otp_code, expires_at) VALUES (?, ?, ?)",
            [email, otp, expiresAt],
            async (err) => {
                if (err) return res.status(500).json({ error: "Failed to save OTP" });
                try {
                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: "Your ANPR Login Code",
                        html: `
                            <h2>Your One-Time Login Code</h2>
                            <p>Use this code to log in to the ANPR app:</p>
                            <h1 style="color:#00b894;letter-spacing:8px;">${otp}</h1>
                            <p>This code expires in <b>10 minutes</b>.</p>
                        `,
                    });
                    res.json({ message: "OTP sent successfully" });
                } catch (emailErr) {
                    console.error("Email error:", emailErr);
                    res.status(500).json({ error: "Failed to send email" });
                }
            }
        );
    });
});

// ✅ VERIFY OTP ROUTE
app.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;

    db.query(
        "SELECT * FROM otp_codes WHERE email = ? AND otp_code = ? AND is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
        [email, otp],
        (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });
            if (results.length === 0) return res.status(400).json({ error: "Invalid or expired OTP" });

            db.query("UPDATE otp_codes SET is_used = TRUE WHERE id = ?", [results[0].id]);

            db.query("SELECT * FROM users WHERE email = ?", [email], (err, userResults) => {
                if (err) return res.status(500).json({ error: "Database error" });
                res.json({ message: "Login successful", user: userResults[0] });
            });
        }
    );
});