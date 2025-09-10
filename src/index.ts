#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

interface ImageGenerationRequest {
  model: string;
  prompt: string;
  image?: string | string[];
  size?: string;
  seed?: number;
  sequential_image_generation?: string;
  sequential_image_generation_options?: object;
  stream?: boolean;
  guidance_scale?: number;
  response_format?: string;
  watermark?: boolean;
}

interface ImageGenerationResponse {
  model: string;
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
  usage: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

const server = new Server(
  {
    name: "doubao-image-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_image",
        description: "Generate images using Doubao image generation API",
        inputSchema: {
          type: "object",
          properties: {
            model: {
              type: "string",
              description: "Model ID or Endpoint ID for image generation",
              default: "doubao-seedream-4-0-250828"
            },
            prompt: {
              type: "string",
              description: "Text prompt for image generation (supports Chinese and English)"
            },
            image: {
              oneOf: [
                { type: "string" },
                { type: "array", items: { type: "string" } }
              ],
              description: "Reference image(s) as URL or Base64 encoded string"
            },
            size: {
              type: "string",
              description: "Image size",
              enum: ["1K", "2K", "4K"],
              default: "2K"
            },
            seed: {
              type: "integer",
              description: "Random seed for controlling generation randomness",
              minimum: -1,
              maximum: 2147483647,
              default: -1
            },
            sequential_image_generation: {
              type: "string",
              description: "Control multi-image generation mode",
              enum: ["auto", "disabled"],
              default: "disabled"
            },
            stream: {
              type: "boolean",
              description: "Enable streaming output",
              default: false
            },
            guidance_scale: {
              type: "number",
              description: "Guidance scale for prompt adherence",
              minimum: 1,
              maximum: 10
            },
            response_format: {
              type: "string",
              description: "Response format for generated images",
              enum: ["url", "b64_json"],
              default: "url"
            },
            watermark: {
              type: "boolean",
              description: "Add watermark to generated images",
              default: true
            }
          },
          required: ["prompt"]
        }
      }
    ] as Tool[],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "generate_image") {
    try {
      const apiKey = process.env.DOUBAO_KEY;
      if (!apiKey) {
        return {
          content: [
            {
              type: "text",
              text: "Error: DOUBAO_KEY environment variable is not set",
            },
          ],
        };
      }

      if (!args || typeof args !== 'object') {
        return {
          content: [
            {
              type: "text",
              text: "Error: Missing or invalid arguments",
            },
          ],
        };
      }

      // Type assertion for args
      const typedArgs = args as any;

      const requestBody: ImageGenerationRequest = {
        model: typedArgs.model || "doubao-seedream-4-0-250828",
        prompt: typedArgs.prompt,
      };

      if (typedArgs.image) {
        requestBody.image = typedArgs.image;
      }
      if (typedArgs.size) {
        requestBody.size = typedArgs.size;
      }
      if (typedArgs.seed !== undefined) {
        requestBody.seed = typedArgs.seed;
      }
      if (typedArgs.sequential_image_generation) {
        requestBody.sequential_image_generation = typedArgs.sequential_image_generation;
      }
      if (typedArgs.sequential_image_generation_options) {
        requestBody.sequential_image_generation_options = typedArgs.sequential_image_generation_options;
      }
      if (typedArgs.stream !== undefined) {
        requestBody.stream = typedArgs.stream;
      }
      if (typedArgs.guidance_scale !== undefined) {
        requestBody.guidance_scale = typedArgs.guidance_scale;
      }
      if (typedArgs.response_format) {
        requestBody.response_format = typedArgs.response_format;
      }
      if (typedArgs.watermark !== undefined) {
        requestBody.watermark = typedArgs.watermark;
      }

      const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json() as ImageGenerationResponse;

      if (!response.ok) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${data.error?.message || "Failed to generate image"}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
      };
    }
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${name}`,
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Doubao Image MCP server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});