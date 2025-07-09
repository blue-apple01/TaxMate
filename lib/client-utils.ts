import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"

type Client = Database["public"]["Tables"]["clients"]["Row"]

export const fetchClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase.from("clients").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching clients:", error)
    return []
  }

  return data || []
}
