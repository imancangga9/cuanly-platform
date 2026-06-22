"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getGlobalSettingByKey } from "./global-settings";

// ------------------------------
// AI Settings Actions
// ------------------------------
export async function getAISettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let { data, error } = await supabase
    .from("ai_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // Create default settings if not exists
    const globalPrompt = await getGlobalSettingByKey("default_custom_prompt");
    const defaultPrompt = globalPrompt?.value || `Anda adalah customer service profesional untuk toko online.
- Selalu jawab dengan ramah dan profesional
- Gunakan bahasa Indonesia yang santai
- Pastikan informasi harga selalu dicantumkan dengan jelas
- Jika ada pertanyaan yang tidak bisa dijawab, arahkan customer untuk menghubungi admin
- Jangan membuat informasi baru yang tidak ada di data produk
- Berikan rekomendasi yang relevan jika memungkinkan`;
    
    const { data: newSettings, error: insertError } = await supabase
      .from("ai_settings")
      .insert({
        user_id: user.id,
        tone: "friendly",
        language: "id",
        custom_prompt: defaultPrompt
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating AI settings:", insertError);
      return null;
    }
    return newSettings;
  }

  if (error) {
    console.error("Error fetching AI settings:", error);
    return null;
  }

  return data;
}

export async function updateAISettings(data: {
  tone?: string;
  language?: string;
  custom_prompt?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("ai_settings")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating AI settings:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/ai");
  return { success: true };
}

// Reset custom prompt ke default global
export async function resetAIPromptToDefault() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Dapatkan default prompt global
  const globalPrompt = await getGlobalSettingByKey("default_custom_prompt");
  const defaultPrompt = globalPrompt?.value || `Anda adalah customer service profesional untuk toko online.
- Selalu jawab dengan ramah dan profesional
- Gunakan bahasa Indonesia yang santai
- Pastikan informasi harga selalu dicantumkan dengan jelas
- Jika ada pertanyaan yang tidak bisa dijawab, arahkan customer untuk menghubungi admin
- Jangan membuat informasi baru yang tidak ada di data produk
- Berikan rekomendasi yang relevan jika memungkinkan`;

  // Update user's ai_settings
  const { error } = await supabase
    .from("ai_settings")
    .update({
      custom_prompt: defaultPrompt,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Error resetting AI prompt:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/ai");
  return { success: true, prompt: defaultPrompt };
}

// ------------------------------
// Product AI Knowledge Actions
// ------------------------------
export async function getProductAIKnowledge(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("product_ai_knowledge")
    .select("*")
    .eq("product_id", productId)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) {
    console.error("Error fetching product AI knowledge:", error);
    return null;
  }

  return data;
}

export async function upsertProductAIKnowledge(
  productId: string,
  data: {
    ai_description?: string;
    benefits?: string;
    usage_instruction?: string;
    target_customer?: string;
    allowed_claim?: string;
    forbidden_claim?: string;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Check if knowledge exists
  const { data: existing } = await supabase
    .from("product_ai_knowledge")
    .select("id")
    .eq("product_id", productId)
    .single();

  let result;
  if (existing) {
    result = await supabase
      .from("product_ai_knowledge")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("product_id", productId);
  } else {
    result = await supabase
      .from("product_ai_knowledge")
      .insert({
        user_id: user.id,
        product_id: productId,
        ...data
      });
  }

  if (result.error) {
    console.error("Error upserting product AI knowledge:", result.error);
    return { error: result.error.message };
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/ai");
  return { success: true };
}

// ------------------------------
// Product FAQ Actions
// ------------------------------
export async function getProductFAQs(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("product_faq")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching product FAQs:", error);
    return [];
  }

  return data || [];
}

export async function createProductFAQ(
  productId: string,
  question: string,
  answer: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("product_faq")
    .insert({ product_id: productId, question, answer });

  if (error) {
    console.error("Error creating product FAQ:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/ai");
  return { success: true };
}

export async function deleteProductFAQ(faqId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("product_faq")
    .delete()
    .eq("id", faqId);

  if (error) {
    console.error("Error deleting product FAQ:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/ai");
  return { success: true };
}

// ------------------------------
// AI Conversations Actions
// ------------------------------
export async function getAIConversations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*, products(name, photo_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching AI conversations:", error);
    return [];
  }

  return data || [];
}

export async function createAIConversation(data: {
  product_id: string;
  customer_question: string;
  ai_answer: string;
  edited_answer?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("ai_conversations")
    .insert({ user_id: user.id, ...data });

  if (error) {
    console.error("Error creating AI conversation:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/ai");
  return { success: true };
}

// ------------------------------
// Generate AI Answer
// ------------------------------
export async function generateAIAnswer(
  productId: string,
  customerQuestion: string,
  selectedChannel: string,
  selectedLanguage: string = "id"
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get profile (store name)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // Get product data
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (!product) return { error: "Product not found" };

  // Get product channel prices
  const { data: productChannelPrices } = await supabase
    .from("product_channel_prices")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", user.id);

  // Get AI settings
  const aiSettings = await getAISettings();

  // Get product AI knowledge
  const productKnowledge = await getProductAIKnowledge(productId);

  // Get product FAQs
  const productFAQs = await getProductFAQs(productId);

  // Build language-specific prompts
  const languagePrompts: Record<string, { system: string; tone: Record<string, string> }> = {
    id: {
      system: "Anda adalah customer service profesional untuk toko online.",
      tone: {
        friendly: "santai dan ramah",
        professional: "profesional",
        formal: "formal"
      }
    },
    ms: {
      system: "Anda adalah khidmat pelanggan profesional untuk kedai dalam talian.",
      tone: {
        friendly: "mesra dan santai",
        professional: "profesional",
        formal: "formal"
      }
    },
    en: {
      system: "You are a professional customer service representative for an online store.",
      tone: {
        friendly: "friendly and casual",
        professional: "professional",
        formal: "formal"
      }
    }
  };

  const langConfig = languagePrompts[selectedLanguage] || languagePrompts.id;
  const tone = aiSettings?.tone || "friendly";
  const toneText = langConfig.tone[tone] || langConfig.tone.friendly;

  // Build prompt
  let systemPrompt = `${langConfig.system}\n`;
  if (profile?.store_name) {
    systemPrompt += selectedLanguage === "id" 
      ? `Nama toko Anda adalah "${profile.store_name}".\n` 
      : selectedLanguage === "ms" 
      ? `Nama kedai anda ialah "${profile.store_name}".\n` 
      : `Your store name is "${profile.store_name}".\n`;
  }
  
  if (selectedLanguage === "id") {
    systemPrompt += "### PENTING: SELALU JAWAB DALAM BAHASA INDONESIA SAJA, TANPA CAMPUR BAHASA LAIN!\n";
    systemPrompt += "Jawab pertanyaan customer berdasarkan informasi produk yang diberikan.\n";
    systemPrompt += "Jangan membuat informasi baru. Jika tidak tahu jawaban, arahkan customer untuk bertanya lebih detail.\n";
    systemPrompt += `Gunakan bahasa Indonesia yang ${toneText}.\n`;
  } else if (selectedLanguage === "ms") {
    systemPrompt += "### PENTING: JAWAB HANYA DALAM BAHASA MELAYU SAHAJA, JANGAN CAMPUR BAHASA LAIN!\n";
    systemPrompt += "Jawab soalan pelanggan berdasarkan maklumat produk yang diberikan.\n";
    systemPrompt += "Jangan cipta maklumat baharu. Jika tidak tahu jawapan, arahkan pelanggan untuk bertanya lebih terperinci.\n";
    systemPrompt += `Gunakan bahasa Melayu yang ${toneText}.\n`;
  } else {
    systemPrompt += "### IMPORTANT: ALWAYS ANSWER ONLY IN ENGLISH, NO MIXED LANGUAGES!\n";
    systemPrompt += "Answer customer questions based on the product information provided.\n";
    systemPrompt += "Do not create new information. If you don't know the answer, direct the customer to ask for more details.\n";
    systemPrompt += `Use ${toneText} English.\n`;
  }

  if (aiSettings?.custom_prompt) {
    systemPrompt += `\nAturan khusus dari toko (tetap jawab dalam bahasa yang ditentukan):\n${aiSettings.custom_prompt}\n`;
  }

  let userPrompt = `\nInformasi Produk:\n`;
  userPrompt += `- Nama: ${product.name}\n`;
  if (product.brand) userPrompt += `- Brand: ${product.brand}\n`;
  if (product.description) userPrompt += `- Deskripsi: ${product.description}\n`;
  
  // Add price per channel
  if (productChannelPrices && productChannelPrices.length > 0) {
    userPrompt += `- Harga Jual per Channel:\n`;
    productChannelPrices.forEach(price => {
      userPrompt += `  - ${price.channel_name}: Rp ${new Intl.NumberFormat('id-ID').format(Number(price.selling_price))}\n`;
    });
    // Also highlight the selected channel's price if available
    if (selectedChannel) {
      const selectedPrice = productChannelPrices.find(p => p.channel_name === selectedChannel);
      if (selectedPrice) {
        userPrompt += `\nUntuk channel "${selectedChannel}", harga jual adalah Rp ${new Intl.NumberFormat('id-ID').format(Number(selectedPrice.selling_price))}\n`;
      }
    }
  }

  if (productKnowledge) {
    if (productKnowledge.ai_description) userPrompt += `- Penjelasan Produk: ${productKnowledge.ai_description}\n`;
    if (productKnowledge.benefits) userPrompt += `- Manfaat: ${productKnowledge.benefits}\n`;
    if (productKnowledge.usage_instruction) userPrompt += `- Cara Pakai: ${productKnowledge.usage_instruction}\n`;
    if (productKnowledge.allowed_claim) userPrompt += `- Klaim yang Diizinkan: ${productKnowledge.allowed_claim}\n`;
    if (productKnowledge.forbidden_claim) userPrompt += `- Klaim yang Dilarang: ${productKnowledge.forbidden_claim}\n`;
  }

  if (productFAQs.length > 0) {
    userPrompt += `\nFAQ Produk:\n`;
    productFAQs.forEach((faq, i) => {
      userPrompt += `${i + 1}. Q: ${faq.question}\n   A: ${faq.answer}\n`;
    });
  }

  userPrompt += `\nPertanyaan Customer: ${customerQuestion}`;
  
  // Final instruction to enforce language
  if (selectedLanguage === "id") {
    userPrompt += "\n\n### INGAT: JAWAB HANYA DALAM BAHASA INDONESIA!";
  } else if (selectedLanguage === "ms") {
    userPrompt += "\n\n### INGAT: JAWAB HANYA DALAM BAHASA MELAYU!";
  } else {
    userPrompt += "\n\n### REMEMBER: ANSWER ONLY IN ENGLISH!";
  }

  try {
    console.log("=== AI GENERATION STARTED ===");
    console.log("Selected language:", selectedLanguage);
    console.log("System prompt preview:", systemPrompt.substring(0, 200), "...");
    console.log("User prompt preview:", userPrompt.substring(0, 200), "...");

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("❌ OPENROUTER_API_KEY is missing from .env.local!");
      throw new Error("API key OpenRouter tidak ditemukan. Silakan tambahkan di file .env.local");
    }
    console.log("✅ API key found (starts with):", apiKey.substring(0, 10), "...");

    // Daftar model fallback yang stabil di OpenRouter
    const models = [
      "openai/gpt-oss-120b:free",
      "mistralai/mistral-7b-instruct:free",
      "meta-llama/llama-3-8b-instruct:free"
    ];

    let lastError;
    
    // Coba satu per satu model sampai berhasil
    for (const model of models) {
      try {
        console.log(`🔄 Trying model: ${model}`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Cuanly AI"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7
          })
        });

        console.log(`Response status for ${model}:`, response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Model ${model} failed:`, errorText);
          lastError = errorText;
          continue; // Coba model berikutnya
        }

        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content;

        if (answer) {
          console.log("✅ Success! Generated answer with model:", model);
          console.log("Answer preview:", answer.substring(0, 100), "...");
          return { answer };
        }
        
        console.log(`⚠️ Model ${model} returned no answer`);
        continue;
        
      } catch (modelError) {
        console.error(`❌ Model ${model} exception:`, modelError);
        lastError = modelError;
        continue;
      }
    }

    // Jika semua model gagal
    throw new Error(`Semua model AI gagal. Error terakhir: ${lastError}`);
    
  } catch (err) {
    console.error("🔥 FATAL ERROR in AI generation:", err);
    // Berikan pesan error yang lebih jelas ke user
    return { 
      error: err instanceof Error 
        ? err.message 
        : "Gagal terhubung ke AI, silakan coba lagi nanti" 
    };
  }
}