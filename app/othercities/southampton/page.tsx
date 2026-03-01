import CityPage from '@/components/CityPage';
import { southamptonData } from '@/data/southampton';

export default function SouthamptonPage() {
  return <CityPage data={southamptonData} backLink="/othercities" backLabel="Other Cities" />;
}
