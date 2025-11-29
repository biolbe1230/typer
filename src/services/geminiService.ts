
const DEEPSEEK_API_KEY = 'sk-6c4a148fd21b4e7b85d63f5f26e1c326';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

export const enhanceText = async (text: string): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Rewrite the following text to sound like a vintage noir detective novel monologue or an old-school telegram. Keep it concise (max 200 characters). Do not add quotes."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 1.0,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("DeepSeek API Error Details:", errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // DeepSeek (OpenAI format) returns choices[0].message.content
    return data.choices?.[0]?.message?.content?.trim() || text;

  } catch (error) {
    console.error("DeepSeek API Error:", error);
    return text; // Fallback to original text on error
  }
};
