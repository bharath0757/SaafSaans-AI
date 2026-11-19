# Assumptions and sources

All figures shown in SaafSaans are **educational estimates**, not medical advice.
Every constant and calculation in the deterministic Impact Engine is grounded in peer-reviewed scientific literature and official environmental health standards.

---

## 1. National AQI Breakpoints (India CPCB)

**Source:** Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change, Government of India: _National Air Quality Index_ report (Table 2).  
**Formula:** Linear interpolation between sub-index breakpoints:
$$I_p = \frac{I_{HI} - I_{LO}}{B_{HI} - B_{LO}} \times (C_p - B_{LO}) + I_{LO}$$
The overall AQI is the maximum (worst) sub-index across available monitored pollutants.

| Category         | AQI Range | $\text{PM}_{2.5}$ (24-hr) ($\mu\text{g/m}^3$) | $\text{PM}_{10}$ (24-hr) ($\mu\text{g/m}^3$) |
| :--------------- | :-------- | :-------------------------------------------- | :------------------------------------------- |
| **Good**         | 0 – 50    | 0 – 30                                        | 0 – 50                                       |
| **Satisfactory** | 51 – 100  | 31 – 60                                       | 51 – 100                                     |
| **Moderate**     | 101 – 200 | 61 – 90                                       | 101 – 250                                    |
| **Poor**         | 201 – 300 | 91 – 120                                      | 251 – 350                                    |
| **Very Poor**    | 301 – 400 | 121 – 250                                     | 351 – 430                                    |
| **Severe**       | 401 – 500 | 251 – 380 (extensible)                        | 431 – 510                                    |

---

## 2. Indoor Air Quality Mass Balance Model

**Governing Equation:** Steady-state single-zone mass balance:
$$C_{in} = \frac{P \cdot a \cdot C_{out} + \frac{S}{V}}{a + k_d + \frac{\text{CADR}}{V}}$$

Where:

- $C_{in}$: Indoor $\text{PM}_{2.5}$ concentration ($\mu\text{g/m}^3$)
- $C_{out}$: Outdoor ambient $\text{PM}_{2.5}$ concentration ($\mu\text{g/m}^3$)
- $P$: Building envelope penetration factor (dimensionless, 0–1)
- $a$: Air exchange rate ($\text{h}^{-1}$)
- $k_d$: Particle surface deposition rate ($\text{h}^{-1}$)
- $S$: Indoor emission generation rate ($\mu\text{g/h}$)
- $V$: Indoor room volume ($\text{m}^3$, default 108 $\text{m}^3$ representing a 40 $\text{m}^2 \times 2.7\text{ m}$ room)
- $\text{CADR}$: Clean Air Delivery Rate ($\text{m}^3\text{/h}$)

### Parameter Values & Ranges

| Parameter                          | Low  | Central | High  | Unit                  | Primary Source                                                                  |
| :--------------------------------- | :--- | :------ | :---- | :-------------------- | :------------------------------------------------------------------------------ |
| **Penetration $P$ (Sealed)**       | 0.60 | 0.70    | 0.80  | -                     | Chen & Zhao 2011 (_Environ. Sci. Technol._ 45:6); EPA Exposure Factors Handbook |
| **Penetration $P$ (Leaky)**        | 0.80 | 0.90    | 0.95  | -                     | Long et al. 2001 (_Environ. Sci. Technol._ 35:10)                               |
| **Air Exchange $a$ (Sealed)**      | 0.10 | 0.30    | 0.50  | $\text{h}^{-1}$       | ASHRAE Standard 62.2; Persily et al. 2010                                       |
| **Air Exchange $a$ (Leaky)**       | 0.70 | 1.00    | 1.50  | $\text{h}^{-1}$       | EPA Exposure Factors Handbook Ch 19                                             |
| **Air Exchange $a$ (Ventilating)** | 2.00 | 5.00    | 10.00 | $\text{h}^{-1}$       | Howard-Reed et al. 2002                                                         |
| **Deposition Rate $k_d$**          | 0.15 | 0.30    | 0.50  | $\text{h}^{-1}$       | Lai & Nazaroff 2000 (_J. Aerosol Sci._ 31:4)                                    |
| **CADR (Small Purifier)**          | 80   | 120     | 160   | $\text{m}^3\text{/h}$ | AHAM AC-1 testing standard                                                      |
| **CADR (Medium / DIY Box)**        | 150  | 230     | 300   | $\text{m}^3\text{/h}$ | Corsi-Rosenthal Box specifications; AHAM AC-1                                   |
| **CADR (Large Purifier)**          | 300  | 400     | 500   | $\text{m}^3\text{/h}$ | Commercial HEPA unit specifications                                             |

---

## 3. Human Inhalation & Micro-Environment Exposure (Dose)

