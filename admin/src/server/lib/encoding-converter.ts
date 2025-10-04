import * as iconv from "iconv-lite";

export function bufferToString(buffer: Buffer): string {
  const startTime = Date.now();
  console.log("[DEBUG] Encoding conversion start:", {
    bufferSize: buffer.length,
    timestamp: new Date().toISOString(),
  });

  // Try to detect encoding and convert to UTF-8
  try {
    // First try Shift-JIS (common for Japanese CSV files)
    const shiftJisStart = Date.now();
    const shiftJisContent = iconv.decode(buffer, "shift_jis");
    console.log("[DEBUG] Shift-JIS decode attempt:", {
      duration: Date.now() - shiftJisStart,
      contentLength: shiftJisContent.length,
      hasJapanese: {
        取引: shiftJisContent.includes("取引"),
        借方: shiftJisContent.includes("借方"),
        貸方: shiftJisContent.includes("貸方"),
      },
    });

    // Check if the decoded content looks reasonable (contains expected Japanese characters)
    if (
      shiftJisContent.includes("取引") ||
      shiftJisContent.includes("借方") ||
      shiftJisContent.includes("貸方")
    ) {
      console.log("[DEBUG] Encoding detected as Shift-JIS:", {
        totalDuration: Date.now() - startTime,
      });
      return shiftJisContent;
    }
  } catch (error) {
    // Shift-JIS decoding failed, continue to try other encodings
    console.log("[DEBUG] Shift-JIS decode failed:", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    // Try UTF-8
    const utf8Start = Date.now();
    const utf8Content = buffer.toString("utf8");
    console.log("[DEBUG] UTF-8 decode successful:", {
      duration: Date.now() - utf8Start,
      totalDuration: Date.now() - startTime,
      contentLength: utf8Content.length,
    });
    return utf8Content;
  } catch (error) {
    console.error("[ERROR] All encoding attempts failed:", {
      error: error instanceof Error ? error.message : String(error),
      totalDuration: Date.now() - startTime,
    });
    throw new Error("Unable to decode CSV file. Unsupported encoding.");
  }
}
