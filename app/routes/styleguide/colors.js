import Route from '@ember/routing/route';

export default class ColorsRoute extends Route {
  model() {
    return [
      {
        category: 'Grays',
        items: [
          {
            name: '$auk-gray-100 ', hex: '#F4F5F6',
          },
          {
            name: '$auk-gray-200 ', hex: '#E6E8EB',
          },
          {
            name: '$auk-gray-300 ', hex: '#CCD1D9',
          },
          {
            name: '$auk-gray-400 ', hex: '#A1ABBA',
          },
          {
            name: '$auk-gray-500 ', hex: '#8E98A6',
          },
          {
            name: '$auk-gray-600 ', hex: '#69717C',
          },
          {
            name: '$auk-gray-700 ', hex: '#545961',
          },
          {
            name: '$auk-gray-800 ', hex: '#2A2D31',
          },
          {
            name: '$auk-gray-900 ', hex: '#212326',
          },
          {
            name: '$auk-gray-1000 ', hex: '#000000',
          }
        ],
      },
      {
        category: 'Blues',
        items: [
          {
            name: '$auk-blue-100 ', hex: '#EDF6FF',
          },
          {
            name: '$auk-blue-200 ', hex: '#DCECFD',
          },
          {
            name: '$auk-blue-300 ', hex: '#C1DDFB',
          },
          {
            name: '$auk-blue-500 ', hex: '#0F6FD7',
          },
          {
            name: '$auk-blue-700 ', hex: '#0E5EB8',
          },
          {
            name: '$auk-blue-900 ', hex: '#073261',
          }
        ],
      },
      {
        category: 'Yellows',
        items: [
          {
            name: '$auk-yellow-100 ', hex: '#FFF9D5',
          },
          {
            name: '$auk-yellow-200 ', hex: '#FFF29B',
          },
          {
            name: '$auk-yellow-300 ', hex: '#FEE539',
          },
          {
            name: '$auk-yellow-500 ', hex: '#FFC515',
          },
          {
            name: '$auk-yellow-700 ', hex: '#997300',
          },
          {
            name: '$auk-yellow-900 ', hex: '#473D21',
          }
        ],
      },
      {
        category: 'Greens',
        items: [
          {
            name: '$auk-green-100 ',  hex: '#F7FAE5',
          },
          {
            name: '$auk-green-200 ',  hex: '#ECF2CD',
          },
          {
            name: '$auk-green-400 ',  hex: '#B3E000',
          },
          {
            name: '$auk-green-500 ',  hex: '#8BAE00',
          },
          {
            name: '$auk-green-700 ',  hex: '#238000',
          },
          {
            name: '$auk-green-900 ',  hex: '#030303',
          }
        ],
      },
      {
        category: 'Reds',
        items: [
          {
            name: '$auk-red-100 ', hex: '#FCF3F3',
          },
          {
            name: '$auk-red-200 ', hex: '#F7E3E3',
          },
          {
            name: '$auk-red-500 ', hex: '#DB3434',
          },
          {
            name: '$auk-red-600 ', hex: '#D92626',
          },
          {
            name: '$auk-red-700 ', hex: '#AB1F1F',
          },
          {
            name: '$auk-red-900 ', hex: '#470000',
          }
        ],
      }
    ];
  }
}
