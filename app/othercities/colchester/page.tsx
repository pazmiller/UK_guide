import CityPage from '@/components/CityPage';
import { colchesterData } from '@/data/colchester';

export default function ColchesterPage() {
  return <CityPage data={colchesterData} backLink="/othercities" backLabel="Other Cities" />;
}
