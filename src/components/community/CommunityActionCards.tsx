const PILLARS = [
  {
    icon: "🏢",
    title: "1. Common Clean Air Sanctuary",
    tag: "High Impact",
    desc: "Equip clubhouse, community library, or society office with high-CADR HEPA filters or DIY Corsi-Rosenthal boxes. Maintain a sealed clean-air zone for vulnerable elders and infants during peak morning and evening inversion hours.",
  },
  {
    icon: "🔥",
    title: "2. Zero Open Waste Burning Patrol",
    tag: "Strict Protocol",
    desc: "Enforce a complete ban on burning dry leaves, garden waste, and plastic trash on premises. Direct security staff to patrol perimeters at dawn/dusk and provide designated composting pits for garden waste.",
  },
  {
    icon: "💧",
    title: "3. Wet Misting & Dust Suppression",
    tag: "Ground-Level",
    desc: "Prohibit dry sweeping with traditional brooms which resuspends fine thoracic dust. Mandate wet mopping or fine water misting across paved driveways, unpaved paths, and parking zones between 11 AM and 3 PM.",
  },
  {
    icon: "🚌",
    title: "4. School Transit & Anti-Idling Gate Zone",
    tag: "Emission Reduction",
    desc: "Coordinate pooled vans and school bus transit to cut private four-wheeler trips by 50%. Enforce a strict 60-second engine shut-off rule at entrance drop-off gates to eliminate toxic tailpipe fumes.",
  },
];

export function CommunityActionCards() {
  return (
    <section aria-labelledby="community-actions-heading" className="space-y-4">
      <h2 id="community-actions-heading" className="font-display text-xl font-bold text-ink">
        Society & Neighborhood Protocols
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-card border border-line bg-paper p-5 shadow-card print:border-ink print:shadow-none print:break-inside-avoid"
          >
            <div className="flex items-center justify-between gap-2 border-b border-line pb-2 print:border-ink">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="text-xl">
                  {p.icon}
                </span>
                <h3 className="font-semibold text-ink">{p.title}</h3>
              </div>
              <span className="rounded bg-teal/10 px-2 py-0.5 text-xs font-bold text-teal print:border print:border-ink print:text-ink">
                {p.tag}
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted print:text-ink">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
