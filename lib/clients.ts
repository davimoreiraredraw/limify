import { db } from "@/lib/db";
import { clientsTable, Client, NewClient } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function getClients(userId: string): Promise<Client[]> {
  try {
    return await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.userId, userId))
      .orderBy(clientsTable.name);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    throw new Error("Falha ao buscar clientes");
  }
}

export async function getClientById(
  id: string,
  userId: string
): Promise<Client | undefined> {
  try {
    const clients = await db
      .select()
      .from(clientsTable)
      .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)));
    return clients[0];
  } catch (error) {
    console.error(`Erro ao buscar cliente com ID ${id}:`, error);
    throw new Error("Falha ao buscar cliente");
  }
}

export async function createClient(
  client: Omit<NewClient, "id" | "createdAt" | "updatedAt" | "userId">,
  userId: string
): Promise<Client> {
  try {
    const result = await db
      .insert(clientsTable)
      .values({
        ...client,
        userId,
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
  client: Partial<Omit<NewClient, "id" | "createdAt">>,
  userId: string
): Promise<Client> {
  try {
    const result = await db
      .update(clientsTable)
      .set({
        ...client,
        updatedAt: new Date(),
      })
      .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)))
      .returning();

    return result[0];
  } catch (error) {
    console.error(`Erro ao atualizar cliente com ID ${id}:`, error);
    throw new Error("Falha ao atualizar cliente");
  }
}

export async function deleteClient(
  id: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await db
      .delete(clientsTable)
      .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)))
      .returning({ id: clientsTable.id });

    return result.length > 0;
  } catch (error) {
    console.error(`Erro ao excluir cliente com ID ${id}:`, error);
    throw new Error("Falha ao excluir cliente");
  }
}
