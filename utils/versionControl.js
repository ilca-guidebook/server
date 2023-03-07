// TODO: Write tests
const PROD_VERSION = [2, 0, 0];

const splitCurrentVersion = (version = '0.0.0') => {
  return version.split('.').map((item) => parseInt(item, 10));
};

export const doesSupportBase64 = (version) => {
  return parseInt(splitCurrentVersion(version)[0], 10) >= 2;
};

export const hasNewerVersion = (version) => {
  for (let i = 0; i < 3; i++) {
    const currentNumber = parseInt(splitCurrentVersion(version)[i], 10);

    if (currentNumber > PROD_VERSION[i]) {
      return false;
    } else if (currentNumber < PROD_VERSION[i]) {
      return true;
    }
  }

  return false;
};
