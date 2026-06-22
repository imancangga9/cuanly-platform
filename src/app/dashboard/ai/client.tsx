"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Copy, RotateCcw, Save, MessageSquare, Package, CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  generateAIAnswer,
  createAIConversation,
  updateAISettings,
  resetAIPromptToDefault,
} from "@/actions/ai";
import { checkAICredit, useAICredit } from "@/actions/ai-credit";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  cost_price: number | string;
  photo_url?: string | null;
}

interface AISettings {
  id: string;
  tone: string;
  language: string;
  custom_prompt?: string;
}

interface Conversation {
  id: string;
  product_id: string;
  customer_question: string;
  ai_answer: string;
  edited_answer?: string;
  created_at: string;
  products?: { name: string; photo_url?: string | null };
}

interface AIWallet {
  id: string;
  balance: number;
}

export function AIClient({
  products,
  aiSettings,
  conversations: initialConversations,
  channels,
  wallet: initialWallet,
}: {
  products: Product[];
  aiSettings: AISettings | null;
  conversations: Conversation[];
  channels: Array<{ id: string; name: string }>;
  wallet: AIWallet | null;
}) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(aiSettings?.language || "id");
  const [customerQuestion, setCustomerQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [editedAnswer, setEditedAnswer] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [conversations, setConversations] = useState(initialConversations);
  const [wallet, setWallet] = useState(initialWallet);
  // Get default prompt from settings if available
  const initialPrompt = aiSettings?.custom_prompt || "";
  const [tone, setTone] = useState(aiSettings?.tone || "friendly");
  const [language, setLanguage] = useState(aiSettings?.language || "id");
  const [customPrompt, setCustomPrompt] = useState(initialPrompt);
  const [creditUsed, setCreditUsed] = useState(false);

  const handleGenerateAnswer = async () => {
    if (!selectedProductId || !customerQuestion) {
      alert("Silakan pilih produk dan masukkan pertanyaan customer!");
      return;
    }

    // Check credit
    if (!wallet || wallet.balance <= 0) {
      alert("AI Credit Anda habis! Silakan tambah credit terlebih dahulu.");
      return;
    }

    setIsGenerating(true);
    setCreditUsed(false);
    try {
      const result = await generateAIAnswer(selectedProductId, customerQuestion, selectedChannel, selectedLanguage);
      if (result.error) throw new Error(result.error);
      setAiAnswer(result.answer);
      setEditedAnswer(result.answer);
      
      // Deduct credit after successful generation - but don't fail if this fails
      try {
        const deductResult = await useAICredit();
        if (!deductResult.error) {
          setCreditUsed(true);
          // Update local wallet state
          if (wallet) {
            setWallet({
              ...wallet,
              balance: wallet.balance - 1
            });
          }
        }
      } catch (deductErr) {
        console.error("Failed to deduct credit:", deductErr);
        // Don't show error to user - answer is already generated
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghasilkan jawaban, silakan coba lagi!");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAnswer = () => {
    const textToCopy = editedAnswer || aiAnswer;
    navigator.clipboard.writeText(textToCopy);
    alert("Jawaban berhasil disalin!");
  };

  const handleRegenerate = async () => {
    await handleGenerateAnswer();
  };

  const handleSaveHistory = async () => {
    if (!selectedProductId || !customerQuestion || !aiAnswer) {
      alert("Data tidak lengkap!");
      return;
    }

    try {
      const result = await createAIConversation({
        product_id: selectedProductId,
        customer_question: customerQuestion,
        ai_answer: aiAnswer,
        edited_answer: editedAnswer !== aiAnswer ? editedAnswer : undefined,
      });
      if (result.error) throw new Error(result.error);
      
      // Tambahkan conversation baru ke state secara langsung
      const selectedProduct = products.find((p) => p.id === selectedProductId);
      const newConversation: Conversation = {
        id: Date.now().toString(),
        product_id: selectedProductId,
        customer_question: customerQuestion,
        ai_answer: aiAnswer,
        edited_answer: editedAnswer !== aiAnswer ? editedAnswer : undefined,
        created_at: new Date().toISOString(),
        products: selectedProduct ? { name: selectedProduct.name, photo_url: selectedProduct.photo_url } : undefined
      };
      
      setConversations([newConversation, ...conversations]);
      
      // Reset form
      setCustomerQuestion("");
      setAiAnswer("");
      setEditedAnswer("");
      
      alert("Riwayat chat berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan riwayat chat!");
    }
  };

  const handleSaveSettings = async () => {
    try {
      const result = await updateAISettings({ tone, language, custom_prompt: customPrompt });
      if (result.error) throw new Error(result.error);
      alert("Pengaturan berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan pengaturan!");
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm("Yakin ingin mereset prompt ke default?")) return;
    
    try {
      const result = await resetAIPromptToDefault();
      if (result.error) throw new Error(result.error);
      if (result.prompt) {
        setCustomPrompt(result.prompt);
      }
      alert("Prompt berhasil direset ke default!");
    } catch (err) {
      console.error(err);
      alert("Gagal mereset prompt!");
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-[#0fdc78]" />
          <h1 className="text-2xl font-bold">Cuanly AI — Smart Seller Assistant</h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-[#0fdc78] text-black flex items-center gap-2 px-4 py-2">
            <CreditCard className="h-4 w-4" />
            <span>{wallet?.balance || 0} Credit</span>
          </Badge>
          <Button asChild variant="secondary" size="sm">
            <Link href="/dashboard/ai-credit">
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Chat AI</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate Jawaban</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Produk</label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih produk" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            {product.photo_url && (
                              <img
                                src={product.photo_url}
                                alt={product.name}
                                className="w-6 h-6 object-cover rounded"
                              />
                            )}
                            {product.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Channel</label>
                  <Select
                    value={selectedChannel}
                    onValueChange={setSelectedChannel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.name}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bahasa Jawaban</label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bahasa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="ms">Malay</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pertanyaan Customer</label>
                  <Textarea
                    placeholder="Contoh: Apakah produk ini aman untuk keramik?"
                    value={customerQuestion}
                    onChange={(e) => setCustomerQuestion(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button
                  className="w-full bg-[#0fdc78] hover:bg-[#0cd66a]"
                  onClick={handleGenerateAnswer}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Menghasilkan Jawaban..." : "Generate Answer"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Jawaban AI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiAnswer ? (
                  <>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{editedAnswer || aiAnswer}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Edit Jawaban</label>
                      <Textarea
                        value={editedAnswer}
                        onChange={(e) => setEditedAnswer(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="secondary" onClick={handleCopyAnswer}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="secondary" onClick={handleRegenerate}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button onClick={handleSaveHistory}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Pilih produk dan masukkan pertanyaan untuk memulai</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Chat AI</CardTitle>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada riwayat chat</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {conversation.products?.photo_url ? (
                            <img
                              src={conversation.products.photo_url}
                              alt={conversation.products.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">
                              {conversation.products?.name || "Produk"}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Q: {conversation.customer_question}
                            </p>
                            <div className="mt-2 text-sm">
                              <p className="text-muted-foreground">A:</p>
                              <p className="whitespace-pre-wrap">
                                {conversation.edited_answer || conversation.ai_answer}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(conversation.created_at)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              conversation.edited_answer || conversation.ai_answer
                            )
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bahasa Default</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="ms">Malay</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tone Bahasa</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Ramah & Santai</SelectItem>
                    <SelectItem value="professional">Profesional</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt Kustom</label>
                <Textarea
                  placeholder="Masukkan aturan khusus untuk AI (opsional)"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleResetToDefault}
                >
                  Reset ke Default
                </Button>
                <Button onClick={handleSaveSettings}>
                  Simpan Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
