import { InfoPage } from "@/components/info-page"

export const metadata = {
  title: "Careers - Tanit Cuisine",
  description: "Join the Tanit Cuisine team in Ilorin, Kwara State.",
}

export default function CareersPage() {
  return (
    <InfoPage
      eyebrow="Careers"
      title="Build the table with us."
      description="Tanit Cuisine is growing in Ilorin, Kwara State. We are interested in thoughtful people who care about hospitality, precision, and Nigerian food."
      sections={[
        {
          title: "Kitchen",
          body: "We welcome chefs, prep cooks, pastry hands, and stewards who respect ingredients and work cleanly under pressure.",
        },
        {
          title: "Service",
          body: "Our front-of-house team handles guest care, delivery coordination, reservations, and private dining support.",
        },
        {
          title: "How to apply",
          body: "Send your CV, portfolio, or a short note about your experience to careers@tanitcuisine.com. We review applications weekly.",
        },
      ]}
      action={{ href: "mailto:careers@tanitcuisine.com", label: "Email careers" }}
    />
  )
}
