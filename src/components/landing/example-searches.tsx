"use client"

import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

const examples = [
  "pet grooming amsterdam",
  "hair salons miami",
  "restaurants paris",
  "yoga studios london",
  "coffee shops berlin",
  "dentists new york",
  "gyms tokyo",
  "bakeries rome",
]

export function ExampleSearches() {
  const router = useRouter()

  const handleExampleClick = (example: string) => {
    router.push(`/search?q=${encodeURIComponent(example)}`)
  }

  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Popular Searches</h2>
          <p className="text-muted-foreground">Click any example to get started</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-3 justify-center max-w-4xl mx-auto"
        >
          {examples.map((example, index) => (
            <motion.div
              key={example}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Badge
                variant="outline"
                className="cursor-pointer px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
