import path, { relative } from 'path';
import openai from './openai.js';

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

const createStore = (docs) =>
  MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());

const docsFromPDF = async (relativePath) => {
  normalizePath = path.normalize(relativePath);
  const loader = new PDFLoader(relativePath);
  const docs = await loader.load();
  const splitter = new CharacterTextSplitter({
    separator: '. ', //INFO do not split in the middle of a sentence
    chunkSize: 2500,
    chunkOverlap: 100,
  });
  return splitter.splitDocuments(docs);
};

const loadStore = async (relativePath) => {
  const pdfDocs = await docsFromPDF(relativePath);
  return createStore([...pdfDocs]);
};

const query = async (relativePath, question) => {
  const store = await loadStore(relativePath);
  const result = await store.similaritySearch(question, 2);
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0, //INFO 0 is deterministic for the document QA
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant. Answser questions to your best ability.',
      },
      {
        role: 'user',
        content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
        Question: ${question}
  
        Context: ${result.map((r) => r.pageContent).join('\n')}`,
      },
    ],
  });
  console.log(
    `Answer: ${response.choices[0].message.content}\n\nSources: ${result
      .map((r) => r.metadata.source)
      .join(', ')}`
  );
};
query(relativePath, question);
