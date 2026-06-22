"use server"

export async function calculatePrice(formData: FormData) {
  const costPrice = Number(formData.get("cost_price"))
  const margin = Number(formData.get("margin_percent"))
  const marketplaceFee = Number(formData.get("marketplace_fee"))
  const extraCost = Number(formData.get("extra_cost"))

  const basePrice = costPrice + extraCost
  const marginAmount = basePrice * (margin / 100)
  const priceBeforeFee = basePrice + marginAmount
  const feeAmount = priceBeforeFee * (marketplaceFee / 100)
  const finalPrice = priceBeforeFee + feeAmount

  return {
    basePrice: Math.round(basePrice),
    marginAmount: Math.round(marginAmount),
    feeAmount: Math.round(feeAmount),
    finalPrice: Math.round(finalPrice),
  }
}

export async function calculatePriceByChannel(formData: FormData) {
  const costPrice = Number(formData.get("cost_price"))
  const channelId = formData.get("channel_id") as string
  const { calculateChannelPrice } = await import("./channels")
  return await calculateChannelPrice(channelId, costPrice)
}
