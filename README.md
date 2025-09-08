# VersoWaves

## MCP Server

The project includes a Node.js MCP server that exposes Playwright and utility tools over stdio.

### Install

```bash
npm i
```

This installs the MCP SDK and required dev dependencies.

### Start the MCP server

```bash
npm run mcp:start
```

The server runs over stdio and provides tools:
- run_playwright_tests: Run Playwright tests with optional grep/path/headed
- list_playwright_tests: List discovered tests
- open_allure_report: Generate and open Allure report
- read_project_file: Read a file relative to the project root
- grep_project: Regex search across project files (uses ripgrep if available, falls back to Node)
- run_shell_command: Run a limited set of safe commands (git status, ls/dir, npm run test, npx playwright test)

### Example tool payloads (conceptual)

- run_playwright_tests
```json
{"tool":"run_playwright_tests","params":{"grep":"Quotation","headed":true}}
```

- list_playwright_tests
```json
{"tool":"list_playwright_tests","params":{}}
```

- grep_project
```json
{"tool":"grep_project","params":{"pattern":"New_Quotation_V2","root":"."}}
```

If you use an MCP-compatible client (e.g., IDE or agent runtime), point it to execute `node mcp/server.js` over stdio.