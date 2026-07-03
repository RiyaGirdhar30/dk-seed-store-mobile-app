import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useBag } from "../contexts/bagContext";
import { useUser } from "../contexts/userContext";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useUser();
  const { clearBag } = useBag();

  const total = Number(params.total);
  const items = params.items ? JSON.parse(params.items) : [];
  const address = params.address ? JSON.parse(params.address) : null;

  const [checkoutHtml, setCheckoutHtml] = useState(null);

  //STEP 1: Create Razorpay Order
  useEffect(() => {
    const createOrder = async () => {
      try {
        const res = await fetch(
          "https://dk-seed-store-backend-1.onrender.com/api/payments/razorpay-order",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount: total }),
          },
        );

        const data = await res.json();

        if (!res.ok) {
          Alert.alert("Payment Error", "Unable to create order");
          return;
        }

        const html = `
<html>
  <body>
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    <script>
      var options = {
        key: "rzp_test_Rv98LzkuJEIGdD",
        amount: ${data.amount},
        currency: "INR",
        name: "DK Seed Store",
        description: "Seed Purchase",
        order_id: "${data.id}",

        handler: function (response) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "success", response })
          );
        },

        modal: {
          ondismiss: function () {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ type: "cancel" })
            );
          }
        },

        theme: { color: "#1b4332" }
      };

      var rzp = new Razorpay(options);
      rzp.open();
    </script>
  </body>
</html>
`;
        setCheckoutHtml(html);
      } catch (err) {
        Alert.alert("Payment Error", "Something went wrong");
      }
    };

    createOrder();
  }, [token, total]);

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      // USER CANCELLED PAYMENT
      if (data.type === "cancel") {
        Alert.alert(
          "Payment Cancelled",
          "You can continue payment anytime from checkout.",
        );

        router.replace("/checkout");
        return;
      }

      // PAYMENT SUCCESS
      if (data.type === "success") {
        const response = data.response;

        //VERIFY PAYMENT
        const verifyRes = await fetch(
          "https://dk-seed-store-backend-1.onrender.com/api/payments/verify",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          },
        );

        if (!verifyRes.ok) {
          Alert.alert("Payment Failed", "Verification failed");
          router.replace("/checkout");
          return;
        }

        // CREATE ORDER
        const orderRes = await fetch("https://dk-seed-store-backend-1.onrender.com/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            products: items.map((item) => ({
              product: item.id,
              quantity: item.qty,
              size: item.size,
            })),
            totalAmount: Number(total),
            address,
            paymentMethod: "RAZORPAY",
            isPaid: true,
            paymentInfo: response,
          }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok) {
          Alert.alert("Order Error", "Payment done but order failed");
          router.replace("/checkout");
          return;
        }

        clearBag();

        router.replace({
          pathname: "/success",
          params: { orderId: orderData._id },
        });
      }
    } catch (err) {
      Alert.alert("Payment Error", "Something went wrong");
      router.replace("/checkout");
    }
  };

  if (!checkoutHtml) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#1b4332" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: checkoutHtml }}
        onMessage={handleMessage}
      />
    </SafeAreaView>
  );
}
