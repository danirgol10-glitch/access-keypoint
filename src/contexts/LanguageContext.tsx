import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.progress': 'Progress',
    'nav.album': 'Album',
    'nav.trading': 'Trading',
    'nav.friends': 'Friends',

    // Profile
    'profile.title': 'Profile',
    'profile.university': 'UNIVERSITY',
    'profile.city': 'CITY',
    'profile.language': 'LANGUAGE',
    'profile.theme': 'APP THEME',
    'profile.logout': 'Log Out',
    'profile.addUniversity': 'Add University',
    'profile.addCity': 'Add City',
    'profile.noneStudent': 'None / Not a student',
    'profile.setCityFirst': 'Set your city first to see universities.',

    // Progress / Home
    'home.progress': 'PROGRESS',
    'home.roadTo100': 'Road to 100%',
    'home.stickersCount': '{count} / {total} stickers',
    'home.owned': 'Owned',
    'home.missing': 'Missing',
    'home.dupes': 'Dupes',
    'home.friendsWhoCanHelp': 'Friends Who Can Help',
    'home.addFriendsToDiscover': 'Add friends to discover who can help!',
    'home.addFriends': 'Add Friends',
    'home.noFriendDuplicates': 'No friend duplicates match your needs yet.',
    'home.sortBy': 'Sort by:',
    'home.sortDefault': 'Default',
    'home.sortMostActive': 'Most active',
    'home.peopleInCityWhoCanHelp': 'People in {city} Who Can Help',
    'home.localMatches': 'Local Matches',
    'home.setCityToFind': 'Set your city in your profile to find local collectors!',
    'home.setCity': 'Set City',
    'home.noCollectorsInCity': 'No other collectors in {city} yet. Spread the word!',
    'home.noMatchesInCity': 'No matches yet in {city}.',
    'home.noMatchesInCityDetail': "Collectors in your city haven't marked duplicates that match what you need.",
    'home.uniWhoCanHelp': 'People at Your University Who Can Help',
    'home.setUniToFind': 'Set your university in your profile to find classmates!',
    'home.setUniversity': 'Set University',
    'home.noUniMatches': 'No university matches yet. Spread the word!',

    // Album
    'album.loading': 'Loading album...',
    'album.failed': 'Failed to load stickers.',
    'album.noStickersFound': 'No stickers found.',
    'album.searchPlaceholder': 'Search by code or team name...',
    'album.allScopes': 'All Scopes',
    'album.teams': 'Teams',
    'album.allGroups': 'All Groups',
    'album.group': 'Group {g}',
    'album.allTeams': 'All Teams',
    'album.allStatus': 'All Status',
    'album.need': 'Need',
    'album.have': 'Have',
    'album.duplicate': 'Duplicate',
    'album.duplicatesSelected': '{count} duplicate{s} selected',
    'album.done': 'Done',

    // Sticker status labels (card)
    'sticker.have': 'Have',
    'sticker.need': 'Need',
    'sticker.duplicate': 'Dup',

    // Quick Duplicate Onboarding
    'onboarding.title': 'Start Trading Faster',
    'onboarding.description': 'Mark your duplicate stickers. Only duplicates appear in the marketplace.',
    'onboarding.markNow': 'Mark duplicates now',
    'onboarding.skip': 'Skip for now',

    // Trading
    'trading.title': 'Trading',
    'trading.pendingRequests': 'Pending Requests',
    'trading.incoming': 'Incoming',
    'trading.outgoing': 'Outgoing',
    'trading.activeTrades': 'Active Trades',
    'trading.chatAvailable': 'Chat available',
    'trading.open': 'Open',
    'trading.chats': 'Chats',
    'trading.noChats': 'No chats yet. Chats unlock when a trade request is accepted.',
    'trading.noMessages': 'No messages yet',
    'trading.friends': 'Friends',
    'trading.addFriendPlaceholder': 'Add friend by username',
    'trading.enterUsername': 'Please enter a username',
    'trading.requestSent': 'Request sent',
    'trading.tradeRequestSent': 'Trade request sent.',
    'trading.requestSentTo': 'Friend request sent to @{username}',
    'trading.friendAdded': 'Friend added',
    'trading.youAreNowFriends': 'You are now friends!',
    'trading.requestRejected': 'Request rejected',
    'trading.theRequestRejected': 'The request has been rejected.',
    'trading.error': 'Error',
    'trading.failedToRespond': 'Failed to respond',
    'trading.incomingFriendRequests': 'Incoming friend requests',
    'trading.outgoingFriendRequests': 'Outgoing friend requests',
    'trading.pending': 'Pending',
    'trading.noFriends': 'No friends yet. Add someone by username above!',
    'trading.cityLabel': 'City',
    'trading.uniLabel': 'University',
    'trading.noActiveTrades': 'No active trades yet.',
    'trading.receivedRequests': 'Received Requests',
    'trading.findCollectors': 'Find collectors in your city, university, or friends.',
    'trading.rejectRequest': 'Reject Request?',
    'trading.cancelRequest': 'Cancel Request?',
    'trading.confirmReject': 'Are you sure you want to reject this trade request?',
    'trading.confirmCancel': 'Are you sure you want to cancel this trade request?',
    'trading.noGoBack': 'No, go back',
    'trading.yesReject': 'Yes, reject',
    'trading.yesCancel': 'Yes, cancel',

    // Trade Request Card
    'trade.to': 'To',
    'trade.from': 'From',
    'trade.accept': 'Accept',
    'trade.reject': 'Reject',
    'trade.cancel': 'Cancel',
    'trade.stickers': '{count} sticker{s}',
    'trade.statusPending': 'Pending',
    'trade.statusAccepted': 'Accepted',
    'trade.statusRejected': 'Rejected',
    'trade.statusCancelled': 'Cancelled',

    // Friend Match Card
    'match.hasStickers': 'Has {count} sticker{s} you need',
    'match.noMatching': 'No matching stickers',
    'match.dupes': '{count} dupes',
    'match.view': 'View',
    'match.active': 'Active {time}',

    // Album Stats Card
    'stats.albumProgress': 'Album Progress',
    'stats.owned': 'Owned',
    'stats.duplicates': 'Duplicates',
    'stats.missing': 'Missing',
    'stats.ofStickers': '{owned} of {total} stickers',

    // Friends
    'friends.title': 'Friends',
    'friends.myFriends': 'My Friends',
    'friends.searchUsers': 'Search Users',
    'friends.searchPlaceholder': 'Search by username',
    'friends.noResults': 'No users found.',
    'friends.noFriendsYet': "You don't have friends yet.",
    'friends.searchToConnect': 'Search collectors to connect.',
    'friends.suggested': 'SUGGESTED',
    'friends.add': 'Add',
    'friends.alreadyFriends': 'Friends',
    'friends.viewProfile': 'View Profile',
    'friends.proposeTrade': 'Propose Trade',

    // Notifications
    'notif.title': 'Notifications',
    'notif.markAllRead': 'Mark all as read',
    'notif.empty': 'No notifications yet',

    // Block User
    'block.blocked': 'User blocked',
    'block.unblocked': 'User unblocked',
    'block.failBlock': 'Failed to block user',
    'block.failUnblock': 'Failed to unblock user',
    'block.blockUser': 'Block user',
    'block.unblockUser': 'Unblock user',
    'block.confirmTitle': 'Block @{username}?',
    'block.confirmDesc': "They won't appear in your matches, chats, or requests. You can unblock them later.",
    'block.cancel': 'Cancel',
    'block.confirm': 'Block',

    // Report User
    'report.reportUser': 'Report user',
    'report.title': 'Report @{username}',
    'report.spam': 'Spam',
    'report.inappropriate': 'Inappropriate behavior',
    'report.scam': 'Scam attempt',
    'report.other': 'Other',
    'report.optionalMessage': 'Additional details (optional)',
    'report.submit': 'Submit Report',
    'report.cancel': 'Cancel',
    'report.success': 'Report submitted',
    'report.successDesc': 'Thank you. We will review this report.',
    'report.fail': 'Failed to submit report',

    // City Gate Modal
    'cityGate.title': 'Select your city',
    'cityGate.desc': 'Choose your city to enable local exchange features.',
    'cityGate.placeholder': 'Choose a city',
    'cityGate.saving': 'Saving...',
    'cityGate.continue': 'Continue',
    'cityGate.saved': 'City saved!',

    // Completion Celebration
    'celebration.title': 'ALBUM COMPLETED',
    'celebration.subtitle': 'For the Good of the Game',

    // Auth
    'auth.welcomeBack': 'Welcome back',
    'auth.createAccount': 'Create an account',
    'auth.loginSubtitle': 'Enter your credentials to access your account',
    'auth.signupSubtitle': 'Enter your email to get started',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Create Account',
    'auth.pleaseWait': 'Please wait...',
    'auth.noAccount': "Don't have an account? Create one",
    'auth.hasAccount': 'Already have an account? Sign in',
    'auth.loading': 'Loading...',
    'auth.validationError': 'Validation Error',
    'auth.loginFailed': 'Login Failed',
    'auth.invalidCredentials': 'Invalid email or password.',
    'auth.signUpFailed': 'Sign Up Failed',
    'auth.accountExists': 'Account Exists',
    'auth.alreadyRegistered': 'This email is already registered.',
    'auth.checkEmail': 'Check Your Email',
    'auth.confirmationSent': 'We sent you a confirmation link.',
    'auth.unexpectedError': 'An unexpected error occurred.',

    // Chat
    'chat.sayHello': 'Say hello! 👋',
    'chat.placeholder': 'Type a message...',

    // Request Detail
    'requestDetail.title': 'Request Details',
    'requestDetail.status': 'Status',
    'requestDetail.created': 'Created',
    'requestDetail.accept': 'Accept',
    'requestDetail.reject': 'Reject',
    'requestDetail.cancelRequest': 'Cancel Request',
    'requestDetail.openChat': 'Open Chat',
    'requestDetail.requestedStickers': 'Requested Stickers ({count})',
    'requestDetail.noStickers': 'No stickers in this request.',
    'requestDetail.notFound': 'Request not found.',
    'requestDetail.accepted': 'Request accepted',
    'requestDetail.rejected': 'Request rejected',
    'requestDetail.cancelled': 'Request cancelled',
    'requestDetail.failAccept': 'Failed to accept request',
    'requestDetail.failUpdate': 'Failed to update request',
    'requestDetail.confirmSure': 'Are you sure? This action cannot be undone.',
    'requestDetail.yesReject': 'Yes, reject',
    'requestDetail.yesCancel': 'Yes, cancel',

    // Choose Username
    'setup.title': 'Set up your profile',
    'setup.subtitle': 'Pick a username, city, and university to get started',
    'setup.username': 'Username',
    'setup.usernamePlaceholder': 'yourname',
    'setup.usernameHint': 'Letters, numbers, and underscores. 3-20 characters.',
    'setup.city': 'City',
    'setup.cityPlaceholder': 'Select your city',
    'setup.university': 'University',
    'setup.uniPlaceholder': 'Select your university',
    'setup.uniCityFirst': 'Select a city first',
    'setup.noneStudent': 'None / Not a student',
    'setup.saving': 'Saving...',
    'setup.continue': 'Continue',
    'setup.welcome': 'Welcome!',
    'setup.usernameSet': 'Your username @{username} is set.',
    'setup.invalidUsername': 'Invalid username',
    'setup.cityRequired': 'City required',
    'setup.selectCity': 'Please select your city.',
    'setup.usernameTaken': 'Username taken',
    'setup.usernameTakenDesc': 'This username is already in use.',
    'setup.back': 'Back',

    // Friend Profile
    'friendProfile.owned': 'Owned',
    'friendProfile.duplicates': 'Duplicates',
    'friendProfile.missing': 'Missing',
    'friendProfile.searchPlaceholder': 'Search by code, name, team...',
    'friendProfile.all': 'All',
    'friendProfile.have': 'Have',
    'friendProfile.duplicate': 'Duplicate',
    'friendProfile.noMatch': 'No stickers match your search.',
    'friendProfile.noFilter': 'No {filter} stickers.',
    'friendProfile.noMarked': 'No stickers marked yet.',

    // Friend Detail
    'friendDetail.hasStickers': 'Has {count} sticker{s} you need',
    'friendDetail.noMatch': 'No duplicates match your needs yet.',
    'friendDetail.askFriend': 'Ask @{username} to mark their duplicates.',
    'friendDetail.selectStickers': 'Select stickers',
    'friendDetail.request': 'Request ({count})',
    'friendDetail.sending': 'Sending...',
    'friendDetail.noValid': 'No valid stickers',
    'friendDetail.noValidDesc': 'The selected stickers are no longer available.',
    'friendDetail.failSend': 'Failed to send request.',

    // Common
    'common.unknown': 'unknown',
    'common.error': 'Error',
    'common.send': 'Send',
  },
  es: {
    // Navigation
    'nav.progress': 'Progreso',
    'nav.album': 'Álbum',
    'nav.trading': 'Intercambio',
    'nav.friends': 'Amigos',

    // Profile
    'profile.title': 'Perfil',
    'profile.university': 'UNIVERSIDAD',
    'profile.city': 'CIUDAD',
    'profile.language': 'IDIOMA',
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
    'trading.cityLabel': 'Ciudad',
    'trading.uniLabel': 'Universidad',
    'trading.noActiveTrades': 'No hay intercambios activos aún.',
    'trading.receivedRequests': 'Solicitudes Recibidas',
    'trading.findCollectors': 'Encuentra coleccionistas en tu ciudad, universidad o amigos.',
    'trading.rejectRequest': '¿Rechazar Solicitud?',
    'trading.cancelRequest': '¿Cancelar Solicitud?',
    'trading.confirmReject': '¿Estás seguro de rechazar esta solicitud de intercambio?',
    'trading.confirmCancel': '¿Estás seguro de cancelar esta solicitud de intercambio?',
    'trading.noGoBack': 'No, volver',
    'trading.yesReject': 'Sí, rechazar',
    'trading.yesCancel': 'Sí, cancelar',

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

    // Friend Profile
    'friendProfile.owned': 'Tengo',
    'friendProfile.duplicates': 'Repetidas',
    'friendProfile.missing': 'Faltan',
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

    // Common
    'common.unknown': 'desconocido',
    'common.error': 'Error',
    'common.send': 'Enviar',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved === 'es' ? 'es' : 'en') as Language;
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>): string => {
    let str = translations[language][key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return str;
  }, [language]);

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
