import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { WishlistProvider } from "../contexts/wishlistContext";
import { BagProvider } from "../contexts/bagContext";
import { UserProvider } from "../contexts/userContext";
import { OrderProvider } from "../contexts/orderContext"; 
import {AddressProvider} from "../contexts/addressContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
         <UserProvider>
      <AddressProvider>
        <WishlistProvider>
          <OrderProvider>
            <BagProvider>
              <Stack screenOptions={{ headerShown: false }}
              />
              <Toast />
            </BagProvider>
          </OrderProvider>
        </WishlistProvider>
</AddressProvider>
</UserProvider>
    </SafeAreaProvider>
  );
}
