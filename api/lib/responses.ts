export const HTTP_SUCCESS = {
  status: 200,
  response: 'OK'
};

export const HTTP_SUCCESS_DATA = (data: any) => {
  data = (Array.isArray(data) ? data : [data]);

  return {
    ...HTTP_SUCCESS,
    length: data.length,
    total:  data.length,
    data
  }
};

export const HTTP_SUCCESS_DATA_PAGINATED = (data: any[]) => {
  return {
    ...HTTP_SUCCESS,
    length: data[0].length,
    total: data[1],
    data: data[0]
  }
}