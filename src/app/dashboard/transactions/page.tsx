import { getProducts } from "@/actions/products"
import { getChannels } from "@/actions/channels"
import { getProductChannelPrices } from "@/actions/product-channel-prices"
import { getTransactionsV2 } from "@/actions/transactions-v2"
import { TransactionsClientV2 } from "./client-v2"

export default async function TransactionsPage() {
  const [products, channels, transactions] = await Promise.all([
    getProducts(), 
    getChannels(),
    getTransactionsV2()
  ])
  
  // Add saved channel prices to each product
  const productsWithPrices = await Promise.all(products.map(async (product) => {
    const savedPrices = await getProductChannelPrices(product.id)
    return { ...product, savedPrices }
  }))

  return <TransactionsClientV2 products={productsWithPrices} channels={channels} transactions={transactions} />
}
