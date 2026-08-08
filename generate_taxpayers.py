#!/usr/bin/env python3
"""
Generate additional Ethiopian taxpayers for the database
Target: 150 total taxpayers (50 per tax center)
"""

import json
import random
from datetime import datetime, timedelta

# Ethiopian business names by sector
BUSINESSES = {
    'Financial Services': [
        'Dashen Bank', 'Awash Bank', 'Wegagen Bank', 'United Bank',
        'Cooperative Bank of Oromia', 'Berhan Bank', 'Zemen Bank', 'Bunna Bank',
        'Oromia Bank', 'Addis International Bank', 'Enat Bank', 'Hibret Bank',
        'Abay Bank', 'Tsehay Bank', 'Amhara Bank', 'Sidama Bank',
        'Tsedey Bank', 'Gadaa Bank', 'Zemzem Bank', 'Goh Betoch Bank'
    ],
    'Manufacturing': [
        'Derba Midroc Cement', 'Dangote Cement Ethiopia', 'Messebo Cement',
        'National Tobacco Enterprise', 'Kombolcha Textile', 'Bahir Dar Textile',
        'Adey Abeba Shoe', 'Anbessa Shoe Factory', 'Moha Soft Drinks',
        'Meta Abo Brewery', 'Harar Brewery', 'Bedele Brewery',
        'East African Bottling', 'Crystal Wine Factory', 'Nazret Brewery',
        'Dire Dawa Bottling', 'Gondar Textiles', 'Arba Minch Textiles',
        'Addis Steel Mill', 'Akaki Metal Works', 'Kaliti Food Complex',
        'Ethiopian Sugar Corporation', 'Wonji Sugar Factory', 'Metehara Sugar'
    ],
    'Import/Export': [
        'Al-Impex Trading', 'Multi-trade Ethiopia', 'Trans Ethiopia Trading',
        'National Trading Corporation', 'Abay Trading', 'Guna Trading House',
        'Bazezew Trading', 'Ameritech Ethiopia', 'Japan Motors Ethiopia',
        'Mohammed International', 'Almeta Impex', 'Muller & Phipps Ethiopia',
        'National Mining', 'Midroc Gold', 'Holland Car', 'Goh Betoch Trading',
        'Kefeta Trading', 'Aman Import Export', 'Samson Trading'
    ],
    'Construction': [
        'Sur Construction', 'Yotek Construction', 'Beteseb Construction',
        'Saba Engineering', 'Kaleb Engineering', 'Ethio Construction Works',
        'Road Construction Authority', 'CCECC Ethiopia', 'China Jiangxi',
        'China Gezhouba', 'Contractor Plc', 'Opal Construction',
        'Tikur Construction', 'Shega Construction', 'Zefmesh Construction'
    ],
    'Hospitality': [
        'Jupiter International Hotel', 'Ghion Hotel', 'Harmony Hotel',
        'Capital Hotel', 'Eliana Hotel', 'Getfam Hotel', 'Nexus Hotel',
        'Intercontinental Hotel', 'Golden Tulip', 'Best Western Plus',
        'Marriott Executive', 'Haile Resort', 'Kuriftu Resort', 'Adulala Resort'
    ],
    'Agriculture': [
        'ET Highland Flora', 'Sher Ethiopia', 'Ziway Roses', 'Hora Flora',
        'Ethiopian Horticulture', 'Yassin Coffee Export', 'Sidama Coffee Union',
        'Oromia Coffee Cooperative', 'Yirgacheffe Coffee', 'Guji Coffee Export',
        'Harar Coffee', 'Limu Coffee', 'Jimma Coffee', 'Teppi Coffee'
    ],
    'Telecommunications': [
        'Safaricom Ethiopia', 'Ethio IT Solutions', 'Zemen Tech',
        'ICT Ethiopia', 'Digital Ethiopia', 'NetSol Ethiopia'
    ],
    'Transportation': [
        'Ethiopian Cargo', 'Selam Bus', 'Sky Bus', 'Abay Bus',
        'Golden Bus', 'Trans Ethiopia', 'Sheger Transport', 'Wegagen Bus',
        'Anbessa City Bus', 'Alliance Transport'
    ],
    'Energy': [
        'Akaki Power Plant', 'Kality Gas', 'Ethiopian Petroleum',
        'Total Ethiopia', 'Shell Ethiopia', 'Oilybia Ethiopia',
        'Nile Petroleum', 'Global Petroleum'
    ],
    'Real Estate': [
        'Flintstone Development', 'Gurd Shola Real Estate', 'Ayat Real Estate',
        'Bole Real Estate', 'Lafto Real Estate', 'Hayat Real Estate',
        'Addis Land', 'Koye Feche Real Estate'
    ],
    'Retail': [
        'Shoa Supermarket', 'Fresh Corner Supermarket', 'Ramis Supermarket',
        'Etete Supermarket', 'Ato Supermarket', 'Bambis Supermarket',
        'Mama Fresh Market', 'Todo Market', 'Meri Best Supermarket'
    ],
    'Healthcare': [
        'Hayat Medical Center', 'Myungsung Medical Center', 'Zewditu Pharmacy',
        'Tikur Anbessa Supply', 'St. Peters Medical', 'Bethel Medical',
        'Yekatit Hospital Supply', 'Ras Desta Medical'
    ],
    'Education': [
        'Unity University', 'Admas University', 'Alpha University',
        'St. Mary University', 'Rift Valley University', 'Microlink College'
    ]
}

