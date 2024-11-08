const selectors = {
  // all current mandatee name for specs who create new data with future dates so names have to be dynamic
  // titles are case sensitive in some views, can be circumvented by using {matchCase: false}.
  current: {
    first: {
      firstName: 'Matthias',
      lastName: 'Diependaele',
      fullName: 'Matthias Diependaele',
      title: 'minister-president',
      searchTitle: 'Minister-president',
    },
    second: {
      firstName: 'Melissa',
      lastName: 'Depraetere',
      fullName: 'Melissa Depraetere',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister',
    },
    third: {
      firstName: 'Hilde',
      lastName: 'Crevits',
      fullName: 'Hilde Crevits',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister',
    },
    fourth: {
      firstName: 'Ben',
      lastName: 'Weyts',
      fullName: 'Ben Weyts',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister van Begroting en Financiën, Vlaamse Rand, Onroerend Erfgoed en Dierenwelzijn',
    },
    fifth: {
      firstName: 'Zuhal',
      lastName: 'Demir',
      fullName: 'Zuhal Demir',
      title: 'Vlaams minister',
    },
    sixth: {
      firstName: 'Caroline',
      lastName: 'Gennez',
      fullName: 'Caroline Gennez',
      title: 'Vlaams minister',
    },
    seventh: {
      firstName: 'Jo',
      lastName: 'Brouns',
      fullName: 'Jo Brouns',
      title: 'Vlaams minister',
    },
    eighth: {
      firstName: 'Annick',
      lastName: 'De Ridder',
      fullName: 'Annick De Ridder',
      title: 'Vlaams minister',
    },
    ninth: {
      firstName: 'Cieltje',
      lastName: 'Van Achter',
      fullName: 'Cieltje Van Achter',
      title: 'Vlaams minister',
    },
    // up to eleventh is possible, but is the minimum ninth? update: Eight is possible, don't use ninth in tests
    // list of titles as shown when adding mandatees to signatures, only needed for current
    // if you update the length also update `have.length` where this list is checked
    signatureTitles: [
      'Matthias Diependaele, Vlaams minister van Economie, Innovatie en Industrie, Buitenlandse Zaken, Digitalisering en Facilitair Management',
      'Melissa Depraetere, Vlaams minister van Wonen, Energie en Klimaat, Toerisme en Jeugd',
      'Hilde Crevits, Vlaams minister van Binnenland, Steden- en Plattelandsbeleid, Samenleven, Integratie en Inburgering, Bestuurszaken, Sociale Economie en Zeevisserij',
      'Ben Weyts, Vlaams minister van Begroting en Financiën, Vlaamse Rand, Onroerend Erfgoed en Dierenwelzijn',
      'Zuhal Demir, Vlaams minister van Onderwijs, Justitie en Werk',
      'Caroline Gennez, Vlaams minister van Welzijn en Armoedebestrijding, Cultuur en Gelijke Kansen',
      'Jo Brouns, Vlaams minister van Omgeving en Landbouw',
      'Annick De Ridder, Vlaams minister van Mobiliteit, Openbare Werken, Havens en Sport',
      'Cieltje Van Achter, Vlaams minister van Brussel en Media'
    ],
    firstSecretary: {
      fullName: 'Maarten Vanholle',
      title: 'Secretaris',
    },
    secondSecretary: {
      fullName: 'Simon Gheysen',
      title: 'Waarnemend secretaris',
    },
    thirdSecretary: {
      fullName: 'Helmer Rooze',
      title: 'Waarnemend secretaris',
    },
    fourthSecretary: {
      fullName: 'Raf Suys',
      title: 'Waarnemend secretaris',
    },
    // what is the min max amount of secretaries possible? don't rely on anything past fourth to exist maybe?
  },

  // older governmentbody data used in tests (will/should not change)
  // currently unused
  '09112023-01082024': {
    first: {
      firstName: 'Jan',
      lastName: 'Jambon',
      fullName: 'Jan Jambon',
      title: 'minister-president',
      searchTitle: 'Minister-president',
    },
    second: {
      firstName: 'Hilde',
      lastName: 'Crevits',
      fullName: 'Hilde Crevits',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister',
    },
    third: {
      firstName: 'Gwendolyn',
      lastName: 'Rutten',
      fullName: 'Gwendolyn Rutten',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister',
    },
    firstSecretary: {
      fullName: 'Jeroen Overmeer',
      title: 'Secretaris',
    },
    // not really second in rank, just another one used in tests
    secondSecretary: {
      fullName: 'Joachim Pohlmann',
      title: 'Waarnemend secretaris',
    },
    // these signatureTitles are not used currently
    signatureTitles: [
      'Jan Jambon, Vlaams minister van Buitenlandse Zaken, Cultuur, Digitalisering en Facilitair Management, Minister-president van de Vlaamse Regering',
      'Hilde Crevits, Vlaams minister van Welzijn, Volksgezondheid en Gezin',
      'Lydia Peeters, Vlaams minister van Mobiliteit, Openbare Werken, Binnenlands Bestuur, Bestuurszaken, Inburgering en Gelijke Kansen',
      'Ben Weyts, Vlaams minister van Onderwijs, Sport, Dierenwelzijn en Vlaamse Rand',
      'Zuhal Demir, Vlaams minister van Justitie en Handhaving, Omgeving, Energie en Toerisme',
      'Matthias Diependaele, Vlaams minister van Financiën en Begroting, Wonen en Onroerend Erfgoed',
      'Benjamin Dalle, Vlaams minister van Brussel, Jeugd, Media en Armoedebestrijding',
      'Jo Brouns, Vlaams minister van Economie, Innovatie, Werk, Sociale Economie en Landbouw'
    ],
  },

  // older governmentbody data used in tests (will/should not change)
  '16052022-08112023': {
    first: {
      firstName: 'Jan',
      lastName: 'Jambon',
      fullName: 'Jan Jambon',
      title: 'minister-president',
      searchTitle: 'Minister-president',
    },
    second: {
      firstName: 'Hilde',
      lastName: 'Crevits',
      fullName: 'Hilde Crevits',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister',
    },
    third: {
      firstName: 'Bart',
      lastName: 'Somers',
      fullName: 'Bart Somers',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister',
    },
  },

  // no spec uses the governmentbody between 16052022 and 18052022

  '10052021-16052022': {
    first: {
      firstName: 'Jan',
      lastName: 'Jambon',
      fullName: 'Jan Jambon',
      title: 'minister-president',
      searchTitle: 'Minister-president',
    },
    second: {
      firstName: 'Hilde',
      lastName: 'Crevits',
      fullName: 'Hilde Crevits',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister',
    },
    third: {
      firstName: 'Bart',
      lastName: 'Somers',
      fullName: 'Bart Somers',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister',
    },
    signatureTitles: [
      'Jan Jambon, Minister-president van de Vlaamse Regering',
      'Jan Jambon, Vlaams minister van Buitenlandse Zaken, Cultuur, Digitalisering en Facilitair Management',
      'Hilde Crevits, Vlaams minister van Economie, Innovatie, Werk, Sociale economie en Landbouw',
      'Bart Somers, Vlaams minister van Binnenlands Bestuur, Bestuurszaken, Inburgering en Gelijke Kansen',
      'Ben Weyts, Vlaams minister van Onderwijs, Sport, Dierenwelzijn en Vlaamse Rand',
      'Zuhal Demir, Vlaams minister van Justitie en Handhaving, Omgeving, Energie en Toerisme',
      'Wouter Beke, Vlaams minister van Welzijn, Volksgezondheid, Gezin en Armoedebestrijding',
      'Matthias Diependaele, Vlaams minister van Financiën en Begroting, Wonen en Onroerend Erfgoed',
      'Lydia Peeters, Vlaams minister van Mobiliteit en Openbare Werken',
      'Benjamin Dalle, Vlaams minister van Brussel, Jeugd en Media'
    ],
  },

  '02102019-10052021': {
    first: {
      firstName: 'Jan',
      lastName: 'Jambon',
      fullName: 'Jan Jambon',
      title: 'minister-president',
      searchTitle: 'Minister-president',
    },
    second: {
      firstName: 'Hilde',
      lastName: 'Crevits',
      fullName: 'Hilde Crevits',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister',
    },
    signatureTitles: [
      'Jan Jambon, Minister-president van de Vlaamse Regering',
      'Jan Jambon, Vlaams minister van Buitenlandse Zaken, Cultuur, ICT en Facilitair Management',
      'Hilde Crevits, Vlaams minister van Economie, Innovatie, Werk, Sociale economie en Landbouw',
      'Bart Somers, Vlaams minister van Binnenlands Bestuur, Bestuurszaken, Inburgering en Gelijke Kansen',
      'Ben Weyts, Vlaams minister van Onderwijs, Sport, Dierenwelzijn en Vlaamse Rand',
      'Zuhal Demir, Vlaams minister van Justitie en Handhaving, Omgeving, Energie en Toerisme',
      'Wouter Beke, Vlaams minister van Welzijn, Volksgezondheid, Gezin en Armoedebestrijding',
      'Matthias Diependaele, Vlaams minister van Financiën en Begroting, Wonen en Onroerend Erfgoed',
      'Lydia Peeters, Vlaams minister van Mobiliteit en Openbare Werken',
      'Benjamin Dalle, Vlaams minister van Brussel, Jeugd en Media'
    ],
  },

  preKaleidos: {
    martens: {
      lastName: 'Martens',
      firstName: 'Luc',
      fullName: 'Luc Martens',
      signatureTitle: 'Luc Martens, Vlaams minister van Cultuur, Gezin en Welzijn',
    },
  },
};
export default selectors;
