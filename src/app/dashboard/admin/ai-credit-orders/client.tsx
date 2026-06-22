"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { approveAICreditOrder, rejectAICreditOrder } from "@/actions/ai-credit";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AICreditOrder {
  id: string;
  order_number: string;
  user_id: string;
  email: string;
  package_name: string;
  package_price: number;
  credit_amount: number;
  unique_code: number;
  total_payment: number;
  proof_image_url: string | null;
  status: string;
  payment_status?: string;
  created_at: string;
}

export function AdminAICreditOrdersClient({
  orders,
}: {
  orders: AICreditOrder[];
}) {
  const [selectedOrder, setSelectedOrder] = useState<AICreditOrder | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (orderId: string) => {
    setIsProcessing(true);
    try {
      const result = await approveAICreditOrder(orderId);
      if (result.error) {
        alert(result.error);
        return;
      }
      alert("Pesanan berhasil disetujui!");
      setSelectedOrder(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Gagal menyetujui pesanan!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (orderId: string) => {
    setIsProcessing(true);
    try {
      const result = await rejectAICreditOrder(orderId);
      if (result.error) {
        alert(result.error);
        return;
      }
      alert("Pesanan berhasil ditolak!");
      setSelectedOrder(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Gagal menolak pesanan!");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Menunggu Bukti
          </Badge>
        );
      case "waiting_verify":
        return (
          <Badge className="bg-yellow-500 text-black flex items-center gap-1">
            <Clock className="h-3 w-3" /> Menunggu Verifikasi
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Disetujui
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Ditolak
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-8 w-8 text-[#0fdc78]" />
        <h1 className="text-2xl font-bold">Verifikasi Pesanan AI Credit</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pesanan</CardTitle>
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
                    <th className="text-left py-4 px-4 font-semibold text-white">Email</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Paket</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Credit</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Total</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Bukti</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Tanggal</th>
                    <th className="text-left py-4 px-4 font-semibold text-white">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-medium">{order.order_number}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{order.email}</td>
                      <td className="py-4 px-4">{order.package_name}</td>
                      <td className="py-4 px-4">{order.credit_amount} Credit</td>
                      <td className="py-4 px-4 font-bold text-[#0fdc78]">{formatCurrency(order.total_payment)}</td>
                      <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-4 px-4">
                        {order.proof_image_url ? (
                          <Badge className="bg-green-500 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Ada
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Belum
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">{formatDate(order.created_at)}</td>
                      <td className="py-4 px-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center py-8">
            <Card className="w-full max-w-lg my-auto">
              <CardHeader>
                <CardTitle>Detail Pesanan {selectedOrder.order_number}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p>
                    <span className="text-muted-foreground">Email:</span> {selectedOrder.email}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-medium">{selectedOrder.package_name}</p>
                  <p>{selectedOrder.credit_amount} Credit</p>
                  <p>Harga: {formatCurrency(selectedOrder.package_price)}</p>
                  <p>Kode unik: {selectedOrder.unique_code}</p>
                  <p className="font-bold text-[#0fdc78]">
                    Total: {formatCurrency(selectedOrder.total_payment)}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bukti Pembayaran</label>
                  {selectedOrder.proof_image_url ? (
                    <img
                      src={selectedOrder.proof_image_url}
                      alt="Bukti Pembayaran"
                      className="w-full max-h-96 object-contain rounded-lg border"
                    />
                  ) : (
                    <p className="text-muted-foreground">Belum ada bukti pembayaran</p>
                  )}
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setSelectedOrder(null)}
                    disabled={isProcessing}
                  >
                    Tutup
                  </Button>
                  {["pending", "waiting_verify"].includes(selectedOrder.status) && (
                    <>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(selectedOrder.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Memproses..." : "Tolak"}
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(selectedOrder.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Memproses..." : "Setujui"}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
