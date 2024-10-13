import { ethers } from "ethers";

const shortenHex = (
  hexVal?: string | null | false,
  extraShort?: true
): string => {
  if (!hexVal) {
    return "";
  }
  return `${hexVal.substring(0, extraShort ? 4 : 6)}...${hexVal.substring(
    hexVal.length - (extraShort ? 3 : 4)
  )}`;
};

const tryPrivateKeyToAddress = (privateKey: string) => {
  try {
    return new ethers.Wallet(privateKey).address;
  } catch (error) {
    return "";
  }
};

const formatEtherWithDecimals = (
  value: ethers.BigNumberish,
  decimals: number = 12
) => {
  const valueString = ethers.utils.formatEther(value);

  if (valueString.split(".")[1].length <= decimals) {
    return valueString;
  }

  return valueString.slice(0, valueString.indexOf(".") + decimals + 1);
};

const chainNetworkColor = (name: string) => {
  if (name.includes("BSC")) {
    return {
      bg: "#F0B90B",
      textColor: "#000000",
    };
  }

  if (name.includes("BASE")) {
    return {
      bg: "#1E90FF",
      textColor: "#FFFFFF",
    };
  }

  return {
    bg: "#000000",
    textColor: "#FFFFFF",
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const machineIdToReadable = (machineId: string) => {
  let readable = "";
  const listChar = [
    ...machineId.split("").slice(0, 15),
    ...machineId.split("").slice(30, 45),
  ];
  for (let i = 0; i < listChar.length; i++) {
    if (i % 5 === 0 && i !== 0) {
      readable += "-";
    }
    readable += listChar[i];
  }
  return readable;
};

const verifyLicense = (machineId: string, license: string) => {
  try {
    //0x91b0c0e15935e814aa8f1bff0560b38a92cb36f3694ecb8ab87100c49a22a9661b361a9070357149de4c2f39975558cf2b1059894d175ec58d71b7a1821e47b71b
    const address = ethers.utils.verifyMessage(machineId, license);
    return (
      address.toLowerCase() ==
      "0x62636FFD17bB80B1a7c177e5F45d774A1eE0d228".toLowerCase()
    );
  } catch (error) {
    return false;
  }
};

export {
  shortenHex,
  sleep,
  tryPrivateKeyToAddress,
  formatEtherWithDecimals,
  chainNetworkColor,
  machineIdToReadable,
  verifyLicense,
};
