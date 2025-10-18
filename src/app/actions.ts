
"use server";

import { summarizeTaskComments } from "@/ai/flows/summarize-task-comments";
import { askKreaBot } from "@/ai/flows/kreatask-bot-flow";
import { translateContent } from "@/ai/flows/translate-content-flow";
import { getTaskSuggestion } from "@/ai/flows/generate-tasks-flow";
import { z } from "zod";
import type { Task, User } from "@/lib/types";

// This file is now primarily for AI and other non-DB server actions.
// All database operations have been moved to src/app/actions/db.ts
export * from './actions/db';

export async function getSummary(formData: FormData) {
  try {
    const validatedData = z.object({ commentThread: z.string() }).parse({
      commentThread: formData.get("commentThread"),
    });

    const companyPolicy = "Summaries should be concise, professional, and focus on decisions and action items. Avoid informal language.";

    const result = await summarizeTaskComments({
      commentThread: validatedData.commentThread,
      companyPolicy,
    });
    
    return { summary: result.summary, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { summary: null, error: "Invalid input." };
    }
    return { summary: null, error: "Failed to generate summary." };
  }
}


export async function getKreaBotResponse(
  query: string,
  tasks: Task[],
  users: User[]
) {
  try {
    const result = await askKreaBot({
      query,
      tasks,
      users,
    });
    
    return { response: result.response, error: null };
  } catch (error) {
    console.error("KreaBot action error:", error);
    return { response: null, error: "Sorry, I encountered an error. Please try again." };
  }
}

const TranslateContentInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
});
type TranslateContentInput = z.infer<typeof TranslateContentInputSchema>;

const TranslateContentOutputSchema = z.object({
  en: z.string().describe('The English translation.'),
  id: z.string().describe('The Indonesian translation.'),
});
type TranslateContentOutput = z.infer<typeof TranslateContentOutputSchema>;


export async function getTranslations(text: string): Promise<{ data: TranslateContentOutput | null, error: string | null }> {
  try {
    const validatedData = TranslateContentInputSchema.parse({ text });
    const result = await translateContent(validatedData);
    return { data: result, error: null };
  } catch (error) {
    console.error("Translation action error:", error);
    if (error instanceof z.ZodError) {
      return { data: null, error: "Invalid text provided for translation." };
    }
    return { data: null, error: "Sorry, I couldn't translate the content right now." };
  }
}

export async function getTaskFromAI(idea: string, users: User[]) {
  if (!idea.trim()) {
    return { suggestion: null, error: "Please provide an idea." };
  }
  try {
    const result = await getTaskSuggestion({
      idea,
      users,
    });
    return { suggestion: result, error: null };
  } catch (e: any) {
    console.error("Error getting task from AI:", e);
    return { suggestion: null, error: "submit.toast.ai_error_generic" };
  }
}
