-- Migration: Fix infinite recursion in caregivers RLS policies
-- Date: 2026-01-09
-- Issue: Caregivers table policies were causing infinite recursion (code 42P17)
-- Solution: Drop recursive policies and replace with simple profile_id checks

-- Disable RLS temporarily to drop problematic policies safely
ALTER TABLE public.caregivers DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on caregivers (they are causing recursion)
DROP POLICY IF EXISTS "Caregivers can insert their own data" ON public.caregivers;
DROP POLICY IF EXISTS "Caregivers can select their own data" ON public.caregivers;
DROP POLICY IF EXISTS "Caregivers can update their own data" ON public.caregivers;
DROP POLICY IF EXISTS "Caregivers can delete their own data" ON public.caregivers;
DROP POLICY IF EXISTS "allow_select_own_caregiver" ON public.caregivers;
DROP POLICY IF EXISTS "allow_insert_own_caregiver" ON public.caregivers;

-- Re-enable RLS
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;

-- Add simple, non-recursive SELECT policy
CREATE POLICY "select_own_caregiver" ON public.caregivers
  FOR SELECT
  USING (profile_id = auth.uid());

-- Add simple, non-recursive INSERT policy
CREATE POLICY "insert_own_caregiver" ON public.caregivers
  FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Add UPDATE policy for own records
CREATE POLICY "update_own_caregiver" ON public.caregivers
  FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Add DELETE policy for own records
CREATE POLICY "delete_own_caregiver" ON public.caregivers
  FOR DELETE
  USING (profile_id = auth.uid());
