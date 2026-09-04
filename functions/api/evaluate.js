export async function onRequestPost(context) {
  try {
    const { transcript, duration } = await context.request.json();

    if (!transcript) {
      return Response.json(
        { error: "No transcript provided." },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert speaking coach.

Evaluate this speech transcript.

SPEECH:
${transcript}

SPEAKING TIME:
${duration || "unknown"} seconds

Return ONLY valid JSON with this exact structure:

{
  "overall": 0,
  "clarity": 0,
  "structure": 0,
  "fluency": 0,
  "vocabulary": 0,
  "conciseness": 0,
  "argument": 0,
  "strengths": ["", ""],
  "improvements": ["", ""],
  "summary": ""
}

Scores must be from 1 to 10.

Judge the actual content and delivery evidence in the transcript.
Do not invent things that cannot be determined from the transcript.
`;

    const result = await context.env.AI.run(
      "@cf/meta/llama-3.1-8b-instruct",
      { prompt }
    );

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: "AI evaluation failed.", details: error.message },
      { status: 500 }
    );
  }
}
