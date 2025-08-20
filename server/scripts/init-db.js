import { initializeDatabase, runQuery } from '../database.js';

async function seedDatabase() {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    // Insert mock customers
    const customers = [
      { id: '1', name: 'Kunde A GmbH' },
      { id: '2', name: 'Kunde B AG' },
      { id: '3', name: 'Kunde C KG' },
      { id: '4', name: 'Kunde D Ltd.' },
      { id: '5', name: 'Kunde E Inc.' }
    ];

    for (const customer of customers) {
      await runQuery(
        'INSERT OR IGNORE INTO customers (id, name) VALUES (?, ?)',
        [customer.id, customer.name]
      );
    }

    // Insert mock scripts
    const scripts = [
      {
        id: '1',
        name: 'Windows Update installieren',
        command: `# Windows Updates installieren
Get-Module -Name PSWindowsUpdate -ListAvailable
if (-not (Get-Module -Name PSWindowsUpdate -ListAvailable)) {
    Install-Module -Name PSWindowsUpdate -Force
}
Import-Module PSWindowsUpdate
Get-WindowsUpdate
Install-WindowsUpdate -AcceptAll -AutoReboot`,
        description: 'Installiert alle verfügbaren Windows Updates automatisch',
        category: 'sicherheit',
        isGlobal: 1,
        autoEnrollment: 1,
        customers: ['1', '2', '3']
      },
      {
        id: '2',
        name: 'Adobe Reader installieren',
        command: `# Adobe Reader automatisch installieren
$url = "https://get.adobe.com/reader/"
$output = "$env:TEMP\\AdobeReader.exe"
Invoke-WebRequest -Uri $url -OutFile $output
Start-Process -FilePath $output -ArgumentList "/S" -Wait
Remove-Item $output`,
        description: 'Lädt Adobe Reader herunter und installiert es automatisch',
        category: 'software',
        isGlobal: 0,
        autoEnrollment: 0,
        customers: ['1', '4']
      },
      {
        id: '3',
        name: 'Netzwerk-Konfiguration prüfen',
        command: `# Netzwerk-Diagnose durchführen
ipconfig /all
nslookup google.com
ping -t 8.8.8.8
Test-NetConnection -ComputerName "google.com" -Port 80`,
        description: 'Führt eine umfassende Netzwerk-Diagnose durch',
        category: 'konfiguration',
        isGlobal: 1,
        autoEnrollment: 0,
        customers: ['2', '3', '5']
      },
      {
        id: '4',
        name: 'CPU Temperatur überwachen',
        command: `# CPU Temperatur abfragen
# Verwendet WMI zur Temperaturüberwachung
$temperatureData = Get-WmiObject -Namespace "root/WMI" -Class "MSAcpi_ThermalZoneTemperature"
if ($temperatureData) {
    foreach ($temp in $temperatureData) {
        $celsiusTemp = ($temp.CurrentTemperature / 10) - 273.15
        Write-Host "CPU Temperatur: $([math]::Round($celsiusTemp, 2))°C"
    }
} else {
    # Alternative Methode über OpenHardwareMonitor
    Write-Host "Versuche alternative Temperaturabfrage..."
    $sensors = Get-WmiObject -Namespace "root/OpenHardwareMonitor" -Class "Sensor" | Where-Object { $_.SensorType -eq "Temperature" -and $_.Name -like "*CPU*" }
    if ($sensors) {
        foreach ($sensor in $sensors) {
            Write-Host "$($sensor.Name): $($sensor.Value)°C"
        }
    } else {
        Write-Host "WARNUNG: Keine Temperatursensoren gefunden. Möglicherweise sind spezielle Treiber erforderlich."
    }
}`,
        description: 'Überwacht die CPU-Temperatur und gibt Warnungen bei kritischen Werten aus',
        category: 'befehl',
        isGlobal: 0,
        autoEnrollment: 0,
        customers: ['3', '5']
      }
    ];

    for (const script of scripts) {
      await runQuery(
        'INSERT OR IGNORE INTO scripts (id, name, command, description, category, isGlobal, autoEnrollment) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [script.id, script.name, script.command, script.description, script.category, script.isGlobal, script.autoEnrollment]
      );

      // Insert script-customer relationships
      for (const customerId of script.customers) {
        await runQuery(
          'INSERT OR IGNORE INTO script_customers (scriptId, customerId) VALUES (?, ?)',
          [script.id, customerId]
        );
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();