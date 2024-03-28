const selectors = {
  // all current mandatee name for specs who create new data with future dates so names have to be dynamic
  // titles are case sensitive in some views, can be circumvented by using {matchCase: false}.
  current: {
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
    fourth: {
      firstName: 'Ben',
      lastName: 'Weyts',
      fullName: 'Ben Weyts',
      title: 'viceminister-president',
      searchTitle: 'Vlaams minister van Onderwijs, Sport, Dierenwelzijn en Vlaamse Rand',
    },
    fifth: {
      firstName: 'Zuhal',
      lastName: 'Demir',
      fullName: 'Zuhal Demir',
      title: 'Vlaams minister',
    },
    sixth: {
      firstName: 'Matthias',
      lastName: 'Diependaele',
      fullName: 'Matthias Diependaele',
      title: 'Vlaams minister',
    },
    seventh: {
      firstName: 'Lydia',
      lastName: 'Peeters',
      fullName: 'Lydia Peeters',
      ttitle: 'Vlaams minister',
    },
    eighth: {
      firstName: 'Benjamin',
      lastName: 'Dalle',
      fullName: 'Benjamin Dalle',
      title: 'Vlaams minister',
    },
    ninth: {
      firstName: 'Jo',
      lastName: 'Brouns',
      fullName: 'Jo Brouns',
      title: 'Vlaams minister',
    },
    // up to eleventh is possible, but is the minimum ninth?
    // list of titles as shown when adding mandatees to signatures, only needed for current
    signatureTitles: [
      'Jan Jambon, Vlaams minister van Buitenlandse Zaken, Cultuur, Digitalisering en Facilitair Management, Minister-president van de Vlaamse Regering',
      'Hilde Crevits, Vlaams minister van Welzijn, Volksgezondheid en Gezin',
      'Gwendolyn Rutten, Vlaams minister van Binnenlands Bestuur, Bestuurszaken, Inburgering en Gelijke Kansen',
      'Ben Weyts, Vlaams minister van Onderwijs, Sport, Dierenwelzijn en Vlaamse Rand',
      'Zuhal Demir, Vlaams minister van Justitie en Handhaving, Omgeving, Energie en Toerisme',
      'Matthias Diependaele, Vlaams minister van Financiën en Begroting, Wonen en Onroerend Erfgoed',
      'Lydia Peeters, Vlaams minister van Mobiliteit en Openbare Werken',
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
  },

};
export default selectors;
