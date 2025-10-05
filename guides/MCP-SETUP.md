# MCP Server Setup for Tuberise Analytics

This project is configured with powerful MCP (Model Context Protocol) servers to enhance development efficiency.

## Configured MCP Servers

### 🤖 ai-validation

- **Purpose**: AI-powered JSON testing and prompt engineering
- **Features**: Automated test generation, prompt optimization
- **Usage**: Run AI validation on API responses and prompts

### 🏥 code-health

- **Purpose**: Project-specific health monitoring
- **Features**: Dependency analysis, code quality metrics, performance monitoring
- **Configuration**: See `code-health.config.json`

### 🗺️ code-mapper

- **Purpose**: Source map visualization and debugging
- **Features**: Circular dependency detection, orphan code identification
- **Output**: Mermaid diagrams for visual analysis

### 🔍 code-search

- **Purpose**: Advanced code search (ripgrep + semantic)
- **Features**: Semantic code understanding, fast text search
- **Index**: Stored in `.code-search-index/`

### ⚛️ typescript-react-agent

- **Purpose**: Project manager with Mistral AI backend
- **Features**: Memory banks, TypeScript expertise, project management
- **Memory**: Persistent storage in `.agent-memory/`

### 🧠 sequential-thinking

- **Purpose**: Chain-of-thought reasoning engine
- **Features**: Deep reasoning, structured problem solving

### 🎭 puppeteer

- **Purpose**: Browser automation for testing and scraping
- **Features**: Headless browser control, screenshot capabilities

## Setup Instructions

1. **Install MCP servers**: Run `./setup-mcp-servers.ps1`
2. **Configure environment**: Update `.env` with your API keys
3. **Start development**: MCP servers will auto-start with Cursor

## Configuration Files

- `mcp.json` - Main MCP server configuration
- `code-health.config.json` - Code health monitoring settings
- `mcp.env.example` - Environment variable template
- `.cursorrules/` - Best practices rules for each technology

## Usage Tips

- **Before refactoring**: Use code-mapper to visualize dependencies
- **Code quality**: Monitor with code-health for continuous improvement
- **Search code**: Use code-search for semantic understanding
- **Project management**: Leverage typescript-react-agent for guidance
- **Testing**: Use ai-validation for automated test generation

## Troubleshooting

- Check MCP server logs in `reports/mcp-logs/`
- Verify API keys in `.env` file
- Ensure all MCP packages are installed globally
- Restart Cursor after configuration changes
