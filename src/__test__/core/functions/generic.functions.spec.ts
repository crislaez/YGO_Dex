import { filterItem, getObjectKeys, isNotEmptyObject, orderItemByDateAsc, orderItemByDateDesc, sliceText } from "@ygodex/app/core/functions/generic.functions";

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

  it('', () => {
    expect(true).toEqual(true)
  })

});

// it('', () => {
//   expect(true).toEqual(true)
// })
