"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Bot, Plus, CheckCircle2, XCircle, Clock, Zap, TrendingUp, CreditCard, ArrowUp, ArrowDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { createAICreditOrder, uploadPaymentProofFile } from "@/actions/ai-credit";
import { formatCurrency, formatDate } from "@/lib/utils";
import imageCompression from "browser-image-compression";

interface AICreditPackage {
  id: string;
  name: string;
  credit_amount: number;
  price: number;
  is_recommended: boolean;
}

interface AIWallet {
  id: string;
  balance: number;
}

interface AICreditOrder {
  id: string;
  order_number: string;
  package_name: string;
  package_price: number;
  credit_amount: number;
  unique_code: number;
  total_payment: number;
  proof_image_url: string | null;
  status: string;
  created_at: string;
  expires_at: string;
}

interface AICreditTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export function AICreditClient({
  packages,
  wallet,
  orders,
  transactions
}: {
  packages: AICreditPackage[];
  wallet: AIWallet | null;
  orders: AICreditOrder[];
  transactions: AICreditTransaction[];
}) {
  const [selectedPackage, setSelectedPackage] = useState<AICreditPackage | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<AICreditOrder | null>(null);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi untuk memilih paket (hanya preview)
  const handleSelectPackage = (pkg: AICreditPackage) => {
    setSelectedPackage(pkg);
  };

  // Fungsi untuk membuat order
  const handleCreateOrder = async () => {
    if (!selectedPackage) return;
    
    setIsCreatingOrder(true);
    try {
      const result = await createAICreditOrder(selectedPackage.id);
      if (result.error) {
        alert(result.error);
        return;
      }
      if (result.order) {
        setCurrentOrder(result.order);
        setSelectedPackage(null);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal membuat pesanan, silakan coba lagi!");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diizinkan!");
      return;
    }

    try {
      // Compress gambar
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      setSelectedFile(compressedFile);

      // Preview
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing file:", error);
      alert("Gagal memproses gambar, silakan coba lagi!");
    }
  };

  const handleUploadProof = async () => {
    const orderIdToUpload = uploadingOrderId || currentOrder?.id;
    if (!orderIdToUpload || !selectedFile) {
      alert("Silakan pilih file bukti transfer!");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("orderId", orderIdToUpload);
      formData.append("file", selectedFile);

      const result = await uploadPaymentProofFile(formData);
      if (result.error) {
        alert(result.error);
        return;
      }
      alert("Bukti transfer berhasil diupload! Silakan tunggu verifikasi admin.");
      setCurrentOrder(null);
      setUploadingOrderId(null);
      setSelectedFile(null);
      setFilePreview(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Gagal upload bukti, silakan coba lagi!");
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Menunggu Verifikasi</Badge>;
      case "approved":
        return <Badge className="bg-green-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Disetujui</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Ditolak</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-500 flex items-center gap-1"><XCircle className="h-3 w-3" /> Dibatalkan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-8 w-8 text-[#0fdc78]" />
        <div>
          <h1 className="text-2xl font-bold">AI Credit</h1>
          <p className="text-muted-foreground">Kelola credit AI untuk jawaban customer</p>
        </div>
      </div>

      {/* Wallet Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Saldo Credit Anda</span>
            <Badge className="bg-[#0fdc78] text-black px-3 py-1 text-lg">
              {wallet?.balance || 0} Credit
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-4xl font-bold text-[#0fdc78]">{wallet?.balance || 0}</p>
              <p className="text-muted-foreground">Credit tersisa</p>
            </div>
            <Button asChild className="bg-[#0fdc78] hover:bg-[#0cd66a] text-black">
              <Link href="#packages">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Credit
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="packages">Paket Credit</TabsTrigger>
          <TabsTrigger value="orders">Pesanan Saya</TabsTrigger>
          <TabsTrigger value="history">Riwayat Transaksi</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" id="packages" className="mt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={pkg.is_recommended ? "border-[#0fdc78] border-2" : ""}>
                {pkg.is_recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#0fdc78] text-black">Populer</Badge>
                  </div>
                )}
                <CardHeader className="text-center relative">
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold mt-2">{pkg.credit_amount}</div>
                  <p className="text-muted-foreground">Credit</p>
                  <div className="text-2xl font-bold text-[#0fdc78] mt-4">
                    {formatCurrency(pkg.price)}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    Pilih Paket
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pesanan Credit</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada pesanan</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-4 px-4 font-semibold text-white">Order Number</th>
                        <th className="text-left py-4 px-4 font-semibold text-white">Paket</th>
                        <th className="text-left py-4 px-4 font-semibold text-white">Total</th>
                        <th className="text-left py-4 px-4 font-semibold text-white">Status</th>
                        <th className="text-left py-4 px-4 font-semibold text-white">Tanggal</th>
                        <th className="text-left py-4 px-4 font-semibold text-white">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                          <td className="py-4 px-4 font-medium">{order.order_number}</td>
                          <td className="py-4 px-4">{order.package_name} ({order.credit_amount} Credit</td>
                          <td className="py-4 px-4 font-bold text-[#0fdc78]">{formatCurrency(order.total_payment)}</td>
                          <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                          <td className="py-4 px-4 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                          <td className="py-4 px-4">
                            {order.status === "pending" && !order.proof_image_url && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setUploadingOrderId(order.id);
                                  setCurrentOrder(order);
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Bukti
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Belum ada transaksi</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {tx.type === "topup" ? (
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <ArrowUp className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <ArrowDown className="h-5 w-5 text-red-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(tx.created_at)}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                        {tx.amount > 0 ? "+" : ""}{tx.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Package Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center py-8">
            <Card className="w-full max-w-md my-auto">
              <CardHeader>
                <CardTitle>Pilih Paket {selectedPackage.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-3xl font-bold text-center">{selectedPackage.credit_amount} Credit</p>
                  <p className="text-2xl font-bold text-[#0fdc78] text-center mt-2">{formatCurrency(selectedPackage.price)}</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setSelectedPackage(null)}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 bg-[#0fdc78] hover:bg-[#0cd66a] text-black"
                    onClick={handleCreateOrder}
                    disabled={isCreatingOrder}
                  >
                    {isCreatingOrder ? "Membuat Pesanan..." : "Lanjut Bayar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Upload Proof Modal */}
      {currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center py-8">
            <Card className="w-full max-w-md my-auto">
              <CardHeader>
                <CardTitle>Upload Bukti Transfer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Pesanan: {currentOrder.order_number}</p>
                  <p className="text-xl font-bold mt-1">{currentOrder.package_name} - {currentOrder.credit_amount} Credit</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Harga: {formatCurrency(currentOrder.package_price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Kode unik: -{currentOrder.unique_code}
                  </p>
                  <p className="text-2xl font-bold text-[#0fdc78] mt-2">Total: {formatCurrency(currentOrder.total_payment)}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Bukti Transfer</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#0fdc78]"
                    onClick={() => fileInputRef.current?.click()}>
                    {filePreview ? (
                      <div className="space-y-2">
                        <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                        <p className="text-sm text-muted-foreground">Klik untuk ganti file</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 mx-auto text-gray-400" />
                        <p className="text-sm text-muted-foreground">Klik untuk upload file gambar</p>
                        <p className="text-xs text-muted-foreground">Max 1MB, otomatis di-compress</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setCurrentOrder(null);
                      setUploadingOrderId(null);
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                  >
                    Tutup
                  </Button>
                  <Button
                    className="flex-1 bg-[#0fdc78] hover:bg-[#0cd66a] text-black"
                    onClick={handleUploadProof}
                    disabled={isUploading || !selectedFile}
                  >
                    {isUploading ? "Uploading..." : "Upload Bukti"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
