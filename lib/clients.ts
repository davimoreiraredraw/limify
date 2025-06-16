import { db } from "@/lib/db";
import { clientsTable, Client, NewClient } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getClients(): Promise<Client[]> {
  try {
    return await db.select().from(clientsTable).orderBy(clientsTable.name);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    throw new Error("Falha ao buscar clientes");
  }
}

export async function getClientById(id: string): Promise<Client | undefined> {
  try {
    const clients = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, id));
    return clients[0];
  } catch (error) {
    console.error(`Erro ao buscar cliente com ID ${id}:`, error);
    throw new Error("Falha ao buscar cliente");
  }
}

export async function createClient(
  client: Omit<NewClient, "id" | "createdAt" | "updatedAt">
): Promise<Client> {
  try {
    const result = await db
      .insert(clientsTable)
      .values({
        ...client,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    throw new Error("Falha ao criar cliente");
  }
}

export async function updateClient(
  id: string,
  client: Partial<Omit<NewClient, "id" | "createdAt">>
): Promise<Client> {
  try {
    const result = await db
      .update(clientsTable)
      .set({
        ...client,
        updatedAt: new Date(),
      })
      .where(eq(clientsTable.id, id))
      .returning();

    return result[0];
  } catch (error) {
    console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
    throw new Error("Falha ao atualizar cliente");
  }
}

export async function deleteClient(id: string): Promise<boolean> {
  try {
    const result = await db
      .delete(clientsTable)
      .where(eq(clientsTable.id, id))
      .returning({ id: clientsTable.id });

    return result.length > 0;
  } catch (error) {
    console.error(`Erro ao excluir cliente com ID ${id}:`, error);
    throw new Error("Falha ao excluir cliente");
  }
}