**Equation:** Personal inhaled particulate mass dose ($\mu\text{g}$):
$$\text{Dose} = \sum_{i} \left( C_{i,\text{effective}} \times \text{Inhalation Rate}_i \times \text{Duration}_i \right)$$
$$C_{i,\text{effective}} = \frac{C_i}{\text{Protection Factor}_{\text{mask}}}$$

### Inhalation Rates ($\text{m}^3\text{/h}$)

**Source:** U.S. EPA _Exposure Factors Handbook_, Chapter 6 (Table 6-1 & 6-2).

| Demographic           | Resting / Sleep            | Light Activity (Office, Walking) | Moderate Activity (Exercise) |
| :-------------------- | :------------------------- | :------------------------------- | :--------------------------- |
| **Adult** (21–64 yrs) | 0.45 $\text{m}^3\text{/h}$ | 0.90 $\text{m}^3\text{/h}$       | 1.60 $\text{m}^3\text{/h}$   |
| **Child** (3–10 yrs)  | 0.30 $\text{m}^3\text{/h}$ | 0.50 $\text{m}^3\text{/h}$       | 0.80 $\text{m}^3\text{/h}$   |
| **Elder** (65+ yrs)   | 0.40 $\text{m}^3\text{/h}$ | 0.70 $\text{m}^3\text{/h}$       | 1.00 $\text{m}^3\text{/h}$   |

---

## 4. Respiratory Protection (Masks)

**Source:** NIOSH 42 CFR Part 84; OSHA Assigned Protection Factor (APF) Table (29 CFR 1910.134); Drewnick et al. 2021 (_Aerosol Sci. Technol._).

| Mask Type         | Media Efficiency | Assigned Protection Factor (Low / Central / High) | Typical Inhaled Reduction |
| :---------------- | :--------------- | :------------------------------------------------ | :------------------------ |
| **None**          | 0%               | 1.0 / 1.0 / 1.0                                   | 0%                        |
| **Cloth Mask**    | 30%              | 1.2 / 1.5 / 2.0                                   | 17% – 50%                 |
| **Surgical Mask** | 60%              | 1.5 / 2.5 / 4.0                                   | 33% – 75%                 |
| **N95 / KN95**    | 95%              | 5.0 / 10.0 / 15.0                                 | 80% – 93%                 |

---

## 5. Transport Micro-Environments & Emissions

**Source:** CSTEP Urban Transport Assessment (2020); Shakti Sustainable Energy Foundation; Delhi Metro Rail Corporation (DMRC) Carbon Credit Reports; EEER Commuter Exposure Studies (2019).

| Mode            | $\text{PM}_{2.5}$ Exposure Multiplier (vs Ambient) | $\text{CO}_2\text{e}$ per Passenger-km ($\text{g CO}_2\text{e/pkm}$) | Description / Note                             |
| :-------------- | :------------------------------------------------- | :------------------------------------------------------------------- | :--------------------------------------------- |
| **Walk**        | 0.9 / 1.1 / 1.5                                    | 0                                                                    | Zero operational emissions; roadside proximity |
| **Cycle**       | 1.0 / 1.2 / 1.6                                    | 0                                                                    | Zero operational emissions; active ventilation |
| **Two-Wheeler** | 1.2 / 1.5 / 2.0                                    | 40 / 55 / 70                                                         | Direct exhaust exposure, high tailpipe fumes   |
| **Private Car** | 0.3 / 0.5 / 0.9                                    | 110 / 150 / 200                                                      | Cabin filtration with AC recirculation         |
| **Bus**         | 0.8 / 1.3 / 1.8                                    | 30 / 60 / 90                                                         | Variable windows and fleet engine types        |
| **Metro**       | 0.2 / 0.3 / 0.5                                    | 15 / 22 / 30                                                         | Underground/elevated sealed AC coaches         |

---

## 6. Household Cooking Fuel Emissions

**Source:** WHO Guidelines for Indoor Air Quality: Household Fuel Combustion (2014); Balakrishnan et al. (_Lancet Planetary Health_ 2019); Smith et al.

| Fuel Type                 | Indoor $\text{PM}_{2.5}$ Emission Rate ($\mu\text{g/h}$) | $\text{CO}_2\text{e}$ Emission Rate ($\text{g/h}$) |
| :------------------------ | :------------------------------------------------------- | :------------------------------------------------- |
| **LPG**                   | 100 / 300 / 600                                          | 800 / 1200 / 1600                                  |
| **Induction**             | 10 / 50 / 150                                            | 300 / 500 / 800                                    |
| **Biomass / Dung / Wood** | 2,000 / 5,000 / 10,000                                   | 2,000 / 3,500 / 5,000                              |
| **Kerosene**              | 500 / 1,500 / 3,000                                      | 1,500 / 2,200 / 3,000                              |
