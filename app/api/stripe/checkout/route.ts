import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    // Obter o usuário autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Em modo de desenvolvimento, permitir checkout sem autenticação real
    if (!user && process.env.NODE_ENV === "development") {
      // Usar um user ID falso para ambiente de desenvolvimento
      console.warn(
        "AVISO: Usando ID de usuário falso em ambiente de desenvolvimento"
      );

      // Criar sessão de checkout com um ID falso para desenvolvimento
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        client_reference_id: "dev-user-123", // ID falso para desenvolvimento
        metadata: {
          priceId: priceId,
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planos?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planos?canceled=true`,
      });

      return NextResponse.json({ url: session.url });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Criar sessão de checkout com o ID do usuário
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: user.id, // ID do usuário para rastreamento
      metadata: {
        priceId: priceId, // Salvar o priceId nos metadados
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planos?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/planos?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Erro ao criar sessão de checkout:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
