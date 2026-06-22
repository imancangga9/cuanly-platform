import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let photoUrl: string | null = null
    const photoFile = formData.get('photo') as File | null

    if (photoFile && photoFile.size > 0) {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.webp`

      const { error: uploadError, data } = await supabase.storage
        .from('product-photos')
        .upload(fileName, photoFile, {
          contentType: photoFile.type
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload photo: ' + uploadError.message }, { status: 500 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-photos')
        .getPublicUrl(fileName)

      photoUrl = publicUrl
    }

    const { error } = await supabase.from('products').insert({
      user_id: user.id,
      name: formData.get('name') as string,
      sku: formData.get('sku') as string || null,
      category: formData.get('category') as string || null,
      description: formData.get('description') as string || null,
      photo_url: photoUrl,
      cost_price: Number(formData.get('cost_price')),
      stock: Number(formData.get('stock')),
    })

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const productId = formData.get('product_id') as string
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current product
    const { data: currentProduct } = await supabase
      .from('products')
      .select('photo_url')
      .eq('id', productId)
      .single()

    let photoUrl: string | null = currentProduct?.photo_url || null
    const photoFile = formData.get('photo') as File | null

    // Handle new photo upload
    if (photoFile && photoFile.size > 0) {
      // Delete old photo if exists
      if (currentProduct?.photo_url) {
        const bucketName = 'product-photos'
        const urlParts = currentProduct.photo_url.split('/')
        const fileName = urlParts.slice(-2).join('/')
        await supabase.storage.from(bucketName).remove([fileName])
      }

      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.webp`

      const { error: uploadError } = await supabase.storage
        .from('product-photos')
        .upload(fileName, photoFile, {
          contentType: photoFile.type
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload photo: ' + uploadError.message }, { status: 500 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-photos')
        .getPublicUrl(fileName)

      photoUrl = publicUrl
    }

    // Update product in database
    const { error } = await supabase.from('products').update({
      name: formData.get('name') as string,
      sku: formData.get('sku') as string || null,
      category: formData.get('category') as string || null,
      description: formData.get('description') as string || null,
      photo_url: photoUrl,
      cost_price: Number(formData.get('cost_price')),
      stock: Number(formData.get('stock')),
    }).eq('id', productId)

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
