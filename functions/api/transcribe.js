export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const audio = formData.get("file");

    if (!audio) {
      return Response.json(
        { error: "No audio file received." },
        { status: 400 }
      );
    }

    const audioBuffer = await audio.arrayBuffer();

    const result = await context.env.AI.run(
      "@cf/openai/whisper",
      {
        audio: [...new Uint8Array(audioBuffer)]
      }
    );

    return Response.json({
      text: result.text || ""
    });

  } catch (error) {
    return Response.json(
      {
        error: "Transcription failed.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
