import CityPage from '@/components/CityPage';
import { edinburghData } from '@/data/edinburgh';

export default function EdinburghPage() {
  return <CityPage data={edinburghData} backLink="/othercities" backLabel="Other Cities" />;
}
