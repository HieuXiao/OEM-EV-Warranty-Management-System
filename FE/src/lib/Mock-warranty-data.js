export const mockWarrantyClaims = [
  {
    id: "WC-2024-001",
    vehicleModel: "VF 8",
    vin: "30A-12345",
    issue: "Battery charging issue - not reaching full capacity",
    status: "in_progress",
    priority: "high",
    createdAt: "2024-01-15",
  },
  {
    id: "WC-2024-002",
    vehicleModel: "VF 9",
    vin: "29B-67890",
    issue: "Infotainment system screen flickering",
    status: "pending",
    priority: "medium",
    createdAt: "2024-01-14",
  },
  {
    id: "WC-2024-003",
    vehicleModel: "VF 7",
    vin: "51F-11111",
    issue: "Air conditioning not cooling properly",
    status: "approved",
    priority: "medium",
    createdAt: "2024-01-13",
  },
]

export const mockPartsInventory = [
  {
    id: "BAT-VF8-001",
    name: "Battery Module 87.7kWh",
    code: "BAT-VF8-001",
    stock: 12,
    minStock: 5,
    status: "normal",
  },
  {
    id: "INF-VF-001",
    name: 'Infotainment Display 15.6"',
    code: "INF-VF-001",
    stock: 3,
    minStock: 5,
    status: "low",
  },
]
