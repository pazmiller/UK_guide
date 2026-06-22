import CityPage from '@/components/CityPage';
import { copenhagenData } from '@/data/europa/copenhagen';

export default function CopenhagenPage()
{
  return <CityPage data={copenhagenData} backLink="/europa" backLabel="Europa" />;
}
