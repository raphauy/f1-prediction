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
import { formatForEmail } from '@/lib/date-formatting'

interface GPLaunchedEmailProps {
  userEmail?: string
  userName?: string
  grandPrixName?: string
  location?: string
  country?: string
  circuit?: string
  raceDate?: Date
  qualifyingDate?: Date
  predictUrl?: string
  workspaceName?: string
}

export default function GPLaunchedEmail({
  userEmail = "usuario@ejemplo.com",
  userName = "Competidor",
  grandPrixName = "Gran Premio de Australia",
  location = "Melbourne",
  country = "Australia",
  circuit = "Albert Park",
  raceDate = new Date('2025-03-16T06:00:00Z'),
  qualifyingDate = new Date('2025-03-15T06:00:00Z'),
  predictUrl = "https://ejemplo.com/w/workspace/predictions/gp123",
  workspaceName = "Mi Liga F1"
}: GPLaunchedEmailProps) {
  // Formatear fechas para el email (mostrarán UTC ya que no conocemos la zona del usuario)
  const formattedRaceDate = formatForEmail(raceDate)
  const formattedQualifyingDate = formatForEmail(qualifyingDate)

  return (
    <Html>
      <Head />
      <Preview>
        ¡Nuevo GP disponible! {grandPrixName} está listo para tus predicciones - Paddock Masters
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
                    ¡Nuevo Gran Premio Disponible!
                  </Text>
                </Container>
              </Section>

              {/* Main content */}
              <Section className="px-4 pt-4 pb-3">
                <Heading className="text-gray-900 text-xl font-semibold mb-3 mt-0">
                  🏁 {grandPrixName}
                </Heading>
                
                <Text className="text-gray-600 mb-4 leading-6 text-base">
                  Hola {userName},
                </Text>

                <Text className="text-gray-600 mb-4 leading-6 text-base">
                  El <strong>{grandPrixName}</strong> ya está disponible para realizar tus predicciones en <strong>{workspaceName}</strong>.
                </Text>

                {/* Race details */}
                <Section className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <Text className="text-gray-700 font-semibold mb-2 text-sm">
                    📍 Detalles del Gran Premio:
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1">
                    • <strong>Circuito:</strong> {circuit}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1">
                    • <strong>Ubicación:</strong> {location}, {country}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1">
                    • <strong>Clasificación:</strong> {formattedQualifyingDate}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    • <strong>Carrera:</strong> {formattedRaceDate}
                  </Text>
                </Section>

                {/* Warning about deadline */}
                <Section className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <Text className="text-amber-800 text-sm m-0 font-medium">
                    ⏰ <strong>Importante:</strong> Las predicciones se cerrarán cuando comience la clasificación el {formattedQualifyingDate}. ¡No te quedes fuera!
                  </Text>
                </Section>

                {/* Call to action button */}
                <Section className="text-center mb-6">
                  <Button
                    href={predictUrl}
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
                    Hacer mis Predicciones
                  </Button>
                </Section>

                <Text className="text-gray-500 text-xs leading-4 mb-4 text-center">
                  Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                </Text>

                <Section className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <Text className="text-red-500 text-xs m-0 word-break-all font-mono">
                    {predictUrl}
                  </Text>
                </Section>

                <Text className="text-gray-600 text-xs leading-4 mb-3">
                  Demuestra tus conocimientos de F1 y compite por el primer lugar en la clasificación. ¡Buena suerte! 🏆
                </Text>
              </Section>

              {/* Footer */}
              <Section className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <Text className="text-gray-500 text-xs text-center m-0">
                  Este email fue enviado a {userEmail} porque estás registrado en {workspaceName}.
                </Text>
                <Text className="text-gray-400 text-xs text-center mt-2 mb-0">
                  Para dejar de recibir estos emails, actualiza tus preferencias en tu perfil.
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