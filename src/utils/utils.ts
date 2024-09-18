import { ethers } from "ethers";

const shortenIfAddress = (
  address?: string | null | false,
  extraShort?: true
): string => {
  if (!address) {
    return "";
  }
  return `${address.substring(0, extraShort ? 4 : 6)}...${address.substring(
    address.length - (extraShort ? 3 : 4)
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
  decimals: number = 4
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

export {
  shortenIfAddress,
  sleep,
  tryPrivateKeyToAddress,
  formatEtherWithDecimals,
  chainNetworkColor,
};
