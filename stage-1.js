import { PDFParse } from "pdf-parse";
import fs from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { configDotenv } from "dotenv";
import { Pinecone } from '@pinecone-database/pinecone';

configDotenv();

const fileBuffer = await fs.readFile("./story.pdf");

const Uint8ArrayData = new Uint8Array(fileBuffer);

const parse = new PDFParse(Uint8ArrayData);

const data = await parse.getText();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400,
  chunkOverlap: 110,
});

const pc = new Pinecone({
    apiKey:process.env.PINECONE_API_KEY
})

const parts = await splitter.splitText(`${data.text}`);

const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
  apiKey: process.env.MISTRAL_API_KEY,
});

const vectors = await embeddings.embedDocuments(parts);

const vectorsData = vectors.map((vector, idx) => {
  return { text: parts[idx], vector: vector };
});

const index = pc.Index("kodex-rag");

const vectorStored = await index.upsert({
    records : vectorsData.map((vec) => {
        return {
            id : `${Math.random() * 100000000000}`,
            metadata:{
                text:vec.text
            },
            values:vec.vector
        }
    })
})

console.log(vectorStored);