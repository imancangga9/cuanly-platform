import { createClient } from "@/lib/supabase/server"
import { getProducts } from "@/actions/products"
import { getProductChannelPrices } from "@/actions/product-channel-prices"
import { ProductsClient } from "./client"

function calculatePrice(costPrice: number, factors: { operation: string; value_type: string; value: number }[]) {
  let price = costPrice
  for (const f of factors) {
    if (f.operation === "multiply" && f.value_type === "percentage") {
      price = price * (1 + f.value / 100)
    } else if (f.operation === "multiply" && f.value_type === "fixed") {
      price = price * f.value
    } else if (f.operation === "add" && f.value_type === "percentage") {
      price = price + (price * f.value / 100)
    } else if (f.operation === "add" && f.value_type === "fixed") {
      price = price + f.value
    }
  }
  return Math.round(price)
}

export default async function ProductsPage() {
  const supabase = await createClient()
  const [products, channels] = await Promise.all([
    getProducts(),
    supabase.from("channels").select("id, name, factors:channel_factors(*)").order("created_at", { ascending: true }),
  ])

  console.log("Products from getProducts:", products);

  const channelList = channels.data || []

  const productsWithPrices = await Promise.all(products.map(async (product) => {
    const channelPrices = channelList.map((ch: { name: string; factors: { operation: string; value_type: string; value: number; sort_order: number }[] }) => {
      const factors = [...(ch.factors || [])].sort((a, b) => a.sort_order - b.sort_order)
      return {
        channelName: ch.name,
        price: calculatePrice(Number(product.cost_price), factors),
      }
    })

    const savedPrices = await getProductChannelPrices(product.id)
    console.log("Saved prices for product", product.id, ":", savedPrices);
    
    return { ...product, channelPrices, savedPrices }
  }))

  return <ProductsClient products={productsWithPrices} channels={channelList} />
}
