import { DallEAPIWrapper } from '@langchain/openai';

const toolImage = new DallEAPIWrapper({
  n: 1,
  model: 'dall-e-3',
  apiKey: process.env.OPENAI_API_KEY,
});

export default toolImage;
