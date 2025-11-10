import { Redirect } from "expo-router";
import { useLocalSearchParams } from "expo-router";

export default function TrackOrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Redirect to order detail page
  return <Redirect href={`/(app)/order/${id}`} />;
}




