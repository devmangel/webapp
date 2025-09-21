import { Card, CardBody } from '../../../components/ui/Card'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string; callbackUrl?: string }>
}

export default async function AuthErrorPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { error, callbackUrl } = await searchParams

  const getErrorMessage = (error?: string) => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Error de configuración',
          message: 'Hay un problema con la configuración del servidor. Por favor, contacta al administrador.',
          action: 'Contactar soporte'
        }
      case 'AccessDenied':
        return {
          title: 'Acceso denegado',
          message: 'No tienes permisos para acceder a esta aplicación.',
          action: 'Volver al inicio'
        }
      case 'Verification':
        return {
          title: 'Error de verificación',
          message: 'El token de verificación ha expirado o no es válido.',
          action: 'Solicitar nuevo enlace'
        }
      case 'Default':
      default:
        return {
          title: 'Error de autenticación',
          message: 'Ha ocurrido un error durante el proceso de autenticación. Por favor, inténtalo de nuevo.',
          action: 'Reintentar'
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-gray-600">
            {errorInfo.message}
          </p>
        </div>

        <Card padding="none">
          <CardBody padding="lg">
            <div className="space-y-4">
              <div className="text-center">
                <a
                  href={`/${locale}/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
                  className="inline-flex items-center justify-center w-full px-4 py-3 border border-transparent rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  {errorInfo.action}
                </a>
              </div>
              
              <div className="text-center">
                <a
                  href={`/${locale}`}
                  className="inline-flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Volver al inicio
                </a>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Si el problema persiste, por favor{' '}
            <a 
              href="mailto:soporte@ejemplo.com"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              contacta al soporte técnico
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
