import { X } from 'lucide-react';

const TERMS_CONTENT = `TÉRMINOS Y CONDICIONES DE USO

Última actualización: [25/03/2026]

Bienvenido a Trade11. Al registrarte o utilizar la aplicación, aceptas los siguientes Términos y Condiciones.

1. Descripción del servicio

Trade11 es una plataforma digital que permite a los usuarios registrar, gestionar e intercambiar figuritas de álbumes, facilitando la conexión entre usuarios.

Trade11 actúa únicamente como un medio de conexión entre usuarios y no participa en los intercambios físicos entre ellos.

2. Registro y cuenta

Para utilizar Trade11, el usuario debe crear una cuenta.

El usuario se compromete a:

Proporcionar información veraz
Mantener la seguridad de su cuenta
No compartir sus credenciales

Trade11 podrá suspender o eliminar cuentas que incumplan estos términos.

3. Uso de la plataforma

El usuario se compromete a utilizar Trade11 de manera responsable y conforme a la ley.

Está prohibido:

Realizar actividades fraudulentas
Enviar spam
Acosar o intimidar a otros usuarios
Utilizar la plataforma con fines ilegales
4. Intercambios entre usuarios

Los intercambios realizados a través de Trade11 son acuerdos directos entre usuarios.

Trade11:

No garantiza el cumplimiento de los intercambios
No verifica la autenticidad de las figuritas
No interviene en disputas

El usuario reconoce que cualquier intercambio se realiza bajo su propia responsabilidad.

5. Bloqueo y reportes

Trade11 ofrece herramientas para bloquear y reportar usuarios.

Trade11 podrá:

Restringir funcionalidades
Suspender cuentas
Eliminar usuarios que incumplan estos términos
6. Eliminación de cuenta

El usuario puede eliminar su cuenta en cualquier momento desde la App.

Al eliminar la cuenta:

Se eliminarán los datos asociados
Se perderá el acceso a la plataforma
7. Limitación de responsabilidad

Trade11 no será responsable por:

Daños derivados de intercambios entre usuarios
Conductas de otros usuarios
Información incorrecta proporcionada
Fallas técnicas o interrupciones

El uso de la App se realiza bajo el propio riesgo del usuario.

8. Propiedad intelectual

Todos los derechos sobre Trade11, incluyendo diseño, funcionalidades y contenido, pertenecen a Trade11.

9. Modificaciones

Trade11 puede modificar estos términos en cualquier momento.

El uso continuo implica aceptación de los cambios.

10. Ley aplicable

Estos términos se rigen por las leyes de Colombia.

11. Contacto

📧 support.trade11@gmail.com`;

const PRIVACY_CONTENT = `POLÍTICA DE PRIVACIDAD

Última actualización: [25/03/2026]

En Trade11 respetamos tu privacidad y protegemos tus datos personales.

1. Datos que recopilamos

Podemos recopilar:

Nombre de usuario
Correo electrónico
Ciudad y universidad
Actividad dentro de la App
Interacciones (intercambios, chats)
2. Uso de la información

Utilizamos los datos para:

Crear y gestionar cuentas
Facilitar intercambios
Mejorar la experiencia del usuario
Brindar soporte
3. Compartición de datos

Trade11 no vende datos personales.

Podemos compartir:

Información básica con otros usuarios (username, progreso)
Información requerida por ley
4. Seguridad

Aplicamos medidas razonables para proteger la información.

Sin embargo, ningún sistema es completamente seguro.

5. Derechos del usuario

El usuario puede:

Acceder a sus datos
Modificar su información
Eliminar su cuenta
6. Eliminación de datos

Al eliminar la cuenta:

Se eliminan los datos personales
Se pierde acceso a la plataforma
7. Menores de edad

Trade11 no está dirigida a menores de 13 años.

8. Cambios en la política

Podemos actualizar esta política en cualquier momento.

9. Contacto

📧 support.trade11@gmail.com`;

interface LegalModalProps {
  type: 'terms' | 'privacy';
  onClose: () => void;
}

const LegalModal = ({ type, onClose }: LegalModalProps) => {
  const content = type === 'terms' ? TERMS_CONTENT : PRIVACY_CONTENT;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: 'var(--surface-card)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--surface-card-border)' }}>
        <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
          {type === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad'}
        </h2>
        <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <pre className="whitespace-pre-wrap text-[13px] leading-relaxed font-sans" style={{ color: 'var(--text-primary)' }}>
          {content}
        </pre>
      </div>
    </div>
  );
};

export { LegalModal, TERMS_CONTENT, PRIVACY_CONTENT };
