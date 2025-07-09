import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTeamInvite({
  email,
  name,
  teamName,
  inviteLink,
}: {
  email: string;
  name: string;
  teamName: string;
  inviteLink: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Limify <suporte@limify-beta.lat>",
      to: email,
      subject: "Convite para equipe no Limify",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Convite para Equipe - Limify</title>
          </head>
          <body>
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: white; border-radius: 8px; padding: 40px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="https://i.ibb.co/69tkGtY/logo.png" alt="Limify" style="height: 40px;" />
                </div>
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #6e2dfa; font-size: 24px; margin: 0 0 10px 0;">
                    Você foi convidado para uma equipe!
                  </h1>
                  <p>
                    Você foi convidado para participar da equipe ${teamName}
                  </p>
                </div>
                <div style="margin-bottom: 30px;">
                  <p>Olá ${name}!</p>
                  <p>
                    Você foi convidado para se juntar à equipe
                    <strong>${teamName}</strong> no Limify. Como membro da equipe,
                    você terá acesso a todas as funcionalidades e recursos disponíveis
                    para colaboração.
                  </p>
                  <p>
                    Para aceitar o convite, clique no botão abaixo e complete seu
                    cadastro:
                  </p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a
                    href="${inviteLink}"
                    style="background-color: #6e2dfa; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; display: inline-block;"
                  >
                    Aceitar Convite
                  </a>
                </div>
                <div style="margin-bottom: 30px;">
                  <p>
                    Se o botão não funcionar, você pode copiar e colar o seguinte link
                    no seu navegador:
                  </p>
                  <p style="word-break: break-all; font-size: 14px; color: #6b7280">
                    ${inviteLink}
                  </p>
                </div>
                <div style="text-align: center; font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p>Este convite expirará em 7 dias.</p>
                  <p>
                    Se você não esperava receber este convite, pode ignorar este email
                    com segurança.
                  </p>
                </div>
              </div>
              <div style="text-align: center; font-size: 14px; color: #6b7280;">
                <p>© 2024 Limify. Todos os direitos reservados.</p>
                <p>Enviado por Limify - Gestão de Projetos e Orçamentos</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}
