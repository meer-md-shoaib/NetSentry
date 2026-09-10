/**
 * NetSentry — Criminal Network Intelligence Dataset (SIH 2026)
 * Pre-packaged synthetic intelligence graph simulating multi-agency law enforcement data.
 * 
 * Demonstrates:
 * USP 1: Alias & Identity Resolution (phonetic variations, nick-names, confidence scoring)
 * USP 2: Cross-Jurisdiction Linking (Delhi Special Cell, Maharashtra ATS, UP STF, Karnataka CID, CBI)
 */

export const SYNDICATES = [
  {
    id: 'syn-dwest',
    name: 'D-West Cartel (Narcotics & Hawala)',
    color: '#38bdf8', // Neon Cyan
    headquarters: 'Mumbai - Dubai Transit Axis',
    riskLevel: 'CRITICAL',
    description: 'Transnational organized syndicate orchestrating synthetic narcotics smuggling, port logistics, and multi-tier hawala cash layering.'
  },
  {
    id: 'syn-ncr',
    name: 'NCR Arms & Contract Extortion Ring',
    color: '#f43f5e', // Crimson / Rose
    headquarters: 'Delhi - Meerut - Gurugram Corridor',
    riskLevel: 'CRITICAL',
    description: 'Interstate weapon manufacturing pipeline and high-profile extortion syndicate running clandestine safehouses across Western UP and Haryana.'
  },
  {
    id: 'syn-cyber',
    name: 'Cyber Nexus & Mule Banking Syndicate',
    color: '#a855f7', // Neon Purple / Violet
    headquarters: 'Jamtara - Bengaluru - Cyberabad Hubs',
    riskLevel: 'HIGH',
    description: 'Syndicate deploying phishing kits, illegal crypto mixer nodes, and thousands of compromised mule bank accounts across private Indian banks.'
  },
  {
    id: 'syn-coastal',
    name: 'Coastal Seaborne Contraband Syndicate',
    color: '#10b981', // Emerald / Sea Green
    headquarters: 'Kutch - Porbandar - Ratnagiri Seaboard',
    riskLevel: 'HIGH',
    description: 'Maritime smuggling network using mechanized fishing dhows and unmanned landing points along the Arabian Sea coastline.'
  },
  {
    id: 'syn-transit',
    name: 'Interstate Vehicle & Fake Currency Ring',
    color: '#f59e0b', // Amber / Gold
    headquarters: 'Malda - Patna - Punjab Transit Lines',
    riskLevel: 'MEDIUM',
    description: 'Specializes in high-grade FICN (Fake Indian Currency Notes) circulation and stolen luxury vehicle VIN tampering for gang logistics.'
  }
];

