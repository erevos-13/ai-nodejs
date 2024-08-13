import "dotenv/config";
import openai from "./openai.js";
import math from "advanced-calculator";
const QUESTION = process.argv[2] || "hi";

const messages = [
  {
    role: "user",
    content: QUESTION,
  },
];

const functions = {
  calculate: async ({ expression }) => {
    return math.evaluate(expression);
  },
  async generateImage({ prompt }) {
    const result = await openai.images.generate({
      prompt,
    });
    console.log("image generate", result);
    return result.data[0].url;
  },
};

const getCompletion = async (messages) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4-0613",
    messages,
    functions: [
      {
        //INFO function to calculate math expressions tell the model when to use it
        name: "calculate",
        description: "Run a math expression", //INFO is the prompt for the system to know when to use the function
        parameters: {
          type: "object",
          properties: {
            expression: {
              type: "string",
              description:
                'Then math expression to evaluate like "2 * 3 + (21 / 2) ^ 2"',
            },
          },
          required: ["expression"],
        },
      },
      {
        //INFO function to calculate math expressions tell the model when to use it
        name: "generateImage",
        description: "Create o generate image base on a description", //INFO is the prompt for the system to know when to use the function
        parameters: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description:
                'Then description of the image to generate like "A cat in the forest"',
            },
          },
          required: ["prompt"],
        },
      },
    ],
    temperature: 0,
  });

  return response;
};

let response;
while (true) {
  response = await getCompletion(messages);

  if (response.choices[0].finish_reason === "stop") {
    console.log(response.choices[0].message.content);
    break;
  } else if (response.choices[0].finish_reason === "function_call") {
    const fnName = response.choices[0].message.function_call.name;
    const args = response.choices[0].message.function_call.arguments;

    const functionToCall = functions[fnName];
    const params = JSON.parse(args);

    const result = functionToCall(params);

    messages.push({
      role: "assistant",
      content: null,
      function_call: {
        name: fnName,
        arguments: args,
      },
    });

    messages.push({
      role: "function",
      name: fnName,
      content: JSON.stringify({ result: result }),
    });
  }
}

