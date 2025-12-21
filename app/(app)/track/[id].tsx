import { Redirect } from "expo-router";
import { useLocalSearchParams } from "expo-router";

export default function TrackOrderScreen() {
  const { id, status } = useLocalSearchParams<{ id: string; status?: string }>();
  return (
    <Redirect
      href={{
        pathname: "/(app)/order/[id]",
        params: { id, status },
      }}
    />
  );
}