export const CRIMINALS = [
  // ==========================================
  // SYNDICATE 1: D-West Cartel (Narcotics & Hawala)
  // ==========================================
  {
    id: 'crm-001',
    name: 'Mohd. Aslam',
    aliases: ['Aslam Bhai', 'Md. Aslam', 'Aslam Kalia', 'अस्लम'],
    aliasConfidence: 0.96,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Kingpin / Strategic Handler',
    cell: 'Overseas Operations Wing',
    crimeType: 'Narcotics & Hawala',
    jurisdiction: 'Maharashtra ATS',
    secondaryJurisdictions: ['Delhi Police Special Cell', 'Gujarat ATS'],
    riskScore: 0.98,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #118/2024 - NDPS Act Sec 21/29 (Mumbai Crime Branch)',
      'FIR #304/2024 - MCOCA Sec 3(1)(ii) (Maharashtra ATS)',
      'FIR #412/2025 - Sec 120B/420 IPC (Delhi Special Cell)'
    ],
    hardIdentifiers: {
      phone: '+91 98201-90112 (Burner)',
      imei: '864910041289410',
      vehicle: 'MH-02-DN-9901 (Fortuner)',
      accounts: ['HDFC #...4810', 'Emirates NBD #...9102']
    },
    explainability: 'Primary kingpin of D-West Cartel. Directly controls overseas container routing and commands 14 field operatives across Mumbai, Surat, and Delhi.',
    tags: ['kingpin', 'narcotics', 'hawala', 'mumbai', 'transnational', 'mcoca'],
    avatarSeed: 'aslam'
  },
  {
    id: 'crm-002',
    name: 'Tariq Merchant',
    aliases: ['Tariq Hawala', 'T.M. Dubai', 'Tariq Bhai'],
    aliasConfidence: 0.91,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Chief Financial Launderer',
    cell: 'Hawala & Shell Account Nexus',
    crimeType: 'Hawala & Money Laundering',
    jurisdiction: 'Enforcement Directorate (ED)',
    secondaryJurisdictions: ['Maharashtra ATS', 'Delhi Special Cell'],
    riskScore: 0.94,
    riskLevel: 'CRITICAL',
    firRecords: [
      'ECIR/MBZO-I/44/2024 - PMLA Sec 3 & 4 (ED Mumbai)',
      'FIR #220/2024 - FEMA Violation (DRI Mumbai)'
    ],
    hardIdentifiers: {
      phone: '+91 98110-44921',
      imei: '358291048821903',
      vehicle: 'MH-01-EA-4411 (Mercedes E-Class)',
      accounts: ['ICICI Shell Account #...9104', 'Axis #...8192']
    },
    explainability: 'Laundered over ₹78 Crores for D-West Cartel using shell bullion firms. Bridges cash proceeds from NCR arms purchases and narcotics imports.',
    tags: ['hawala', 'money-laundering', 'ed', 'pmla', 'finance', 'shell-companies'],
    avatarSeed: 'tariq'
  },
  {
    id: 'crm-003',
    name: 'Farhan Qureshi',
    aliases: ['Shooter Farhan', 'Farhan Chhotu', 'Qureshi Bhai'],
    aliasConfidence: 0.89,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Enforcement & Hit Squad Lead',
    cell: 'Street Enforcement Cell',
    crimeType: 'Extortion & Contract Hit',
    jurisdiction: 'Maharashtra ATS',
    secondaryJurisdictions: ['UP STF'],
    riskScore: 0.92,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #92/2023 - Sec 302/34 IPC (Nagpada PS)',
      'FIR #441/2024 - Arms Act Sec 25/27 (Mumbai Special Cell)'
    ],
    hardIdentifiers: {
      phone: '+91 97690-33120',
      imei: '861092048991204',
      vehicle: 'MH-04-AB-1920 (KTM Duke 390)',
      accounts: ['Kotak #...3319']
    },
    explainability: 'Commands armed enforcers for debt recovery and targeted strikes. Sourced illegal 9mm automatic pistols directly from NCR Arms Cartel.',
    tags: ['enforcer', 'arms', 'extortion', 'contract-hit', 'mumbai'],
    avatarSeed: 'farhan'
  },
  {
    id: 'crm-004',
    name: 'Salim Patel',
    aliases: ['Salim Cargo', 'S.K. Dock', 'Salim Seth'],
    aliasConfidence: 0.85,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Port & Container Logistics Coordinator',
    cell: 'Maritime Logistics Wing',
    crimeType: 'Narcotics & Contraband',
    jurisdiction: 'Customs & DRI Mumbai',
    secondaryJurisdictions: ['Gujarat ATS'],
    riskScore: 0.87,
    riskLevel: 'HIGH',
    firRecords: [
      'DRI/MZU/F/19/2024 - Customs Act Sec 135 (JNPT Nhava Sheva)',
      'FIR #115/2025 - NDPS Act Sec 8(c)/21 (Navi Mumbai)'
    ],
    hardIdentifiers: {
      phone: '+91 98218-77192',
      imei: '351982049910248',
      vehicle: 'MH-46-Z-8890 (Tata Safari)',
      accounts: ['Bank of Baroda #...1029']
    },
    explainability: 'Key inside-man at commercial container freight stations. Coordinates customs clearance of concealed commercial narcotics consignments.',
    tags: ['port', 'jnpt', 'dri', 'logistics', 'containers'],
    avatarSeed: 'salim'
  },
  {
    id: 'crm-005',
    name: 'Rashid Khan',
    aliases: ['Rashid SIM', 'Rashid Telecom', 'RK Dealer'],
    aliasConfidence: 0.88,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Burner SIM & Hardware Supplier',
    cell: 'Technical Logistics Unit',
    crimeType: 'Telecom Fraud & Cyber Logistics',
    jurisdiction: 'Mumbai Cyber Police',
    secondaryJurisdictions: ['Delhi Police Special Cell'],
    riskScore: 0.79,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #88/2024 - IT Act Sec 66D / IPC 468 (BKC Cyber PS)',
      'FIR #102/2025 - Telegraph Act Sec 20 (Special Cell)'
    ],
    hardIdentifiers: {
      phone: '+91 99300-88122',
      imei: '869201048821990',
      vehicle: 'MH-03-CB-4012 (Activa 6G)',
      accounts: ['Paytm Payments Bank #...0092']
    },
    explainability: 'Procured over 450 fake-identity SIM cards used by D-West kingpins and NCR hit squads to evade regular CDR cell-tower triangulation.',
    tags: ['telecom', 'burner-sim', 'cyber', 'fraud', 'hardware'],
    avatarSeed: 'rashid'
  },
  {
    id: 'crm-006',
    name: 'Zubair Ansari',
    aliases: ['Zubair Courier', 'Zubu', 'Ansari Trader'],
    aliasConfidence: 0.82,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Interstate Cash Mule Handler',
    cell: 'Hawala & Shell Account Nexus',
    crimeType: 'Hawala & Money Laundering',
    jurisdiction: 'Maharashtra ATS',
    secondaryJurisdictions: ['Karnataka CID'],
    riskScore: 0.78,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #55/2024 - IPC Sec 420/120B (Dadar PS)',
      'FIR #77/2024 - PMLA Inquiry (ED Bengaluru)'
    ],
    hardIdentifiers: {
      phone: '+91 97022-19200',
      imei: '359102049920199',
      vehicle: 'MH-01-BK-3399 (Honda City)',
      accounts: ['Canara Bank #...5541']
    },
    explainability: 'Operates fleet of interstate cash carriers transporting hawala tokens between Mumbai Zaveri Bazaar and Bengaluru electronics markets.',
    tags: ['cash-mule', 'hawala', 'interstate', 'bengaluru', 'mumbai'],
    avatarSeed: 'zubair'
  },
  {
    id: 'crm-007',
    name: 'Iqbal Kazi',
    aliases: ['Iqbal Chemical', 'Doctor Kazi', 'I.K.'],
    aliasConfidence: 0.84,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Synthetic Drug Chemist / Lab Lead',
    cell: 'Clandestine Laboratory Unit',
    crimeType: 'Narcotics & Hawala',
    jurisdiction: 'Gujarat ATS',
    secondaryJurisdictions: ['Maharashtra ATS', 'NCB'],
    riskScore: 0.91,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #14/2024 - NDPS Act Sec 22/29 (Ankleshwar GIDC)',
      'NCB Crime No. 08/2024 (NCB Mumbai Zonal Unit)'
    ],
    hardIdentifiers: {
      phone: '+91 98980-44102',
      imei: '864192049920112',
      vehicle: 'GJ-16-AC-7788 (Hyundai Creta)',
      accounts: ['State Bank of India #...9930']
    },
    explainability: 'Master chemist synthesizing mephedrone (MD) in industrial pharmaceutical estates in Ankleshwar; supplies D-West distribution pipelines.',
    tags: ['chemist', 'mephedrone', 'ndps', 'ncb', 'clandestine-lab'],
    avatarSeed: 'iqbal'
  },
  {
    id: 'crm-008',
    name: 'Nadeem Merchant',
    aliases: ['Nadeem Dubai', 'Nadu', 'Merchant Jr.'],
    aliasConfidence: 0.90,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Cross-Border Hawala Settlement Broker',
    cell: 'Hawala & Shell Account Nexus',
    crimeType: 'Hawala & Money Laundering',
    jurisdiction: 'Enforcement Directorate (ED)',
    secondaryJurisdictions: ['Delhi Police Special Cell'],
    riskScore: 0.89,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #218/2024 - IPC Sec 120B/471 (Delhi Crime Branch)',
      'ED Summons #991/2025 (PMLA Unit)'
    ],
    hardIdentifiers: {
      phone: '+971 50-9812901 / +91 98200-11299',
      imei: '352910049920199',
      vehicle: 'MH-02-CP-0007 (BMW 5 Series)',
      accounts: ['Standard Chartered UAE #...8819']
    },
    explainability: 'Manages international offset accounts balancing overseas import payments against domestic real estate investments.',
    tags: ['hawala', 'international', 'dubai', 'ed', 'real-estate'],
    avatarSeed: 'nadeem'
  },
  {
    id: 'crm-009',
    name: 'Altaf Sayyed',
    aliases: ['Altaf Kurla', 'Sayyed Bhai', 'AK-Kurla'],
    aliasConfidence: 0.81,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Citywide Street Distribution Head',
    cell: 'Street Enforcement Cell',
    crimeType: 'Narcotics & Extortion',
    jurisdiction: 'Mumbai Police Crime Branch',
    secondaryJurisdictions: ['Maharashtra ATS'],
    riskScore: 0.83,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #302/2023 - NDPS Act Sec 21 (Kurla PS)',
      'FIR #41/2025 - IPC Sec 387 (Extortion Cell)'
    ],
    hardIdentifiers: {
      phone: '+91 98330-99211',
      imei: '861029048821900',
      vehicle: 'MH-03-AU-5511 (Pulsar 220)',
      accounts: ['Union Bank #...3310']
    },
    explainability: 'Directs 25+ local peddlers across suburban rail belts; channels weekly cash remittances through Zubair Ansari.',
    tags: ['street-boss', 'distribution', 'kurla', 'mumbai', 'peddler-network'],
    avatarSeed: 'altaf'
  },
  {
    id: 'crm-010',
    name: 'Tanveer Qureshi',
    aliases: ['Tanveer Shooter', 'Tanveer UP', 'Tanveer Meerut'],
    aliasConfidence: 0.87,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Armory Custodian & Safehouse Lead',
    cell: 'Street Enforcement Cell',
    crimeType: 'Arms Trafficking',
    jurisdiction: 'Maharashtra ATS',
    secondaryJurisdictions: ['UP STF'],
    riskScore: 0.86,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #192/2024 - Arms Act Sec 25 (Thane Crime Branch)',
      'FIR #61/2025 - IPC 120B/307 (Meerut Civil Lines)'
    ],
    hardIdentifiers: {
      phone: '+91 97190-22104',
      imei: '351092049920119',
      vehicle: 'UP-15-BB-8890 (Scorpio N)',
      accounts: ['Punjab National Bank #...8812']
    },
    explainability: 'Provides physical cross-state link between Farhan Qureshi in Mumbai and Kuldeep Tyagi’s illegal weapons cache in Meerut.',
    tags: ['armory', 'cross-jurisdiction', 'up-stf', 'mats', 'weapons-cache'],
    avatarSeed: 'tanveer'
  },
  {
    id: 'crm-011',
    name: 'Sameer Sheikh',
    aliases: ['Sam Hawala', 'Sameer Pydhonie', 'S. Sheikh'],
    aliasConfidence: 0.80,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Angadia Network Liaison',
    cell: 'Hawala & Shell Account Nexus',
    crimeType: 'Hawala & Money Laundering',
    jurisdiction: 'Maharashtra ATS',
    secondaryJurisdictions: ['Gujarat Police CID'],
    riskScore: 0.82,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #140/2024 - IPC Sec 420/467 (Pydhonie PS)',
      'DRI Case #44/2024 (Ahmedabad Unit)'
    ],
    hardIdentifiers: {
      phone: '+91 98200-88190',
      imei: '864910048821933',
      vehicle: 'MH-01-DF-2200 (Innova Crysta)',
      accounts: ['Kotak Mahindra #...7741']
    },
    explainability: 'Manages physical diamond & cash transfer channels between Mumbai Pydhonie and Surat diamond markets for cartel accounts.',
    tags: ['angadia', 'surat', 'mumbai', 'cash-transfers', 'hawala'],
    avatarSeed: 'sameer'
  },
  {
    id: 'crm-012',
    name: 'Waseem Akram',
    aliases: ['Waseem Koli', 'Waseem Boatman', 'W.A.'],
    aliasConfidence: 0.83,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Offshore Vessel Contact',
    cell: 'Maritime Logistics Wing',
    crimeType: 'Narcotics & Contraband',
    jurisdiction: 'Indian Coast Guard / Customs',
    secondaryJurisdictions: ['Maharashtra ATS'],
    riskScore: 0.85,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #09/2024 - Maritime Zones Act / NDPS (Yellow Gate PS)',
      'Coast Guard Intel Report #CG/W/882/2024'
    ],
    hardIdentifiers: {
      phone: '+91 99670-44910',
      imei: '354920048821004',
      vehicle: 'Fishing Trawler "Al-Rehman" (Reg: IND-MH-1-MM-892)',
      accounts: ['State Bank of India #...2291']
    },
    explainability: 'Pilots offshore mid-sea transfer vessels connecting international motherships in international waters with Salim Patel’s harbor dockers.',
    tags: ['maritime', 'trawler', 'mid-sea-transfers', 'coast-guard', 'yellow-gate'],
    avatarSeed: 'waseem'
  },

  // ==========================================
  // SYNDICATE 2: NCR Arms & Contract Extortion Ring
  // ==========================================
  {
    id: 'crm-013',
    name: 'Vikram Rathore',
    aliases: ['Vicky Gujjar', 'Vikram Fauji', 'Vicky Don', 'विक्रम'],
    aliasConfidence: 0.95,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Syndicate Leader / Contract Negotiator',
    cell: 'Command & Strategic Cell',
    crimeType: 'Arms Trafficking & Extortion',
    jurisdiction: 'Delhi Police Special Cell',
    secondaryJurisdictions: ['UP STF', 'Haryana STF'],
    riskScore: 0.97,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #390/2024 - MCOCA / Sec 386/307 IPC (Delhi Special Cell)',
      'FIR #112/2024 - Arms Act Sec 25(1AA) (Meerut Kotwali)',
      'FIR #49/2025 - IPC Sec 387/120B (Gurugram Crime Branch)'
    ],
    hardIdentifiers: {
      phone: '+91 98118-99021',
      imei: '864910049920194',
      vehicle: 'HR-26-DQ-0001 (Toyota Land Cruiser)',
      accounts: ['HDFC Bank #...1109', 'PNB #...7781']
    },
    explainability: 'Heads the most heavily armed contract gang in NCR. Procures factory-grade automatic carbines and pistol barrels from underground foundries in Western UP.',
    tags: ['gang-leader', 'extortion', 'arms', 'ncr', 'delhi-special-cell', 'mcoca'],
    avatarSeed: 'vikram'
  },
  {
    id: 'crm-014',
    name: 'Kuldeep Tyagi',
    aliases: ['Kuldeep Fauji', 'Tyagi Ji', 'K.T. Meerut'],
    aliasConfidence: 0.92,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Foundry & Weapons Production Head',
    cell: 'Clandestine Weapon Foundry',
    crimeType: 'Illegal Arms Manufacturing',
    jurisdiction: 'UP STF (Meerut Unit)',
    secondaryJurisdictions: ['Delhi Police Special Cell', 'Bihar Police STF'],
    riskScore: 0.93,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #288/2023 - Arms Act Sec 25/54/59 (Meerut STF)',
      'FIR #419/2024 - IPC Sec 120B / Explosives Act (Muzaffarnagar)'
    ],
    hardIdentifiers: {
      phone: '+91 97198-11209',
      imei: '358910048821901',
      vehicle: 'UP-15-CL-4419 (Mahindra Thar)',
      accounts: ['State Bank of India #...6621']
    },
    explainability: 'Runs underground weapons machining workshops producing replica 7.65mm and 9mm semi-automatic pistols. Direct supplier to D-West and Bishnoi-linked factions.',
    tags: ['arms-factory', 'up-stf', 'foundry', 'weapons', 'meerut'],
    avatarSeed: 'kuldeep'
  },
  {
    id: 'crm-015',
    name: 'Amit Sharma',
    aliases: ['Pandit Ji', 'Amit Shooter', 'Sharma Extortion'],
    aliasConfidence: 0.88,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Virtual Extortion Caller & Intimidator',
    cell: 'VoIP & Virtual Extortion Unit',
    crimeType: 'Extortion & Threat Calls',
    jurisdiction: 'Delhi Police Special Cell',
    secondaryJurisdictions: ['Rajasthan Police SOG'],
    riskScore: 0.88,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #145/2024 - IPC Sec 386/506 (New Delhi Crime Branch)',
      'FIR #209/2024 - Arms Act Sec 27 (Jaipur Crime Branch)'
    ],
    hardIdentifiers: {
      phone: '+1 (415) 882-9102 (VoIP spoofed) / +91 99100-33190',
      imei: '861092049921008',
      vehicle: 'DL-04-MC-9110 (Creta Dark Edition)',
      accounts: ['Yes Bank #...9902']
    },
    explainability: 'Places international VoIP threat calls demanding ransom from toll operators, builders, and jewelers across Delhi-NCR and Jaipur.',
    tags: ['voip', 'extortion', 'threats', 'ransom', 'delhi', 'special-cell'],
    avatarSeed: 'amit'
  },
  {
    id: 'crm-016',
    name: 'Rohit Nagar',
    aliases: ['Pahalwan', 'Rohit Gujjar', 'Nagar Bhai'],
    aliasConfidence: 0.85,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Safehouse & Logistics Custodian',
    cell: 'Safehouse & Mobility Cell',
    crimeType: 'Logistics & Harboring Criminals',
    jurisdiction: 'Haryana STF (Gurugram Unit)',
    secondaryJurisdictions: ['Delhi Police Special Cell'],
    riskScore: 0.81,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #330/2024 - IPC Sec 216 (Harboring Offender) (Gurugram)',
      'FIR #92/2025 - Arms Act Sec 25 (Faridabad Crime Branch)'
    ],
    hardIdentifiers: {
      phone: '+91 98120-77114',
      imei: '351980049921094',
      vehicle: 'HR-29-AW-8800 (Mahindra Scorpio)',
      accounts: ['Axis Bank #...4401']
    },
    explainability: 'Maintains 4 fortified farmhouses in Sohna and Greater Noida where shooters hide after firing outside targeted businessmen’s offices.',
    tags: ['safehouse', 'harboring', 'gurugram', 'haryana-stf', 'logistics'],
    avatarSeed: 'rohit'
  },
  {
    id: 'crm-017',
    name: 'Sunil Bhati',
    aliases: ['Sunil Khekra', 'Bhati Commando', 'S.K.'],
    aliasConfidence: 0.84,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Procurement Specialist (Munger Pipeline)',
    cell: 'Clandestine Weapon Foundry',
    crimeType: 'Arms Trafficking',
    jurisdiction: 'Bihar Police STF',
    secondaryJurisdictions: ['UP STF', 'Delhi Special Cell'],
    riskScore: 0.86,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #88/2024 - Arms Act Sec 25/26 (Munger Kotwali)',
      'FIR #310/2024 - IPC Sec 120B (Varanasi Cantt PS)'
    ],
    hardIdentifiers: {
      phone: '+91 94310-88192',
      imei: '864910047721099',
      vehicle: 'BR-01-PJ-4412 (Bolero Camper)',
      accounts: ['Central Bank of India #...3319']
    },
    explainability: 'Runs the Munger-to-NCR weapons corridor; transports machined pistol slides and trigger assemblies disguised inside agricultural machinery.',
    tags: ['munger-pipeline', 'bihar-stf', 'arms-courier', 'interstate-weapons'],
    avatarSeed: 'sunil'
  },
  {
    id: 'crm-018',
    name: 'Deepak Choudhary',
    aliases: ['Deepak Boxer', 'Choudhary Shooter', 'Boxer'],
    aliasConfidence: 0.91,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Execution Squad Operative',
    cell: 'Street Enforcement Cell',
    crimeType: 'Murder & Attempted Murder',
    jurisdiction: 'Delhi Police Special Cell',
    secondaryJurisdictions: ['Punjab Police AGTF'],
    riskScore: 0.94,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #401/2023 - Sec 302 IPC (Rohini Court Firing Case)',
      'FIR #88/2024 - Sec 307/34 IPC (Sonipat City PS)'
    ],
    hardIdentifiers: {
      phone: '+91 99119-00214',
      imei: '358910041120988',
      vehicle: 'DL-08-CS-7712 (KTM RC 390)',
      accounts: ['Cash Only']
    },
    explainability: 'Key executioner accused of 5 high-profile gangland hits. Connected directly to Tariq Merchant for overseas funding channels.',
    tags: ['shooter', 'contract-hit', 'delhi-special-cell', 'rohini', 'murder'],
    avatarSeed: 'deepak'
  },
  {
    id: 'crm-019',
    name: 'Manoj Baisla',
    aliases: ['Manoj Contractor', 'Baisla Builder', 'M.B.'],
    aliasConfidence: 0.83,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Extortion Collection & Front Broker',
    cell: 'Command & Strategic Cell',
    crimeType: 'Extortion & Money Laundering',
    jurisdiction: 'Noida Police Commissionerate',
    secondaryJurisdictions: ['Delhi Police Special Cell'],
    riskScore: 0.82,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #211/2024 - Gangster Act / Sec 386 IPC (Noida Sector 20)',
      'FIR #99/2025 - IPC 506 (Greater Noida)'
    ],
    hardIdentifiers: {
      phone: '+91 98101-44919',
      imei: '861092047712004',
      vehicle: 'UP-16-AX-0099 (Audi Q7)',
      accounts: ['HDFC Bank #...6621', 'ICICI Bank #...8810']
    },
    explainability: 'Collects extortion protection money masked as sand mining and commercial transport contracts in Greater Noida.',
    tags: ['gangster-act', 'extortion-front', 'noida', 'protection-money'],
    avatarSeed: 'manoj'
  },
  {
    id: 'crm-020',
    name: 'Sanjeev Pradhan',
    aliases: ['Pradhan Ji', 'Sanjeev Bulandshahr', 'S.P.'],
    aliasConfidence: 0.86,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Ammunition & Explosives Sourcing',
    cell: 'Clandestine Weapon Foundry',
    crimeType: 'Arms & Explosives Trafficking',
    jurisdiction: 'UP STF',
    secondaryJurisdictions: ['Delhi Police Special Cell'],
    riskScore: 0.87,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #399/2024 - Explosives Act Sec 4/5 (Bulandshahr STF)',
      'FIR #120/2025 - Arms Act Sec 25 (Aligarh)'
    ],
    hardIdentifiers: {
      phone: '+91 97190-88129',
      imei: '351980047712901',
      vehicle: 'UP-13-W-9912 (Mahindra Bolero)',
      accounts: ['Syndicate Bank #...1190']
    },
    explainability: 'Diverts commercial ammonium nitrate and factory ammunition boxes from stone quarry licenses to Kuldeep Tyagi’s cache.',
    tags: ['explosives', 'ammunition', 'up-stf', 'quarry-diversion'],
    avatarSeed: 'sanjeev'
  },
  {
    id: 'crm-021',
    name: 'Naveen Kasana',
    aliases: ['Naveen Khekra', 'Kasana Shooter', 'K.N.'],
    aliasConfidence: 0.79,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Surveillance & Target Reconnaissance',
    cell: 'Street Enforcement Cell',
    crimeType: 'Extortion & Stalking',
    jurisdiction: 'Delhi Police Crime Branch',
    secondaryJurisdictions: ['Haryana Police'],
    riskScore: 0.77,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #178/2024 - IPC Sec 387/120B (Pitampura PS)',
      'FIR #44/2025 - IPC 506 (Faridabad)'
    ],
    hardIdentifiers: {
      phone: '+91 99110-55412',
      imei: '864910043321900',
      vehicle: 'DL-09-SF-4410 (Swift Dzire)',
      accounts: ['Paytm Payments Bank #...4419']
    },
    explainability: 'Tracks daily movements of extortion targets; installs GPS magnetic trackers under victims’ luxury cars.',
    tags: ['reconnaissance', 'gps-tracking', 'delhi-crime-branch', 'surveillance'],
    avatarSeed: 'naveen'
  },
  {
    id: 'crm-022',
    name: 'Harish Tomar',
    aliases: ['Harish Baghpat', 'Tomar Ji', 'H.T.'],
    aliasConfidence: 0.82,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Interstate Transport Driver',
    cell: 'Safehouse & Mobility Cell',
    crimeType: 'Arms Trafficking',
    jurisdiction: 'UP STF',
    secondaryJurisdictions: ['Delhi Police Special Cell'],
    riskScore: 0.76,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #304/2024 - Arms Act Sec 25 (Baghpat Kotwali)',
      'FIR #88/2025 - IPC 411 (Stolen Property) (Delhi)'
    ],
    hardIdentifiers: {
      phone: '+91 97191-33190',
      imei: '358910045521094',
      vehicle: 'UP-17-T-0044 (Eicher Truck)',
      accounts: ['Canara Bank #...8812']
    },
    explainability: 'Transports hidden false-bottom ammunition consignments inside vegetable crates from Western UP into Delhi sabzi mandis.',
    tags: ['courier', 'transport', 'false-bottom', 'baghpat', 'arms-transit'],
    avatarSeed: 'harish'
  },

  // ==========================================
  // SYNDICATE 3: Cyber Nexus & Mule Banking Ring
  // ==========================================
  {
    id: 'crm-023',
    name: 'David Chen',
    aliases: ['Master Crypto', 'Chen Bhai', 'Dragon_Zero', '0xDavid'],
    aliasConfidence: 0.94,
    syndicate: 'Cyber Nexus & Mule Banking Syndicate',
    role: 'Darknet Crypto Mixer & Laundering Architect',
    cell: 'Blockchain Obfuscation Cell',
    crimeType: 'Cyber Crime & Crypto Laundering',
    jurisdiction: 'National Cyber Crime Coordination Centre (I4C)',
    secondaryJurisdictions: ['Bengaluru Cyber CID', 'Delhi Special Cell IFSO'],
    riskScore: 0.96,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #112/2024 - IT Act 66C/66D / IPC 420 (IFSO Special Cell)',
      'Cyber FIR #882/2024 (Bengaluru Cyber CID)',
      'PMLA Inquiry #ECIR/09/2025 (ED Cyber Wing)'
    ],
    hardIdentifiers: {
      phone: '+852 9102-4419 (Signal) / +91 99000-88129',
      imei: '351980041129001',
      vehicle: 'KA-01-MG-9900 (BMW M340i)',
      accounts: ['Tether TRC-20: TXYZ...9921b', 'WazirX KYC: DCHEN...901']
    },
    explainability: 'Runs automated cross-chain crypto mixers laundering stolen cyber scam proceeds for D-West hawala brokers and Jamtara phishing syndicates.',
    tags: ['crypto-mixer', 'darknet', 'ifso', 'i4c', 'cyber-fraud', 'tether'],
    avatarSeed: 'david'
  },
  {
    id: 'crm-024',
    name: 'Rohit Verma',
    aliases: ['Mule King', 'Rohit Jamtara', 'RV Accounts'],
    aliasConfidence: 0.90,
    syndicate: 'Cyber Nexus & Mule Banking Syndicate',
    role: 'Pan-India Mule Bank Account Broker',
    cell: 'Mule Account Harvest & Siphon Unit',
    crimeType: 'Financial Cyber Fraud',
    jurisdiction: 'Jamtara Cyber Police',
    secondaryJurisdictions: ['Maharashtra Cyber Cell', 'Gujarat Cyber Cell'],
    riskScore: 0.91,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #304/2024 - IT Act 66D / IPC 420/467 (Jamtara Cyber PS)',
      'FIR #512/2024 - Sec 120B/471 IPC (Cyber Cell Pune)'
    ],
    hardIdentifiers: {
      phone: '+91 93340-99210',
      imei: '864910041129094',
      vehicle: 'JH-10-BX-4411 (Mahindra Scorpio S11)',
      accounts: ['Over 1,200 Corrugated Current Accounts across HDFC/ICICI']
    },
    explainability: 'Purchases dormant Jan Dhan and student bank accounts for ₹15,000 each; routes ₹35 Lakhs daily from investment fraud apps.',
    tags: ['mule-accounts', 'jamtara', 'jan-dhan', 'cyber-fraud', 'phishing'],
    avatarSeed: 'rohitv'
  },
  {
    id: 'crm-025',
    name: 'Pooja Roy',
    aliases: ['Pooja Ma\'am', 'Pooja CallCenter', 'Neha Sharma', 'पूजा'],
    aliasConfidence: 0.89,
    syndicate: 'Cyber Nexus & Mule Banking Syndicate',
    role: 'Illegal Call Center Floor Operator',
    cell: 'Social Engineering & Phishing Hub',
    crimeType: 'Digital Arrest & Tech Support Fraud',
    jurisdiction: 'Kolkata Cyber Police',
    secondaryJurisdictions: ['Delhi Police IFSO', 'Noida Cyber Cell'],
    riskScore: 0.85,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #221/2024 - IT Act Sec 66 / IPC 419/420 (Salt Lake Sector V)',
      'FIR #709/2024 - IPC Sec 384/420 (Noida Cyber PS)'
    ],
    hardIdentifiers: {
      phone: '+91 98310-77192',
      imei: '358910049920119',
      vehicle: 'WB-02-AK-3301 (Tata Nexon EV)',
      accounts: ['Bandhan Bank #...4401', 'Axis Bank #...9912']
    },
    explainability: 'Supervised 60 tele-callers impersonating CBI/ED officers in fake "Digital Arrest" scams defrauding senior citizens across India.',
    tags: ['digital-arrest', 'call-center', 'social-engineering', 'phishing', 'kolkata'],
    avatarSeed: 'pooja'
  },
  {
    id: 'crm-026',
    name: 'Ankit Bansal',
    aliases: ['Crypto Bansal', 'A.B. OTC', 'Bansal P2P'],
    aliasConfidence: 0.87,
    syndicate: 'Cyber Nexus & Mule Banking Syndicate',
    role: 'P2P Crypto Cash Exchange Desk',
    cell: 'Blockchain Obfuscation Cell',
    crimeType: 'Crypto Laundering & Tax Evasion',
    jurisdiction: 'Bengaluru Cyber Crime Police',
    secondaryJurisdictions: ['Delhi Police Special Cell'],
    riskScore: 0.86,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #194/2024 - IT Act 66D / IPC 420 (Bengaluru Central CID)',
      'FIR #88/2025 - PMLA Notice (ED Bengaluru Sub-Zonal)'
    ],
    hardIdentifiers: {
      phone: '+91 98450-33129',
      imei: '861092045521990',
      vehicle: 'KA-05-NB-7788 (Kia Seltos)',
      accounts: ['Binance P2P UID: 9918204', 'Kotak Mahindra #...5510']
    },
    explainability: 'Converts cash collected by Rohit Verma’s mules into USDT on Binance P2P and transfers directly to David Chen’s cold wallets.',
    tags: ['crypto-otc', 'p2p', 'usdt', 'binance', 'bengaluru', 'cyber-laundering'],
    avatarSeed: 'ankit'
  },
  {
    id: 'crm-027',
    name: 'Karan Mehra',
    aliases: ['Karan APK', 'Malware Karan', 'K.M.'],
    aliasConfidence: 0.83,
    syndicate: 'Cyber Nexus & Mule Banking Syndicate',
    role: 'Trojan & Phishing APK Developer',
    cell: 'Technical Tooling & Malware Lab',
    crimeType: 'Malware Development & Cyber Espionage',
    jurisdiction: 'National Cyber Crime Coordination Centre (I4C)',
    secondaryJurisdictions: ['Haryana Cyber Police'],
    riskScore: 0.88,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #92/2024 - IT Act 43/66/66D (Gurugram Cyber PS)',
      'CERT-In Incident Advisory #CI-2024-0919'
    ],
    hardIdentifiers: {
      phone: '+91 98100-22199',
      imei: '352910047712099',
      vehicle: 'HR-26-ED-4411 (Skoda Slavia)',
      accounts: ['GitHub handle: k-mehra-dev', 'HDFC Bank #...2201']
    },
    explainability: 'Codes malicious Android SMS-forwarding APKs disguised as bank electricity bill payment utilities to intercept OTPs.',
    tags: ['malware', 'android-trojan', 'sms-forwarder', 'otp-theft', 'i4c'],
    avatarSeed: 'karan'
  },
  {
    id: 'crm-028',
    name: 'Suresh Mondal',
    aliases: ['Suresh SIM Jamtara', 'Mondal Telecom', 'S.M.'],
    aliasConfidence: 0.81,
    syndicate: 'Cyber Nexus & Mule Banking Syndicate',
    role: 'Pre-Activated POS SIM Supplier',
    cell: 'Mule Account Harvest & Siphon Unit',
    crimeType: 'Telecom Fraud & Identity Forgery',
    jurisdiction: 'Jharkhand Police Special Branch',
    secondaryJurisdictions: ['West Bengal CID'],
    riskScore: 0.79,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #145/2024 - IPC Sec 468/471 (Giridih Cyber PS)',
      'DoT Disconnection Order #DOT/JH/992/2024'
    ],
    hardIdentifiers: {
      phone: '+91 94311-99210',
      imei: '864910041120448',
      vehicle: 'JH-11-AC-2211 (Hero Glamour)',
      accounts: ['State Bank of India #...8819']
    },
    explainability: 'Fraudulently activated 2,500+ SIM cards using biometrics of rural villagers during fake subsidized ration distribution camps.',
    tags: ['sim-fraud', 'biometric-theft', 'jamtara', 'jharkhand', 'telecom'],
    avatarSeed: 'sureshm'
  },
  {
    id: 'crm-029',
    name: 'Manish Tiwari',
    aliases: ['Tiwari ATM', 'Cashout Manish', 'M.T.'],
    aliasConfidence: 0.82,
    syndicate: 'Cyber Nexus & Mule Banking Syndicate',
    role: 'ATM Cashout & Withdrawal Coordinator',
    cell: 'Mule Account Harvest & Siphon Unit',
    crimeType: 'ATM Fraud & Cash Siphoning',
    jurisdiction: 'Delhi Police Cyber Cell',
    secondaryJurisdictions: ['UP Police Cyber Crime'],
    riskScore: 0.80,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #390/2024 - IPC Sec 420/120B (Dwarka Cyber PS)',
      'FIR #118/2025 - IPC 411 (Noida Sector 58)'
    ],
    hardIdentifiers: {
      phone: '+91 99109-88120',
      imei: '358910042219001',
      vehicle: 'DL-04-NA-9912 (Maruti Brezza)',
      accounts: ['Over 40 ATM Debit Cards Seized']
    },
    explainability: 'Manages masked withdrawal runners who empty mule accounts at off-highway ATMs within 10 minutes of fraud victim deposits.',
    tags: ['atm-cashout', 'withdrawal-runner', 'cyber-theft', 'dwarka'],
    avatarSeed: 'manisht'
  },
  {
    id: 'crm-030',
    name: 'Neha Kapoor',
    aliases: ['Neha Script', 'Script Lead', 'N.K.'],
    aliasConfidence: 0.84,
    syndicate: 'Cyber Nexus & Mule Banking Syndicate',
    role: 'Scam Scriptwriter & Language Specialist',
    cell: 'Social Engineering & Phishing Hub',
    crimeType: 'Social Engineering',
    jurisdiction: 'Noida Police Commissionerate',
    secondaryJurisdictions: ['Delhi Police IFSO'],
    riskScore: 0.76,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #180/2024 - IPC Sec 420/120B (Noida Sector 62 Cyber)',
      'FIR #49/2025 - IT Act Sec 66D (Delhi Crime Branch)'
    ],
    hardIdentifiers: {
      phone: '+91 98110-66129',
      imei: '861092046612900',
      vehicle: 'UP-16-BX-1100 (Honda Amaze)',
      accounts: ['ICICI Bank #...3319']
    },
    explainability: 'Drafts psychological manipulation scripts for romance investment fraud, fake FedEx customs parcel traps, and task scams.',
    tags: ['scriptwriter', 'social-engineering', 'phishing-scripts', 'noida'],
    avatarSeed: 'nehak'
  },

  // ==========================================
  // SYNDICATE 4: Coastal Seaborne Contraband Syndicate
  // ==========================================
  {
    id: 'crm-031',
    name: 'Ismail Koli',
    aliases: ['Captain Ismail', 'Ismail Machhimar', 'Bada Koli', 'इस्माइल'],
    aliasConfidence: 0.93,
    syndicate: 'Coastal Seaborne Contraband Syndicate',
    role: 'Seaborne Navigation Master / Dhow Fleet Owner',
    cell: 'Offshore Maritime Transport Cell',
    crimeType: 'Contraband & Maritime Smuggling',
    jurisdiction: 'Gujarat Police Marine Task Force',
    secondaryJurisdictions: ['Indian Coast Guard', 'DRI Jamnagar'],
    riskScore: 0.94,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #18/2024 - Customs Act / Passport Act (Okha Marine PS)',
      'Coast Guard Seizure Report #CG/NW/331/2024',
      'FIR #88/2025 - NDPS Act Sec 21/29 (Porbandar Crime Branch)'
    ],
    hardIdentifiers: {
      phone: '+91 98250-99120 (Satellite Thuraya #88216...99)',
      imei: '864910048810294',
      vehicle: 'Dhow "Safina-e-Kutch" (Reg: IND-GJ-01-MM-449)',
      accounts: ['Bank of Baroda Mandvi #...1102']
    },
    explainability: 'Master mariner commanding 8 diesel dhows navigating without AIS beacons across Makran coast to Gujarat creeks with high-value consignments.',
    tags: ['maritime', 'dhow', 'kutch', 'coast-guard', 'satellite-phone', 'dri'],
    avatarSeed: 'ismail'
  },
  {
    id: 'crm-032',
    name: 'Jignesh Patel',
    aliases: ['Jignesh Custom', 'Jiggo Fixer', 'J.P. Kandla'],
    aliasConfidence: 0.88,
    syndicate: 'Coastal Seaborne Contraband Syndicate',
    role: 'Port Clearing & Agency Liaison',
    cell: 'Harbor Documentation & Clearance',
    crimeType: 'Customs Forgery & Duty Evasion',
    jurisdiction: 'Customs & Central Excise (Kandla)',
    secondaryJurisdictions: ['CBI Anti-Corruption Branch (Gandhinagar)'],
    riskScore: 0.89,
    riskLevel: 'CRITICAL',
    firRecords: [
      'RC 029/2024/CBI/GNR - Prevention of Corruption Act Sec 7/13',
      'DRI SCN #DRI/AZU/19/2024 (DRI Mundra)'
    ],
    hardIdentifiers: {
      phone: '+91 98240-44919',
      imei: '351980049920192',
      vehicle: 'GJ-12-BF-0010 (Toyota Fortuner)',
      accounts: ['Axis Bank Gandhidham #...8812', 'SBI #...4419']
    },
    explainability: 'Corrupt customs clearing agent at Kandla & Mundra; fabricates fraudulent bill-of-lading documents misdeclaring cargo as industrial gypsum.',
    tags: ['customs-clearing', 'mundra', 'kandla', 'cbi', 'forgery', 'port'],
    avatarSeed: 'jignesh'
  },
  {
    id: 'crm-033',
    name: 'Bhupat Solanki',
    aliases: ['Bhupat Diu', 'Solanki Koli', 'Bhupat Dada'],
    aliasConfidence: 0.86,
    syndicate: 'Coastal Seaborne Contraband Syndicate',
    role: 'Coastal Landing Point Coordinator',
    cell: 'Creek Landing & Inshore Transport',
    crimeType: 'Contraband Landing & Bootlegging',
    jurisdiction: 'Gujarat Police CID (Crime)',
    secondaryJurisdictions: ['Diu & Daman Police'],
    riskScore: 0.83,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #72/2024 - Bombay Prohibition Act / Sec 120B IPC (Una PS)',
      'FIR #119/2024 - Customs Act Sec 135 (Diu Coastal PS)'
    ],
    hardIdentifiers: {
      phone: '+91 98981-22904',
      imei: '861092043321909',
      vehicle: 'GJ-11-AC-9900 (Mahindra Scorpio)',
      accounts: ['Dena Bank / BoB #...9901']
    },
    explainability: 'Manages light-off boat transfers at unmanned rocky coves between Diu and Veraval, loading cargo onto trucks within 12 minutes.',
    tags: ['coastal-landing', 'veraval', 'diu', 'customs', 'inshore'],
    avatarSeed: 'bhupat'
  },
  {
    id: 'crm-034',
    name: 'Yusuf Memon',
    aliases: ['Yusuf Gold', 'Memon Bullion', 'Y.M. Surat'],
    aliasConfidence: 0.90,
    syndicate: 'Coastal Seaborne Contraband Syndicate',
    role: 'Smuggled Bullion & Gold Smelting Broker',
    cell: 'Bullion Smelting & Market Distribution',
    crimeType: 'Gold Smuggling & Hawala',
    jurisdiction: 'DRI Surat Sub-Zonal',
    secondaryJurisdictions: ['Gujarat Police Crime Branch'],
    riskScore: 0.87,
    riskLevel: 'HIGH',
    firRecords: [
      'DRI/SRT/GOLD/04/2024 - Customs Act Sec 112/135',
      'FIR #290/2024 - IPC Sec 420/468 (Mahidharpura PS Surat)'
    ],
    hardIdentifiers: {
      phone: '+91 98251-88902',
      imei: '358910041129481',
      vehicle: 'GJ-05-CR-7722 (BMW 3 Series)',
      accounts: ['HDFC Bank Surat #...5519', 'ICICI #...1029']
    },
    explainability: 'Melts foreign-origin stamped gold bars into local jeweler scrap without serial markings in clandestine furnace facilities in Surat.',
    tags: ['gold-smuggling', 'bullion', 'surat', 'dri', 'smelting'],
    avatarSeed: 'yusuf'
  },
  {
    id: 'crm-035',
    name: 'Razak Baloch',
    aliases: ['Razak Makrani', 'Balochi', 'R.B.'],
    aliasConfidence: 0.92,
    syndicate: 'Coastal Seaborne Contraband Syndicate',
    role: 'Transnational Mid-Sea Supplier Liaison',
    cell: 'Offshore Maritime Transport Cell',
    crimeType: 'International Narcotics Trafficking',
    jurisdiction: 'Narcotics Control Bureau (NCB Operations)',
    secondaryJurisdictions: ['Gujarat ATS'],
    riskScore: 0.95,
    riskLevel: 'CRITICAL',
    firRecords: [
      'NCB Op Case #02/NCB/HQ/2024 (International Maritime Interdiction)',
      'FIR #101/2024 - NDPS / Maritime Zones Act (Porbandar)'
    ],
    hardIdentifiers: {
      phone: '+882 16-9902194 (Iridium Sat-Phone)',
      imei: '351980048821990',
      vehicle: 'Offshore Trawler "Al-Saeed" (Unflagged)',
      accounts: ['Cash & Hawala Direct']
    },
    explainability: 'Coordinates international offshore motherships waiting outside India’s 200 nautical mile EEZ to drop GPS-tagged buoy packages for Ismail Koli.',
    tags: ['international-waters', 'ncb', 'satellite-phone', 'iridium', 'mothership'],
    avatarSeed: 'razak'
  },
  {
    id: 'crm-036',
    name: 'Mansukh Chudasama',
    aliases: ['Mansukh Truck', 'Kutch Carrier', 'M.C.'],
    aliasConfidence: 0.80,
    syndicate: 'Coastal Seaborne Contraband Syndicate',
    role: 'Heavy Inshore Fleet Transporter',
    cell: 'Creek Landing & Inshore Transport',
    crimeType: 'Contraband Transit & Concealment',
    jurisdiction: 'Gujarat Police Border Range',
    secondaryJurisdictions: ['Rajasthan Police'],
    riskScore: 0.77,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #192/2024 - Customs Act Sec 135 (Gandhidham Marine)',
      'FIR #66/2025 - IPC 120B (Sanchore Police)'
    ],
    hardIdentifiers: {
      phone: '+91 94260-88129',
      imei: '864910042219003',
      vehicle: 'GJ-12-Y-8819 (10-Tyre Ashok Leyland Truck)',
      accounts: ['State Bank of India #...3319']
    },
    explainability: 'Runs modified salt transportation trucks with sealed false ceilings moving smuggled cargo from Kutch into Rajasthan and Delhi.',
    tags: ['truck-transit', 'salt-trucks', 'kutch', 'rajasthan-border'],
    avatarSeed: 'mansukh'
  },
  {
    id: 'crm-037',
    name: 'Devraj Gadhvi',
    aliases: ['Devu Bhai', 'Gadhvi Smuggler', 'D.G.'],
    aliasConfidence: 0.83,
    syndicate: 'Coastal Seaborne Contraband Syndicate',
    role: 'Coastal Creeks Navigator',
    cell: 'Offshore Maritime Transport Cell',
    crimeType: 'Navigation & Creek Smuggling',
    jurisdiction: 'Gujarat ATS',
    secondaryJurisdictions: ['BSF Water Wing'],
    riskScore: 0.81,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #49/2024 - Indian Forest Act / Customs (Kori Creek)',
      'FIR #112/2024 - Passport Entry into India Act (Lakhpat PS)'
    ],
    hardIdentifiers: {
      phone: '+91 97270-44120',
      imei: '358910043321908',
      vehicle: 'FRP Speedboat (Mercury Twin 200HP Outboard)',
      accounts: ['Dena Bank #...2201']
    },
    explainability: 'Specialist in low-tide shallow mudflats navigation across Sir Creek and Kori Creek where conventional coastal patrol craft run aground.',
    tags: ['creek-navigation', 'kori-creek', 'bsf-water-wing', 'gujarat-ats'],
    avatarSeed: 'devraj'
  },
  {
    id: 'crm-038',
    name: 'Pratapsinh Jadeja',
    aliases: ['Darbar', 'Pratap Mandvi', 'P.J.'],
    aliasConfidence: 0.85,
    syndicate: 'Coastal Seaborne Contraband Syndicate',
    role: 'Coastal Warehouse & Security Chief',
    cell: 'Harbor Documentation & Clearance',
    crimeType: 'Harboring & Armed Security',
    jurisdiction: 'Gujarat Police (Kutch West)',
    secondaryJurisdictions: ['Gujarat ATS'],
    riskScore: 0.82,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #188/2024 - Arms Act Sec 25 (Mandvi PS)',
      'FIR #330/2024 - IPC Sec 384/506 (Bhuj Town PS)'
    ],
    hardIdentifiers: {
      phone: '+91 98252-11099',
      imei: '861092041129004',
      vehicle: 'GJ-12-CA-0009 (Mahindra Scorpio-N)',
      accounts: ['Bank of India #...8812']
    },
    explainability: 'Maintains armed sentries at isolated beachside salt-works warehouses where offloaded contraband is stored before truck dispatch.',
    tags: ['armed-warehouse', 'mandvi', 'security', 'salt-works'],
    avatarSeed: 'pratapsinh'
  },

  // ==========================================
  // SYNDICATE 5: Interstate Vehicle & Fake Currency Nexus
  // ==========================================
  {
    id: 'crm-039',
    name: 'Harpreet Singh Dhillon',
    aliases: ['Harry Dhillon', 'Harry Chassis', 'Harpreet Punjab', 'हरप्रीत'],
    aliasConfidence: 0.95,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'Interstate Stolen Luxury Vehicle Kingpin',
    cell: 'Vehicle Theft & VIN Tampering Hub',
    crimeType: 'Auto Theft & Organized Racket',
    jurisdiction: 'Punjab Police AGTF',
    secondaryJurisdictions: ['Delhi Police Special Cell', 'Haryana Police STF'],
    riskScore: 0.93,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #298/2024 - IPC Sec 379/411/420/467/120B (Amritsar Special Cell)',
      'FIR #410/2024 - IPC Sec 468/471 (Delhi Crime Branch Auto Theft Squad)',
      'FIR #88/2025 - Gangster Act (Mohali State Crime)'
    ],
    hardIdentifiers: {
      phone: '+91 98720-99014',
      imei: '864910049921048',
      vehicle: 'PB-02-CP-0001 (Toyota Fortuner Legender)',
      accounts: ['HDFC Bank Amritsar #...4419', 'Canara Bank #...8810']
    },
    explainability: 'Steals high-end SUVs in Delhi-NCR using electronic scanner programmers; fits them with engine numbers of totaled insurance vehicles and resells in Punjab.',
    tags: ['auto-theft', 'chassis-tampering', 'punjab-agtf', 'delhi-auto-theft', 'gangster-act'],
    avatarSeed: 'harpreet'
  },
  {
    id: 'crm-040',
    name: 'Santosh Mondal',
    aliases: ['Santosh FICN', 'Santosh Malda', 'Mondal Babu', 'संतोष'],
    aliasConfidence: 0.91,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'Cross-Border FICN Carrier & Distributor',
    cell: 'Fake Indian Currency (FICN) Network',
    crimeType: 'Counterfeit Currency (FICN) & NIA Case',
    jurisdiction: 'National Investigation Agency (NIA)',
    secondaryJurisdictions: ['West Bengal Police STF', 'Bihar Police STF'],
    riskScore: 0.94,
    riskLevel: 'CRITICAL',
    firRecords: [
      'NIA Case #RC-14/2024/NIA/DLI - IPC Sec 489B/489C / UAPA Sec 16',
      'FIR #220/2024 - IPC 489B (Malda English Bazar PS)',
      'FIR #99/2025 - IPC 489C (Patna Kotwali)'
    ],
    hardIdentifiers: {
      phone: '+91 97330-88129',
      imei: '351980047712048',
      vehicle: 'WB-74-V-9901 (Bolero Maxi Truck)',
      accounts: ['Over ₹48 Lakhs Face Value Counterfeit 500-rupee Notes Seized']
    },
    explainability: 'High-value courier smuggling optical-variable ink fake ₹500 currency across porous border points in Malda for distribution into Delhi and UP.',
    tags: ['ficn', 'counterfeit', 'nia', 'uapa', 'malda', 'fake-currency'],
    avatarSeed: 'santosh'
  },
  {
    id: 'crm-041',
    name: 'Vicky Verma',
    aliases: ['Vicky Chassis', 'Verma Mechanic', 'V.V. Meerut'],
    aliasConfidence: 0.88,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'Master VIN & Chassis Re-Etching Machinist',
    cell: 'Vehicle Theft & VIN Tampering Hub',
    crimeType: 'Auto Theft & Document Forgery',
    jurisdiction: 'UP Police (Meerut Sotiganj)',
    secondaryJurisdictions: ['Delhi Police Special Cell'],
    riskScore: 0.86,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #199/2024 - IPC Sec 420/468/471 (Meerut Cantt PS)',
      'FIR #380/2024 - IPC Sec 411/34 (Delhi Cantt PS)'
    ],
    hardIdentifiers: {
      phone: '+91 98370-44109',
      imei: '861092048821094',
      vehicle: 'UP-15-BD-3301 (Hyundai i20)',
      accounts: ['Punjab National Bank #...5519']
    },
    explainability: 'Laser re-etches chassis numbers and alters engine ECU firmware for Harpreet Dhillon’s stolen fleet; links directly to Vikram Rathore’s NCR gang.',
    tags: ['sotiganj', 'chassis-etching', 'ecu-flashing', 'auto-racket', 'meerut'],
    avatarSeed: 'vickyv'
  },
  {
    id: 'crm-042',
    name: 'Gurpreet Brar',
    aliases: ['Gopi Brar', 'Gopi Shooter', 'G.B. Moga'],
    aliasConfidence: 0.90,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'Gangland Vehicle Armed Escort',
    cell: 'Vehicle Theft & VIN Tampering Hub',
    crimeType: 'Armed Escort & Arms Act',
    jurisdiction: 'Punjab Police AGTF',
    secondaryJurisdictions: ['Haryana Police STF'],
    riskScore: 0.89,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #112/2024 - Arms Act Sec 25 / IPC 307 (Moga City PS)',
      'FIR #401/2024 - Gangster Act (Ludhiana Crime Branch)'
    ],
    hardIdentifiers: {
      phone: '+91 98880-11294',
      imei: '358910041120481',
      vehicle: 'PB-10-DF-4400 (Mahindra Scorpio Classic)',
      accounts: ['State Bank of India #...9912']
    },
    explainability: 'Provides armed convoy protection for transit runs moving stolen luxury vehicles and FICN consignments across interstate highways.',
    tags: ['armed-escort', 'agtf', 'punjab-police', 'gangster', 'arms'],
    avatarSeed: 'gurpreet'
  },
  {
    id: 'crm-043',
    name: 'Prabhat Mondal',
    aliases: ['Prabhat Courier', 'Chhotu Malda', 'P.M.'],
    aliasConfidence: 0.82,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'Interstate Train Passenger Courier',
    cell: 'Fake Indian Currency (FICN) Network',
    crimeType: 'Counterfeit Currency Circulation',
    jurisdiction: 'Government Railway Police (GRP Howrah)',
    secondaryJurisdictions: ['Delhi Police Crime Branch'],
    riskScore: 0.80,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #88/2024 - IPC 489B/489C (GRP Howrah PS)',
      'FIR #140/2025 - IPC 489C (Old Delhi Railway PS)'
    ],
    hardIdentifiers: {
      phone: '+91 97340-22194',
      imei: '864910048821004',
      vehicle: 'Train Transits (Kalka Mail / Poorva Express)',
      accounts: ['Post Office Savings #...9910']
    },
    explainability: 'Transports packets of fake currency hidden inside heavy winter quilts and battery compartments of electronics across major train trunks.',
    tags: ['grp', 'railway-smuggling', 'ficn', 'courier', 'malda-delhi'],
    avatarSeed: 'prabhat'
  },
  {
    id: 'crm-044',
    name: 'Balwinder Sandhu',
    aliases: ['Balli Toll', 'Sandhu Transporter', 'B.S.'],
    aliasConfidence: 0.84,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'Toll Plaza & FastTag Pass Bypass Specialist',
    cell: 'Vehicle Theft & VIN Tampering Hub',
    crimeType: 'Auto Theft & Document Forgery',
    jurisdiction: 'Haryana Police (Ambala Range)',
    secondaryJurisdictions: ['Punjab Police'],
    riskScore: 0.78,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #190/2024 - IPC Sec 420/468 (Shambhu Barrier PS)',
      'FIR #33/2025 - Motor Vehicles Act Sec 192A (Ludhiana)'
    ],
    hardIdentifiers: {
      phone: '+91 98140-55129',
      imei: '352910049920119',
      vehicle: 'PB-11-AC-7711 (Recovery Crane Truck)',
      accounts: ['Axis Bank #...2201']
    },
    explainability: 'Clones VIP highway passes and government fastags so stolen SUVs bypass automated police ANPR (Automatic Number Plate Recognition) cameras.',
    tags: ['fastag-cloning', 'anpr-evasion', 'toll-bypass', 'haryana-police'],
    avatarSeed: 'balwinder'
  },
  {
    id: 'crm-045',
    name: 'Rafiqul Islam',
    aliases: ['Rafiq Border', 'Islam Dada', 'R.I. Kaliachak'],
    aliasConfidence: 0.87,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'Border Procurement & Exchange Point Lead',
    cell: 'Fake Indian Currency (FICN) Network',
    crimeType: 'Cross-Border FICN & Smuggling',
    jurisdiction: 'BSF South Bengal Frontier',
    secondaryJurisdictions: ['NIA Kolkata Branch'],
    riskScore: 0.90,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #312/2024 - IPC Sec 489B/120B (Kaliachak PS)',
      'BSF Apprehension Dossier #BSF/SB/FICN/89/2024'
    ],
    hardIdentifiers: {
      phone: '+91 97350-11029',
      imei: '861092044421094',
      vehicle: 'WB-66-E-2200 (Mahindra Bolero)',
      accounts: ['Direct Cash Handover']
    },
    explainability: 'Direct receiver of international counterfeit currency drops at Kaliachak border; supplies Santosh Mondal and interstate distribution networks.',
    tags: ['kaliachak', 'bsf', 'border-drops', 'ficn', 'nia'],
    avatarSeed: 'rafiqul'
  },
  {
    id: 'crm-046',
    name: 'Satnam Kahlon',
    aliases: ['Satta Dhaba', 'Kahlon Ji', 'S.K.'],
    aliasConfidence: 0.81,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'Highway Dhaba Stash House Operator',
    cell: 'Vehicle Theft & VIN Tampering Hub',
    crimeType: 'Harboring Stolen Goods',
    jurisdiction: 'Punjab Police (Jalandhar Rural)',
    secondaryJurisdictions: ['Haryana Police'],
    riskScore: 0.77,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #145/2024 - IPC Sec 411/413 (Habitual Receiver) (Phillaur PS)',
      'FIR #92/2025 - IPC 120B (GT Road Special Drive)'
    ],
    hardIdentifiers: {
      phone: '+91 98760-44910',
      imei: '351980041129990',
      vehicle: 'PB-08-AU-9912 (Swift)',
      accounts: ['State Bank of India #...6612']
    },
    explainability: 'Runs a high-traffic highway truck dhaba on NH-44 near Phillaur with an underground parking facility concealing stolen vehicles for 48 hours.',
    tags: ['highway-dhaba', 'nh44', 'stash-house', 'jalandhar-rural'],
    avatarSeed: 'satnam'
  },
  {
    id: 'crm-047',
    name: 'Ajay Sharma',
    aliases: ['Ajay RTO', 'Sharma Agent', 'A.S. Forger'],
    aliasConfidence: 0.85,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'RTO Document & NOC Forger',
    cell: 'Vehicle Theft & VIN Tampering Hub',
    crimeType: 'Forgery & Government Record Tampering',
    jurisdiction: 'Delhi Police Crime Branch',
    secondaryJurisdictions: ['Haryana Police'],
    riskScore: 0.82,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #299/2024 - IPC Sec 420/467/468/471 (Sarita Vihar PS)',
      'FIR #61/2025 - Prevention of Corruption Act (Janakpuri RTO Drive)'
    ],
    hardIdentifiers: {
      phone: '+91 98119-33201',
      imei: '864910046621094',
      vehicle: 'DL-03-CC-8192 (Honda City)',
      accounts: ['HDFC Bank #...9912']
    },
    explainability: 'Fabricates fake state transport NOCs, smart-card registration certificates, and fake insurance cover notes for the stolen vehicle nexus.',
    tags: ['rto-forgery', 'noc-cloning', 'delhi-crime-branch', 'smart-cards'],
    avatarSeed: 'ajays'
  },
  {
    id: 'crm-048',
    name: 'Bapi Barman',
    aliases: ['Bapi Malda', 'Barman Carrier', 'B.B.'],
    aliasConfidence: 0.79,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'Rural Market Note Dispenser',
    cell: 'Fake Indian Currency (FICN) Network',
    crimeType: 'Counterfeit Currency Circulation',
    jurisdiction: 'West Bengal Police',
    secondaryJurisdictions: ['Jharkhand Police'],
    riskScore: 0.75,
    riskLevel: 'MEDIUM',
    firRecords: [
      'FIR #80/2024 - IPC Sec 489C (Pakur PS)',
      'FIR #112/2024 - IPC 489B (Farakka PS)'
    ],
    hardIdentifiers: {
      phone: '+91 97341-88901',
      imei: '358910047712099',
      vehicle: 'Motorcycle Hero Splendor (WB-65-D-8821)',
      accounts: ['Bandhan Bank #...1102']
    },
    explainability: 'Circulates small bundles of fake ₹500 notes into high-volume rural cattle fairs and weekly village bazaars to blend notes into genuine circulation.',
    tags: ['rural-markets', 'ficn-dispenser', 'farakka', 'west-bengal'],
    avatarSeed: 'bapi'
  },

  // ==========================================
  // CROSS-SYNDICATE BROKERS & NEXUS BRIDGES
  // (Crucial for SIH Demo: Shows High Betweenness Centrality)
  // ==========================================
  {
    id: 'crm-049',
    name: 'Shekhar Kulkarni',
    aliases: ['Shekhar Broker', 'Kulkarni Haveli', 'S.K. Pune'],
    aliasConfidence: 0.91,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Inter-Gang Logistics & Financial Arbitrageur',
    cell: 'Hawala & Shell Account Nexus',
    crimeType: 'Hawala & Arms Logistics Brokerage',
    jurisdiction: 'Maharashtra ATS',
    secondaryJurisdictions: ['Delhi Police Special Cell', 'UP STF'],
    riskScore: 0.96,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #410/2024 - MCOCA / Sec 120B IPC (Pune Crime Branch)',
      'FIR #88/2025 - Arms Act Sec 25 / PMLA (Maharashtra ATS)'
    ],
    hardIdentifiers: {
      phone: '+91 98220-44910',
      imei: '864910041129990',
      vehicle: 'MH-12-PQ-0005 (Audi A6)',
      accounts: ['Over ₹14 Crores routed across 6 Co-operative Banks']
    },
    explainability: 'HIGH CENTRALITY NEXUS: Direct financial clearing agent between Tariq Merchant (D-West) and Vikram Rathore (NCR Arms). Sits at the structural center of the interstate graph.',
    tags: ['nexus-bridge', 'high-centrality', 'mcoca', 'pune', 'inter-gang'],
    avatarSeed: 'shekhar'
  },
  {
    id: 'crm-050',
    name: 'Devender Rawat',
    aliases: ['Rawat Ji', 'D.R. Cyber', 'Dev Rawat'],
    aliasConfidence: 0.89,
    syndicate: 'Cyber Nexus & Mule Banking Syndicate',
    role: 'Crypto-Hawala Cross-Conversion Desk',
    cell: 'Blockchain Obfuscation Cell',
    crimeType: 'Crypto-Hawala Bridge',
    jurisdiction: 'Delhi Police IFSO (Special Cell)',
    secondaryJurisdictions: ['Maharashtra ATS', 'Enforcement Directorate'],
    riskScore: 0.93,
    riskLevel: 'CRITICAL',
    firRecords: [
      'FIR #192/2024 - PMLA / IT Act 66D (Delhi Special Cell)',
      'ED File #ECIR/DLZO-II/19/2024'
    ],
    hardIdentifiers: {
      phone: '+91 98110-88210',
      imei: '351980048821048',
      vehicle: 'DL-01-ZA-0077 (Mercedes GLA)',
      accounts: ['Binance Enterprise Account / Kraken OTC Desk']
    },
    explainability: 'HIGH CENTRALITY NEXUS: Directly converts David Chen’s dark web crypto into physical cash for Tariq Merchant’s D-West operators and NCR arms dealers.',
    tags: ['crypto-hawala', 'bridge', 'nexus', 'ifso', 'ed'],
    avatarSeed: 'devender'
  },
  {
    id: 'crm-051',
    name: 'Mukul Tyagi',
    aliases: ['Mukul Meerut', 'Tyagi Junior', 'M.T.'],
    aliasConfidence: 0.86,
    syndicate: 'NCR Arms & Contract Extortion Ring',
    role: 'Interstate Weapons Delivery Courier',
    cell: 'Clandestine Weapon Foundry',
    crimeType: 'Arms Trafficking',
    jurisdiction: 'UP STF',
    secondaryJurisdictions: ['Gujarat ATS', 'Maharashtra ATS'],
    riskScore: 0.88,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #312/2024 - Arms Act Sec 25(1A) (Surat City Crime Branch)',
      'FIR #99/2025 - IPC Sec 120B (Meerut STF)'
    ],
    hardIdentifiers: {
      phone: '+91 97190-55410',
      imei: '861092049920119',
      vehicle: 'UP-15-CH-9921 (Mahindra Bolero Neo)',
      accounts: ['Bank of Baroda #...4401']
    },
    explainability: 'Directly transported 12 illegal pistols from Kuldeep Tyagi in Meerut to Ismail Koli’s coastal smugglers in Gujarat for sea security.',
    tags: ['arms-courier', 'up-to-gujarat', 'weapons-delivery', 'up-stf'],
    avatarSeed: 'mukul'
  },
  {
    id: 'crm-052',
    name: 'Arjun Koli',
    aliases: ['Chhota Ismail', 'Arjun Sailor', 'A.K.'],
    aliasConfidence: 0.84,
    syndicate: 'Coastal Seaborne Contraband Syndicate',
    role: 'Fast Inshore Speedboat Pilot',
    cell: 'Offshore Maritime Transport Cell',
    crimeType: 'Maritime Contraband',
    jurisdiction: 'Indian Coast Guard',
    secondaryJurisdictions: ['Maharashtra ATS'],
    riskScore: 0.83,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #29/2024 - Yellow Gate PS (Mumbai Coastal)',
      'Coast Guard Log #CG/OKHA/112/2024'
    ],
    hardIdentifiers: {
      phone: '+91 98251-44102',
      imei: '358910042210499',
      vehicle: 'Custom High-Speed Twin OBM Craft "Wave-Rider"',
      accounts: ['SBI Okha #...9912']
    },
    explainability: 'Runs the maritime landing shuttle transferring contraband from offshore motherships into Waseem Akram’s Mumbai docks.',
    tags: ['speedboat', 'coastal-pilot', 'yellow-gate', 'okha'],
    avatarSeed: 'arjun'
  },
  {
    id: 'crm-053',
    name: 'Deepak Saluja',
    aliases: ['Saluja Car Bazaar', 'D.S. Delhi', 'Saluja Bhai'],
    aliasConfidence: 0.88,
    syndicate: 'Interstate Vehicle & Fake Currency Ring',
    role: 'Second-Hand Luxury Car Showroom Front',
    cell: 'Vehicle Theft & VIN Tampering Hub',
    crimeType: 'Money Laundering & Stolen Vehicle Front',
    jurisdiction: 'Delhi Police Crime Branch',
    secondaryJurisdictions: ['Punjab Police AGTF'],
    riskScore: 0.87,
    riskLevel: 'HIGH',
    firRecords: [
      'FIR #390/2024 - IPC Sec 411/420/467 (Karol Bagh PS)',
      'FIR #110/2025 - Gangster Act (Jalandhar Police)'
    ],
    hardIdentifiers: {
      phone: '+91 98110-11920',
      imei: '864910048821049',
      vehicle: 'DL-02-CP-8800 (Mercedes E-Class)',
      accounts: ['Kotak Mahindra Karol Bagh #...8812']
    },
    explainability: 'Sells vehicles stolen by Harpreet Dhillon through a legitimate Karol Bagh showroom with counterfeit paper trails; funds laundered via Tariq Merchant.',
    tags: ['car-showroom', 'karol-bagh', 'money-laundering', 'stolen-cars'],
    avatarSeed: 'saluja'
  },
  {
    id: 'crm-054',
    name: 'Zahid Memon',
    aliases: ['Zahid Cargo', 'Z.M. Dubai', 'Zahid Bhai'],
    aliasConfidence: 0.89,
    syndicate: 'D-West Cartel (Narcotics & Hawala)',
    role: 'Overseas Bill of Lading Handler',
    cell: 'Overseas Operations Wing',
    crimeType: 'Transnational Smuggling',
    jurisdiction: 'Directorate of Revenue Intelligence (DRI)',
    secondaryJurisdictions: ['Maharashtra ATS', 'Interpol Red Notice Division'],
    riskScore: 0.94,
    riskLevel: 'CRITICAL',
    firRecords: [
      'Interpol Red Notice #A-9921/10-2024',
      'DRI All-India Alert #DRI/HQ/CI/99/2024'
    ],
    hardIdentifiers: {
      phone: '+971 52-4419201',
      imei: '351980041120999',
      vehicle: 'Overseas Transit (Dubai / Colombo)',
      accounts: ['Mashreq Bank UAE #...4401']
    },
    explainability: 'Acts as overseas handler for Mohd. Aslam. Forges shipping bills for containers dispatched from Jebel Ali Port to Mundra and JNPT.',
    tags: ['interpol', 'red-notice', 'jebel-ali', 'dri', 'transnational'],
    avatarSeed: 'zahid'
  }
];

