import { InfoPage } from "@/components/info-page"

export const metadata = {
  title: "Accessibility - Tanit Cuisine",
  description: "Accessibility commitment for the Tanit Cuisine website.",
}

export default function AccessibilityPage() {
  return (
    <InfoPage
      eyebrow="Accessibility"
      title="A site every guest can use."
      description="Tanit Cuisine aims to make its website clear, readable, keyboard-friendly, and useful across devices."
      sections={[
        {
          title: "Our approach",
          body: "We use semantic structure, readable contrast, responsive layouts, alt text for important images, and accessible labels for key controls.",
        },
        {
          title: "Ongoing work",
          body: "We review navigation, forms, and checkout flows as the site changes so the experience remains usable for more guests.",
        },
        {
          title: "Feedback",
          body: "If you find an accessibility issue, email hello@tanitcuisine.com with the page, device, and assistive technology details if available.",
        },
      ]}
      action={{ href: "/contact", label: "Send feedback" }}
    />
  )
}
