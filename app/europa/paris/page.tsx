import CityPage from '@/components/CityPage';
import { parisData } from '@/data/europa/paris';

export default function ParisPage()
{
  return <CityPage data={parisData} backLink="/europa" backLabel="Europa" />;
}
