import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sindusconValues } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = parseInt(searchParams.get("mes") || "1");
    const ano = parseInt(
      searchParams.get("ano") || new Date().getFullYear().toString()
    );

    const values = await db
      .select()
      .from(sindusconValues)
      .where(and(eq(sindusconValues.mes, mes), eq(sindusconValues.ano, ano)));

    return NextResponse.json(values);
  } catch (error) {
    console.error("Erro ao buscar valores da Sinduscon:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mes, ano, values } = body;

    // Deletar valores existentes para o mês/ano
    await db
      .delete(sindusconValues)
      .where(and(eq(sindusconValues.mes, mes), eq(sindusconValues.ano, ano)));

    // Inserir novos valores
    const valuesToInsert = values
      .filter(
        (item: any) =>
          item.r1 !== null ||
          item.pp4 !== null ||
          item.r8 !== null ||
          item.r16 !== null
      )
      .map((item: any) => ({
        estado: item.estado,
        r1: item.r1,
        pp4: item.pp4,
        r8: item.r8,
        r16: item.r16,
        mes,
        ano,
      }));

    if (valuesToInsert.length > 0) {
      await db.insert(sindusconValues).values(valuesToInsert);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar valores da Sinduscon:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
