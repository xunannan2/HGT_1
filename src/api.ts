import { Story } from "./stories";
import { GoogleGenAI } from "@google/genai";

let hasZhipuConfig: boolean | null = null;

const checkZhipuConfig = async () => {
  if (hasZhipuConfig !== null) return hasZhipuConfig;
  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    hasZhipuConfig = data.hasZhipu;
    return hasZhipuConfig;
  } catch (e) {
    console.error("Failed to check config:", e);
    return false;
  }
};

/**
 * Sends a question to the AI based on the current story context.
 * Uses Zhipu AI (BigModel) with Google Gemini fallback.
 */
export const askAI = async (question: string, story: Story): Promise<string> => {
  const prompt = `
    你是一个“海龟汤”（情境推理游戏）的主持人。
    
    【游戏背景】
    故事标题：${story.title}
    汤面（表面情况）：${story.surface}
    汤底（真相）：${story.bottom}
    
    【回答规则】
    1. 如果玩家的问题包含“提示”、“给点提示”、“线索”等请求提示的词汇：
       请给出一个“轻度提示”。提示应该是一个引导性的提问或线索，不能直接说出真相。
       回答格式必须为：“轻度提示：[你的提示内容]”。
       例如：“轻度提示：关键人物的身份很重要”。
    2. 对于其他所有推理问题，你必须且只能从以下三个词中选择一个回答：
       - "是"：玩家的猜测与真相一致。
       - "否"：玩家的猜测与真相矛盾。
       - "无关"：玩家的问题与推理真相没有直接关系。
    
    【示例对话】
    玩家：他死了吗？
    回答：是
    
    玩家：他是被毒死的吗？
    回答：否
    
    玩家：今天天气好吗？
    回答：无关
    
    玩家：给我个提示。
    回答：轻度提示：注意故事中提到的那个“包裹”的用途。
    
    【当前任务】
    玩家提出的问题是：“${question}”
    请给出回答：
  `;

  const isZhipuAvailable = await checkZhipuConfig();

  try {
    let text = "";

    if (isZhipuAvailable) {
      // Engine 1: Zhipu AI via Proxy
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`智谱接口错误 (${response.status}): ${errorData.error || "未知错误"}`);
        }

        const data = await response.json();
        text = data.choices[0].message.content.trim();
      } catch (e) {
        console.error("Zhipu Engine Failed:", e);
        throw e; // Re-throw to be caught by the outer catch
      }
    } else {
      // Engine 2: Google Gemini Fallback
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error("未检测到有效配置（ZHIPU_API_KEY 或 GEMINI_API_KEY 缺失）");
        }
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        
        if (!response.text) {
          throw new Error("Gemini 返回内容为空");
        }
        text = response.text.trim();
      } catch (e) {
        console.error("Gemini Engine Failed:", e);
        throw e;
      }
    }

    // Check for hint response
    if (text.startsWith("轻度提示：") || text.includes("轻度提示")) {
      return text;
    }

    // Strict validation for standard responses
    const validResponses = ["是", "否", "无关"];
    
    // Check for exact match first
    if (validResponses.includes(text)) {
      return text;
    }

    // If not exact, try to find the keyword in the response
    for (const valid of validResponses) {
      if (text === valid || text.startsWith(valid) || text.endsWith(valid)) {
        return valid;
      }
    }

    // If AI fails to follow rules, return a friendly prompt to the user
    return "抱歉，我无法用“是/否/无关”来回答这个问题。请尝试换一种问法（例如：他是自杀吗？），或者输入“提示”获取线索。";
  } catch (error) {
    console.error("AI 调用失败:", error);
    const message = error instanceof Error ? error.message : "未知错误";
    throw new Error(`AI 助手暂时无法响应: ${message}`);
  }
};
