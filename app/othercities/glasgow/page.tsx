import CityPage from '@/components/CityPage';
import { glasgowData } from '@/data/glasgow';

export default function GlasgowPage() {
  return <CityPage data={glasgowData} backLink="/othercities" backLabel="Other Cities" />;
}
