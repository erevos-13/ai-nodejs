#!/usr/bin/env node

import chalk from "chalk";
import cliHtml from "cli-html";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import readline from "node:readline";
import openai from "./openai.js";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const message = async (history, message) => {
  const result = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [...history, message],
    temperature: 0.4, //INFO how creative the AI's responses are
  });
  return result.choices[0].message.content;
};
const formatMessage = (userInput) => ({ role: "user", content: userInput });

const chat = () => {
  const history = [
    {
      role: "system",
      content:
        "You are a helpful assistant that aids in the completion of tasks.",
    },
  ];
  const start = () => {
    rl.question("You: ", async (userInput) => {
      if (userInput.toLowerCase() === "exit") {
        rl.close();
        return;
      }
      const response = await message(
        history.map(({ content }) => formatMessage(content)),
        formatMessage(userInput)
      );
      console.log(chalk.black.bgGreenBright(`Bot:=========================`));
      marked.use(markedTerminal);
      console.log(cliHtml(marked.parse(`${response.toString()}`)));
      history.push({ role: "bot", content: response });
      start();
    });
  };
  start();
};
console.log('Chatbot init Type "exit" to quit');
chat();

