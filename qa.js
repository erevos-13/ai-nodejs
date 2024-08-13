import openai from "./openai.js";

import { Document } from "langchain/document";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { CharacterTextSplitter } from "langchain/text_splitter";

const question = process.argv[2] || "hi";
const video = `https://youtu.be/zR_iuq2evXo?si=cG8rODgRgXOx9_Cn`;

const createStore = (docs) =>
  MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());

const docsFromYTVideo = async (video) => {
  const loader = YoutubeLoader.createFromUrl(video, {
    language: "en",
    addVideoInfo: true,
  });
  const docs = await loader.load();
  const splitter = new CharacterTextSplitter({
    separator: " ",
    chunkSize: 2500,
    chunkOverlap: 100,
  });
  return splitter.splitDocuments(docs);
};

const docsFromPDF = async () => {
  const loader = new PDFLoader("./xbox.pdf");
  const docs = await loader.load();
  const splitter = new CharacterTextSplitter({
    separator: ". ", //INFO do not split in the middle of a sentence
    chunkSize: 2500,
    chunkOverlap: 100,
  });
  return splitter.splitDocuments(docs);
};

const loadStore = async () => {
  const videoDocs = await docsFromYTVideo(video);
  const pdfDocs = await docsFromPDF();
  return createStore([...videoDocs, ...pdfDocs]);
};

const query = async () => {
  const store = await loadStore();
  const result = await store.similaritySearch(question, 2);
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0, //INFO 0 is deterministic for the document QA
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. Answser questions to your best ability.",
      },
      {
        role: "user",
        content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
        Question: ${question}
  
        Context: ${result.map((r) => r.pageContent).join("\n")}`,
      },
    ],
  });
  console.log(
    `Answer: ${response.choices[0].message.content}\n\nSources: ${result
      .map((r) => r.metadata.source)
      .join(", ")}`
  );
};
query();

