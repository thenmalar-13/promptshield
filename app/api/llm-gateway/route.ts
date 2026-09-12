import { NextResponse } from "next/server";

const MODEL = "gemini-3.6-flash";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const prompt = body?.prompt;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        {
          error: "A non-empty prompt is required.",
        },
        { status: 400 }
      );
    }

    /*
     * This endpoint is intentionally a separate LLM gateway.
     *
     * The frontend must call this endpoint ONLY after
     * PromptShield has decided that the request is ALLOWED.
     *
     * The security-analysis endpoint remains separate so that
     * the firewall and the actual LLM request are clearly
     * separated in the architecture.
     */

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          model: MODEL,
          input: prompt,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini LLM gateway error:", data);

      return NextResponse.json(
        {
          error: "LLM request failed.",
          details:
            data?.error?.message || "Unknown Gemini error",
        },
        { status: response.status }
      );
    }

    console.log(
      "Gemini LLM response:",
      JSON.stringify(data, null, 2)
    );

    let outputText: string | undefined;

    /*
     * Try the common Interactions API response formats.
     */

    if (typeof data?.output_text === "string") {
      outputText = data.output_text;
    }

    if (!outputText && Array.isArray(data?.output)) {
      for (let i = data.output.length - 1; i >= 0; i--) {
        const item = data.output[i];

        if (typeof item?.text === "string") {
          outputText = item.text;
          break;
        }

        if (Array.isArray(item?.content)) {
          for (
            let j = item.content.length - 1;
            j >= 0;
            j--
          ) {
            const content = item.content[j];

            if (typeof content?.text === "string") {
              outputText = content.text;
              break;
            }
          }
        }

        if (outputText) break;
      }
    }

    if (!outputText && Array.isArray(data?.steps)) {
      for (let i = data.steps.length - 1; i >= 0; i--) {
        const step = data.steps[i];

        if (typeof step?.text === "string") {
          outputText = step.text;
          break;
        }

        if (Array.isArray(step?.content)) {
          for (
            let j = step.content.length - 1;
            j >= 0;
            j--
          ) {
            const content = step.content[j];

            if (typeof content?.text === "string") {
              outputText = content.text;
              break;
            }
          }
        }

        if (outputText) break;
      }
    }

    if (!outputText) {
      return NextResponse.json(
        {
          error: "Gemini returned no response text.",
          raw: data,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      source: "Gemini LLM",
      model: MODEL,
      response: outputText,
    });
  } catch (error) {
    console.error("PromptShield LLM gateway error:", error);

    return NextResponse.json(
      {
        error: "Unable to reach the LLM gateway.",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 }
    );
  }
}