LOCATIONS = [
    'Bole', 'Piazza', 'Merkato', 'Kazanchis', 'CMC', 'Kality', 'Akaki',
    'Lebu', 'Sarbet', 'Meskel Square', 'Mexico Square', 'Arat Kilo',
    'Sidist Kilo', 'Bambis', 'Megenagna', 'Gerji', 'Summit', 'Kotebe'
]

COMPLIANCE_HISTORY = [
    'Good compliance record',
    'Clean record',
    'Compliant',
    'Minor filing delays',
    'Minor discrepancies noted',
    'Late filings',
    'VAT discrepancies',
    'Payroll tax issues',
    'Transfer pricing concerns',
    'Multiple late filings',
    'Revenue underreporting concerns',
    'Export tax verification needed',
    'Import duty concerns',
    'Service tax concerns',
    'Excise tax review needed',
    'Related party transactions need review',
    'Intercompany pricing review needed',
    'Production volume discrepancies',
    'Complex revenue streams',
    'Multiple revenue sources'
]

def get_risk_score_and_level():
    """Generate risk score and determine level"""
    rand = random.random()
    if rand < 0.10:  # 10% CRITICAL
        score = random.randint(90, 100)
        level = 'CRITICAL'
    elif rand < 0.30:  # 20% HIGH
        score = random.randint(70, 89)
        level = 'HIGH'
    elif rand < 0.80:  # 50% MEDIUM
        score = random.randint(50, 69)
        level = 'MEDIUM'
    else:  # 20% LOW
        score = random.randint(30, 49)
        level = 'LOW'
    return score, level

def get_audit_type(risk_level, sector):
    """Determine audit type based on risk and sector"""
    if risk_level == 'CRITICAL':
        if sector in ['Financial Services', 'Telecommunications']:
            return random.choice(['comprehensive', 'joint_audit'])
        return 'comprehensive'
    elif risk_level == 'HIGH':
        if 'Import/Export' in sector or 'International' in sector:
            return random.choice(['field_audit', 'transfer_pricing'])
        elif sector == 'Construction':
            return 'field_audit'
        return random.choice(['field_audit', 'issue_audit'])
    elif risk_level == 'MEDIUM':
        return random.choice(['desk_audit', 'desk_audit', 'issue_audit'])
    else:
        return 'desk_audit'

def generate_revenue(risk_level):
    """Generate annual revenue based on risk level"""
    if risk_level == 'CRITICAL':
        return random.randint(2000, 8500) * 1000000
    elif risk_level == 'HIGH':
        return random.randint(800, 2000) * 1000000
    elif risk_level == 'MEDIUM':
        return random.randint(200, 800) * 1000000
    else:
        return random.randint(50, 200) * 1000000

def generate_employees(revenue):
    """Generate employee count based on revenue"""
    # Rough formula: 1 employee per 5-10M ETB revenue
    base = revenue / 8000000
    return int(base * random.uniform(0.7, 1.3)) + random.randint(10, 50)

def random_date(start_year=2008, end_year=2020):
    """Generate random date"""
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).strftime('%Y-%m-%d')

