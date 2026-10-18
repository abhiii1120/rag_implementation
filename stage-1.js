import { PDFParse } from "pdf-parse";
import fs from 'fs/promises';
import {RecursiveCharacterTextSplitter} from '@langchain/textsplitters';

const fileBuffer = await fs.readFile("./story.pdf");

const Uint8ArrayData = new Uint8Array(fileBuffer);

const parse = new PDFParse(Uint8ArrayData);

const data = await parse.getText();


const splitter = new RecursiveCharacterTextSplitter({
    chunkSize:200,
    chunkOverlap:90,
})

const parts = await splitter.splitText(`${data.text}`)

console.log(parts)