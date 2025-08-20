import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PowerShellCodeEditor } from "@/components/PowerShellCodeEditor";
import { ArrowLeft, Edit, Trash2, Calendar, Users, Globe, Zap, Package, Shield, Settings, Terminal } from "lucide-react";
import { Script, Customer, categoryLabels } from "@/types/script";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";


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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [codeValue, setCodeValue] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadScriptData(id);
    }
  }, [id]);

  const loadScriptData = async (scriptId: string) => {
    try {
      setLoading(true);
      const [scriptData, customersData] = await Promise.all([
        apiService.getScript(scriptId),
        apiService.getCustomers()
      ]);
      setScript(scriptData);
      setCustomers(customersData);
      setCodeValue(scriptData.command);
    } catch (error) {
      console.error('Failed to load script:', error);
      toast({
        title: "Fehler beim Laden",
        description: "Skript konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border p-8 text-center">
            <Terminal className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Skript wird geladen...</h1>
            <p className="text-muted-foreground mb-6">Bitte warten Sie einen Moment.</p>
          </Card>
        </div>
      </div>
    );
  }

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
      .map(id => customers.find(c => c.id === id))
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