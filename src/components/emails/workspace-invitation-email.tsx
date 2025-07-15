import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'

interface WorkspaceInvitationEmailProps {
  invitedUserEmail?: string
  inviterName?: string
  workspaceName?: string
  acceptUrl?: string
  expiresInDays?: number
}

export default function WorkspaceInvitationEmail({
  invitedUserEmail = "usuario@ejemplo.com",
  inviterName = "Juan Pérez",
  workspaceName = "Mi Workspace",
  acceptUrl = "https://ejemplo.com/invite/token123",
  expiresInDays = 7
}: WorkspaceInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} te ha invitado a competir en &ldquo;{workspaceName}&rdquo; - Paddock Masters
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-4 px-4 w-[580px] max-w-full">
            <Section className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              {/* Header with gradient */}
              <Section 
                className="bg-gradient-to-r from-red-500 to-red-600 text-white text-center py-4" 
                style={{
                  background: 'linear-gradient(to right, #ef4444, #dc2626)', 
                  color: '#ffffff', 
                  textAlign: 'center', 
                  padding: '16px 0'
                }}
              >
                <Container className="px-4">
                  <Heading 
                    className="text-lg font-bold m-0 text-white" 
                    style={{color: '#ffffff', margin: 0}}
                  >
                    Paddock Masters
                  </Heading>
                  <Text 
                    className="text-white mt-1 mb-0 text-sm opacity-90" 
                    style={{color: '#ffffff', fontSize: '14px', margin: '4px 0 0 0'}}
                  >
                    Invitación a Competir
                  </Text>
                </Container>
              </Section>

              {/* Main content */}
              <Section className="px-4 pt-4 pb-3">
                <Heading className="text-gray-900 text-xl font-semibold mb-3 mt-0">
                  ¡Únete a la competencia! 🏁
                </Heading>
                
                <Text className="text-gray-600 mb-4 leading-6 text-base">
                  <strong>{inviterName}</strong> te ha invitado a unirte a la competencia de predicciones F1 en{" "}
                  <strong>&ldquo;{workspaceName}&rdquo;</strong>.
                </Text>

                <Text className="text-gray-600 mb-4 leading-6 text-sm">
                  Compite con otros fans de F1, realiza tus predicciones para cada Gran Premio, gana puntos por tus aciertos y sube en la clasificación. ¡Demuestra que eres el mejor predictor de la temporada!
                </Text>

                {/* Call to action button */}
                <Section className="text-center mb-6">
                  <Button
                    href={acceptUrl}
                    className="bg-red-500 text-white font-semibold py-3 px-6 rounded-lg text-base inline-block no-underline"
                    style={{
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontWeight: '600',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    Unirse a la Competencia
                  </Button>
                </Section>

                <Text className="text-gray-500 text-xs leading-4 mb-4 text-center">
                  Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                </Text>

                <Section className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <Text className="text-red-500 text-xs m-0 word-break-all font-mono">
                    {acceptUrl}
                  </Text>
                </Section>

                {/* Expiration notice */}
                <Section className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <Text className="text-amber-800 text-xs m-0 font-medium">
                    ⏰ Esta invitación expirará en {expiresInDays} día{expiresInDays !== 1 ? 's' : ''}. 
                    Asegúrate de aceptarla antes de que caduque.
                  </Text>
                </Section>

                <Text className="text-gray-600 text-xs leading-4 mb-3">
                  Si no conoces a {inviterName} o no esperabas esta invitación, puedes ignorar este email con seguridad.
                </Text>
              </Section>

              {/* Footer */}
              <Section className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <Text className="text-gray-500 text-xs text-center m-0">
                  Esta invitación fue enviada a {invitedUserEmail} por {inviterName} desde Paddock Masters.
                </Text>
                <Text className="text-gray-400 text-xs text-center mt-1 mb-0">
                  © 2024 Paddock Masters. Todos los derechos reservados.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}