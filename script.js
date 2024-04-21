// Import necessary modules
const { config } = require("dotenv");
const ejs = require("ejs");
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const NodeWebcam = require("node-webcam");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const bodyParser = require("body-parser");
const axios = require("axios");

// Set EJS as the view engine
const app = express();
app.set("view engine", "ejs");

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

config();

const Replicate = require("replicate");

// Create an instance of Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Create an Express app
const server = http.createServer(app);
const io = socketIO(server);

// Set up the port
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import the Screenshot model
const Screenshot = require("./models");

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Webcam setup
const Webcam = NodeWebcam.create({
  width: 1280,
  height: 720,
  quality: 100,
  output: "jpeg",
  callbackReturn: "base64",
});

// Function to get the last inserted user ID
async function getLastInsertedUserId() {
  try {
    // Find the last inserted record in the database and sort by _id in descending order
    const lastRecord = await Screenshot.findOne().sort({ _id: -1 }).exec();

    // If there are no records in the database, return null or throw an error
    if (!lastRecord) {
      return null; // Or throw new Error('No records found in the database');
    }

    // Return the userId of the last inserted record, cast to a number
    return parseInt(lastRecord.userId, 10);
  } catch (error) {
    console.error("Error getting last inserted user ID:", error);
    throw error; // Handle the error accordingly
  }
}

