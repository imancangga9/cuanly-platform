-- Fix RLS Policies for AI Wallet and Transactions
-- Run this in Supabase SQL Editor

-- ============================================
-- AI Wallet Policies - Add UPDATE policy for users
-- ============================================
CREATE POLICY "Users can update their own wallet"
    ON ai_wallet
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AI Credit Transactions Policies - Add INSERT policy for users
-- ============================================
CREATE POLICY "Users can insert their own transactions"
    ON ai_credit_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
