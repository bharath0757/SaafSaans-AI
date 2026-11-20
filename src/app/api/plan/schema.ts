import { z } from "zod";

export const planRequestSchema = z.object({
  aqi: z.number().min(0).max(500),
  cityName: z.string().min(1).default("Your city"),
  ambientPm25: z.number().optional(),
  bestWindow: z
    .object({
      startHour: z.number(),
      endHour: z.number(),
      label: z.string(),
      avgAqi: z.number(),
    })
    .default({
      startHour: 13,
      endHour: 16,
      label: "1:00 PM – 4:00 PM",
      avgAqi: 150,
    }),
  profile: z
    .object({
      hasChildren: z.boolean().default(false),
      hasElders: z.boolean().default(false),
      hasRespiratoryCondition: z.boolean().default(false),
      commuteMode: z
        .enum(["walk", "cycle", "twoWheeler", "car", "bus", "metro"])
        .default("twoWheeler"),
      commuteDistanceKm: z.number().min(0).max(100).default(10),
      cookingFuel: z.enum(["lpg", "induction", "biomass", "kerosene"]).default("lpg"),
      homeType: z.enum(["sealed", "leaky"]).default("leaky"),
      purifier: z.enum(["none", "small", "medium", "large"]).default("none"),
      mask: z.enum(["none", "cloth", "surgical", "n95"]).default("none"),
      budget: z.enum(["free", "low", "medium", "high"]).default("low"),
    })
    .default({
      hasChildren: false,
      hasElders: false,
      hasRespiratoryCondition: false,
      commuteMode: "twoWheeler",
      commuteDistanceKm: 10,
      cookingFuel: "lpg",
      homeType: "leaky",
      purifier: "none",
      mask: "none",
      budget: "low",
    }),
});

export type PlanRequestBody = z.infer<typeof planRequestSchema>;
