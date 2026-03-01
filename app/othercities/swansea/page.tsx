import CityPage from '@/components/CityPage';
import { swanseaData } from '@/data/swansea';

export default function SwanseaPage() {
  return <CityPage data={swanseaData} backLink="/othercities" backLabel="Other Cities" />;
}
