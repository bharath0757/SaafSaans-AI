const CHECKLIST_ITEMS = [
  "Registry of high-risk residents (infants, asthmatics, COPD patients, elderly members).",
  "Emergency supply of certified N95 respirators maintained at the security gate/RWA desk.",
  "Functional pulse oximeters and nebulizer power backup stations in common facility rooms.",
  "Direct communication channel (WhatsApp/SMS) alerting members when AQI exceeds 300.",
];

export function VulnerableRegistry() {
  return (
    <section
      aria-labelledby="vulnerable-registry-heading"
      className="rounded-card border border-line bg-paper p-6 shadow-card print:border-ink print:shadow-none print:break-inside-avoid"
    >
      <h2 id="vulnerable-registry-heading" className="font-display text-xl font-bold text-ink">
        High-Risk Member Emergency Shield
      </h2>
      <p className="mt-1 text-xs text-muted print:text-ink">
        Winter smog disproportionately impacts children, seniors, and individuals with respiratory
        conditions.
      </p>

      <ul className="mt-4 space-y-2 text-xs text-ink">
        {CHECKLIST_ITEMS.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span aria-hidden="true" className="font-bold text-teal print:text-ink">
              ☑
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 border-t border-dashed border-line pt-4 print:border-ink">
        <p className="text-xs font-semibold text-muted print:text-ink">NOTICEBOARD ENDORSEMENT</p>
        <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-muted print:text-ink sm:grid-cols-3">
          <div>
            <span className="block font-medium">RWA / Society Name:</span>
            <span className="block border-b border-line pt-4 print:border-ink"></span>
          </div>
          <div>
            <span className="block font-medium">Clean Air Coordinator:</span>
            <span className="block border-b border-line pt-4 print:border-ink"></span>
          </div>
          <div>
            <span className="block font-medium">Emergency Contact / Phone:</span>
            <span className="block border-b border-line pt-4 print:border-ink"></span>
          </div>
        </div>
      </div>
    </section>
  );
}
