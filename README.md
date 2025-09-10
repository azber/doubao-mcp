# Doubao Image Generation MCP

一个用于豆包图片生成 API 的 MCP (Model Context Protocol) 服务器。

## 功能特性

- 支持豆包图片生成 API 的所有参数
- 支持文本转图片、图片转图片等多种生成模式
- 支持多种图片尺寸和格式
- 支持流式输出和批量生成
- 支持添加水印和自定义参数

## 安装

1. 克隆仓库：
```bash
git clone <repository-url>
cd doubao-mcp
```

2. 安装依赖：
```bash
npm install
```

3. 构建项目：
```bash
npm run build
```

## 配置

### 1. 设置 API 密钥

在使用之前，需要设置豆包 API 密钥：

```bash
export DOUBAO_KEY="your_api_key_here"
```

### 2. MCP 客户端配置

将以下配置添加到你的 MCP 客户端（如 Claude Desktop）配置文件中：

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "doubao-image": {
      "command": "node",
      "args": ["/path/to/doubao-mcp/dist/index.js"],
      "env": {
        "DOUBAO_KEY": "your_doubao_api_key_here"
      }
    }
  }
}
```

**注意**：
- 将 `/path/to/doubao-mcp` 替换为你的实际项目路径
- 将 `your_doubao_api_key_here` 替换为你的实际 API 密钥
- 确保项目已通过 `npm run build` 构建完成

## 使用方法

### 启动服务器

```bash
npm start
```

### 在 MCP 客户端中使用

服务器提供了一个 `generate_image` 工具，支持以下参数：

- `model` (可选): 模型 ID，默认为 "doubao-seedream-4-0-250828"
- `prompt` (必选): 图片生成提示词，支持中英文
- `image` (可选): 参考图片，支持 URL 或 Base64 编码
- `size` (可选): 图片尺寸，可选值 "1K", "2K", "4K"，默认 "2K"
- `seed` (可选): 随机种子，范围 [-1, 2147483647]，默认 -1
- `sequential_image_generation` (可选): 组图生成模式，"auto" 或 "disabled"
- `stream` (可选): 是否启用流式输出，默认 false
- `guidance_scale` (可选): 提示词遵循度，范围 [1, 10]
- `response_format` (可选): 响应格式，"url" 或 "b64_json"，默认 "url"
- `watermark` (可选): 是否添加水印，默认 true

### 示例

```json
{
  "tool": "generate_image",
  "arguments": {
    "prompt": "星际穿越，黑洞，科幻场景",
    "size": "2K",
    "watermark": true
  }
}
```

## 支持的模型

- `doubao-seedream-4-0-250828`: 主要的图片生成模型
- `doubao-seedream-3.0-t2i`: 文本转图片模型
- `doubao-seededit-3.0-i2i`: 图片转图片模型

## 开发

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

## 许可证

MIT