import { Symbol } from "@/types";
import { Button, InputNumber } from "antd";
import React, { useEffect, useState } from "react";

interface IProps {
  item: Symbol;
  portfolio: Symbol[];
  setPortfolio: (value: any) => void;
}

const CoinListItemCard: React.FC<IProps> = ({ item, portfolio, setPortfolio }) => {
  const [unit, setUnit] = useState(1);

  useEffect(() => {
    setUnit(portfolio?.find((p: Symbol) => p.symbol === item.symbol)?.unit || 1);
  }, [portfolio, item.symbol]);

  const handleRemoveCoin = () => {
    setPortfolio(portfolio.filter((p: Symbol) => p.symbol !== item.symbol));
    setUnit(1);
  };

  const handleAddCoin = () => {
    setPortfolio([...portfolio, { ...item, unit }]);
  };

  const handleUpdateCoin = () => {
    const updatedPortfolio = portfolio.map((p: Symbol) => {
      if (p.symbol === item.symbol) {
        return { ...p, unit };
      }
      return p;
    });

    setPortfolio(updatedPortfolio);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 pl-1 pr-4 border-b">
      <p>
        {item?.symbol} - {item?.lastPrice} <br />
        <span className="text-xs text-gray-400">
          Weighted Average Price {item?.weightedAvgPrice}
        </span>
      </p>
      <div className="flex gap-2">
        <div>
          <InputNumber
            min={1}
            max={100000}
            value={unit}
            onChange={(value) => setUnit(value as number)}
            onBlur={(e) => {
              if (e.target.value === "") {
                setUnit(1);
              }
            }}
          />
        </div>

        {portfolio?.find((p: Symbol) => p.symbol === item.symbol) ? (
          <>
            <Button
              className="!bg-lime-500 hover:!bg-lime-600 !text-white hover:!text-white border-0"
              size="middle"
              onClick={handleUpdateCoin}>
              Update
            </Button>
            <Button size="middle" danger onClick={handleRemoveCoin}>
              Remove
            </Button>
          </>
        ) : (
          <Button
            className="min-w-[168px] !bg-blue-500 hover:!bg-blue-600 !text-white hover:!text-white border-0"
            size="middle"
            onClick={handleAddCoin}>
            Add
          </Button>
        )}
      </div>
    </div>
  );
};

export default CoinListItemCard;
