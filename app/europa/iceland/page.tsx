import CityPage from '@/components/CityPage';
import { icelandData } from '@/data/europa/iceland';

export default function IcelandPage() {
  return <CityPage data={icelandData} backLink="/europa" backLabel="Europa" />;
}
