import { configDotenv } from "dotenv";
configDotenv();
import { ChatMistralAI, MistralAIEmbeddings } from "@langchain/mistralai";
import { Pinecone } from "@pinecone-database/pinecone";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const userPrompt = "tell me about arav internship program";

const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
  apiKey: process.env.MISTRAL_API_KEY,
});

const vector = await embeddings.embedQuery(userPrompt);

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const index = pc.Index("kodex-rag");

const response = await index.query({
  vector: vector,
  includeMetadata: true,
  topK: 4,
});

const mistralSmall = new ChatMistralAI({
  model: "ministral-14b-2512",
  apiKey: process.env.MISTRAL_API_KEY,
});

const aiResponse = await mistralSmall.invoke([
  new SystemMessage(`
            Context : ${response.matches.map((match) => match.metadata.text).join("\n\n")}
        `),
  new HumanMessage(userPrompt),
]);

console.log(aiResponse);
