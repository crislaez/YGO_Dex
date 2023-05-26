import { filterByItem, filterItem, getCardsBySet, getObjectKeys, isNotEmptyObject, orderItemByDateAsc, orderItemByDateDesc, sliceText } from "@ygodex/app/core/functions/generic.functions";

describe('Generic functions', () => {

  it('isNotEmptyObject: should return true',() => {
    const mock = {name: 'Roberto', lastname: 'Sedinho'};
    const result = isNotEmptyObject(mock);
    expect(result).toEqual(true);
  });

  it('isNotEmptyObject: should return false',() => {
    const mock = {};
    const result = isNotEmptyObject(mock);
    expect(result).toEqual(false);
  });

  it('getObjectKeys: should return an array with the same length and have the same keys (name, lastname)', () => {
    const mock = {name: 'Roberto', lastname: 'Sedinho'};
    const result = getObjectKeys(mock);
    const mockResult = ['name','lastname'];
    const isSameKeys = result?.every((key: string) => mockResult?.includes(key))
    expect(result?.length).toEqual(mockResult?.length);
    expect(isSameKeys).toEqual(true);
  });

  it('sliceText: should return a string with ellipsis (Roberto...)', () => {
    const mock = 'Roberto Sedinho';
    const result = sliceText(mock, 7);
    expect(result).toEqual('Roberto...');
  });

  it("orderItemByDateDesc: should order desc", () => {
    const list = [
        { date: "2022-01-01" },
        { date: "2021-01-01" },
        { date: "2023-01-01" }
    ];
    const orderedList = orderItemByDateDesc(list, "date");
    expect(orderedList).toEqual([
        { date: "2023-01-01" },
        { date: "2022-01-01" },
        { date: "2021-01-01" }
      ]);
  });

  it("orderItemByDateAsc: should order asc", () => {
    const list = [
        { date: "2022-01-01" },
        { date: "2021-01-01" },
        { date: "2023-01-01" }
    ];
    const orderedList = orderItemByDateAsc(list, "date");
    expect(orderedList).toEqual([
          { date: "2021-01-01" },
          { date: "2022-01-01" },
          { date: "2023-01-01" }
      ]);
  });

  it('filterItem: without finder input, it should return the same length',() => {
    const mockData = [
      {name:'Roberto', lastname:'Sedinho'},
      {name:'Steve', lastname:'Strange'},
      {name:'Tony', lastname:'Stark'}
    ];
    const filterResponse = filterItem(null!, 'name', mockData)
    expect(mockData?.length).toEqual(filterResponse?.length)
  });

  it('filterItem: with finder input, it should return length equal to 1',() => {
    const mockData = [
      {name:'Roberto', lastname:'Sedinho'},
      {name:'Steve', lastname:'Strange'},
      {name:'Tony', lastname:'Stark'}
    ];
    const filterResponse = filterItem('Roberto', 'name', mockData)
    expect(filterResponse?.length).toEqual(1)
  });

  it('filterByItem: should have a length of 4 and have all the "id" except the repeating one (id 2)', () => {
    const mockData = [
      {id: 1, name:'Roberto', lastname:'Sedinho'},
      {id: 1, name:'Roberto', lastname:'Castro'},
      {id: 2, name:'Roberto', lastname:'Perez'},
      {id: 3, name:'Steve', lastname:'Strange'},
      {id: 4, name:'Tony', lastname:'Stark'}
    ];

    const mockResponse = [
      {id: 1, name:'Roberto', lastname:'Sedinho'},
      {id: 2, name:'Roberto', lastname:'Perez'},
      {id: 3, name:'Steve', lastname:'Strange'},
      {id: 4, name:'Tony', lastname:'Stark'}
    ];

    const mockResponseIds = mockResponse?.map(({id}) => id);
    const response = filterByItem(mockData, 'id')
    const result = mockResponse?.every(({id}) => mockResponseIds?.includes(id));

    expect(response?.length).toEqual(4);
    expect(result).toEqual(true)
  });

  it('getCardsBySet: ', () => {
    const mock = [
      { card_sets: [{set_name:'cardSet1', set_code: 'AAAA_004'}] },
      { card_sets: [{set_name:'cardSet1', set_code: 'AAAA_002'}] },
      { card_sets: [{set_name:'cardSet1', set_code: 'AAAA_001'}] },
      { card_sets: [{set_name:'cardSet2', set_code: 'AAAA_001'}] },
      { card_sets: [{set_name:'cardSet3', set_code: 'AAAA_003'}]},
      { card_sets: [{set_name:'cardSet1', set_code: 'AAAA_000'}] },
    ];
    const response = getCardsBySet((mock as any), 'cardSet1');
    const mockResponse = ['AAAA_000','AAAA_001','AAAA_002','AAAA_004']
    console.log(response)
    const result = response?.every(({ card_sets }) => mockResponse?.includes(card_sets?.[0]?.set_code!))
    expect(response?.length).toEqual(4);
    expect(result).toEqual(true);
  });

});

// it('', () => {
//   expect(true).toEqual(true)
// });
