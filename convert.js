import { config } from "dotenv";
import Replicate from "replicate";
import fs from "fs";

config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

(async () => {
  try {
    // Path to the captured image stored in the 'screenshots' folder
    const imageFilePath = "./public/screenshots/1.jpg";

    // Check if the image file exists
    if (!fs.existsSync(imageFilePath)) {
      throw new Error("Captured image file not found.");
    }

    // Read the image file as base64 data
    const imageData = fs.readFileSync(imageFilePath, { encoding: "base64" });

    // Run the replicate API using the captured image
    const output = await replicate.run(
      "fofr/become-image:8d0b076a2aff3904dfcec3253c778e0310a68f78483c4699c7fd800f3051d2b3",
      {
        input: {
          image: `data:image/jpeg;base64,${imageData}`, // Provide the image data as base64
          prompt: "an anime character with painting filter",
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
    );

    // Check if the output array is empty or undefined
    if (!output || output.length === 0) {
      throw new Error("Anime effect output not found or empty.");
    }

    // Extract the URL of the output image from the replicate output
    const animeImageURL = output[0]; // The URL is directly accessible in the first element of the array

    // Now, remove the background from the image
    const backgroundOutput = await replicate.run(
      "smoretalk/rembg-enhance:c57bc7626c4b5eda6531ffb84657f5672932d0fad49120b94383ec93f7ad7ac6",
      {
        input: {
          image: animeImageURL,
        },
      }
    );

    console.log("Background removal output:", backgroundOutput);

    // Continue with further processing or handling of the generated output
  } catch (error) {
    console.error("Error:", error);
  }
})();
