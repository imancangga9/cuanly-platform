import { getProducts } from "@/actions/products";
import { getAISettings, getAIConversations } from "@/actions/ai";
import { getChannels } from "@/actions/channels";
import { getAIWallet } from "@/actions/ai-credit";
import { AIClient } from "./client";

export default async function AIPage() {
  const [products, aiSettings, conversations, channels, wallet] = await Promise.all([
    getProducts(),
    getAISettings(),
    getAIConversations(),
    getChannels(),
    getAIWallet()
  ]);

  return (
    <AIClient
      products={products}
      aiSettings={aiSettings}
      conversations={conversations}
      channels={channels}
      wallet={wallet}
    />
  );
}