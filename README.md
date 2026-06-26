\# Inventory Agent



A Node.js agent that uses the Anthropic Claude API to answer plain-English questions about a vehicle inventory database.



\## How it works



The agent uses Claude's tool use feature. When you ask a question like "Do you have any trucks available?", Claude decides to call a `search\_inventory` tool, which queries a local REST API backed by SQLite. Claude then interprets the results and responds naturally.



This project demonstrates the core agentic two-call pattern:

1\. Send question to Claude with a tool definition

2\. Claude requests a tool call

3\. Your code executes the tool against the inventory API

4\. Send results back to Claude for a final natural language answer



\## Prerequisites



\- Node.js v18+

\- \[inventory-api](https://github.com/focus-appdev/inventory-api) running on localhost:3000

\- Anthropic API key



\## Setup



```bash

npm install

cp .env.example .env  # add your ANTHROPIC\_API\_KEY

node index.js

```



\## Example

Question: Do you have any trucks available?



Claude is calling: search\_inventory



With params: { model: 'truck' }



API returned 7 vehicles



Answer: Great news! We have several trucks available...

