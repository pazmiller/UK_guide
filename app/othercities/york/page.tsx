import CityPage from '@/components/CityPage';
import { yorkData } from '@/data/york';

export default function YorkPage() {
  return <CityPage data={yorkData} backLink="/othercities" backLabel="Other Cities" />;
}
