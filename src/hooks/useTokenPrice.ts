import { useEffect, useState } from "react";

const useTokenPrice = (symbol?: string) => {
	// const [price, setPrice] = useState<string | null>(null);

	// useEffect(() => {
	//   getTokenPrice(symbol);
	// }, [symbol]);

	// const getTokenPrice = async (symbol: string) => {
	//   try {
	//     const res = await fetch(
	//       `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`
	//     );
	//     const data = await res.json();
	//     setPrice(data.price);
	//   } catch (error) {
	//     console.log("Error fetching token price", error);
	//   }
	// };
	// return price;
	return symbol ? "" : "";
};

export default useTokenPrice;