// Socket.io connection
// Socket.io connection
io.on("connection", (socket) => {
  console.log("A client connected");

  // Listen for takeScreenshot event
  socket.on("takeScreenshot", async (screenshotData, userId) => {
    try {
      //console.log("Received screenshot data:", screenshotData);

      const screenshotName = `screenshot_${Date.now()}.jpg`;
      const screenshotPath = path.join(
        __dirname,
        "public",
        "screenshots",
        screenshotName
      );
      const base64Data = screenshotData.replace(
        /^data:image\/jpeg;base64,/,
        ""
      );
      require("fs").writeFileSync(screenshotPath, base64Data, "base64");

      // Get the last inserted user ID
      const lastUserId = await getLastInsertedUserId();

      // If lastUserId is null, log an error and return
      if (lastUserId === null) {
        console.error("No existing user ID found in the database.");
        return;
      }

      // Find the user with the last user ID and update the screenshotPath
      const userToUpdate = await Screenshot.findOneAndUpdate(
        { userId: userId }, // Use the provided userId here
        { screenshotPath: screenshotPath },
        { new: true }
      );

      if (!userToUpdate) {
        console.error(`No user found with userID: ${userId}`);
        return;
      }

      io.emit("screenshot", screenshotPath);
      console.log(`Screenshot path updated for user with ID: ${userId}`);
      io.emit("redirect", `/user/testconv/${userId}`);
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  });

  // Listen for takeScreenshot event
  socket.on("takeScreenshotAr", async (screenshotData, userId) => {
    try {
      //console.log("Received screenshot data:", screenshotData);

      const screenshotName = `screenshot_${Date.now()}.jpg`;
      const screenshotPath = path.join(
        __dirname,
        "public",
        "screenshots",
        screenshotName
      );
      const base64Data = screenshotData.replace(
        /^data:image\/jpeg;base64,/,
        ""
      );
      require("fs").writeFileSync(screenshotPath, base64Data, "base64");

      // Get the last inserted user ID
      const lastUserId = await getLastInsertedUserId();

      // If lastUserId is null, log an error and return
      if (lastUserId === null) {
        console.error("No existing user ID found in the database.");
        return;
      }

      // Find the user with the last user ID and update the screenshotPath
      const userToUpdate = await Screenshot.findOneAndUpdate(
        { userId: userId }, // Use the provided userId here
        { screenshotPath: screenshotPath },
        { new: true }
      );

      if (!userToUpdate) {
        console.error(`No user found with userID: ${userId}`);
        return;
      }

      io.emit("screenshot", screenshotPath);
      console.log(`Screenshot path updated for user with ID: ${userId}`);
      io.emit("redirect", `/user/testconvar/${userId}`);
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
  });
});

// Route to handle user data based on user ID
/*app.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });
    res.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});*/

// Route to handle user data based on user ID

app.get("/", async (req, res) => {
  res.render("langue");
});

app.get("/startfr", async (req, res) => {
  res.render("start");
});

app.get("/startar", async (req, res) => {
  res.render("start-ar");
});

app.get("/formfr", async (req, res) => {
  res.render("form");
});

app.get("/formar", async (req, res) => {
  res.render("form-ar");
});

// Route to handle user data based on user ID
app.get("/template", async (req, res) => {
  try {
    res.render("start");
  } catch (error) {}
});

// Route to handle user data based on user ID
app.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("details", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/bd/:userId/1", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("fr/bd1", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/bd/:userId/2", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("fr/bd2", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/bd/:userId/3", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("fr/bd3", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/bd/:userId/4", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("fr/bd4", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/bd/:userId/5", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("fr/bd5", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/bdar/:userId/1", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("ar/bd1", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/bdar/:userId/2", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("ar/bd2", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/bdar/:userId/3", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("ar/bd3", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/bdar/:userId/4", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("ar/bd4", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/bdar/:userId/5", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("ar/bd5", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/userar/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("details-ar", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

// Function to generate and increment the user ID
async function getNextUserId() {
  const result = await Screenshot.findOne().sort({ userId: -1 }).exec();
  return result ? result.userId + 1 : 12345; // Initial user ID
}

// Route to convert image to cartoon

app.get("/user/convert/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const screenshot = await Screenshot.findOne({ userId });
    if (!screenshot) {
      return res.status(404).send("Screenshot not found for the user ID.");
    }
    fs.readFile(
      screenshot.screenshotPath,
      { encoding: "base64" },
      (err, imageData) => {
        if (err) {
          console.error("Error reading image file:", err);
          return res.status(500).send("Error reading image file.");
        }
        // Run the replicate API using the captured image
        replicate
          .run(
            "fofr/become-image:8d0b076a2aff3904dfcec3253c778e0310a68f78483c4699c7fd800f3051d2b3",
            {
              input: {
                image: `data:image/jpeg;base64,${imageData}`, // Provide the image data as base64
                prompt: "a cartoon caracter",
                image_to_become:
                  "https://static.vecteezy.com/ti/vecteur-libre/p1/17678787-architecte-technicien-et-constructeurs-et-ingenieurs-et-mecaniciens-et-travailleurs-de-la-construction-travail-d-equipe-personnage-de-dessin-anime-d-illustrationle-ingenieur-avec-casque-de-securite-blanc-sur-chantier-vectoriel.jpg",
                negative_prompt: "",
                prompt_strength: 1,
                number_of_images: 1,
                denoising_strength: 1,
                instant_id_strength: 1,
                image_to_become_noise: 0.3,
                control_depth_strength: 0.8,
                image_to_become_strength: 0.75,
              },
            }
          )
          .then(async (output) => {
            try {
              // Extract the URL of the output image from the replicate output
              const cartoonImageURL = output[0]; // The URL is directly accessible in the first element of the array

              // Now, remove the background from the image
              const backgroundOutputURL = await replicate.run(
                "smoretalk/rembg-enhance:c57bc7626c4b5eda6531ffb84657f5672932d0fad49120b94383ec93f7ad7ac6",
                {
                  input: {
                    image: cartoonImageURL,
                  },
                }
              );

              console.log(
                "Background removal output URL:",
                backgroundOutputURL
              );

              // Download the background output image
              const response = await axios.get(backgroundOutputURL, {
                responseType: "arraybuffer",
              });
              const backgroundPath = path.join(
                __dirname,
                "public",
                "backgroundOutputs",
                `background_${Date.now()}.jpg`
              );
              fs.writeFileSync(backgroundPath, response.data);

              // Update the screenshot document with the local file path
              screenshot.backgroundOutput = backgroundPath;
              await screenshot.save();

              // Continue with further processing or handling of the generated output
              //res.json({ cartoonImageURL, backgroundPath });
              res.redirect(`/user/${userId}`);
            } catch (error) {
              console.error("Error processing background output:", error);
              res.status(500).send("Error processing background output.");
            }
          })
          .catch((error) => {
            console.error("Error converting image to cartoon:", error);
            const errorMessage =
              "NSFW content detected in input images. Please try taking another photo.";
            res.redirect(
              `/screen/${userId}?error=${encodeURIComponent(errorMessage)}`
            );
          });
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.get("/user/convertar/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const screenshot = await Screenshot.findOne({ userId });
    if (!screenshot) {
      return res.status(404).send("Screenshot not found for the user ID.");
    }
    fs.readFile(
      screenshot.screenshotPath,
      { encoding: "base64" },
      (err, imageData) => {
        if (err) {
          console.error("Error reading image file:", err);
          return res.status(500).send("Error reading image file.");
        }
        // Run the replicate API using the captured image
        replicate
          .run(
            "fofr/become-image:8d0b076a2aff3904dfcec3253c778e0310a68f78483c4699c7fd800f3051d2b3",
            {
              input: {
                image: `data:image/jpeg;base64,${imageData}`, // Provide the image data as base64
                prompt: "a cartoon caracter",
                image_to_become:
                  "https://static.vecteezy.com/ti/vecteur-libre/p1/17678787-architecte-technicien-et-constructeurs-et-ingenieurs-et-mecaniciens-et-travailleurs-de-la-construction-travail-d-equipe-personnage-de-dessin-anime-d-illustrationle-ingenieur-avec-casque-de-securite-blanc-sur-chantier-vectoriel.jpg",
                negative_prompt: "",
                prompt_strength: 1,
                number_of_images: 1,
                denoising_strength: 1,
                instant_id_strength: 1,
                image_to_become_noise: 0.3,
                control_depth_strength: 0.8,
                image_to_become_strength: 0.75,
              },
            }
          )
          .then(async (output) => {
            try {
              // Extract the URL of the output image from the replicate output
              const cartoonImageURL = output[0]; // The URL is directly accessible in the first element of the array

              // Now, remove the background from the image
              const backgroundOutputURL = await replicate.run(
                "smoretalk/rembg-enhance:c57bc7626c4b5eda6531ffb84657f5672932d0fad49120b94383ec93f7ad7ac6",
                {
                  input: {
                    image: cartoonImageURL,
                  },
                }
              );

              console.log(
                "Background removal output URL:",
                backgroundOutputURL
              );

              // Download the background output image
              const response = await axios.get(backgroundOutputURL, {
                responseType: "arraybuffer",
              });
              const backgroundPath = path.join(
                __dirname,
                "public",
                "backgroundOutputs",
                `background_${Date.now()}.jpg`
              );
              fs.writeFileSync(backgroundPath, response.data);

              // Update the screenshot document with the local file path
              screenshot.backgroundOutput = backgroundPath;
              await screenshot.save();

              // Continue with further processing or handling of the generated output
              //res.json({ cartoonImageURL, backgroundPath });
              res.redirect(`/userar/${userId}`);
            } catch (error) {
              console.error("Error processing background output:", error);
              res.status(500).send("Error processing background output.");
            }
          })
          .catch((error) => {
            console.error("Error converting image to cartoon:", error);
            const errorMessage =
              "NSFW content detected in input images. Please try taking another photo.";
            res.redirect(
              `/screenar/${userId}?error=${encodeURIComponent(errorMessage)}`
            );
          });
      }
    );
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error.");
  }
});

app.post("/submitForm", async (req, res) => {
  try {
    // Extract form data from the request body
    const { firstName, lastName, email, sexe } = req.body;

    // Get the next unique user ID
    const userId = await getNextUserId();

    // Create a new instance of the Screenshot model with the form data
    const screenshot = new Screenshot({
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      sexe: "none",
      screenshotPath: "",
    });

    // Save the screenshot data to the database
    await screenshot.save();

    // Redirect the user to the /userId/:userId route
    res.redirect(`/screen/${userId}`);
  } catch (error) {
    console.error("Error submitting form:", error);
    // Send an error response if there was a problem with form submission
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/submitFormAr", async (req, res) => {
  try {
    // Extract form data from the request body
    const { firstName, lastName, email, sexe } = req.body;

    // Get the next unique user ID
    const userId = await getNextUserId();

    // Create a new instance of the Screenshot model with the form data
    const screenshot = new Screenshot({
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      sexe: "none",
      screenshotPath: "",
    });

    // Save the screenshot data to the database
    await screenshot.save();

    // Redirect the user to the /userId/:userId route
    res.redirect(`/screenar/${userId}`);
  } catch (error) {
    console.error("Error submitting form:", error);
    // Send an error response if there was a problem with form submission
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/screen/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });
    const error = req.query.error || null;

    // Render user.ejs template with user data
    res.render("screen", { userData, error });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/screenar/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });
    const error = req.query.error || null;

    // Render user.ejs template with user data
    res.render("screen-ar", { userData, error });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/testconv/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("convert", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/user/testconvar/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find the user data based on the provided user ID
    const userData = await Screenshot.find({ userId: userId });

    // Render user.ejs template with user data
    res.render("convert-ar", { userData });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send("Internal server error");
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
