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

    // Profile
    'profile.title': 'Profile',
    'profile.university': 'UNIVERSITY',
    'profile.city': 'CITY',
    'profile.language': 'LANGUAGE',
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

    // Common
    'common.unknown': 'unknown',
  },
  es: {
    // Navigation
    'nav.progress': 'Progreso',
    'nav.album': 'Álbum',
    'nav.trading': 'Intercambio',

    // Profile
    'profile.title': 'Perfil',
    'profile.university': 'UNIVERSIDAD',
    'profile.city': 'CIUDAD',
    'profile.language': 'IDIOMA',
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
    'album.need': 'Necesito',
    'album.have': 'Tengo',
    'album.duplicate': 'Repetido',
    'album.duplicatesSelected': '{count} repetido{s} seleccionado{s}',
    'album.done': 'Listo',

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

    // Common
    'common.unknown': 'desconocido',
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
