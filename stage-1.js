import { PDFParse } from "pdf-parse";
import fs from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { configDotenv } from "dotenv";
configDotenv();

const fileBuffer = await fs.readFile("./story.pdf");

const Uint8ArrayData = new Uint8Array(fileBuffer);

const parse = new PDFParse(Uint8ArrayData);

const data = await parse.getText();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,
  chunkOverlap: 110,
});

const parts = await splitter.splitText(`${data.text}`);

const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
  apiKey: process.env.MISTRAL_API_KEY,
});

const vectors = await embeddings.embedDocuments(parts);

const vectorsData = vectors.map((vector, idx) => {
  return { text: parts[idx], vector: vector };
});

console.log(vectorsData);
