const S = {
  urls: {
    home: 'https://www.niteflirt.com',
    login: 'https://www.niteflirt.com/login',
    chat: 'https://www.niteflirt.com/messages',
    mail: 'https://www.niteflirt.com/mail',
    profile: 'https://www.niteflirt.com/profile',
    dashboard: 'https://www.niteflirt.com/dashboard',
    earnings: 'https://www.niteflirt.com/earnings',
    calls: 'https://www.niteflirt.com/calls',
    visitors: 'https://www.niteflirt.com/visitors',
    favorites: 'https://www.niteflirt.com/favorites',
    blocked: 'https://www.niteflirt.com/blocked',
    settings: 'https://www.niteflirt.com/settings'
  },

  auth: {
    loggedIn: 'text=/Inbox|Bandeja|Messages|Chat|Profile|Account|Logout|Sign out|Dashboard|Earnings/i',
    loggedInCSS: '.user-menu, .profile-menu, .account-menu, .logged-in-indicator, .user-profile, .account-info, [data-testid="user-menu"], .MuiAvatar-root',
    loginForm: 'form, .login-form, [data-testid="login-form"], .MuiFormControl-root',
    // Selectores específicos de Material-UI para Niteflirt
    emailField: '#outlined-basic-login, input[type="text"], input[type="email"], .MuiInputBase-input, input[name="email"], input[name="username"]',
    passwordField: 'input[type="password"], .MuiInputBase-input[type="password"], input[name="password"]',
    loginButton: 'button:has-text("Login"), button:has-text("Sign In"), button:has-text("Log In"), .MuiButton-containedPrimary, button[type="submit"]'
  },

  navigation: {
    menu: '.nav-menu, .navigation, .sidebar, .menu, [data-testid="navigation"]',
    inboxLink: 'a[href*="messages"], a[href*="chat"], a:has-text("Messages"), a:has-text("Chat"), a:has-text("Inbox")',
    mailLink: 'a[href*="mail"], a:has-text("Mail"), a:has-text("Email")',
    callsLink: 'a[href*="calls"], a:has-text("Calls"), a:has-text("Phone")',
    profileLink: 'a[href*="profile"], a:has-text("Profile"), a:has-text("Account")',
    dashboardLink: 'a[href*="dashboard"], a:has-text("Dashboard"), a:has-text("Home")',
    earningsLink: 'a[href*="earnings"], a:has-text("Earnings"), a:has-text("Money")',
    visitorsLink: 'a[href*="visitors"], a:has-text("Visitors"), a:has-text("Views")',
    favoritesLink: 'a[href*="favorites"], a:has-text("Favorites"), a:has-text("Favs")',
    settingsLink: 'a[href*="settings"], a:has-text("Settings"), a:has-text("Config")'
  },

  chat: {
    threadList: '.thread-list, .chat-list, .conversation-list, .message-list, [data-testid="thread-list"], .MuiList-root',
    threadItem: '.thread-item, .chat-item, .conversation-item, .message-item, [data-testid="thread-item"], .MuiListItem-root, li[role="button"], .chat-thread',
    unreadCount: '.unread-count, .message-count, .badge, [data-testid="unread-count"], .MuiBadge-badge',
    conversationArea: '.conversation-area, .chat-area, .message-area, [data-testid="conversation-area"], .chat-container',
    messageContainer: '.message-container, .chat-messages, .conversation-messages, [data-testid="message-container"]',
    messageItem: '.message-item, .chat-message, .conversation-message, [data-testid="message-item"], .message',
    lastInboundMsg: '.inbound-message:last-child, .received-message:last-child, .client-message:last-child, [data-testid="inbound-message"]:last-child, .message.received:last-child, .message.inbound:last-child',
    lastOutboundMsg: '.outbound-message:last-child, .sent-message:last-child, .my-message:last-child, [data-testid="outbound-message"]:last-child, .message.sent:last-child, .message.outbound:last-child',
    clientName: '.client-name, .user-name, .sender-name, [data-testid="client-name"], .chat-header h1, .conversation-header h1',
    clientInfo: '.client-info, .user-info, .sender-info, [data-testid="client-info"]',
    clientStatus: '.client-status, .user-status, .online-status, [data-testid="client-status"]',
    messageInput: 'input[type="text"], textarea, .message-input, .chat-input, [data-testid="message-input"], .MuiInputBase-input, [contenteditable="true"]',
    sendButton: 'button[type="submit"], .send-button, .submit-button, [data-testid="send-button"], button:has-text("Send"), button:has-text("Enviar"), .MuiButton-root:has-text("Send")',
    searchBox: '.search-box, .search-input, [data-testid="search-box"], input[placeholder*="search"], input[placeholder*="Search"]',
    filterOptions: '.filter-options, .filter-buttons, [data-testid="filter-options"]',
    activeFilter: '.filter-active, .filter-selected, [data-testid="active-filter"]'
  },

  mail: {
    mailList: '.mail-list, .email-list, .inbox-list, [data-testid="mail-list"], .MuiList-root',
    mailItem: '.mail-item, .email-item, .inbox-item, [data-testid="mail-item"], .MuiListItem-root, li[role="button"]',
    readRow: '.read-row, .read-email, .read-mail, [data-testid="read-row"]',
    emailSender: '.email-sender, .mail-sender, .sender-name, [data-testid="email-sender"]',
    emailDate: '.email-date, .mail-date, .date, [data-testid="email-date"]',
    mailFilters: '.mail-filters, .email-filters, [data-testid="mail-filters"]',
    unreadFilter: '.unread-filter, [data-testid="unread-filter"]',
    allFilter: '.all-filter, [data-testid="all-filter"]'
  },

  calls: {
    callHistory: '.call-history, .calls-list, [data-testid="call-history"], .MuiList-root',
    callItem: '.call-item, .call-record, [data-testid="call-item"], .MuiListItem-root',
    missedCall: '.missed-call, .call-missed, [data-testid="missed-call"]',
    answeredCall: '.answered-call, .call-answered, [data-testid="answered-call"]',
    callDuration: '.call-duration, .duration, [data-testid="call-duration"]',
    callDate: '.call-date, .date, [data-testid="call-date"]'
  },

  visitors: {
    visitorList: '.visitor-list, .visitors-list, [data-testid="visitor-list"], .MuiList-root',
    visitorItem: '.visitor-item, .visitor-record, [data-testid="visitor-item"], .MuiListItem-root',
    visitorName: '.visitor-name, .name, [data-testid="visitor-name"]',
    visitDate: '.visit-date, .date, [data-testid="visit-date"]',
    visitorStatus: '.visitor-status, .status, [data-testid="visitor-status"]'
  },

  favorites: {
    favoriteList: '.favorite-list, .favorites-list, [data-testid="favorite-list"], .MuiList-root',
    favoriteItem: '.favorite-item, .favorite-record, [data-testid="favorite-item"], .MuiListItem-root',
    favoriteName: '.favorite-name, .name, [data-testid="favorite-name"]',
    favoriteDate: '.favorite-date, .date, [data-testid="favorite-date"]',
    removeFavorite: '.remove-favorite, .unfavorite, [data-testid="remove-favorite"]'
  },

  dashboard: {
    statsContainer: '.stats-container, .dashboard-stats, [data-testid="stats-container"]',
    earningsDisplay: '.earnings-display, .money-display, [data-testid="earnings-display"]',
    messageCount: '.message-count, .msg-count, [data-testid="message-count"]',
    callCount: '.call-count, .calls-count, [data-testid="call-count"]',
    visitorCount: '.visitor-count, .visitors-count, [data-testid="visitor-count"]',
    onlineStatus: '.online-status, .status-indicator, [data-testid="online-status"]'
  },

  profile: {
    profileInfo: '.profile-info, .user-info, [data-testid="profile-info"]',
    profilePhoto: '.profile-photo, .user-photo, .avatar, [data-testid="profile-photo"]',
    profileName: '.profile-name, .user-name, [data-testid="profile-name"]',
    profileBio: '.profile-bio, .user-bio, .bio, [data-testid="profile-bio"]',
    editProfile: '.edit-profile, .edit-button, [data-testid="edit-profile"]',
    saveProfile: '.save-profile, .save-button, [data-testid="save-profile"]'
  },

  notifications: {
    notificationArea: '.notification-area, .notifications, [data-testid="notification-area"]',
    notificationItem: '.notification-item, .notification, [data-testid="notification-item"]',
    notificationText: '.notification-text, .text, [data-testid="notification-text"]',
    closeNotification: '.close-notification, .close-button, [data-testid="close-notification"]',
    unreadNotifications: '.unread-notification, .unread, [data-testid="unread-notification"]'
  },

  common: {
    loadingSpinner: '.loading-spinner, .spinner, .loader, [data-testid="loading-spinner"]',
    errorMessage: '.error-message, .error, .alert-error, [data-testid="error-message"]',
    successMessage: '.success-message, .success, .alert-success, [data-testid="success-message"]',
    modalOverlay: '.modal-overlay, .modal-backdrop, .overlay, [data-testid="modal-overlay"]',
    closeButton: '.close-button, .close, .x-button, [data-testid="close-button"]',
    confirmButton: '.confirm-button, .ok-button, .yes-button, [data-testid="confirm-button"]',
    cancelButton: '.cancel-button, .no-button, .cancel, [data-testid="cancel-button"]'
  }
};

module.exports = S;
