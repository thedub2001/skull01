import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pvhrjxypkgviklzdzmka.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aHJqeHlwa2d2aWtsemR6bWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTY1NjYsImV4cCI6MjA2OTg5MjU2Nn0.ZbqkLJ4RWypbPk5NUJUk9_0DFpI8BwE2O0w2Bgb-Rx8'
export const supabase = createClient(supabaseUrl, supabaseKey)
