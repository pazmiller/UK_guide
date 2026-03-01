import CityPage from '@/components/CityPage';
import { polandData } from '@/data/europa/poland';

export default function PolandPage() {
  return <CityPage data={polandData} backLink="/europa" backLabel="Europa" />;
}
