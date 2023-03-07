import axios from 'axios';

export const isUserPartOfILCA = async (id, dateOfBirth) => {
  const { data } = await axios.get(
    `http://loglig.com:8080/api/Player/IsUnionMember?IdentNum=${id}&Birthdate=${dateOfBirth}&UnionId=59`
  );

  return data.Result;
};