// ==========================================
// EXPLICIT LAW-ENFORCEMENT RELATIONSHIPS (FILAMENTS)
// Rich multi-signal connections between criminal nodes
// ==========================================
export const RELATIONSHIPS = [
  // --- D-West Internal Core Links ---
  { source: 'crm-001', target: 'crm-002', weight: 0.98, type: 'FINANCIAL_HAWALA', explanation: 'Direct weekly Hawala clearance (>₹78 Cr) via shell bullion accounts' },
  { source: 'crm-001', target: 'crm-003', weight: 0.95, type: 'COMMAND_HIERARCHY', explanation: 'Direct operational orders issued to hit squad for targeted extortion hits' },
  { source: 'crm-001', target: 'crm-004', weight: 0.92, type: 'PORT_LOGISTICS', explanation: 'Overseas container consignment tracking via Nhava Sheva dock clearance' },
  { source: 'crm-001', target: 'crm-005', weight: 0.88, type: 'TECHNICAL_COMMS', explanation: 'Supplied 12 encrypted burner SIM cards to kingpin overseas line' },
  { source: 'crm-002', target: 'crm-006', weight: 0.94, type: 'CASH_MULE_ROUTE', explanation: 'Zubair Ansari transports ₹40 Lakh physical tokens daily for Tariq Merchant' },
  { source: 'crm-002', target: 'crm-008', weight: 0.96, type: 'OVERSEAS_OFFSET', explanation: 'International Hawala book settlement balancing Dubai against Mumbai' },
  { source: 'crm-002', target: 'crm-011', weight: 0.91, type: 'ANGADIA_CHANNEL', explanation: 'Physical diamond and currency transit between Pydhonie and Surat' },
  { source: 'crm-003', target: 'crm-009', weight: 0.89, type: 'STREET_ENFORCEMENT', explanation: 'Armed enforcement backing for suburban street-level peddler rings' },
  { source: 'crm-003', target: 'crm-010', weight: 0.93, type: 'ARMORY_SUPPLY', explanation: 'Tanveer Qureshi stores weapons cache used by Farhan Qureshi shooters' },
  { source: 'crm-004', target: 'crm-012', weight: 0.90, type: 'MARITIME_TRANSFER', explanation: 'Coordinates mid-sea transfer from fishing trawlers into commercial docks' },
  { source: 'crm-001', target: 'crm-007', weight: 0.91, type: 'LAB_SUPPLY', explanation: 'Finances clandestine mephedrone synthesis lab in Ankleshwar GIDC' },

  // --- NCR Arms Ring Internal Core Links ---
  { source: 'crm-013', target: 'crm-014', weight: 0.97, type: 'FOUNDRY_PIPELINE', explanation: 'Exclusive bulk contract for 50 machined 9mm pistols and ammunition' },
  { source: 'crm-013', target: 'crm-015', weight: 0.94, type: 'EXTORTION_CALLS', explanation: 'VoIP threat calls routed to NCR builders on Vikram Rathore’s target list' },
  { source: 'crm-013', target: 'crm-016', weight: 0.91, type: 'SAFEHOUSE_HARBORING', explanation: 'Rohit Nagar provides fortified farmhouses and getaway vehicles in Sohna' },
  { source: 'crm-013', target: 'crm-018', weight: 0.96, type: 'CONTRACT_HIT', explanation: 'Execution orders for Rohini Court shootout and Gurgaon extortion firing' },
  { source: 'crm-014', target: 'crm-017', weight: 0.93, type: 'RAW_MATERIAL_FEED', explanation: 'Sunil Bhati brings raw forged pistol slides from Munger to Meerut' },
  { source: 'crm-014', target: 'crm-020', weight: 0.92, type: 'EXPLOSIVES_FEED', explanation: 'Ammonium nitrate and quarry ammunition channeled to Tyagi workshop' },
  { source: 'crm-013', target: 'crm-019', weight: 0.88, type: 'EXTORTION_COLLECTION', explanation: 'Manoj Baisla collects extortion checks masked as construction sand contracts' },
  { source: 'crm-015', target: 'crm-021', weight: 0.87, type: 'RECON_COORDINATION', explanation: 'Kasana provides live GPS locations and routine logs for extortion targets' },
  { source: 'crm-016', target: 'crm-022', weight: 0.89, type: 'TRANSIT_DISPATCH', explanation: 'False-bottom vegetable trucks used to ferry arms caches to safehouses' },

  // --- Cyber Nexus Internal Core Links ---
  { source: 'crm-023', target: 'crm-024', weight: 0.96, type: 'MULE_TO_CRYPTO', explanation: 'Automated USDT purchase from Rohit Verma’s 1,200 harvested mule accounts' },
  { source: 'crm-023', target: 'crm-026', weight: 0.95, type: 'P2P_DESK_CLEARING', explanation: 'High-volume off-book Binance OTC clearing into private cold wallets' },
  { source: 'crm-023', target: 'crm-027', weight: 0.91, type: 'MALWARE_INFRA', explanation: 'David Chen hosts C2 (Command & Control) servers for Karan Mehra’s APK trojans' },
  { source: 'crm-024', target: 'crm-025', weight: 0.94, type: 'PHISHING_DEPOSIT', explanation: 'Kolkata fake "Digital Arrest" victims deposit directly into Jamtara accounts' },
  { source: 'crm-024', target: 'crm-028', weight: 0.92, type: 'BIOMETRIC_SIMS', explanation: 'Suresh Mondal provides fake biometric SIMs for mobile banking OTPs' },
  { source: 'crm-024', target: 'crm-029', weight: 0.90, type: 'RAPID_CASHOUT', explanation: 'Manish Tiwari ATM runners empty mule accounts within 10 minutes of fraud' },
  { source: 'crm-025', target: 'crm-030', weight: 0.89, type: 'SCAM_SCRIPTS', explanation: 'Script development for ED/CBI impersonation tailored for tele-callers' },

  // --- Coastal Contraband Internal Core Links ---
  { source: 'crm-031', target: 'crm-032', weight: 0.94, type: 'PORT_MANIPULATION', explanation: 'Fake bill-of-lading filed at Kandla to mask dhow contraband landings' },
  { source: 'crm-031', target: 'crm-033', weight: 0.93, type: 'CREEK_LANDING', explanation: 'Bhupat Solanki coordinates light-off landings at rocky Diu coves' },
  { source: 'crm-031', target: 'crm-035', weight: 0.97, type: 'MOTHERSHIP_MEET', explanation: 'Mid-sea coordinate rendezvous with Razak Baloch’s international mothership' },
  { source: 'crm-031', target: 'crm-037', weight: 0.91, type: 'SHALLOW_PILOT', explanation: 'Devraj Gadhvi pilots high-speed speedboats through tidal creek shallows' },
  { source: 'crm-033', target: 'crm-036', weight: 0.89, type: 'SALT_TRUCK_TRANSIT', explanation: 'Smuggled shipments concealed in false ceilings of salt transport trucks' },
  { source: 'crm-033', target: 'crm-038', weight: 0.88, type: 'ARMED_WAREHOUSE', explanation: 'Armed security at Mandvi beachside salt-works warehouse storage' },
  { source: 'crm-034', target: 'crm-031', weight: 0.92, type: 'BULLION_DELIVERY', explanation: 'Offloads foreign gold bars directly from dhow for immediate Surat melting' },

  // --- Interstate Vehicle & Currency Ring Internal Core Links ---
  { source: 'crm-039', target: 'crm-041', weight: 0.96, type: 'CHASSIS_TAMPERING', explanation: 'Vicky Verma re-etches VIN numbers of stolen luxury SUVs in Meerut' },
  { source: 'crm-039', target: 'crm-042', weight: 0.93, type: 'ARMED_TRANSIT', explanation: 'Gurpreet Brar escorts stolen Fortuners across interstate borders' },
  { source: 'crm-039', target: 'crm-044', weight: 0.90, type: 'ANPR_BYPASS', explanation: 'Cloned government FastTags and VIP passes used to evade toll cameras' },
  { source: 'crm-039', target: 'crm-046', weight: 0.89, type: 'HIGHWAY_STASH', explanation: 'Stolen SUVs stored in underground dhaba parking near Phillaur NH-44' },
  { source: 'crm-039', target: 'crm-047', weight: 0.92, type: 'RTO_FORGERY', explanation: 'Ajay Sharma provides counterfeit smart-card RCs and forged NOCs' },
  { source: 'crm-040', target: 'crm-043', weight: 0.94, type: 'TRAIN_COURIER', explanation: 'Prabhat Mondal carries fake currency packets across Kalka Mail trains' },
  { source: 'crm-040', target: 'crm-045', weight: 0.97, type: 'BORDER_DROP_RECEIPT', explanation: 'Receives international fake ₹500 currency drops at Kaliachak border' },
  { source: 'crm-040', target: 'crm-048', weight: 0.88, type: 'RURAL_DISPERSAL', explanation: 'Bapi Barman blends fake notes into high-volume village weekly markets' },

  // ==========================================
  // CROSS-SYNDICATE STRATEGIC BRIDGES
  // High Betweenness Centrality (Crucial for SIH Demo!)
  // ==========================================
  // 1. D-West <---> NCR Arms Cartel Bridge:
  {
    source: 'crm-003', // Farhan Qureshi (D-West Enforcer)
    target: 'crm-010', // Tanveer Qureshi (Armory Custodian)
    weight: 0.92,
    type: 'CROSS_JURISDICTION_ARMS',
    explanation: 'Interstate arms supply: 9mm pistols transported from Meerut to Mumbai'
  },
  {
    source: 'crm-010', // Tanveer Qureshi
    target: 'crm-014', // Kuldeep Tyagi (NCR Weapons Foundry)
    weight: 0.94,
    type: 'FOUNDRY_PURCHASE',
    explanation: 'Procured 15 automatic handguns directly from Tyagi foundry in Meerut'
  },
  {
    source: 'crm-002', // Tariq Merchant (D-West Hawala)
    target: 'crm-049', // Shekhar Kulkarni (Broker)
    weight: 0.97,
    type: 'INTER_GANG_FINANCE',
    explanation: 'NEXUS BRIDGE: ₹14 Crore cash cleared for NCR arms acquisitions'
  },
  {
    source: 'crm-049', // Shekhar Kulkarni
    target: 'crm-013', // Vikram Rathore (NCR Kingpin)
    weight: 0.96,
    type: 'HAWALA_WEAPONS_SETTLEMENT',
    explanation: 'NEXUS BRIDGE: Sits between D-West Hawala and NCR Arms Syndicate'
  },

  // 2. D-West <---> Cyber Nexus Bridge:
  {
    source: 'crm-002', // Tariq Merchant
    target: 'crm-050', // Devender Rawat (Crypto-Hawala Bridge)
    weight: 0.95,
    type: 'CRYPTO_HAWALA_BRIDGE',
    explanation: 'NEXUS BRIDGE: Converts ₹25 Cr cash hawala into darknet USDT'
  },
  {
    source: 'crm-050', // Devender Rawat
    target: 'crm-023', // David Chen (Cyber Master Crypto)
    weight: 0.97,
    type: 'DARKNET_CROSS_CHAIN',
    explanation: 'Cross-chain crypto mixing obfuscates origin of D-West narcotics funds'
  },
  {
    source: 'crm-005', // Rashid SIM (D-West)
    target: 'crm-028', // Suresh Mondal (Cyber SIM)
    weight: 0.88,
    type: 'SHARED_SIM_SUPPLY',
    explanation: 'Both procurement cells use same wholesale biometric SIM syndicate'
  },

  // 3. D-West <---> Coastal Contraband Bridge:
  {
    source: 'crm-004', // Salim Patel (D-West Docks)
    target: 'crm-031', // Ismail Koli (Coastal Dhow Fleet)
    weight: 0.93,
    type: 'COASTAL_HANDOFF',
    explanation: 'Dhow transfers at sea routed to Nhava Sheva container staging yard'
  },
  {
    source: 'crm-012', // Waseem Akram (D-West Boatman)
    target: 'crm-052', // Arjun Koli (Coastal Speedboat)
    weight: 0.91,
    type: 'MARITIME_SHUTTLE',
    explanation: 'Coordinated offshore offloading runs along Maharashtra-Gujarat maritime border'
  },
  {
    source: 'crm-002', // Tariq Merchant (D-West Hawala)
    target: 'crm-034', // Yusuf Memon (Coastal Gold Smuggler)
    weight: 0.94,
    type: 'GOLD_HAWALA_ARBITRAGE',
    explanation: 'Smuggled gold bullion accepted as settlement for Middle-East hawala debts'
  },

  // 4. NCR Arms <---> Vehicle Nexus Bridge:
  {
    source: 'crm-013', // Vikram Rathore (NCR Kingpin)
    target: 'crm-039', // Harpreet Dhillon (Vehicle Kingpin)
    weight: 0.95,
    type: 'GETAWAY_VEHICLE_FLEET',
    explanation: 'NCR extortion shooters supplied untraceable cloned-plate Fortuners'
  },
  {
    source: 'crm-014', // Kuldeep Tyagi (NCR Foundry)
    target: 'crm-041', // Vicky Verma (Vehicle Chassis Mechanic)
    weight: 0.93,
    type: 'SOTIGANJ_WORKSHOP',
    explanation: 'Both utilize clandestine machine tooling equipment in Meerut Sotiganj'
  },
  {
    source: 'crm-016', // Rohit Nagar (NCR Safehouse)
    target: 'crm-047', // Ajay Sharma (RTO Forger)
    weight: 0.90,
    type: 'FORGED_RC_LOGISTICS',
    explanation: 'Supplies forged RTO documents for safehouse getaway vehicles'
  },

  // 5. Coastal <---> NCR Arms Link:
  {
    source: 'crm-051', // Mukul Tyagi (Arms Courier)
    target: 'crm-031', // Ismail Koli (Coastal Captain)
    weight: 0.89,
    type: 'WEAPONS_FOR_SEAFARERS',
    explanation: 'Supplied automatic weapons to protect offshore mothership transfer dhows'
  },

  // 6. Vehicle Nexus <---> D-West Cash Flow Link:
  {
    source: 'crm-053', // Deepak Saluja (Car Bazaar Front)
    target: 'crm-002', // Tariq Merchant (D-West Hawala)
    weight: 0.91,
    type: 'AUTO_CASH_LAUNDERING',
    explanation: 'Showroom car sales receipts used to launder cash proceeds of D-West'
  },

  // 7. FICN <---> NCR Arms Purchase Link:
  {
    source: 'crm-040', // Santosh Mondal (FICN Carrier)
    target: 'crm-015', // Amit Sharma (NCR Virtual Extortion)
    weight: 0.87,
    type: 'HIGH_GRADE_FICN_PAYMENT',
    explanation: 'Counterfeit currency partially used for local logistics and ammunition transit'
  }
];

/**
 * Transforms criminal dataset into normalized records suitable for 3D universe mapping
 */
export function getNormalizedCriminalRecords() {
  return CRIMINALS.map(c => {
    return {
      id: c.id,
      title: c.name,
      artist: c.syndicate, // Maps to galaxy cluster
      album: c.cell, // Maps to orbital sub-cluster / cell
      genre: c.crimeType, // Maps to primary category
      playlist: c.jurisdiction, // Maps to jurisdiction
      release_date: '2024-01-01',
      tags: c.tags,
      artwork_url: null, // Will use high-contrast SVG criminal badge
      risk_score: c.riskScore,
      risk_level: c.riskLevel,
      aliases: c.aliases,
      alias_confidence: c.aliasConfidence,
      fir_records: c.firRecords,
      hard_identifiers: c.hardIdentifiers,
      explainability: c.explainability,
      enrichment: {
        status: 'MATCHED',
        provider: 'NetSentry Entity Resolution',
        confidence: c.aliasConfidence,
        recording_id: c.hardIdentifiers.phone,
        artist_id: c.jurisdiction,
        release_id: c.firRecords[0] || 'FIR Recorded',
        release_date: '2024 Active',
        canonical_album: c.cell
      }
    };
  });
}
