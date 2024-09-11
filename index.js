#!/usr/bin/env node
import 'dotenv/config';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import chalk from 'chalk';
import cliHtml from 'cli-html';
import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import ora from 'ora';
import cliSpinners from 'cli-spinners';
import readline from 'node:readline';
import openai from './openai.js';
import toolImage from './image-ai.js';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const message = async (history, message) => {
  const result = await openai.chat.completions.create({
    model: process.env.OPEN_AI_MODEL,
    messages: [...history, message],
    temperature: 0.4, //INFO how creative the AI's responses are
  });
  return result.choices[0].message.content;
};
const formatMessage = (userInput) => ({ role: 'user', content: userInput });

const chat = () => {
  const history = [
    {
      role: 'system',
      content:
        'You are a helpful assistant that aids in the completion of tasks.',
    },
  ];
  const start = () => {
    rl.question('You: ', async (userInput) => {
      console.log('userInput:', userInput);
      if (userInput.toLowerCase() === 'exit') {
        rl.close();
        return;
      }
      // Select a spinner style from cli-spinners
      const spinnerStyle = cliSpinners.dots; // You can choose any spinner style from cli-spinners

      // Create an ora spinner with the selected style
      const spinner = ora({
        text: 'Loading...\n',
        spinner: spinnerStyle,
        discardStdin: false,
      }).start();
      try {
        const response = await message(
          history.map(({ content }) => formatMessage(content)),
          formatMessage(userInput)
        );
        spinner.succeed('Response from the Helper Assistant:');
        marked.use(markedTerminal);
        console.log(cliHtml(marked.parse(`${response.toString()}`)));
        history.push({ role: 'bot', content: response });
      } catch (error) {
        spinner.fail('Failed to generate response message');
        console.error(error);
      } finally {
        spinner.stop();
        // Clear the line to remove any spinner artifacts
        process.stdout.write('\x1B[2K\x1B[0G');
        start();
      }
    });
  };
  start();
};
console.log('Chatbot init Type "exit" to quit');

const imageGenerator = async () => {
  rl.question('You describe the image: ', async (userInput) => {
    if (userInput.toLowerCase() === 'exit') {
      rl.close();
      return;
    }
    // Select a spinner style from cli-spinners
    const spinnerStyle = cliSpinners.dots; // You can choose any spinner style from cli-spinners

    // Create an ora spinner with the selected style
    const spinner = ora({
      text: 'Loading...',
      spinner: spinnerStyle,
    }).start();
    const imageResult = await toolImage.invoke(userInput);
    spinner.succeed('Image Generated completed!');
    console.log(chalk.black.bgGreenBright(`Image:=========================`));
    console.log(imageResult);
  });
};

yargs(hideBin(process.argv))
  .command('chat', 'Start chatbot', chat)
  .command('img', 'Generate image from your terminal', imageGenerator)
  .command('qa', 'Question and Answer')
  .demandCommand(1)
  .parse();
