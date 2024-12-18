import Route from '@ember/routing/route';

export default class ColorsRoute extends Route {
  model() {
    return [
      {
        category: 'Grays',
        items: [
          {
            name: 'auk.$color-gray-100 ', hex: '#F4F5F6',
          },
          {
            name: 'auk.$color-gray-200 ', hex: '#E6E8EB',
          },
          {
            name: 'auk.$color-gray-300 ', hex: '#CCD1D9',
          },
          {
            name: 'auk.$color-gray-400 ', hex: '#A1ABBA',
          },
          {
            name: 'auk.$color-gray-500 ', hex: '#8E98A6',
          },
          {
            name: 'auk.$color-gray-600 ', hex: '#69717C',
          },
          {
            name: 'auk.$color-gray-700 ', hex: '#545961',
          },
          {
            name: 'auk.$color-gray-800 ', hex: '#2A2D31',
          },
          {
            name: 'auk.$color-gray-900 ', hex: '#212326',
          },
          {
            name: 'auk.$color-gray-1000 ', hex: '#000000',
          }
        ],
      },
      {
        category: 'Blues',
        items: [
          {
            name: 'auk.$color-blue-100 ', hex: '#EDF6FF',
          },
          {
            name: 'auk.$color-blue-200 ', hex: '#DCECFD',
          },
          {
            name: 'auk.$color-blue-300 ', hex: '#C1DDFB',
          },
          {
            name: 'auk.$color-blue-500 ', hex: '#0F6FD7',
          },
          {
            name: 'auk.$color-blue-700 ', hex: '#0E5EB8',
          },
          {
            name: 'auk.$color-blue-900 ', hex: '#073261',
          }
        ],
      },
      {
        category: 'Yellows',
        items: [
          {
            name: 'auk.$color-yellow-100 ', hex: '#FFF9D5',
          },
          {
            name: 'auk.$color-yellow-200 ', hex: '#FFF29B',
          },
          {
            name: 'auk.$color-yellow-300 ', hex: '#FEE539',
          },
          {
            name: 'auk.$color-yellow-500 ', hex: '#FFC515',
          },
          {
            name: 'auk.$color-yellow-700 ', hex: '#997300',
          },
          {
            name: 'auk.$color-yellow-900 ', hex: '#473D21',
          }
        ],
      },
      {
        category: 'Greens',
        items: [
          {
            name: 'auk.$color-green-100 ',  hex: '#F7FAE5',
          },
          {
            name: 'auk.$color-green-200 ',  hex: '#ECF2CD',
          },
          {
            name: 'auk.$color-green-400 ',  hex: '#B3E000',
          },
          {
            name: 'auk.$color-green-500 ',  hex: '#8BAE00',
          },
          {
            name: 'auk.$color-green-700 ',  hex: '#238000',
          },
          {
            name: 'auk.$color-green-900 ',  hex: '#030303',
          }
        ],
      },
      {
        category: 'Reds',
        items: [
          {
            name: 'auk.$color-red-100 ', hex: '#FCF3F3',
          },
          {
            name: 'auk.$color-red-200 ', hex: '#F7E3E3',
          },
          {
            name: 'auk.$color-red-500 ', hex: '#DB3434',
          },
          {
            name: 'auk.$color-red-600 ', hex: '#D92626',
          },
          {
            name: 'auk.$color-red-700 ', hex: '#AB1F1F',
          },
          {
            name: 'auk.$color-red-900 ', hex: '#470000',
          }
        ],
      }
    ];
  }
}