def generate_taxpayer(idx, tax_center, sector_pool):
    """Generate a single taxpayer"""
    sector = random.choice(list(sector_pool.keys()))
    name = random.choice(sector_pool[sector])
    
    # Avoid duplicates by adding suffix if needed
    if random.random() > 0.7:
        name += ' ' + random.choice(['PLC', 'S.C.', 'Ltd', 'Group', 'Co.', 'Corp'])
    
    risk_score, risk_level = get_risk_score_and_level()
    audit_type = get_audit_type(risk_level, sector)
    revenue = generate_revenue(risk_level)
    employees = generate_employees(revenue)
    
    tc_code = tax_center.split('-')[-1].upper()
    base_tin = int(tax_center.split('-')[-1][-1]) * 1000 + 100
    
    taxpayer = {
        'id': f'tp-{tax_center.replace("addis_ababa-", "aa-")}-{idx:03d}',
        'tin': f'TIN-{base_tin + idx:04d}',
        'name': name,
        'sector': sector,
        'taxCenter': tax_center,
        'region': 'addis_ababa',
        'riskScore': risk_score,
        'riskLevel': risk_level,
        'suggestedAuditType': audit_type,
        'annualRevenue': revenue,
        'employees': employees,
        'registeredDate': random_date(),
        'lastAudit': random_date(2021, 2023),
        'complianceHistory': random.choice(COMPLIANCE_HISTORY),
        'address': f'{random.choice(LOCATIONS)}, Addis Ababa'
    }
    
    return taxpayer

def format_taxpayer_js(tp):
    """Format taxpayer as JavaScript object"""
    return f"""  {{
    id: '{tp['id']}',
    tin: '{tp['tin']}',
    name: '{tp['name']}',
    sector: '{tp['sector']}',
    taxCenter: '{tp['taxCenter']}',
    region: '{tp['region']}',
    riskScore: {tp['riskScore']},
    riskLevel: '{tp['riskLevel']}',
    suggestedAuditType: '{tp['suggestedAuditType']}',
    annualRevenue: {tp['annualRevenue']},
    employees: {tp['employees']},
    registeredDate: '{tp['registeredDate']}',
    lastAudit: '{tp['lastAudit']}',
    complianceHistory: '{tp['complianceHistory']}',
    address: '{tp['address']}'
  }}"""

# Generate taxpayers
print("Generating taxpayers...")
print("=" * 60)

tax_centers = {
    'addis_ababa-tc1': 38,  # Need 38 more (current: 12, target: 50)
    'addis_ababa-tc2': 42,  # Need 42 more (current: 8, target: 50)
    'addis_ababa-tc3': 44   # Need 44 more (current: 6, target: 50)
}

all_taxpayers = []

for tc, count in tax_centers.items():
    print(f"\nGenerating {count} taxpayers for {tc}...")
    # Adjust sector mix based on tax center
    if 'tc1' in tc:
        # TC1: Large businesses - more financial, telecom, construction
        sector_weights = {**BUSINESSES, **{
            'Financial Services': BUSINESSES['Financial Services'] * 2,
            'Construction': BUSINESSES['Construction'] * 2
        }}
    elif 'tc2' in tc:
        # TC2: Medium businesses - balanced mix
        sector_weights = BUSINESSES
    else:
        # TC3: Small businesses - more retail, services
        sector_weights = {**BUSINESSES, **{
            'Retail': BUSINESSES['Retail'] * 3,
            'Manufacturing': BUSINESSES['Manufacturing'][:10]  # Smaller manufacturers
        }}
    
    start_idx = 100 if 'tc1' in tc else (200 if 'tc2' in tc else 300)
    
    for i in range(count):
        tp = generate_taxpayer(start_idx + i, tc, sector_weights)
        all_taxpayers.append(tp)
        print(f"  ✓ {tp['name']} ({tp['riskLevel']}, {tp['suggestedAuditType']})")

print(f"\n{'=' * 60}")
print(f"Total taxpayers generated: {len(all_taxpayers)}")
print(f"{'=' * 60}\n")

# Output as JavaScript
print("// ===== GENERATED TAXPAYERS - ADD TO taxpayers.js =====")
print("// Add these BEFORE the existing taxpayers closing bracket ];\n")

for i, tp in enumerate(all_taxpayers):
    print(format_taxpayer_js(tp) + (',\n' if i < len(all_taxpayers) - 1 else ''))

print("\n// ===== END GENERATED TAXPAYERS =====")
print(f"\n✅ Generated {len(all_taxpayers)} taxpayers ready to add!")
print("📋 Copy the output above and add to taxpayers.js")
