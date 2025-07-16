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
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface GPReminderEmailProps {
  userEmail?: string
  userName?: string
  grandPrixName?: string
  location?: string
  qualifyingDate?: Date
  predictUrl?: string
  workspaceName?: string
  hasUserPredicted?: boolean
  timeRemaining?: string
}

export default function GPReminderEmail({
  userEmail = "usuario@ejemplo.com",
  userName = "Competidor",
  grandPrixName = "Gran Premio de Australia",
  location = "Melbourne",
  qualifyingDate = new Date('2025-03-15T06:00:00Z'),
  predictUrl = "https://ejemplo.com/w/workspace/predict/gp123",
  workspaceName = "Mi Liga F1",
  hasUserPredicted = false,
  timeRemaining
}: GPReminderEmailProps) {
  const calculatedTimeRemaining = timeRemaining || formatDistanceToNow(qualifyingDate, { 
    locale: es,
    addSuffix: false 
  })

  return (
    <Html>
      <Head />
      <Preview>
        ⏰ Recordatorio: Quedan {calculatedTimeRemaining} para cerrar predicciones del {grandPrixName}
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto py-4 px-4 w-[580px] max-w-full">
            <Section className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              {/* Header with urgent gradient */}
              <Section 
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-4" 
                style={{
                  background: 'linear-gradient(to right, #f59e0b, #ea580c)', 
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
                    ⏰ Recordatorio Urgente
                  </Text>
                </Container>
              </Section>

              {/* Main content */}
              <Section className="px-4 pt-4 pb-3">
                <Heading className="text-gray-900 text-xl font-semibold mb-3 mt-0">
                  {hasUserPredicted ? '✅ Ya realizaste tus predicciones' : '⚠️ ¡No te quedes fuera!'}
                </Heading>
                
                <Text className="text-gray-600 mb-4 leading-6 text-base">
                  Hola {userName},
                </Text>

                {hasUserPredicted ? (
                  <>
                    <Text className="text-gray-600 mb-4 leading-6 text-base">
                      Este es un recordatorio de que ya realizaste tus predicciones para el <strong>{grandPrixName}</strong>. 
                      ¡Bien hecho! 🎯
                    </Text>
                    <Text className="text-gray-600 mb-4 leading-6 text-base">
                      Las predicciones se cerrarán en <strong>{calculatedTimeRemaining}</strong>. 
                      Si deseas revisar o modificar tus predicciones, aún estás a tiempo.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-gray-600 mb-4 leading-6 text-base">
                      <strong>¡Aún no has realizado tus predicciones!</strong> para el <strong>{grandPrixName}</strong> en {location}.
                    </Text>
                    
                    {/* Urgent countdown */}
                    <Section className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-center">
                      <Text className="text-red-800 text-lg font-bold m-0">
                        ⏱️ Quedan solo:
                      </Text>
                      <Text className="text-red-900 text-2xl font-bold mt-2 mb-0">
                        {calculatedTimeRemaining}
                      </Text>
                      <Text className="text-red-700 text-sm mt-2 mb-0">
                        para que cierren las predicciones
                      </Text>
                    </Section>
                  </>
                )}

                {/* Call to action button */}
                <Section className="text-center mb-6">
                  <Button
                    href={predictUrl}
                    className="bg-red-500 text-white font-semibold py-3 px-6 rounded-lg text-base inline-block no-underline"
                    style={{
                      backgroundColor: hasUserPredicted ? '#10b981' : '#ef4444',
                      color: '#ffffff',
                      fontWeight: '600',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                  >
                    {hasUserPredicted ? 'Revisar mis Predicciones' : '🏁 Hacer mis Predicciones Ahora'}
                  </Button>
                </Section>

                {!hasUserPredicted && (
                  <Text className="text-gray-600 text-sm leading-5 mb-4 text-center">
                    No pierdas la oportunidad de sumar puntos en <strong>{workspaceName}</strong>. 
                    ¡Cada predicción cuenta para la clasificación general!
                  </Text>
                )}

                <Text className="text-gray-500 text-xs leading-4 mb-4 text-center">
                  Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                </Text>

                <Section className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <Text className="text-red-500 text-xs m-0 word-break-all font-mono">
                    {predictUrl}
                  </Text>
                </Section>
              </Section>

              {/* Footer */}
              <Section className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                <Text className="text-gray-500 text-xs text-center m-0">
                  Este recordatorio fue enviado a {userEmail} desde {workspaceName}.
                </Text>
                <Text className="text-gray-400 text-xs text-center mt-2 mb-0">
                  Para dejar de recibir recordatorios, actualiza tus preferencias en tu perfil.
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