import Route from '@ember/routing/route';

export default class ColorsRoute extends Route {
  model() {
    return [
      {
        category: 'Grays',
        items: [
          {
            name: '$au-gray-100 ', hex: '#F4F5F6',
          },
          {
            name: '$au-gray-200 ', hex: '#E6E8EB',
          },
          {
            name: '$au-gray-300 ', hex: '#CCD1D9',
          },
          {
            name: '$au-gray-400 ', hex: '#A1ABBA',
          },
          {
            name: '$au-gray-500 ', hex: '#8E98A6',
          },
          {
            name: '$au-gray-600 ', hex: '#69717C',
          },
          {
            name: '$au-gray-700 ', hex: '#545961',
          },
          {
            name: '$au-gray-800 ', hex: '#2A2D31',
          },
          {
            name: '$au-gray-900 ', hex: '#212326',
          },
          {
            name: '$au-gray-1000 ', hex: '#000000',
          }
        ],
      },
      {
        category: 'Blues',
        items: [
          {
            name: '$au-blue-100 ', hex: '#EDF6FF',
          },
          {
            name: '$au-blue-200 ', hex: '#DCECFD',
          },
          {
            name: '$au-blue-300 ', hex: '#C1DDFB',
          },
          {
            name: '$au-blue-600 ', hex: '#0F6FD7',
          },
          {
            name: '$au-blue-700 ', hex: '#0E5EB8',
          },
          {
            name: '$au-blue-900 ', hex: '#073261',
          }
        ],
      },
      {
        category: 'Yellows',
        items: [
          {
            name: '$au-yellow-100 ', hex: '#FFF9D5',
          },
          {
            name: '$au-yellow-200 ', hex: '#FFF29B',
          },
          {
            name: '$au-yellow-300 ', hex: '#FEE539',
          },
          {
            name: '$au-yellow-500 ', hex: '#FFC515',
          },
          {
            name: '$au-yellow-700 ', hex: '#997300',
          },
          {
            name: '$au-yellow-900 ', hex: '#473D21',
          }
        ],
      },
      {
        category: 'Greens',
        items: [
          {
            name: '$au-green-100 ',  hex: '#F7FAE5',
          },
          {
            name: '$au-green-200 ',  hex: '#ECF2CD',
          },
          {
            name: '$au-green-400 ',  hex: '#B3E000',
          },
          {
            name: '$au-green-500 ',  hex: '#8BAE00',
          },
          {
            name: '$au-green-700 ',  hex: '#238000',
          },
          {
            name: '$au-green-900 ',  hex: '#030303',
          }
        ],
      },
      {
        category: 'Reds',
        items: [
          {
            name: '$au-red-100 ', hex: '#FCF3F3',
          },
          {
            name: '$au-red-200 ', hex: '#F7E3E3',
          },
          {
            name: '$au-red-500 ', hex: '#DB3434',
          },
          {
            name: '$au-red-600 ', hex: '#D92626',
          },
          {
            name: '$au-red-700 ', hex: '#AB1F1F',
          },
          {
            name: '$au-red-900 ', hex: '#470000',
          }
        ],
      }
    ];
  }
}
