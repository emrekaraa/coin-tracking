import axios from "axios";
import { Symbol } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Chart } from "react-google-charts";
import VirtualList from "rc-virtual-list";
import CoinListItemCard from "@/components/CoinListItemCard";
import useScreenSize from "@/hooks/useWindowSize";
import { SyncOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Modal, Spin, Input, List } from "antd";
const { Search } = Input;

export default function Home() {
  const [portfolio, setPortfolio] = useState<Symbol[]>([]);
  const [searchKey, setSearchKey] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const screenSize = useScreenSize();

  //! Fetch data from API
  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ["symbols"],
    refetchOnWindowFocus: false,
    refetchInterval: 300000,
    queryFn: async () => {
      return axios.get("https://api2.binance.com/api/v3/ticker/24hr").then((res) => res.data);
    },
  });

  //! Load & Save Portfolio from LocalStorage
  useEffect(() => {
    const savedPortfolio = localStorage.getItem("portfolio");
    if (!savedPortfolio) return;

    if (data?.length > 0) {
      let updatePortfolio: Symbol[] = [];
      let portfolioFromStorage: Symbol[] = JSON.parse(savedPortfolio);

      data?.forEach((item: Symbol) => {
        portfolioFromStorage.forEach((p: Symbol) => {
          if (item.symbol === p.symbol) {
            updatePortfolio.push({
              ...item,
              unit: p.unit,
            });
          }
        });
      });

      setPortfolio(updatePortfolio);
    }
  }, [data]);
  useEffect(() => {
    if (data?.length > 0) {
      localStorage.setItem("portfolio", JSON.stringify(portfolio));
    }
  }, [portfolio, data]);

  //! Filter data by search key
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter((item: Symbol) =>
      item.symbol.toLowerCase().includes(searchKey.toLowerCase()),
    );
  }, [data, searchKey]);

  return (
    <main className="container mx-auto py-10 ">
      <h1 className="text-center text-xl font-semibold">Coin Tracking and Reporting Application</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-7">
        <div>
          <div className="flex flex-wrap gap-[10px]">
            <Button icon={<PlusOutlined />} size="large" onClick={() => setIsModalVisible(true)}>
              Add Stock
            </Button>
            <Button
              icon={<SyncOutlined spin={isRefetching} />}
              size="large"
              onClick={() => refetch()}>
              Refresh
            </Button>
          </div>

          {portfolio?.length > 0 ? (
            <List
              className="mt-6"
              dataSource={portfolio}
              renderItem={(item: Symbol) => (
                <CoinListItemCard item={item} portfolio={portfolio} setPortfolio={setPortfolio} />
              )}
            />
          ) : (
            <p className="text-center mt-10 font-medium">No Coin in the Portfolio!</p>
          )}
        </div>

        <Chart
          chartType="PieChart"
          data={
            portfolio?.length > 0
              ? [["Coin", "Price"], ...portfolio.map((item: Symbol) => [item.symbol, item.unit])]
              : [
                  ["Coin", "Price"],
                  ["No Coin", 1],
                ]
          }
          options={{ is3D: true }}
          width={"100%"}
          height={"400px"}
        />
      </div>

      <Modal
        width={600}
        title="Add & Update Coin"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSearchKey("");
        }}
        cancelText="Close"
        okButtonProps={{
          style: { display: "none" },
        }}>
        <div>
          <Search
            value={searchKey}
            size="large"
            onChange={(e) => setSearchKey(e.target.value)}
            className="my-2"
            placeholder="Search Coin..."
            loading={false}
          />

          <VirtualList
            data={filteredData || []}
            height={350}
            itemHeight={screenSize?.width ? (screenSize?.width > 640 ? 69 : 101) : 69}
            itemKey="symbol">
            {(item) => (
              <CoinListItemCard item={item} portfolio={portfolio} setPortfolio={setPortfolio} />
            )}
          </VirtualList>
        </div>
      </Modal>

      <Spin spinning={isPending || isRefetching} fullscreen tip="Loading..."></Spin>
    </main>
  );
}
