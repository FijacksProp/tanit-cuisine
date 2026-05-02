import { InfoPage } from "@/components/info-page"

export const metadata = {
  title: "Privacy Policy - Tanit Cuisine",
  description: "Privacy information for Tanit Cuisine guests.",
}

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy"
      title="Your information stays cared for."
      description="This page explains how Tanit Cuisine handles guest information for orders, enquiries, and reservations."
      sections={[
        {
          title: "Information we collect",
          body: "We collect details you provide when ordering or contacting us, such as your name, phone number, email address, delivery address, order notes, and message content.",
        },
        {
          title: "How we use it",
          body: "We use your information to prepare orders, coordinate delivery, respond to enquiries, improve service quality, and send updates you request.",
        },
        {
          title: "Sharing",
          body: "We only share information with team members and service providers who need it to complete your order or support your request.",
        },
        {
          title: "Contact",
          body: "For privacy questions, email hello@tanitcuisine.com and we will respond as quickly as possible.",
        },
      ]}
      action={{ href: "/contact", label: "Contact us" }}
    />
  )
}
