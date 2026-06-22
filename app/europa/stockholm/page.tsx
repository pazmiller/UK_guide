import CityPage from '@/components/CityPage';
import { stockholmData } from '@/data/europa/stockholm';

export default function StockholmPage()
{
  return <CityPage data={stockholmData} backLink="/europa" backLabel="Europa" />;
}
