# AI CLI Tool

This project is a command-line interface (CLI) tool that interacts with OpenAI's API to provide various functionalities such as chat, image generation, and question-answering.

## Features

- **Chatbot**: Start a chatbot session.
- **Image Generator**: Generate images based on user descriptions.
- **Question and Answer**: Answer questions with optional tags.

## Prerequisites

- Node.js (v18 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/ai-cli-tool.git
   cd ai-cli-tool
   ```

2. Install the dependencies:
   npm install

3. Create a `.env` file in the root directory and add your OpenAI API key:
   OPENAI_API_KEY="your_openai_api_key_here"
   OPEN_AI_MODEL="gpt-4o"

## Usage

- Chatbot
  `termAi chat`

## Image Generator

    `termAi img`

## Question and Answer

    `termAi qa -f <the path of the file> -q <question here>`
    |> Must me string

## Dependencies

- dotenv: Loads environment variables from a .env file.
- ora: Elegant terminal spinner.
- cli-spinners: Collection of CLI spinners.
- chalk: Terminal string styling.
- yargs: Command-line argument parser.
- marked: Markdown parser.
- marked-terminal: Terminal renderer for marked.
- cli-html: Render HTML in the terminal.

## Example

````$ node index.js chat
Chatbot initialized. Type "exit" to quit.
You: Hello
⠇ Loading...
Bot: Hello! How can I assist you today?
You: exit```
````

## License

This README file provides a comprehensive overview of your project, including its features, prerequisites, installation steps, usage instructions, project structure, dependencies, an example usage, and the license. Feel free to customize it further based on your specific project details and requirements.
