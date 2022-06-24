export const EventTypes = Object.freeze({
  Amf: Object.freeze({
    processApiLink: 'amfprocessapilink',
    processBuffer: 'amfprocessbuffer',
    processApiFile: 'amfprocessapifile',
    selectApiMainFile: 'amfselectapimainfile',
  }),
  App: Object.freeze({
    versionInfo: 'appversioninfo',
    command: 'appcommand',
    requestAction: 'apprequestaction',
    readState: 'appreadstate',
    updateStateProperty: 'appupdatestateproperty',
  }),
  Config: Object.freeze({
    read: 'arcconfigread',
    readAll: 'arcconfigreadall',
    update: 'arcconfigupdate',
    State: Object.freeze({
      update: 'arcconfigstateupdate',
    }),
  }),
  DataExport: Object.freeze({
    customData: 'arccustomdataexport',
    nativeData: 'arcnativeexport',
    fileSave: 'filedatasave',
  }),
  DataImport: Object.freeze({
    normalize: 'arcdataimportnormalize',
    dataImport: 'arcdataimport',
    processFile: 'arcdataimportprocessfile',
    processData: 'arcdataimportprocessdata',
    inspect: 'arcdataimportinspect',
    dataImported: 'arcdataimported',
  }),
  GoogleDrive: Object.freeze({
    save: 'googledrivesave',
    listAppFolders: 'googledrivelistappfolders',
    read: 'googledriveread',
    notifyFilePicked: 'googledrivefilepicked',
  }),
  Model: Object.freeze({
    destroy: 'modeldestroy',
    destroyed: 'modeldestroyed',
    Project: {
      read: 'modelprojectread',
      readBulk: 'modelprojectreadbulk',
      update: 'modelprojectchange',
      updateBulk: 'modelprojectupdatebulk',
      delete: 'modelprojectdelete',
      list: 'modelprojectlist',
      listAll: 'modelprojectlistall',
      State: {
        update: 'modelstateprojectchange',
        delete: 'modelstateprojectdelete',
      }
    },
    Request: {
      read: 'modelrequestread',
      readBulk: 'modelrequestreadbulk',
      // updates metadata only
      update: 'modelrequestchange',
      updateBulk: 'modelrequestupdatebulk',
      // updates metadata, transforms body, takes care of dependencies
      store: 'modelrequeststore',
      delete: 'modelrequestdelete',
      deleteBulk: 'modelrequestdeletebulk',
      undeleteBulk: 'modelrequestsundelete',
      query: 'modelrequestquery',
      list:  'modelrequestlist',
      projectList: 'modelrequestprojectlist',
      State: {
        update: 'modelstaterequestchange',
        delete: 'modelstaterequestdelete',
      },
    },
    UrlIndexer: {
      update: 'modelurlindexerupdate',
      query: 'modelurlindexerquery',
      State: {
        finished: 'modelstateurlindexerfinished',
      }
    },
    AuthData: {
      query: 'modelauthdataquery',
      update: 'modelauthdataupdate',
      State: {
        update: 'modelstateauthdataupdate',
      },
    },
    HostRules: {
      update: 'modelhostrulesupdate',
      updateBulk: 'modelhostrulesupdatebulk',
      delete: 'modelhostrulesdelete',
      list: 'modelhostruleslist',
      State: {
        update: 'modelstatehostrulesupdate',
        delete: 'modelstatehostrulesdelete',
      },
    },
    ClientCertificate: {
      read: 'modelclientcertificateread',
      list: 'modelclientcertificatelist',
      delete: 'modelclientcertificatedelete',
      update: 'modelclientcertificateupdate',
      insert: 'modelclientcertificateinsert',
      State: {
        update: 'modelstateclientcertificateupdate',
        delete: 'modelstateclientcertificatedelete',
      },
    },
    WSUrlHistory: {
      // read: 'modelwsurlhistoryread',
      list: 'modelwsurlhistorylist',
      insert: 'modelwsurlhistoryinsert',
      query: 'modelwsurlhistoryquery',
      State: {
        update: 'modelstatewsurlhistoryupdate',
      },
    },
    UrlHistory: {
      // read: 'modelwsurlhistoryread',
      list: 'modelurlhistorylist',
      insert: 'modelurlhistoryinsert',
      query: 'modelurlhistoryquery',
      delete: 'modelurlhistorydelete',
      State: {
        update: 'modelstateurlhistoryupdate',
        delete: 'modelstateurlhistorydelete',
      },
    },
    Environment: {
      read: 'modelenvironmentread',
      update: 'modelenvironmentupdate',
      delete: 'modelenvironmentdelete',
      list: 'modelenvironmentlist',
      current: 'modelenvironmentcurrent',
      select: 'modelenvironmentselect',
      State: {
        update: 'modelstateenvironmentupdate',
        delete: 'modelstateenvironmentdelete',
        select: 'modelstateenvironmentselect'
      },
    },
    Variable: {
      update: 'modelvariableupdate',
      delete: 'modelvariabledelete',
      list: 'modelvariablelist',
      set: 'modelvariableset',
      State: {
        update: 'modelstatevariableupdate',
        delete: 'modelstatevariabledelete',
      },
    },
    RestApi: {
      list: 'modelrestapilist',
      read: 'modelrestapiread',
      dataRead: 'modelrestapidataread',
      update: 'modelrestapiupdate',
      dataUpdate: 'modelrestapidataupdate',
      updateBulk: 'modelrestapiupdatebulk',
      delete: 'modelrestapidelete',
      versionDelete: 'modelrestapiversiondelete',
      State: {
        update: 'modelstaterestapiupdate',
        dataUpdate: 'modelstaterestapidataupdate',
        delete: 'modelstaterestapidelete',
        versionDelete: 'modelstaterestapiversiondelete',
      },
    },
  }),
  Navigation: Object.freeze({
    navigate: 'arcnavigate',
    navigateExternal: 'arcnavigateexternal',
    navigateRequest: 'arcnavigaterequest',
    navigateRestApi: 'arcnavigaterestapi',
    navigateProject: 'arcnavigateproject',
    helpTopic: 'arcnavigatehelptopic',
    openWebUrl: 'arcnavigateopenweburl',
  }),
  RestApiLegacy: Object.freeze({
    processFile: 'restapiprocessfile',
    dataReady: 'restapidataready',
  }),
  /**
   * Event types for ARC request object.
   * These only represent the events dispatched globally (events that bubble).
   * They do not have events that are specific to any part of the request editor.
   */
  Request: Object.freeze({
    send: 'arcrequestsend',
    State: Object.freeze({
      urlChange: 'arcrequeststateurlchange',
      contentTypeChange: 'arcrequeststatecontenttypechange',
    }),
  }),
  // ARC electron app search events.
  Search: Object.freeze({
    find: 'appsearchfind',
    clear: 'appsearchclear',
    State: Object.freeze({
      foundInPage: 'appsearchfoundinpage',
    }),
  }),
  Theme: Object.freeze({
    loadApplicationTheme: 'themeloadapplication',
    loadTheme: 'themeload',
    readSate: 'themereadsate',
    readActiveThemeInfo: 'themereadactiveinfo',
    activate: 'themeactivate',
    install: 'themeinstall',
    uninstall: 'themeuninstall',
    setSystemPreferred: 'themesetsystempreferred',
    readSystemThemeInfo: 'themereadsystemthemeinfo',
    loadSystemPreferred: 'themeloadsystempreferred',
    loadUserPreferred: 'themeloaduserpreferred',
    State: Object.freeze({
      activated: 'themestateactivated',
    }),
  }),
  /**
   * Event types for ARC transport (usually HTTP)
   */
  Transport: Object.freeze({
    beforeRequest: 'arcbeforerequest',
    beforeRedirect: 'arcbeforeredirect',
    headersReceived: 'archeadersreceived',
    firstByte: 'arcfirstbytereceived',
    // used by the UI to initiate the request transport
    request: 'arcrequest',
    // used by the UI to report a response
    response: 'arcresponse',
    // used by the application logic, dispatched when the request has been
    // pre-processed by any listeners (variables, actions) and can be transported.
    // The HTTP transport library is listening to this event
    transport: 'arctransport',
    resendAuth: 'arcresendauth',
    // used by the application logic, dispatched when the HTTP transport library 
    // has finished processing the request. This is handled by the logic that
    // performs operations before the request is reported back to the UI
    // like authorization and actions.
    processResponse: 'arcprocessresponse',
    abort: 'arcabort',

    /** 
     * Informs to make a connection. Used by web sockets.
     */
    connect: 'transportconnect',
    /** 
     * Informs to close the current connection. Used by web sockets.
     */
    disconnect: 'transportdisconnect',
    /** 
     * Informs to send a data on the current connection. Used by web sockets.
     */
    connectionSend: 'transportconnectionsend',
    /** 
     * When a component / module requests a CORS free HTTP request
     * outside the ARC's HTTP engine.
     */
    httpTransport: 'httptransport',
  }),
  Ui: Object.freeze({
    /** 
     * Tells the application to trigger a context menu with the passed arguments.
     */
    contextMenu: 'arccontextmenu',
  }),
  Updater: Object.freeze({
    checkForUpdate: 'appupdatercheckforupdate',
    installUpdate: 'appupdaterinstallupdate',
    State: {
      checkingForUpdate: 'updaterstatecheckingforupdate',
      updateAvailable: 'updaterstateupdateavailable',
      updateNotAvailable: 'updaterstateupdatenotavailable',
      autoUpdateError: 'updaterstateautoupdateerror',
      downloadProgress: 'updaterstatedownloadprogress',
      updateDownloaded: 'updaterstateupdatedownloaded',
    },
  }),
  Workspace: Object.freeze({
    appendExport: 'domainworkspaceappendexport',
    appendRequest: 'domainworkspaceappendrequest',
    read: 'domainworkspaceread',
    write: 'domainworkspacewrite',
    setId: 'domainworkspacesetid',
    triggerWrite: 'domainworkspacetriggerwrite',
    State: Object.freeze({
      idChange: 'domainworkspacestateidchange',
      write: 'domainworkspacestatewrite'
    }),
  }),
});
