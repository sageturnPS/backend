export const nodes = [
  {
    id: "1", // Ad ID
    name: "[State #1 -- ex. Alabama]", // Store name
    startDate: new Date(2020, 1, 10), // Example start date
    endDate: new Date(2020, 1, 15), // Example end date
    adName: "Ad Name 1", // Ad Name
    nodes: [], // Nested nodes
  },
  {
    id: "2", // Ad ID
    name: "[State #2]", // Store name
    startDate: new Date(2020, 1, 12), // Example start date
    endDate: new Date(2020, 1, 17), // Example end date
    adName: "Ad Name 2", // Ad Name
    nodes: [], // Nested nodes
  },
  {
    id: "3", // Ad ID
    name: "[State #3]", // Store name
    startDate: new Date(2020, 2, 1), // Example start date
    endDate: new Date(2020, 2, 28), // Example end date
    adName: "Ad Name 3", // Ad Name
    nodes: [
      {
        id: "3.1", // Ad ID
        name: "[Banner -- ex. Jewel-Osco]", // Store name
        startDate: new Date(2020, 2, 5), // Example start date
        endDate: new Date(2020, 2, 20), // Example end date
        adName: "Ad Name 3.1", // Ad Name
        nodes: [
          { id: "3.1.1", name: "[Store #1 -- ex. Store #123]", startDate: new Date(2020, 2, 1), endDate: new Date(2020, 2, 18), adName: "Ad Name 3.1.1", nodes: [] },
          { id: "3.1.2", name: "[Store #2]", startDate: new Date(2020, 2, 2), endDate: new Date(2020, 2, 19), adName: "Ad Name 3.1.2", nodes: [] },
        ],
      },
      {
        id: "3.2", // Ad ID
        name: "Objects", // Store name
        startDate: new Date(2020, 2, 10), // Example start date
        endDate: new Date(2020, 2, 22), // Example end date
        adName: "Ad Name 3.2", // Ad Name
        nodes: [
          { id: "3.2.1", name: "Object Methods", startDate: new Date(2020, 2, 5), endDate: new Date(2020, 2, 20), adName: "Ad Name 3.2.1", nodes: [] },
          { id: "3.2.2", name: "Garbage Collection", startDate: new Date(2020, 2, 6), endDate: new Date(2020, 2, 21), adName: "Ad Name 3.2.2", nodes: [] },
        ],
      },
      {
        id: "3.3", // Ad ID
        name: "Code Style", // Store name
        startDate: new Date(2020, 2, 7), // Example start date
        endDate: new Date(2020, 2, 23), // Example end date
        adName: "Ad Name 3.3", // Ad Name
        nodes: [], // Nested nodes
      },
    ],
  },
  {
    id: "4", // Ad ID
    name: "[State #4]", // Store name
    startDate: new Date(2020, 3, 1), // Example start date
    endDate: new Date(2020, 3, 8), // Example end date
    adName: "Ad Name 4", // Ad Name
    nodes: [
      { id: "4.1", name: "Create React App", startDate: new Date(2020, 2, 25), endDate: new Date(2020, 3, 1), adName: "Ad Name 4.1", nodes: [] },
      { id: "4.2", name: "JSX", startDate: new Date(2020, 2, 26), endDate: new Date(2020, 3, 1), adName: "Ad Name 4.2", nodes: [] },
      {
        id: "4.3", // Ad ID
        name: "Components", // Store name
        startDate: new Date(2020, 3, 15), // Example start date
        endDate: new Date(2020, 4, 1), // Example end date
        adName: "Ad Name 4.3", // Ad Name
        nodes: [], // Nested nodes
      },
      { id: "4.4", name: "Props", startDate: new Date(2020, 4, 1), endDate: new Date(2020, 5, 1), adName: "Ad Name 4.4", nodes: [] },
      {
        id: "4.5", // Ad ID
        name: "State", // Store name
        startDate: new Date(2020, 5, 1), // Example start date
        endDate: new Date(2020, 6, 1), // Example end date
        adName: "Ad Name 4.5", // Ad Name
        nodes: [
          { id: "4.5.1", name: "Remote State", startDate: new Date(2020, 6, 1), endDate: new Date(2020, 7, 1), adName: "Ad Name 4.5.1", nodes: [] },
          { id: "4.5.2", name: "Local State", startDate: new Date(2020, 6, 2), endDate: new Date(2020, 7, 1), adName: "Ad Name 4.5.2", nodes: [] },
        ],
      },
    ],
  },
  {
    id: "5", // Ad ID
    name: "[State #5]", // Store name
    startDate: new Date(2020, 4, 10), // Example start date
    endDate: new Date(2020, 4, 28), // Example end date
    adName: "Ad Name 5", // Ad Name
    nodes: [], // Nested nodes
  },
  {
    id: "6", // Ad ID
    name: "[State #6]", // Store name
    startDate: new Date(2020, 5, 1), // Example start date
    endDate: new Date(2020, 5, 18), // Example end date
    adName: "Ad Name 6", // Ad Name
    nodes: [
      { id: "6.1", name: "Express", startDate: new Date(2020, 5, 5), endDate: new Date(2020, 6, 10), adName: "Ad Name 6.1", nodes: [] },
    ],
  },
  {
    id: "7", // Ad ID
    name: "[State #7]", // Store name
    startDate: new Date(2020, 6, 1), // Example start date
    endDate: new Date(2020, 6, 30), // Example end date
    adName: "Ad Name 7", // Ad Name
    nodes: [
      {
        id: "7.1", // Ad ID
        name: "Queries and Mutations", // Store name
        startDate: new Date(2020, 6, 5), // Example start date
        endDate: new Date(2020, 6, 28), // Example end date
        adName: "Ad Name 7.1", // Ad Name
        nodes: [
          { id: "7.1.1", name: "Fields", startDate: new Date(2020, 6, 10), endDate: new Date(2020, 6, 20), adName: "Ad Name 7.1.1", nodes: [] },
          { id: "7.1.2", name: "Arguments", startDate: new Date(2020, 6, 11), endDate: new Date(2020, 6, 21), adName: "Ad Name 7.1.2", nodes: [] },
          { id: "7.1.3", name: "Aliases", startDate: new Date(2020, 6, 12), endDate: new Date(2020, 6, 22), adName: "Ad Name 7.1.3", nodes: [] },
          { id: "7.1.4", name: "Fragments", startDate: new Date(2020, 6, 13), endDate: new Date(2020, 6, 23), adName: "Ad Name 7.1.4", nodes: [] },
          { id: "7.1.5", name: "Inline Fragments", startDate: new Date(2020, 6, 14), endDate: new Date(2020, 6, 23), adName: "Ad Name 7.1.5", nodes: [] },
          { id: "7.1.6", name: "Variables", startDate: new Date(2020, 6, 15), endDate: new Date(2020, 6, 24), adName: "Ad Name 7.1.6", nodes: [] },
          { id: "7.1.7", name: "Directives", startDate: new Date(2020, 6, 16), endDate: new Date(2020, 6, 25), adName: "Ad Name 7.1.7", nodes: [] },
        ],
      },
    ],
  },
];
