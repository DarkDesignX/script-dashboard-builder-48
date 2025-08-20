import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PowerShellCodeEditor } from "@/components/PowerShellCodeEditor";
import { ArrowLeft, Edit, Trash2, Calendar, Users, Globe, Zap, Package, Shield, Settings, Terminal } from "lucide-react";
import { Script, Customer, categoryLabels } from "@/types/script";
import { useState, useEffect } from "react";

// Mock data - in a real app this would come from props/context or API
const mockScripts: Script[] = [
  {
    id: "1",
    name: "Windows Update Installation",
    description: "Installiert alle verfügbaren Windows Updates automatisch",
    category: "software",
    command: "# Windows Update Installation\nGet-WUInstall -AcceptAll -AutoReboot",
    customers: ["1", "2"],
    isGlobal: true,
    autoEnrollment: false,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "2", 
    name: "Firewall Konfiguration",
    description: "Konfiguriert Windows Firewall Regeln für Unternehmensumgebung",
    category: "sicherheit",
    command: "# Firewall Configuration\nNew-NetFirewallRule -DisplayName 'Allow Port 443' -Direction Inbound -Protocol TCP -LocalPort 443",
    customers: ["1"],
    isGlobal: false,
    autoEnrollment: true,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-25")
  },
  {
    id: "3",
    name: "CPU Temperatur überwachen",
    description: "Überwacht die CPU-Temperatur und gibt Warnungen bei kritischen Werten aus",
    category: "befehl",
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
    customers: ["3"],
    isGlobal: false,
    autoEnrollment: false,
    createdAt: new Date("2024-01-22"),
    updatedAt: new Date("2024-01-22")
  }
];

const mockCustomers: Customer[] = [
  { id: "1", name: "Acme Corp" },
  { id: "2", name: "TechStart GmbH" },
  { id: "3", name: "Global Solutions" }
];

const categoryIcons = {
  software: Package,
  sicherheit: Shield,
  konfiguration: Settings,
  befehl: Terminal,
};

export default function ScriptDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [script, setScript] = useState<Script | null>(null);
  const [codeValue, setCodeValue] = useState("");

  useEffect(() => {
    const foundScript = mockScripts.find(s => s.id === id);
    if (foundScript) {
      setScript(foundScript);
      setCodeValue(foundScript.command);
    }
  }, [id]);

  if (!script) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Skript nicht gefunden</h1>
            <p className="text-muted-foreground mb-6">Das angeforderte Skript konnte nicht gefunden werden.</p>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zur Übersicht
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const getCustomerNames = (customerIds: string[]) => {
    return customerIds
      .map(id => mockCustomers.find(c => c.id === id))
      .filter(Boolean);
  };

  const CategoryIcon = categoryIcons[script.category];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <CategoryIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{script.name}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-destructive/50">
              <Trash2 className="h-4 w-4 mr-2" />
              Löschen
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Script Info */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-card border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Skript Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kategorie</label>
                  <div className="mt-1">
                    <Badge variant="secondary" className="bg-secondary/50">
                      {categoryLabels[script.category]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1 space-y-2">
                    {script.isGlobal && (
                      <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent/50 block w-fit">
                        <Globe className="h-3 w-3 mr-1" />
                        Global
                      </Badge>
                    )}
                    {script.autoEnrollment && (
                      <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50 block w-fit">
                        <Zap className="h-3 w-3 mr-1" />
                        Auto Enrollment
                      </Badge>
                    )}
                    {!script.isGlobal && !script.autoEnrollment && (
                      <span className="text-sm text-muted-foreground">Standard</span>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Zugewiesene Kunden</label>
                  <div className="mt-2 space-y-2">
                    {getCustomerNames(script.customers).length > 0 ? (
                      getCustomerNames(script.customers).map(customer => (
                        <Badge key={customer!.id} variant="tag" className="block w-fit">
                          <Users className="h-3 w-3 mr-1" />
                          {customer!.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Keine Kunden zugewiesen</span>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Erstellt</label>
                  <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                    <Calendar className="h-4 w-4" />
                    {script.createdAt.toLocaleDateString('de-DE')}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Zuletzt geändert</label>
                  <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                    <Calendar className="h-4 w-4" />
                    {script.updatedAt.toLocaleDateString('de-DE')}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Script Code and Description */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Beschreibung</h3>
              <p className="text-muted-foreground leading-relaxed">
                {script.description || 'Keine Beschreibung verfügbar'}
              </p>
            </Card>

            <PowerShellCodeEditor
              value={codeValue}
              onChange={setCodeValue}
              placeholder="# PowerShell Code..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}