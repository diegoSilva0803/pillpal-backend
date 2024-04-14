const express = require("express");
const router = express.Router();
const uniqid = require("uniqid");
const fs = require("fs");
const path = require("path"); // Added for cleaner path handling
const accountSid = "AC020629f62d4e5435b67a7c0449a474b5";
const authToken = "c5605ada617a86215c6aca38159e0af1";
const client = require("twilio")(accountSid, authToken);

const dataFile = path.join(__dirname, "../data/medInfo.json");
const registrationFile = path.join(__dirname, "../data/signin.json");

function readRegistrationData() {
    try {
      const registrationData = fs.readFileSync(registrationFile, "utf8"); // Read as UTF-8 for better handling
      return JSON.parse(registrationData);
    } catch (err) {
      console.error("Error reading registration data:", err);
      // Consider returning an empty array or a default value in case of errors
      return [];
    }
  }


  function writeRegistrationData(data) {
    try {
      fs.writeFileSync(registrationFile, JSON.stringify(data, null, 2), "utf8"); // Formatted JSON for readability
    } catch (err) {
      console.error("Error writing registration data:", err);
    }
  }

  



function readMedData() {
  try {
    const medData = fs.readFileSync(dataFile, "utf8"); // Read as UTF-8 for better handling
    return JSON.parse(medData);
  } catch (err) {
    console.error("Error reading medication data:", err);
    // Consider returning an empty array or a default value in case of errors
    return [];
  }
}

// Function to write medication data to file
function writeMedData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf8"); // Formatted JSON for readability
  } catch (err) {
    console.error("Error writing medication data:", err);
  }
}



router.post('/register', (req, res) => {
    const { username, email, phone, password } = req.body;
    console.log("Received data:", req.body);
  
    // Validate user data (implement your validation logic here)
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const registrationData = readRegistrationData();
    const newRegistrationData = {
      id: uniqid(),
      username,
      email,
      phone,
      password
    };
  
    registrationData.push(newRegistrationData);
    writeRegistrationData(registrationData);
  
    res.status(201).json(newRegistrationData);
  
    res.status(201).json({ message: 'Registration successful' });
  });



// Route handler for GET requests to `/medication/create`
router.get("/medication/create", (req, res) => {
  const medData = readMedData();
  res.status(200).json(medData);
});


router.get("/medication/sms", (req, res) => {
  client.messages
    .create({
      body: "It's time to take your medication!",
      from: "+13202881723",
      to: "+17782228929",
    })
    .then((message) => console.log(message.sid));
    // .done();
  res.status(200);
});

// Route handler for POST requests to `/medication/create`
router.post("/medication/create", (req, res) => {
  const { medName, freq, startDate, endDate = "" } = req.body;

  if (!medName || !freq || !startDate || !endDate) {
    // Handle missing data more gracefully
    return res.status(400).json({ message: "Missing required fields" });
  }

  const medData = readMedData();
  const newData = {
    id: uniqid(),
    medName,
    freq,
    startDate,
    endDate,
  };

  medData.push(newData);
  writeMedData(medData);

  res.status(201).json(newData); // Created (201) status for successful creation
});

// Route handler for DELETE requests to `/medication/delete/:id`
router.delete("/medication/delete/:id", (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Missing medication ID" });
  }

  const medData = readMedData();
  const updatedData = medData.filter((item) => item.id !== id);

  if (updatedData.length === medData.length) {
    // Handle case where ID not found
    return res.status(404).json({ message: "Medication not found" });
  }

  writeMedData(updatedData);

  res.status(200).json({ message: "Medication deleted successfully" }); // More informative message
});

router.put("/medication/update/:id", async (req, res) => {
  const { id } = req.params;
  const { medName, freq, startDate, endDate } = req.body;

  // Validation (optional) and error handling

  const medData = readMedData();
  const existingIndex = medData.findIndex((item) => item.id === id);

  if (existingIndex === -1) {
    return res.status(404).json({ message: "Medication not found" });
  }

  medData[existingIndex] = {
    ...medData[existingIndex],
    medName,
    freq,
    startDate,
    endDate,
  };
  writeMedData(medData);

  res.status(200).json({ message: "Medication updated successfully" });
});

module.exports = router;
