const Anthropic = require("@anthropic-ai/sdk");
const http = require("http");
require("dotenv").config();

const client = new Anthropic.default();

// This function calls your running inventory-api
function searchInventory(params) {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams(params).toString();
    const url = `http://localhost:3000/vehicles?${query}`;

    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

// Tool definition — this is what Claude sees
const tools = [
  {
    name: "search_inventory",
    description: "Search the vehicle inventory database. Can filter by make, model, year, or max price.",
    input_schema: {
      type: "object",
      properties: {
        make: { type: "string", description: "Vehicle make, e.g. Toyota" },
        model: { type: "string", description: "Vehicle model, e.g. Camry" },
        year: { type: "integer", description: "Vehicle year" },
        max_price: { type: "number", description: "Maximum price in dollars" },
      },
      required: [],
    },
  },
];

async function askAboutInventory(question) {
  console.log(`\nQuestion: ${question}\n`);

  const messages = [{ role: "user", content: question }];

  // First call — Claude decides whether to use the tool
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: tools,
    messages: messages,
  });

  // If Claude wants to use the tool
  if (response.stop_reason === "tool_use") {
    const toolUse = response.content.find((b) => b.type === "tool_use");
    console.log(`Claude is calling: ${toolUse.name}`);
    console.log(`With params:`, toolUse.input);

    // Actually call your inventory API
    const results = await searchInventory(toolUse.input);
    console.log(`API returned ${results.length} vehicles\n`);

    // Second call — send the results back to Claude
    const finalResponse = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: tools,
      messages: [
        ...messages,
        { role: "assistant", content: response.content },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify(results),
            },
          ],
        },
      ],
    });

    console.log("Answer:", finalResponse.content[0].text);
  } else {
    console.log("Answer:", response.content[0].text);
  }
}

// Ask something!
askAboutInventory("Do you have any trucks available?");