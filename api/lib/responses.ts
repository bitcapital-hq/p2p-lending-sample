export const HTTP_SUCCESS = {
  status: 200,
  response: 'OK'
};

export const HTTP_SUCCESS_DATA = data => {
  data = (Array.isArray(data) ? data : [data]);

  return {
    ...HTTP_SUCCESS,
    length: data.length,
    data
  }
};