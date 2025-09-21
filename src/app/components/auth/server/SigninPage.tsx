import { Card, CardBody } from '../../ui/Card'
import { AuthProviders } from '../client/AuthProviders'

interface Props {
  locale: string
  callbackUrl?: string
  error?: string
}

export default function SigninPage({ locale, callbackUrl, error }: Props) {
  const getErrorMessage = (error?: string) => {
    switch (error) {
      case 'OAuthSignin':
        return 'Error al conectar con el proveedor de autenticación.'
      case 'OAuthCallback':
        return 'Error en el callback de autenticación.'
      case 'OAuthCreateAccount':
        return 'Error al crear la cuenta con el proveedor.'
      case 'EmailCreateAccount':
        return 'Error al crear la cuenta con email.'
      case 'Callback':
        return 'Error en el proceso de autenticación.'
      case 'OAuthAccountNotLinked':
        return 'Esta cuenta ya existe con otro proveedor. Por favor, usa el método original.'
      case 'EmailSignin':
        return 'Error al enviar el email de acceso.'
      case 'CredentialsSignin':
        return 'Credenciales incorrectas.'
      case 'SessionRequired':
        return 'Debes iniciar sesión para acceder a esta página.'
      case 'google':
        return 'Error de configuración con Google. Por favor, contacta al administrador.'
      default:
        return error ? 'Error de autenticación. Por favor, inténtalo de nuevo.' : null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-gray-600">
            Accede a tu cuenta para continuar
          </p>
        </div>

        <Card padding="none">
          <CardBody padding="lg">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error de autenticación
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {getErrorMessage(error)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <AuthProviders 
              callbackUrl={callbackUrl || '/dashboard'} 
            />
          </CardBody>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <a 
              href={`/${locale}/signup${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
