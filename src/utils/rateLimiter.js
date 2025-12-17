/**
 * Rate Limiter for OpenRouter API
 * OpenRouter has generous limits (200 req/min for free models)
 * We use 50 requests per minute to be conservative
 */

class RateLimiter {
  constructor(maxRequests = 50, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow; // 60 seconds
    this.requests = [];
  }

  async waitForSlot() {
    const now = Date.now();

    // Remove requests older than time window
    this.requests = this.requests.filter(
      (timestamp) => now - timestamp < this.timeWindow
    );

    // If under limit, allow immediately
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return;
    }

    // Calculate wait time until oldest request expires
    const oldestRequest = this.requests[0];
    const waitTime = this.timeWindow - (now - oldestRequest) + 1000; // Add 1 second buffer

    console.log(`Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);

    // Wait for the required time
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    // Recursively try again
    return this.waitForSlot();
  }

  reset() {
    this.requests = [];
  }
}

// Export singleton instance - OpenRouter allows 50 requests per minute conservatively
const openRouterRateLimiter = new RateLimiter(50, 60000);

export default openRouterRateLimiter;
