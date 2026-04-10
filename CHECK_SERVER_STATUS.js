#!/usr/bin/env node

/**
 * Quick Server Status Check
 * Run this to verify if the backend server and database are running
 */

const http = require("http");

const API_URL = process.env.VITE_API_URL || "http://localhost:5000";
const CHECKS = [
  {
    name: "Basic Server Response",
    endpoint: "/",
    expectedStatus: 200,
  },
  {
    name: "Health Check",
    endpoint: "/api/health",
    expectedStatus: 200,
  },
  {
    name: "Database Connection",
    endpoint: "/api/test-db",
    expectedStatus: 200,
  },
];

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

console.log(`\n${colors.cyan}=== Computer Excellence Academy - Server Status Check ===${colors.reset}\n`);
console.log(`API URL: ${colors.yellow}${API_URL}${colors.reset}\n`);

function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(`${API_URL}${endpoint}`);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: "GET",
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({ status: res.statusCode, data, error: null });
      });
    });

    req.on("error", (error) => {
      resolve({ status: null, data: null, error });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ status: null, data: null, error: new Error("TIMEOUT") });
    });

    req.end();
  });
}

(async () => {
  let systemHealthy = true;

  for (const check of CHECKS) {
    try {
      const result = await checkEndpoint(check.endpoint);

      if (result.error) {
        systemHealthy = false;
        console.log(`${colors.red}✗${colors.reset} ${check.name}`);

        if (result.error.code === "ECONNREFUSED") {
          console.log(`  ${colors.red}Cannot connect to server at ${API_URL}${colors.reset}`);
          console.log(
            `  ${colors.yellow}Make sure the backend server is running on port 5000${colors.reset}`
          );
        } else if (result.error.message === "TIMEOUT") {
          console.log(`  ${colors.red}Connection timeout${colors.reset}`);
          console.log(
            `  ${colors.yellow}Server may be experiencing issues or not responding${colors.reset}`
          );
        } else {
          console.log(`  Error: ${result.error.message}`);
        }
      } else if (result.status !== check.expectedStatus) {
        systemHealthy = false;
        console.log(`${colors.red}✗${colors.reset} ${check.name} (Status: ${result.status})`);
        if (result.status === 503) {
          console.log(`  ${colors.red}Database connection lost${colors.reset}`);
          console.log(
            `  ${colors.yellow}Check your MONGO_URI and ensure MongoDB Atlas is accessible${colors.reset}`
          );
        }
      } else {
        console.log(`${colors.green}✓${colors.reset} ${check.name}`);
        try {
          const data = JSON.parse(result.data);
          if (data?.dbConnected === false) {
            console.log(`  ${colors.yellow}⚠ Warning: Database may not be connected${colors.reset}`);
            systemHealthy = false;
          }
        } catch (e) {
          // ignore parse errors
        }
      }
    } catch (error) {
      systemHealthy = false;
      console.log(`${colors.red}✗${colors.reset} ${check.name}`);
      console.log(`  Error: ${error.message}`);
    }
  }

  console.log(`\n${colors.cyan}=== Recommendations ===${colors.reset}`);

  if (systemHealthy) {
    console.log(`${colors.green}✓ All systems operational!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}To fix the network error:${colors.reset}\n`);
    console.log("1. Start the backend server:");
    console.log(`   ${colors.cyan}cd server && npm start${colors.reset}\n`);
    console.log("2. Or if using npm from root:");
    console.log(`   ${colors.cyan}npm run server${colors.reset}\n`);
    console.log("3. Verify .env file in server/ has correct:");
    console.log(`   - MONGO_URI (MongoDB connection string)${colors.reset}`);
    console.log(`   - PORT (should be 5000)${colors.reset}\n`);
    console.log("4. Check client/.env has:");
    console.log(`   - VITE_API_URL=http://localhost:5000${colors.reset}\n`);
  }

  console.log();
  process.exit(systemHealthy ? 0 : 1);
})();
