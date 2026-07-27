import CityPage from '@/components/CityPage';
import { nottinghamData } from '@/data/nottingham';

export default function NottinghamPage() {
  return <CityPage data={nottinghamData} backLink="/othercities" backLabel="Other Cities" />;
}
