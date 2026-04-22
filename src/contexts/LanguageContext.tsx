import React, { createContext, useContext, useCallback } from 'react';

export type Language = 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const translations: Record<string, string> = {
  // Navigation
  'nav.progress': 'Progreso',
  'nav.album': 'Álbum',
  'nav.trading': 'Intercambio',
  'nav.friends': 'Amigos',

  // Profile
  'profile.title': 'Perfil',
  'profile.yourProfile': 'Tu perfil',
  'profile.university': 'UNIVERSIDAD',
  'profile.city': 'CIUDAD',
  'profile.theme': 'TEMA DE LA APP',
  'profile.logout': 'Cerrar Sesión',
  'profile.addUniversity': 'Agregar Universidad',
  'profile.addCity': 'Agregar Ciudad',
  'profile.noneStudent': 'Ninguna / No soy estudiante',
  'profile.setCityFirst': 'Establece tu ciudad primero para ver universidades.',

  // Progress / Home
  'home.progress': 'PROGRESO',
  'home.roadTo100': 'Camino al 100%',
  'home.stickersCount': '{count} / {total} stickers',
  'home.owned': 'Tengo',
  'home.missing': 'Faltan',
  'home.dupes': 'Repet.',
  'home.friendsWhoCanHelp': 'Amigos que pueden ayudar',
  'home.addFriendsToDiscover': '¡Agrega amigos para descubrir quién puede ayudar!',
  'home.addFriends': 'Agregar Amigos',
  'home.noFriendDuplicates': 'Ningún duplicado de amigos coincide con lo que necesitas.',
  'home.sortBy': 'Ordenar por:',
  'home.sortDefault': 'Predeterminado',
  'home.sortMostActive': 'Más activo',
  'home.peopleInCityWhoCanHelp': 'Personas en {city} que pueden ayudar',
  'home.localMatches': 'Coincidencias locales',
  'home.setCityToFind': '¡Establece tu ciudad en tu perfil para encontrar coleccionistas locales!',
  'home.setCity': 'Establecer Ciudad',
  'home.noCollectorsInCity': 'No hay otros coleccionistas en {city} aún. ¡Corre la voz!',
  'home.noMatchesInCity': 'No hay coincidencias en {city} aún.',
  'home.noMatchesInCityDetail': 'Los coleccionistas de tu ciudad no han marcado duplicados que coincidan con lo que necesitas.',
  'home.uniWhoCanHelp': 'Personas de tu universidad que pueden ayudar',
  'home.setUniToFind': '¡Establece tu universidad en tu perfil para encontrar compañeros!',
  'home.setUniversity': 'Establecer Universidad',
  'home.noUniMatches': 'No hay coincidencias universitarias aún. ¡Corre la voz!',

  // Album
  'album.loading': 'Cargando álbum...',
  'album.failed': 'Error al cargar los stickers.',
  'album.noStickersFound': 'No se encontraron stickers.',
  'album.searchPlaceholder': 'Buscar por código o equipo...',
  'album.allScopes': 'Todos',
  'album.teams': 'Equipos',
  'album.allGroups': 'Todos los Grupos',
  'album.group': 'Grupo {g}',
  'album.allTeams': 'Todos los Equipos',
  'album.allStatus': 'Todos los Estados',
  'album.need': 'Me falta',
  'album.have': 'La tengo',
  'album.duplicate': 'Repetida',
  'album.duplicatesSelected': '{count} repetida{s} seleccionada{s}',
  'album.done': 'Listo',

  // Sticker status labels (card)
  'sticker.have': 'La tengo',
  'sticker.need': 'Me falta',
  'sticker.duplicate': 'Repetida',

  // Quick Duplicate Onboarding
  'onboarding.title': 'Empieza a Intercambiar',
  'onboarding.description': 'Marca tus stickers repetidos. Solo los repetidos aparecen en el mercado.',
  'onboarding.markNow': 'Marcar repetidos ahora',
  'onboarding.skip': 'Omitir por ahora',

  // Trading
  'trading.title': 'Intercambio',
  'trading.pendingRequests': 'Solicitudes Pendientes',
  'trading.incoming': 'Entrantes',
  'trading.outgoing': 'Salientes',
  'trading.activeTrades': 'Intercambios Activos',
  'trading.chatAvailable': 'Chat disponible',
  'trading.open': 'Abrir',
  'trading.chats': 'Chats',
  'trading.noChats': 'No hay chats aún. Los chats se desbloquean al aceptar una solicitud.',
  'trading.noMessages': 'Sin mensajes aún',
  'trading.friends': 'Amigos',
  'trading.addFriendPlaceholder': 'Agregar amigo por usuario',
  'trading.enterUsername': 'Ingresa un nombre de usuario',
  'trading.requestSent': 'Solicitud enviada',
  'trading.tradeRequestSent': 'Solicitud de intercambio enviada.',
  'trading.requestSentTo': 'Solicitud de amistad enviada a @{username}',
  'trading.friendAdded': 'Amigo agregado',
  'trading.youAreNowFriends': '¡Ahora son amigos!',
  'trading.requestRejected': 'Solicitud rechazada',
  'trading.theRequestRejected': 'La solicitud ha sido rechazada.',
  'trading.error': 'Error',
  'trading.failedToRespond': 'Error al responder',
  'trading.incomingFriendRequests': 'Solicitudes de amistad entrantes',
  'trading.outgoingFriendRequests': 'Solicitudes de amistad salientes',
  'trading.pending': 'Pendiente',
  'trading.noFriends': '¡No hay amigos aún. Agrega a alguien por su usuario!',
  'trading.uniLabel': 'Universidad',
  'trading.noActiveTrades': 'No hay intercambios activos aún.',
  'trading.receivedRequests': 'Solicitudes Recibidas',
  'trading.findCollectors': 'Encuentra coleccionistas a través de amigos o universidad.',
  'trading.discoverySubtitle': 'Descubre coleccionistas e intercambia láminas',
  'friends.suggestedDesc': 'Personas de tu universidad',
  'trading.rejectRequest': '¿Rechazar Solicitud?',
  'trading.cancelRequest': '¿Cancelar Solicitud?',
  'trading.confirmReject': '¿Estás seguro de rechazar esta solicitud de intercambio?',
  'trading.confirmCancel': '¿Estás seguro de cancelar esta solicitud de intercambio?',
  'trading.noGoBack': 'No, volver',
  'trading.yesReject': 'Sí, rechazar',
  'trading.yesCancel': 'Sí, cancelar',
  'trading.removeActiveTrade': 'Quitar intercambio activo',
  'trading.archiveTitle': '¿Eliminar intercambio activo?',
  'trading.archiveMessage': 'Este intercambio se quitará de tu lista de intercambios activos.',
  'trading.tradeArchived': 'Intercambio quitado de tu lista',

  // Trade Request Card
  'trade.to': 'Para',
  'trade.from': 'De',
  'trade.accept': 'Aceptar',
  'trade.reject': 'Rechazar',
  'trade.cancel': 'Cancelar',
  'trade.stickers': '{count} sticker{s}',
  'trade.statusPending': 'Pendiente',
  'trade.statusAccepted': 'Aceptado',
  'trade.statusRejected': 'Rechazado',
  'trade.statusCancelled': 'Cancelado',

  // Friend Match Card
  'match.hasStickers': 'Tiene {count} sticker{s} que necesitas',
  'match.noMatching': 'Sin stickers coincidentes',
  'match.dupes': '{count} repetidos',
  'match.view': 'Ver',
  'match.active': 'Activo {time}',

  // Album Stats Card
  'stats.albumProgress': 'Progreso del Álbum',
  'stats.owned': 'Tengo',
  'stats.duplicates': 'Repetidos',
  'stats.missing': 'Faltan',
  'stats.ofStickers': '{owned} de {total} stickers',

  // Friends
  'friends.title': 'Amigos',
  'friends.myFriends': 'Mis Amigos',
  'friends.searchUsers': 'Buscar Usuarios',
  'friends.searchPlaceholder': 'Buscar por nombre de usuario',
  'friends.noResults': 'No se encontraron usuarios.',
  'friends.noFriendsYet': 'Aún no tienes amigos.',
  'friends.searchToConnect': 'Busca coleccionistas para conectar.',
  'friends.suggested': 'SUGERIDOS',
  'friends.add': 'Agregar',
  'friends.alreadyFriends': 'Amigos',
  'friends.viewProfile': 'Ver Perfil',
  'friends.proposeTrade': 'Proponer Intercambio',

  // Notifications
  'notif.title': 'Notificaciones',
  'notif.markAllRead': 'Marcar todo como leído',
  'notif.empty': 'Sin notificaciones aún',

  // Block User
  'block.blocked': 'Usuario bloqueado',
  'block.unblocked': 'Usuario desbloqueado',
  'block.failBlock': 'Error al bloquear usuario',
  'block.failUnblock': 'Error al desbloquear usuario',
  'block.blockUser': 'Bloquear usuario',
  'block.unblockUser': 'Desbloquear usuario',
  'block.confirmTitle': '¿Bloquear a @{username}?',
  'block.confirmDesc': 'No aparecerá en tus coincidencias, chats ni solicitudes. Puedes desbloquearlo después.',
  'block.cancel': 'Cancelar',
  'block.confirm': 'Bloquear',

  // Report User
  'report.reportUser': 'Reportar usuario',
  'report.title': 'Reportar a @{username}',
  'report.spam': 'Spam',
  'report.inappropriate': 'Comportamiento inapropiado',
  'report.scam': 'Intento de estafa',
  'report.other': 'Otro',
  'report.optionalMessage': 'Detalles adicionales (opcional)',
  'report.submit': 'Enviar reporte',
  'report.cancel': 'Cancelar',
  'report.success': 'Reporte enviado',
  'report.successDesc': 'Gracias. Revisaremos este reporte.',
  'report.fail': 'Error al enviar reporte',

  // City Gate Modal
  'cityGate.title': 'Selecciona tu ciudad',
  'cityGate.desc': 'Elige tu ciudad para habilitar funciones de intercambio local.',
  'cityGate.placeholder': 'Elegir una ciudad',
  'cityGate.saving': 'Guardando...',
  'cityGate.continue': 'Continuar',
  'cityGate.saved': '¡Ciudad guardada!',

  // Completion Celebration
  'celebration.title': 'ÁLBUM COMPLETADO',
  'celebration.subtitle': 'Por el bien del juego',

  // Auth
  'auth.welcomeBack': 'Bienvenido de nuevo',
  'auth.createAccount': 'Crear una cuenta',
  'auth.loginSubtitle': 'Ingresa tus credenciales para acceder a tu cuenta',
  'auth.signupSubtitle': 'Ingresa tu correo para comenzar',
  'auth.email': 'Correo electrónico',
  'auth.password': 'Contraseña',
  'auth.signIn': 'Iniciar Sesión',
  'auth.signUp': 'Crear Cuenta',
  'auth.pleaseWait': 'Espera...',
  'auth.noAccount': '¿No tienes cuenta? Crea una',
  'auth.hasAccount': '¿Ya tienes cuenta? Inicia sesión',
  'auth.loading': 'Cargando...',
  'auth.validationError': 'Error de validación',
  'auth.loginFailed': 'Error al iniciar sesión',
  'auth.invalidCredentials': 'Correo o contraseña incorrectos.',
  'auth.signUpFailed': 'Error al registrarse',
  'auth.accountExists': 'Cuenta existente',
  'auth.alreadyRegistered': 'Este correo ya está registrado.',
  'auth.checkEmail': 'Revisa tu correo',
  'auth.confirmationSent': 'Te enviamos un enlace de confirmación.',
  'auth.unexpectedError': 'Ocurrió un error inesperado.',
  'auth.acceptTermsPrefix': 'He leído y acepto los',
  'auth.termsLink': 'Términos y Condiciones',
  'auth.privacyLink': 'Política de Privacidad',
  'auth.and': 'y la',
  'auth.mustAcceptTerms': 'Debes aceptar los Términos y Condiciones y la Política de Privacidad.',

  // Chat
  'chat.sayHello': '¡Saluda! 👋',
  'chat.placeholder': 'Escribe un mensaje...',

  // Request Detail
  'requestDetail.title': 'Detalles de la Solicitud',
  'requestDetail.status': 'Estado',
  'requestDetail.created': 'Creada',
  'requestDetail.accept': 'Aceptar',
  'requestDetail.reject': 'Rechazar',
  'requestDetail.cancelRequest': 'Cancelar Solicitud',
  'requestDetail.openChat': 'Abrir Chat',
  'requestDetail.requestedStickers': 'Stickers Solicitados ({count})',
  'requestDetail.noStickers': 'No hay stickers en esta solicitud.',
  'requestDetail.notFound': 'Solicitud no encontrada.',
  'requestDetail.accepted': 'Solicitud aceptada',
  'requestDetail.rejected': 'Solicitud rechazada',
  'requestDetail.cancelled': 'Solicitud cancelada',
  'requestDetail.failAccept': 'Error al aceptar solicitud',
  'requestDetail.failUpdate': 'Error al actualizar solicitud',
  'requestDetail.confirmSure': '¿Estás seguro? Esta acción no se puede deshacer.',
  'requestDetail.yesReject': 'Sí, rechazar',
  'requestDetail.yesCancel': 'Sí, cancelar',

  // Choose Username
  'setup.title': 'Configura tu perfil',
  'setup.subtitle': 'Elige un usuario, ciudad y universidad para comenzar',
  'setup.username': 'Nombre de usuario',
  'setup.usernamePlaceholder': 'tunombre',
  'setup.usernameHint': 'Letras, números y guiones bajos. 3-20 caracteres.',
  'setup.city': 'Ciudad',
  'setup.cityPlaceholder': 'Selecciona tu ciudad',
  'setup.university': 'Universidad',
  'setup.uniPlaceholder': 'Selecciona tu universidad',
  'setup.uniCityFirst': 'Selecciona una ciudad primero',
  'setup.noneStudent': 'Ninguna / No soy estudiante',
  'setup.saving': 'Guardando...',
  'setup.continue': 'Continuar',
  'setup.welcome': '¡Bienvenido!',
  'setup.usernameSet': 'Tu usuario @{username} está listo.',
  'setup.invalidUsername': 'Usuario inválido',
  'setup.cityRequired': 'Ciudad requerida',
  'setup.selectCity': 'Por favor selecciona tu ciudad.',
  'setup.usernameTaken': 'Usuario en uso',
  'setup.usernameTakenDesc': 'Este usuario ya está en uso.',
  'setup.back': 'Volver',

  // Friend Profile (third person)
  'friendProfile.has': 'Tiene',
  'friendProfile.duplicates': 'Repetidas',
  'friendProfile.isMissing': 'Le faltan',
  'friendProfile.searchPlaceholder': 'Buscar por código, nombre, equipo...',
  'friendProfile.all': 'Todos',
  'friendProfile.have': 'Tengo',
  'friendProfile.duplicate': 'Repetida',
  'friendProfile.noMatch': 'No hay stickers que coincidan con tu búsqueda.',
  'friendProfile.noFilter': 'No hay stickers de tipo {filter}.',
  'friendProfile.noMarked': 'No hay stickers marcados aún.',

  // Friend Detail
  'friendDetail.hasStickers': 'Tiene {count} sticker{s} que necesitas',
  'friendDetail.noMatch': 'Ningún duplicado coincide con lo que necesitas.',
  'friendDetail.askFriend': 'Pide a @{username} que marque sus repetidas.',
  'friendDetail.selectStickers': 'Seleccionar stickers',
  'friendDetail.request': 'Solicitar ({count})',
  'friendDetail.sending': 'Enviando...',
  'friendDetail.noValid': 'Sin stickers válidos',
  'friendDetail.noValidDesc': 'Los stickers seleccionados ya no están disponibles.',
  'friendDetail.failSend': 'Error al enviar solicitud.',

  // Account Management
  'profile.deleteAccount': 'Eliminar Cuenta',
  'profile.deleteConfirmTitle': '¿Estás seguro?',
  'profile.deleteConfirmMessage': 'Esta acción eliminará tu cuenta y todos tus datos de forma permanente.',
  'profile.deleteConfirmButton': 'Eliminar Cuenta',
  'profile.deleteTypingPrompt': 'Escribe ELIMINAR para confirmar',
  'profile.cancel': 'Cancelar',
  'profile.deleting': 'Eliminando...',
  'profile.legal': 'LEGAL',
  'profile.termsAndConditions': 'Términos y Condiciones',
  'profile.privacyPolicy': 'Política de Privacidad',

  // Common
  'common.unknown': 'desconocido',
  'common.error': 'Error',
  'common.send': 'Enviar',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language: Language = 'es';

  const setLanguage = useCallback((_lang: Language) => {
    // No-op: app is Spanish-only
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    let str = translations[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
