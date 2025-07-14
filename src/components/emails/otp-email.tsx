import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'

interface OtpEmailProps {
  otp?: string
  appName?: string
}

export default function OtpEmail({ otp = "123456", appName = "RC Starter Kit" }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu código de verificación de {appName}: {otp}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-4 px-4 w-[580px] max-w-full">
            <Section className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              {/* Header with gradient */}
              <Section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-4" style={{background: 'linear-gradient(to right, #2563eb, #9333ea)', color: '#ffffff', textAlign: 'center', padding: '16px 0'}}>
                <Container className="px-4">
                  <Heading className="text-lg font-bold m-0 text-white" style={{color: '#ffffff', margin: 0}}>{appName || "RC Starter Kit"}</Heading>
                  <Text className="text-white mt-1 mb-0 text-sm opacity-90" style={{color: '#ffffff', fontSize: '14px', margin: '4px 0 0 0'}}>Verificación de Acceso Seguro</Text>
                </Container>
              </Section>

              {/* Main content */}
              <Section className="px-4 pt-2 pb-3">
                <Heading className="text-gray-900 text-lg font-semibold mb-2 mt-0">
                  Tu código de verificación
                </Heading>
                
                <Text className="text-gray-600 mb-4 leading-5 text-sm">
                  Usa el siguiente código de verificación para completar tu inicio de sesión. Este código expirará en 10 minutos.
                </Text>

                {/* OTP Code Box */}
                <Section className="text-center mb-4">
                  <div className="inline-block bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg py-3 px-5">
                    <Text className="text-2xl font-bold text-gray-900 tracking-[0.5em] m-0">
                      {otp}
                    </Text>
                  </div>
                </Section>

                <Text className="text-gray-600 text-xs leading-4 mb-3">
                  Por tu seguridad, no compartas este código con nadie. Si no solicitaste este código de verificación, ignora este email.
                </Text>

                {/* Security notice */}
                <Section className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <Text className="text-blue-800 text-xs m-0 font-medium">
                    🔒 Tip de seguridad: Nunca te pediremos tu código de verificación por teléfono, email u otro método.
                  </Text>
                </Section>
              </Section>

              {/* Footer */}
              <Section className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <Text className="text-gray-500 text-xs text-center m-0">
                  Este email fue enviado como parte de la seguridad de tu cuenta de {appName || "RC Starter Kit"}.
                </Text>
                <Text className="text-gray-400 text-xs text-center mt-1 mb-0">
                  © 2024 {appName || "RC Starter Kit"}. Todos los derechos reservados.
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}