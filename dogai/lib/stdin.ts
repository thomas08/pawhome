/**
 * Read all stdin as a string and parse as JSON.
 * Works correctly whether stdin is piped or a heredoc.
 */
export async function readStdinJson(): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => { data += chunk; });
    process.stdin.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (err) {
        reject(new Error(`Invalid JSON on stdin: ${err}`));
      }
    });
    process.stdin.on("error", reject);
  });
}
