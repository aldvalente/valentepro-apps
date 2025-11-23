// Frontend i18n system
const translations = {
  it: {
    // Header
    'header.search': 'Cerca attrezzatura, città...',
    'header.becomeHost': 'Diventa Host',
    'header.login': 'Accedi',
    'header.register': 'Registrati',
    'header.profile': 'Profilo',
    'header.myEquipment': 'Le mie attrezzature',
    'header.myBookings': 'Le mie prenotazioni',
    'header.admin': 'Admin Panel',
    'header.logout': 'Logout',
    
    // Home
    'home.title': 'Noleggia attrezzature sportive ovunque',
    'home.subtitle': 'Trova l\'attrezzatura perfetta per la tua prossima avventura',
    'home.featured': 'Attrezzature in evidenza',
    
    // Filters
    'filters.category': 'Categoria',
    'filters.all': 'Tutte',
    'filters.bikes': 'Bici',
    'filters.mountain': 'Montagna',
    'filters.water': 'Acquatici',
    'filters.search': 'Cerca',
    'filters.city': 'Città',
    
    // Equipment
    'equipment.perDay': 'al giorno',
    'equipment.viewDetails': 'Vedi dettagli',
    'equipment.book': 'Prenota',
    'equipment.description': 'Descrizione',
    'equipment.rules': 'Regole di noleggio',
    'equipment.reviews': 'Recensioni',
    'equipment.location': 'Posizione',
    'equipment.host': 'Host',
    'equipment.contactHost': 'Contatta host',
    
    // Booking
    'booking.from': 'Dal',
    'booking.to': 'Al',
    'booking.days': 'giorni',
    'booking.total': 'Totale',
    'booking.confirm': 'Conferma prenotazione',
    'booking.status.pending': 'In attesa',
    'booking.status.confirmed': 'Confermata',
    'booking.status.rejected': 'Rifiutata',
    'booking.status.cancelled': 'Cancellata',
    'booking.status.completed': 'Completata',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Nome completo',
    'auth.firstName': 'Nome',
    'auth.lastName': 'Cognome',
    'auth.phone': 'Telefono (opzionale)',
    'auth.language': 'Lingua preferita',
    'auth.forgotPassword': 'Password dimenticata?',
    'auth.noAccount': 'Non hai un account?',
    'auth.hasAccount': 'Hai già un account?',
    
    // Review
    'review.rating': 'Valutazione',
    'review.comment': 'Commento',
    'review.submit': 'Invia recensione',
    'review.noReviews': 'Nessuna recensione ancora',
    
    // Messages
    'message.send': 'Invia messaggio',
    'message.typeMessage': 'Scrivi un messaggio...',
    'message.noMessages': 'Nessun messaggio',
    
    // Common
    'common.save': 'Salva',
    'common.cancel': 'Annulla',
    'common.edit': 'Modifica',
    'common.delete': 'Elimina',
    'common.close': 'Chiudi',
    'common.loading': 'Caricamento...',
    'common.error': 'Si è verificato un errore',
    'common.success': 'Operazione completata con successo',
    'common.noResults': 'Nessun risultato trovato'
  },
  
  en: {
    // Header
    'header.search': 'Search equipment, city...',
    'header.becomeHost': 'Become a Host',
    'header.login': 'Login',
    'header.register': 'Sign up',
    'header.profile': 'Profile',
    'header.myEquipment': 'My equipment',
    'header.myBookings': 'My bookings',
    'header.admin': 'Admin Panel',
    'header.logout': 'Logout',
    
    // Home
    'home.title': 'Rent sports equipment anywhere',
    'home.subtitle': 'Find the perfect equipment for your next adventure',
    'home.featured': 'Featured equipment',
    
    // Filters
    'filters.category': 'Category',
    'filters.all': 'All',
    'filters.bikes': 'Bikes',
    'filters.mountain': 'Mountain',
    'filters.water': 'Water sports',
    'filters.search': 'Search',
    'filters.city': 'City',
    
    // Equipment
    'equipment.perDay': 'per day',
    'equipment.viewDetails': 'View details',
    'equipment.book': 'Book',
    'equipment.description': 'Description',
    'equipment.rules': 'Rental rules',
    'equipment.reviews': 'Reviews',
    'equipment.location': 'Location',
    'equipment.host': 'Host',
    'equipment.contactHost': 'Contact host',
    
    // Booking
    'booking.from': 'From',
    'booking.to': 'To',
    'booking.days': 'days',
    'booking.total': 'Total',
    'booking.confirm': 'Confirm booking',
    'booking.status.pending': 'Pending',
    'booking.status.confirmed': 'Confirmed',
    'booking.status.rejected': 'Rejected',
    'booking.status.cancelled': 'Cancelled',
    'booking.status.completed': 'Completed',
    
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.fullName': 'Full name',
    'auth.firstName': 'First name',
    'auth.lastName': 'Last name',
    'auth.phone': 'Phone (optional)',
    'auth.language': 'Preferred language',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    
    // Review
    'review.rating': 'Rating',
    'review.comment': 'Comment',
    'review.submit': 'Submit review',
    'review.noReviews': 'No reviews yet',
    
    // Messages
    'message.send': 'Send message',
    'message.typeMessage': 'Type a message...',
    'message.noMessages': 'No messages',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Operation completed successfully',
    'common.noResults': 'No results found'
  }
};

// Current language (default to Italian)
let currentLang = localStorage.getItem('language') || 'it';

// Get translation
function t(key) {
  // Helper function to look up nested keys
  const nestedLookup = (obj, key) => {
    const keys = key.split('.');
    let value = obj;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }
    return value;
  };
  
  // Try direct lookup first (for flat keys like 'header.login')
  let value = translations[currentLang]?.[key];
  
  // If not found, try nested lookup
  if (!value) {
    value = nestedLookup(translations[currentLang], key);
  }
  
  // Fallback to English if not found
  if (!value && currentLang !== 'en') {
    // Try direct lookup in English
    value = translations.en?.[key];
    
    // If still not found, try nested lookup
    if (!value) {
      value = nestedLookup(translations.en, key);
    }
  }
  
  return value || key;
}

// Set language
function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    updatePageTranslations();
  }
}

// Update all elements with data-i18n attribute
function updatePageTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.placeholder = translation;
    } else {
      element.textContent = translation;
    }
  });
  
  // Update HTML lang attribute
  document.documentElement.lang = currentLang;
  
  // Trigger custom event for other components to update
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
}

// Get current language
function getCurrentLanguage() {
  return currentLang;
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', updatePageTranslations);
} else {
  updatePageTranslations();
}

// Export for use in other scripts
window.i18n = {
  t,
  setLanguage,
  getCurrentLanguage,
  updatePageTranslations
};
