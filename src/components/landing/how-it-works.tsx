"use client"

import { Search, Filter, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

const steps = [
  {
    icon: Search,
    title: "Search",
    description: "Enter your search query like 'pet grooming amsterdam' or use advanced filters for precise results.",
  },
  {
    icon: Filter,
    title: "Filter",
    description: "Filter businesses by website status, ratings, reviews, and more. Find exactly what you need.",
  },
  {
    icon: Download,
    title: "Export",
    description: "Download your results as CSV, Excel, or JSON. Ready to import into your CRM or spreadsheet.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Extract business data in three simple steps
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="border-2 hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
