import CityPage from '@/components/CityPage';
import { kolnData } from '@/data/europa/koln';

export default function KolnPage() {
  return <CityPage data={kolnData} backLink="/europa" backLabel="Europa" />;
}
