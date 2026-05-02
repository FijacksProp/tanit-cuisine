import { InfoPage } from "@/components/info-page"

export const metadata = {
  title: "Terms - Tanit Cuisine",
  description: "Ordering and website terms for Tanit Cuisine.",
}

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="Simple terms for ordering well."
      description="These terms describe the basic expectations for using the Tanit Cuisine website and ordering from our Ilorin kitchen."
      sections={[
        {
          title: "Orders",
          body: "Orders are prepared after confirmation. Availability, prices, preparation times, and delivery windows may change based on kitchen capacity and ingredient supply.",
        },
        {
          title: "Payments",
          body: "The current checkout is a demo flow. When live payments are enabled, payment must be completed through the supported payment method before dispatch unless otherwise agreed.",
        },
        {
          title: "Delivery",
          body: "Delivery estimates are provided in good faith and may be affected by distance, weather, traffic, and rider availability within Ilorin and nearby areas.",
        },
        {
          title: "Support",
          body: "If there is an issue with an order, contact us promptly so our team can review it and help make things right.",
        },
      ]}
      action={{ href: "/menu", label: "Browse menu" }}
    />
  )
}
